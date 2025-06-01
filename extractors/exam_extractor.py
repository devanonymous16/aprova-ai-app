import requests
from bs4 import BeautifulSoup
import csv
from urllib.parse import urljoin 
import time
import os
import io 
from PyPDF2 import PdfReader 
import re 

BASE_URL_SITE_RAIZ = "https://www.pciconcursos.com.br"

def baixar_e_extrair_texto_de_pdf(url_pdf):
    # ... (esta função permanece a mesma da sua última versão, sem alterações)
    if not url_pdf:
        return None
    print(f"        Baixando e extraindo texto de: {url_pdf}")
    try:
        headers_pdf = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 PCIConcursosScraper/1.7 (PDF)'}
        response_pdf = requests.get(url_pdf, headers=headers_pdf, timeout=20, stream=True)
        response_pdf.raise_for_status()
        pdf_content = io.BytesIO(response_pdf.content)
        reader = PdfReader(pdf_content)
        texto_completo = ""
        if len(reader.pages) == 0:
            print(f"        PDF em {url_pdf} não tem páginas ou não pôde ser lido corretamente.")
            return None
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            try:
                texto_da_pagina = page.extract_text()
                if texto_da_pagina:
                    texto_completo += texto_da_pagina + "\n"
            except Exception as e_extract_page:
                print(f"        Erro ao extrair texto da página {page_num} do PDF {url_pdf}: {e_extract_page}")
        if texto_completo.strip():
            return texto_completo.strip()
        else:
            print(f"        Não foi possível extrair texto significativo do PDF: {url_pdf}")
            return None
    except requests.exceptions.RequestException as e_req_pdf:
        print(f"        Erro de requisição ao baixar PDF {url_pdf}: {e_req_pdf}")
    except Exception as e_pdf:
        print(f"        Erro ao processar PDF {url_pdf} com PyPDF2: {e_pdf}")
    return None

def parse_gabarito_formato_colunar_pmma(bloco_texto_cargo): # Mantida para o caso específico
    # ... (esta função permanece a mesma da sua última versão, sem alterações)
    gabarito_parcial = {}
    linhas_bloco = bloco_texto_cargo.strip().splitlines()
    i = 0
    while i < len(linhas_bloco) - 1:
        linha_numeros_candidata = linhas_bloco[i].strip()
        linha_respostas_candidata = linhas_bloco[i+1].strip()
        numeros_questoes = re.findall(r'\b(\d{1,3})\b', linha_numeros_candidata)
        respostas_potenciais_lista = [char for char in linha_respostas_candidata if char.isalnum()] 
        respostas_potenciais = "".join(respostas_potenciais_lista)
        if numeros_questoes and len(respostas_potenciais) >= len(numeros_questoes):
            respostas_validas_para_match = [r for r in respostas_potenciais[:len(numeros_questoes)] if r.upper() in "ABCDEEXN"]
            if len(respostas_validas_para_match) == len(numeros_questoes):
                for idx, num_q_str in enumerate(numeros_questoes):
                    resp = respostas_validas_para_match[idx].upper()
                    if resp in ['X', 'N']: resp = "ANULADA"
                    if num_q_str not in gabarito_parcial:
                         gabarito_parcial[num_q_str.zfill(2)] = resp 
                i += 2
                continue 
        i += 1
    return gabarito_parcial

def _normalize_cargo_name_for_matching(cargo_name_str):
    """Helper para normalizar nomes de cargo para matching."""
    if not cargo_name_str:
        return ""
    # Converte para maiúsculas, remove pontuações exceto hífen, e normaliza espaços
    normalized = cargo_name_str.upper()
    normalized = re.sub(r'[^\w\sÁÉÍÓÚÀÃÕÊÔÇ-]', '', normalized, flags=re.UNICODE) # Mantém hífen
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    # Opcional: remover palavras comuns se necessário (ex: DE, DO, DA)
    # common_words = ['DE', 'DO', 'DA', 'DOS', 'DAS', 'PARA', 'O', 'A']
    # words = normalized.split()
    # normalized = " ".join([word for word in words if word not in common_words])
    return normalized

def parse_texto_gabarito_avancado(texto_bruto_gabarito, nome_cargo_alvo_original=""):
    if not texto_bruto_gabarito:
        return {}

    gabarito_final = {}
    nome_cargo_alvo_normalizado = _normalize_cargo_name_for_matching(nome_cargo_alvo_original)
    
    print(f"        Parsing avançado. Cargo alvo normalizado: '{nome_cargo_alvo_normalizado}'")

    # Estratégia 1: Formato Colunar PMMA (se aplicável e nome do cargo bate)
    if "MÉDICO-VETERINÁRIO" in nome_cargo_alvo_normalizado and \
       ("PMMA" in texto_bruto_gabarito.upper() or \
        "POLÍCIA MILITAR DO MARANHÃO" in texto_bruto_gabarito.upper() or \
        "359_PMMA_003_01" in texto_bruto_gabarito):
        
        padrao_bloco_pmma_med_vet = re.compile(
            r"(Cargo\s+\d+:\s*.*?1º\s*TENENTE\s*PM\s*–\s*MÉDICO-VETERINÁRIO\s*\n)" + 
            r"(.*?)" + 
            r"(?=\n\s*Cargo\s+\d+:|\n\s*GABARITOS OFICIAIS PRELIMINARES|\n\s*www\.pciconcursos\.com\.br|\Z)", 
            re.DOTALL | re.IGNORECASE
        )
        match_bloco_pmma = padrao_bloco_pmma_med_vet.search(texto_bruto_gabarito)
        if match_bloco_pmma:
            conteudo_bloco_pmma = match_bloco_pmma.group(2).strip()
            gabarito_pmma = parse_gabarito_formato_colunar_pmma(conteudo_bloco_pmma)
            if gabarito_pmma:
                print("        Estratégia Colunar PMMA: Sucesso.")
                gabarito_final.update(gabarito_pmma)

    # Estratégia 2: Tentar encontrar blocos por títulos e aplicar parser de lista
    if not gabarito_final: # Se o parser colunar não preencheu ou não era aplicável
        print(f"        Estratégia Colunar PMMA não aplicada ou não encontrou. Tentando parser de lista com busca de bloco.")
        
        # Regex para encontrar QUALQUER título de bloco de gabarito
        # Captura o título (grupo 1) e o conteúdo do bloco (grupo 2)
        padrao_qualquer_bloco_gabarito = re.compile(
            r"(Gabarito\s*-\s*Prova\s*Objetiva\s*-\s*.*?Cargo.*?\n|Cargo\s+\d+:.*?|\bCONHECIMENTOS\s+(?:GERAIS|ESPECÍFICOS).*?\n)" +  # Padrões de início de bloco
            r"(.*?)" + # Conteúdo do bloco (não guloso)
            # Lookahead para o próximo título de bloco ou delimitadores comuns
            r"(?=\n\s*(?:Gabarito\s*-\s*Prova\s*Objetiva\s*-|Cargo\s+\d+:|\bCONHECIMENTOS\s+(?:GERAIS|ESPECÍFICOS)|Quarta-feira\s+\d{1,2}\s+\w+\s+\d{4})|\Z)",
            re.IGNORECASE | re.DOTALL
        )

        bloco_escolhido_para_parse = texto_bruto_gabarito # Fallback se nenhum bloco for identificado
        bloco_encontrado_para_cargo_alvo = False

        if nome_cargo_alvo_normalizado: # Só tenta achar bloco se tivermos um nome de cargo alvo
            for match_bloco in padrao_qualquer_bloco_gabarito.finditer(texto_bruto_gabarito):
                titulo_bloco_pdf = match_bloco.group(1).strip()
                conteudo_bloco_pdf = match_bloco.group(2).strip()
                
                titulo_bloco_pdf_normalizado = _normalize_cargo_name_for_matching(titulo_bloco_pdf)
                # print(f"          DEBUG: Testando bloco PDF: '{titulo_bloco_pdf_normalizado}' vs Alvo: '{nome_cargo_alvo_normalizado}'")

                # Lógica de matching de nome de cargo (pode ser aprimorada)
                # Verifica se todas as palavras significativas do cargo alvo estão no título do bloco
                palavras_chave_cargo_alvo = [p for p in nome_cargo_alvo_normalizado.split() if len(p) > 2 and p not in ["DE", "DO", "DA"]]
                
                if palavras_chave_cargo_alvo and \
                   all(palavra_chave in titulo_bloco_pdf_normalizado for palavra_chave in palavras_chave_cargo_alvo):
                    print(f"        Bloco RELEVANTE encontrado para '{nome_cargo_alvo_normalizado}' (Título no PDF: '{titulo_bloco_pdf}').")
                    bloco_escolhido_para_parse = conteudo_bloco_pdf
                    bloco_encontrado_para_cargo_alvo = True
                    break # Encontrou o bloco mais provável
            if not bloco_encontrado_para_cargo_alvo:
                print(f"        Nenhum bloco específico claramente identificado para '{nome_cargo_alvo_normalizado}'. Aplicando parser de lista ao texto completo.")
        else:
            print("        Nenhum nome de cargo alvo para filtro. Aplicando parser de lista ao texto completo.")
            
        # Aplicar regex de lista ao bloco escolhido (ou ao texto completo como fallback)
        padroes_lista = [
            re.compile(r"^\s*(?:QUESTÃO\s*)?(\d{1,3})\s*[-–—.)]\s*([A-EXN*#])\b", re.IGNORECASE | re.MULTILINE),
            re.compile(r"^\s*(?:QUESTÃO\s*)?(\d{1,3})\s+([A-EXN*#])\b", re.IGNORECASE | re.MULTILINE),
            re.compile(r"^\s*(\d{1,3})\s*([A-EXN*#])\b", re.IGNORECASE | re.MULTILINE) 
        ]
        for padrao_idx, padrao in enumerate(padroes_lista):
            # print(f"            Tentando padrão de lista #{padrao_idx+1} no bloco selecionado.")
            matches = padrao.findall(bloco_escolhido_para_parse)
            for match in matches:
                num_questao_str = match[0].zfill(2)
                resposta_bruta = match[1].upper()
                resposta_final = resposta_bruta
                if resposta_bruta in ['X', 'N', '*', '#', 'ANULADA']:
                    resposta_final = "ANULADA"
                if num_questao_str not in gabarito_final:
                    gabarito_final[num_questao_str] = resposta_final
    
    if gabarito_final:
        print(f"        Gabarito AVANÇADO parseado (amostra): {dict(list(gabarito_final.items())[:5])}")
    else:
        print(f"        Não foi possível parsear o gabarito estruturado (AVANÇADO) do texto extraído.")
        # Descomente para ver o texto que falhou no parse:
        # print(f"        Texto bruto do gabarito para análise (primeiros 1000 chars):\n-------\n{texto_bruto_gabarito[:1000]}\n-------")
    return gabarito_final

# --- O RESTO DO CÓDIGO (extrair_dados_detalhes_prova, extrair_provas_da_pagina_listagem, if __name__ == "__main__":)
# --- PERMANECE EXATAMENTE COMO NA SUA ÚLTIMA VERSÃO (a que você colou na pergunta anterior)
# --- Vou colar abaixo para garantir que você tenha tudo e que as chamadas estejam corretas.

def extrair_dados_detalhes_prova(url_pagina_detalhes, info_listagem_original=None): # info_listagem_original é importante
    print(f"    Acessando detalhes REAIS: {url_pagina_detalhes}")
    dados_retorno = {
        "url_pdf_prova": None, "url_pdf_gabarito": None, "todos_url_pdf_encontrados": [],
        "nome_prova_detalhe": "Não encontrado (detalhe)", "cargo_detalhe": None, "ano_detalhe": None,
        "órgão_detalhe": None, "instituição_detalhe": None, "nível_detalhe": None,
        "texto_gabarito_extraido": None, "gabarito_estruturado": {}
    }
    try:
        headers_detalhe = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 PCIConcursosScraper/1.7 (Detalhes)'}
        response_detalhe = requests.get(url_pagina_detalhes, headers=headers_detalhe, timeout=15)
        response_detalhe.raise_for_status()
        soup_detalhe = BeautifulSoup(response_detalhe.content, 'html.parser')

        nome_prova_tag_detalhe = soup_detalhe.find('h5', class_='text-pci')
        if nome_prova_tag_detalhe:
            text_parts = list(nome_prova_tag_detalhe.stripped_strings)
            if text_parts:
                nome_prova_completo_detalhe = " ".join(text_parts)
                dados_retorno["nome_prova_detalhe"] = nome_prova_completo_detalhe.replace("Prova ", "", 1).strip()
        
        links_item_link = soup_detalhe.find_all('a', class_='item-link', href=lambda href: href and href.endswith('.pdf'))
        if links_item_link:
            for link_tag in links_item_link:
                url_pdf_relativa_ou_abs = link_tag.get('href')
                texto_link = link_tag.get_text(strip=True).lower()
                url_pdf_completa = ""
                if url_pdf_relativa_ou_abs:
                    url_pdf_completa = urljoin(BASE_URL_SITE_RAIZ, url_pdf_relativa_ou_abs)
                    if url_pdf_completa not in dados_retorno["todos_url_pdf_encontrados"]:
                         dados_retorno["todos_url_pdf_encontrados"].append(url_pdf_completa)
                    if "gabarito" in texto_link or "gabarito" in url_pdf_relativa_ou_abs.lower():
                        if not dados_retorno["url_pdf_gabarito"]:
                            dados_retorno["url_pdf_gabarito"] = url_pdf_completa
                    elif not dados_retorno["url_pdf_prova"]:
                        if not ("gabarito" in url_pdf_relativa_ou_abs.lower()):
                            dados_retorno["url_pdf_prova"] = url_pdf_completa
            if not dados_retorno["url_pdf_prova"] and dados_retorno["todos_url_pdf_encontrados"]:
                for url_pdf in dados_retorno["todos_url_pdf_encontrados"]:
                    if url_pdf != dados_retorno["url_pdf_gabarito"]:
                        dados_retorno["url_pdf_prova"] = url_pdf
                        break
        
        if dados_retorno["url_pdf_gabarito"]:
            texto_gabarito = baixar_e_extrair_texto_de_pdf(dados_retorno["url_pdf_gabarito"])
            dados_retorno["texto_gabarito_extraido"] = texto_gabarito
            if texto_gabarito:
                nome_cargo_filtro = ""
                # Usa o nome do cargo da página de detalhes se disponível e útil, senão da listagem
                if dados_retorno.get("nome_prova_detalhe") and dados_retorno.get("nome_prova_detalhe") != "Não encontrado (detalhe)":
                    nome_cargo_filtro = dados_retorno.get("nome_prova_detalhe")
                elif info_listagem_original and info_listagem_original.get("nome_prova_cargo_listagem"):
                    nome_cargo_filtro = info_listagem_original.get("nome_prova_cargo_listagem")
                
                dados_retorno["gabarito_estruturado"] = parse_texto_gabarito_avancado(texto_gabarito, nome_cargo_filtro)

        ul_metadados = soup_detalhe.find('ul', class_='list-unstyled') 
        if ul_metadados:
            for li_item in ul_metadados.find_all('li', recursive=False): 
                strong_tag = li_item.find('strong')
                if strong_tag:
                    label_bruto = strong_tag.get_text(strip=True).lower()
                    label = label_bruto.replace(":", "").strip()
                    div_container_valor = strong_tag.parent 
                    valor_tag_candidata = div_container_valor.find(['a', 'span'], class_='text-pci')
                    valor_final = ""
                    if valor_tag_candidata:
                        valor_final = valor_tag_candidata.get_text(strip=True)
                    else: 
                        valor_temp = ""
                        proximo_elemento = strong_tag.next_sibling
                        while proximo_elemento:
                            if proximo_elemento.name == 'br': break
                            if isinstance(proximo_elemento, str): valor_temp += proximo_elemento.strip()
                            elif hasattr(proximo_elemento, 'get_text'): valor_temp += " " + proximo_elemento.get_text(strip=True)
                            proximo_elemento = proximo_elemento.next_sibling
                        valor_final = valor_temp.strip()
                    if valor_final:
                        if label == "cargo": dados_retorno["cargo_detalhe"] = valor_final
                        elif label == "ano": dados_retorno["ano_detalhe"] = valor_final
                        elif label == "órgão": dados_retorno["órgão_detalhe"] = valor_final
                        elif label == "instituição": dados_retorno["instituição_detalhe"] = valor_final
                        elif label == "nível": dados_retorno["nível_detalhe"] = valor_final
        
        print_gabarito_info = f"Gabarito PDF: {'Sim' if dados_retorno['url_pdf_gabarito'] else 'Não'}, " \
                              f"Texto Extraído: {'Sim' if dados_retorno['texto_gabarito_extraido'] else 'Não'}, " \
                              f"Gabarito Estruturado: {len(dados_retorno['gabarito_estruturado'])} itens"
        print(f"      Detalhes para {dados_retorno.get('nome_prova_detalhe', 'N/A')}: {print_gabarito_info}")
        return dados_retorno
    except requests.exceptions.RequestException as e_req:
        print(f"      Erro de requisição ao acessar detalhes {url_pagina_detalhes}: {e_req}")
    except Exception as e_det:
        print(f"      Erro inesperado ao processar detalhes de {url_pagina_detalhes}: {e_det}")
    return dados_retorno

def extrair_provas_da_pagina_listagem(url_listagem_categoria, base_url_para_join):
    print(f"  Processando listagem: {url_listagem_categoria}")
    provas_nesta_pagina = []
    try:
        headers_listagem = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 PCIConcursosScraper/1.6 (Listagem)'}
        response = requests.get(url_listagem_categoria, headers=headers_listagem, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        tabela_provas = soup.find('table', id='lista_provas')
        if not tabela_provas:
            print(f"    Tabela #lista_provas não encontrada em {url_listagem_categoria}")
            return [], False
        tbody = tabela_provas.find('tbody')
        if tbody:
            todas_as_linhas_da_secao_de_dados = tbody.find_all('tr')
        else:
            todas_as_linhas_da_secao_de_dados = tabela_provas.find_all('tr')
        if not todas_as_linhas_da_secao_de_dados:
            return [], True 
        linhas_de_dados = []
        if len(todas_as_linhas_da_secao_de_dados) > 0:
            primeira_linha_tds = todas_as_linhas_da_secao_de_dados[0].find_all('td', limit=1)
            if primeira_linha_tds and 'ua' in primeira_linha_tds[0].get('class', []):
                if len(todas_as_linhas_da_secao_de_dados) > 1:
                    linhas_de_dados = todas_as_linhas_da_secao_de_dados[1:]
            else:
                linhas_de_dados = todas_as_linhas_da_secao_de_dados
        if not linhas_de_dados:
            return [], True
        for tr in linhas_de_dados:
            celulas = tr.find_all('td')
            if len(celulas) >= 5: 
                try:
                    td_nome_link = celulas[0]
                    link_detalhes_tag = td_nome_link.find('a', class_='prova_download') 
                    if not link_detalhes_tag:
                        continue
                    nome_prova_cargo = link_detalhes_tag.get_text(strip=True)
                    url_pagina_detalhes_relativa = link_detalhes_tag.get('href')
                    url_pagina_detalhes_completa = urljoin(base_url_para_join, url_pagina_detalhes_relativa)
                    ano_str = celulas[1].get_text(strip=True)
                    orgao_tag = celulas[2].find('a') 
                    orgao = orgao_tag.get_text(strip=True) if orgao_tag else celulas[2].get_text(strip=True)
                    banca_tag = celulas[3].find('a') 
                    banca = banca_tag.get_text(strip=True) if banca_tag else celulas[3].get_text(strip=True)
                    nivel = celulas[4].get_text(strip=True)
                    identificador_unico_prova = url_pagina_detalhes_completa
                    provas_nesta_pagina.append({
                        'identificador_prova': identificador_unico_prova,
                        'nome_prova_cargo_listagem': nome_prova_cargo,
                        'url_pagina_detalhes': url_pagina_detalhes_completa,
                        'ano_listagem': ano_str,
                        'orgao_listagem': orgao,
                        'banca_listagem': banca,
                        'nivel_listagem': nivel,
                    })
                except Exception as e_linha:
                    print(f"      Erro ao processar linha da tabela: {e_linha} - Linha: {tr.get_text(strip=True)[:100]}")
                    continue
        return provas_nesta_pagina, True
    except requests.exceptions.RequestException as e_req_list:
        print(f"    Erro de requisição para {url_listagem_categoria}: {e_req_list}")
        return [], False
    except Exception as e_page_list:
        print(f"    Erro inesperado em {url_listagem_categoria}: {e_page_list}")
        return [], False

if __name__ == "__main__":
    url_categoria_base = "https://www.pciconcursos.com.br/provas/medico-veterinario"
    print(f"Iniciando scraper para a categoria: {url_categoria_base}")
    output_dir = "output_scraped_data"
    os.makedirs(output_dir, exist_ok=True)

    todas_as_provas_coletadas_da_listagem = []
    pagina_atual = 1
    MAX_PAGINAS_POR_CATEGORIA = 1 
    LIMITE_ITENS_DETALHES_PARA_TESTE = 2 

    while pagina_atual <= MAX_PAGINAS_POR_CATEGORIA:
        if pagina_atual == 1:
            url_alvo_listagem = url_categoria_base
        else:
            url_alvo_listagem = f"{url_categoria_base}/{pagina_atual}"
        print(f"\nProcessando página de listagem: {pagina_atual} -> {url_alvo_listagem}")
        provas_da_pagina_listagem, tabela_processada_com_sucesso = extrair_provas_da_pagina_listagem(url_alvo_listagem, BASE_URL_SITE_RAIZ)
        if not tabela_processada_com_sucesso: 
            print(f"Falha ao processar tabela ou erro na requisição para {url_alvo_listagem}. Assumindo fim da paginação para esta categoria.")
            break
        if not provas_da_pagina_listagem:
            if pagina_atual == 1:
                 print(f"Nenhuma prova de dados encontrada na primeira página ({url_alvo_listagem}).")
            else:
                 print(f"Nenhuma prova de dados encontrada na página {pagina_atual} ({url_alvo_listagem}). Assumindo fim da paginação.")
            break 
        todas_as_provas_coletadas_da_listagem.extend(provas_da_pagina_listagem)
        print(f"  {len(provas_da_pagina_listagem)} provas coletadas desta página. Total parcial: {len(todas_as_provas_coletadas_da_listagem)}")
        if len(provas_da_pagina_listagem) == 0 and pagina_atual > 1 : 
            print(f"Página {pagina_atual} não retornou novas provas, assumindo fim da paginação.")
            break
        pagina_atual += 1
        time.sleep(0.5)

    print(f"\n--- Coleta preliminar da listagem finalizada. Total de {len(todas_as_provas_coletadas_da_listagem)} links de provas coletados para {url_categoria_base} ---")

    if not todas_as_provas_coletadas_da_listagem:
        print("Nenhuma prova foi coletada da listagem. Encerrando.")
    else:
        print(f"\n--- Iniciando extração de detalhes, PDFs e GABARITOS ---")
        provas_finais_com_detalhes_e_gabaritos = []
        itens_a_processar_detalhes = todas_as_provas_coletadas_da_listagem[:LIMITE_ITENS_DETALHES_PARA_TESTE]
        for i, prova_info_listagem in enumerate(itens_a_processar_detalhes):
            print(f"Processando item {i+1}/{len(itens_a_processar_detalhes)}: \"{prova_info_listagem['nome_prova_cargo_listagem']}\" URL: {prova_info_listagem['url_pagina_detalhes']}")
            dados_detalhe_com_gabarito = extrair_dados_detalhes_prova(prova_info_listagem['url_pagina_detalhes'], prova_info_listagem) 
            
            prova_final = prova_info_listagem.copy()
            if dados_detalhe_com_gabarito:
                prova_final.update(dados_detalhe_com_gabarito)
            else:
                chaves_esperadas_detalhe = ['url_pdf_prova', 'url_pdf_gabarito', 'todos_url_pdf_encontrados', 'nome_prova_detalhe', 'cargo_detalhe', 'ano_detalhe', 'órgão_detalhe', 'instituição_detalhe', 'nível_detalhe', 'texto_gabarito_extraido', 'gabarito_estruturado']
                for k in chaves_esperadas_detalhe:
                    if k not in prova_final:
                        if 'url' in k and 'todos' not in k: prova_final[k] = None
                        elif 'todos_url' in k: prova_final[k] = []
                        elif 'gabarito_estruturado' in k: prova_final[k] = {}
                        elif 'texto_gabarito' in k: prova_final[k] = None
                        else: prova_final[k] = None
            provas_finais_com_detalhes_e_gabaritos.append(prova_final)
            time.sleep(0.2)

        if provas_finais_com_detalhes_e_gabaritos:
            nome_categoria_para_arquivo = url_categoria_base.split("/")[-1] if url_categoria_base.split("/")[-1] else url_categoria_base.split("/")[-2]
            nome_arquivo_csv = os.path.join(output_dir, f'provas_com_gabaritos_{nome_categoria_para_arquivo}.csv')
            print(f"\nSalvando {len(provas_finais_com_detalhes_e_gabaritos)} provas com detalhes e gabaritos (texto bruto) em {nome_arquivo_csv}...")
            todas_as_chaves = set()
            for d in provas_finais_com_detalhes_e_gabaritos:
                todas_as_chaves.update(d.keys())
            ordem_colunas_sugerida = [
                'identificador_prova', 'nome_prova_cargo_listagem', 'url_pagina_detalhes', 
                'ano_listagem', 'orgao_listagem', 'banca_listagem', 'nivel_listagem',
                'nome_prova_detalhe', 'cargo_detalhe', 'ano_detalhe', 'órgão_detalhe', 
                'instituição_detalhe', 'nível_detalhe',
                'url_pdf_prova', 'url_pdf_gabarito', 'todos_url_pdf_encontrados',
                'texto_gabarito_extraido', 'gabarito_estruturado'
            ]
            fieldnames = [col for col in ordem_colunas_sugerida if col in todas_as_chaves]
            fieldnames.extend(sorted([key for key in todas_as_chaves if key not in ordem_colunas_sugerida]))
            with open(nome_arquivo_csv, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore', quoting=csv.QUOTE_ALL)
                writer.writeheader()
                writer.writerows(provas_finais_com_detalhes_e_gabaritos)
            print(f"Dados salvos em {nome_arquivo_csv}")
        else:
            print("Nenhuma prova final foi processada.")
    print("Scraper finalizado.")