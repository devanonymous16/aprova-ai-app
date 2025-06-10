from __future__ import annotations # Garante que anotações de tipo futuras sejam strings

import os
import re
import csv
import json
import time
import typing # Usado para TYPE_CHECKING e Any
import traceback
from typing import TYPE_CHECKING, Any, Optional
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# ─── TYPE-HINTS SEGUROS PARA PYLANCE ────────────────────────────────────────
# ---------------------------------------------------------------------------
if TYPE_CHECKING:
    from supabase import Client as SupabaseClient_TypeHint
    from postgrest import APIError as PostgrestAPIError_TypeHint
    from vertexai.generative_models import GenerationResponse as VertexGenerationResponse_TypeHint
    from vertexai.generative_models import Candidate as VertexCandidate_TypeHint 
    from vertexai.generative_models import FinishReason as VertexFinishReason_TypeHint
    from vertexai.generative_models import HarmCategory as VertexHarmCategory_TypeHint
    from vertexai.generative_models import HarmBlockThreshold as VertexHarmBlockThreshold_TypeHint
else:
    SupabaseClient_TypeHint = Any
    PostgrestAPIError_TypeHint = Any 
    VertexGenerationResponse_TypeHint = Any
    VertexCandidate_TypeHint = Any 
    VertexFinishReason_TypeHint = Any 
    VertexHarmCategory_TypeHint = Any
    VertexHarmBlockThreshold_TypeHint = Any


# ---------------------------------------------------------------------------
# ─── IMPORTS CONDICIONAIS (EVITA CRASH SE LIB FALTAR EM TEMPO DE RUN) ──────
# ---------------------------------------------------------------------------
try:
    from supabase import create_client, Client
    from postgrest import APIError 
    _supabase_create_client_runtime = create_client
    _SupabaseClient_runtime = Client 
    _PostgrestAPIError_runtime = APIError
except ImportError:
    print("Supabase não instalada – `pip install supabase` para habilitar.")
    Client = None 
    APIError = None 
    _supabase_create_client_runtime = None
    _PostgrestAPIError_runtime = None


try:
    from google.cloud import aiplatform
    from google.cloud import storage as gcs_storage
    from vertexai.generative_models import (
        GenerativeModel, Part, GenerationConfig, 
        Candidate, GenerationResponse, 
        FinishReason, 
        HarmCategory, HarmBlockThreshold 
    )
    _google_cloud_ok = True
except ImportError:
    print("Google Cloud libs ausentes – instale:")
    print("pip install google-cloud-aiplatform google-cloud-storage google-cloud-aiplatform[generative_models]")
    aiplatform = None
    gcs_storage = None
    GenerativeModel = None 
    Part = None            
    GenerationConfig = None
    Candidate = None       
    GenerationResponse = None 
    FinishReason = None     
    HarmCategory = None 
    HarmBlockThreshold = None 
    _google_cloud_ok = False

# ---------------------------------------------------------------------------
# ─── CONFIG GERAL ───────────────────────────────────────────────────────────
# ---------------------------------------------------------------------------
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    print("[.env] Arquivo não encontrado – certifique-se de que as variáveis de ambiente estão definidas externamente.")

BASE_URL_SITE_RAIZ = "https://www.pciconcursos.com.br"
MAX_OUTPUT_TOKENS_GEMINI = 64000 
TAMANHO_LOTE_QUESTOES_LLM = 15 
PAUSA_ENTRE_LOTES_LLM_SEGUNDOS = 2

# ---------------------------------------------------------------------------
# ─── UTILITÁRIOS DE DOWNLOAD/UPLOAD ─────────────────────────────────────────
# ---------------------------------------------------------------------------
def baixar_pdf_para_arquivo(url_pdf: str, destino: str) -> bool:
    if not url_pdf or not destino:
        return False
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 PCIConcursosScraper/3.6 (+https://aprova-ai.com)" 
            )
        }
        r = requests.get(url_pdf, headers=headers, timeout=45, stream=True)
        r.raise_for_status()
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        with open(destino, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        return True
    except requests.exceptions.Timeout: print(f"        ✖ TIMEOUT ao baixar PDF: {url_pdf}")
    except requests.exceptions.RequestException as e_req: print(f"        ✖ ERRO DE REQUISIÇÃO ao baixar PDF {url_pdf}: {e_req}")
    except OSError as e_os: print(f"        ✖ ERRO DE OS ao salvar PDF {destino}: {e_os}")
    except Exception as exc:
        print(f"        ✖ ERRO INESPERADO ao baixar/salvar PDF {url_pdf}: {exc}")
        return False

def upload_para_gcs(
    caminho_local: str, bucket_name: str, blob_name: str
) -> typing.Optional[str]:
    if not _google_cloud_ok or not gcs_storage: 
        return None
    if not os.path.exists(caminho_local):
        print(f"[GCS] Arquivo não encontrado: {caminho_local}")
        return None
    try:
        client = gcs_storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        blob.upload_from_filename(caminho_local)
        return f"gs://{bucket_name}/{blob_name}"
    except Exception as exc:
        print(f"        [GCS] ERRO INESPERADO no upload: {exc}")
        return None

def sanitizar_nome_arquivo(nome: str) -> str:
    nome_str = str(nome) if nome is not None else ""
    nome_str = re.sub(r"[^\w\s-]", "", nome_str)
    nome_str = re.sub(r"[-\s]+", "_", nome_str).strip("_")
    return nome_str[:100]

# ---------------------------------------------------------------------------
# --- Funções de Extração do PCI Concursos ---
# ---------------------------------------------------------------------------
def extrair_dados_detalhes_prova(url_pagina_detalhes: str, info_listagem_original: Optional[dict] = None) -> dict:
    dados_retorno = {
        "url_pdf_prova": None, 
        "url_pdf_gabarito": None, 
        "todos_url_pdf_encontrados": [],
        "nome_prova_detalhe": info_listagem_original.get('nome_prova_original') if info_listagem_original else "Não encontrado (detalhe)",
        "cargo_detalhe": info_listagem_original.get('nome_prova_original') if info_listagem_original else None,
        "ano_detalhe": info_listagem_original.get('ano') if info_listagem_original else None,
        "órgão_detalhe": info_listagem_original.get('orgao_original') if info_listagem_original else None, 
        "instituição_detalhe": info_listagem_original.get('banca_original') if info_listagem_original else None,
        "nível_detalhe": info_listagem_original.get('nivel_original') if info_listagem_original else None,
    }
    try:
        headers_detalhe = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 PCIConcursosScraper/3.6 (Detalhes)'}
        response_detalhe = requests.get(url_pagina_detalhes, headers=headers_detalhe, timeout=20)
        response_detalhe.raise_for_status()
        soup_detalhe = BeautifulSoup(response_detalhe.content, 'html.parser')
        
        nome_prova_tag_detalhe = soup_detalhe.find('h5', class_='text-pci')
        if nome_prova_tag_detalhe:
            text_parts = list(nome_prova_tag_detalhe.stripped_strings)
            if text_parts:
                nome_prova_completo_detalhe = " ".join(text_parts)
                dados_retorno["nome_prova_detalhe"] = nome_prova_completo_detalhe.replace("Prova ", "", 1).strip()
                if not dados_retorno["cargo_detalhe"]: 
                    dados_retorno["cargo_detalhe"] = dados_retorno["nome_prova_detalhe"]

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
                    
                    is_gabarito = "gabarito" in texto_link or "gabarito" in url_pdf_completa.lower()
                    is_caderno = "caderno" in texto_link or "prova" in texto_link or \
                                 ("edital" not in texto_link and "gabarito" not in texto_link and "resultado" not in texto_link and "inscrições" not in texto_link)
                    
                    if is_gabarito:
                        if not dados_retorno["url_pdf_gabarito"]:
                            dados_retorno["url_pdf_gabarito"] = url_pdf_completa
                        elif "definitivo" in texto_link and (not dados_retorno.get("url_pdf_gabarito","") or "definitivo" not in dados_retorno.get("url_pdf_gabarito","").lower()):
                            dados_retorno["url_pdf_gabarito"] = url_pdf_completa
                        elif "preliminar" not in texto_link and "preliminar" in dados_retorno.get("url_pdf_gabarito","").lower() :
                             dados_retorno["url_pdf_gabarito"] = url_pdf_completa
                    elif is_caderno:
                        if not dados_retorno["url_pdf_prova"]:
                            dados_retorno["url_pdf_prova"] = url_pdf_completa
            
            if not dados_retorno["url_pdf_prova"] and dados_retorno["todos_url_pdf_encontrados"]:
                for url_pdf in dados_retorno["todos_url_pdf_encontrados"]:
                    if url_pdf != dados_retorno.get("url_pdf_gabarito"): 
                        if not ("gabarito" in url_pdf.lower() or "edital" in url_pdf.lower() or "resultado" in url_pdf.lower() or "inscrições" in url_pdf.lower()):
                            dados_retorno["url_pdf_prova"] = url_pdf
                            break 
            if not dados_retorno["url_pdf_prova"] and \
               len(dados_retorno["todos_url_pdf_encontrados"]) == 1 and \
               dados_retorno["todos_url_pdf_encontrados"][0] != dados_retorno.get("url_pdf_gabarito") and \
               not ("edital" in dados_retorno["todos_url_pdf_encontrados"][0].lower() or \
                    "gabarito" in dados_retorno["todos_url_pdf_encontrados"][0].lower() or \
                    "resultado" in dados_retorno["todos_url_pdf_encontrados"][0].lower() or \
                    "inscrições" in dados_retorno["todos_url_pdf_encontrados"][0].lower()):
                dados_retorno["url_pdf_prova"] = dados_retorno["todos_url_pdf_encontrados"][0]

        ul_metadados = soup_detalhe.find('ul', class_='list-unstyled') 
        if ul_metadados:
            for li_item in ul_metadados.find_all('li', recursive=False): 
                strong_tag = li_item.find('strong')
                if strong_tag:
                    label_bruto = strong_tag.get_text(strip=True).lower()
                    label = label_bruto.replace(":", "").strip()
                    
                    valor_final = ""
                    valor_tag_candidata = strong_tag.parent.find(['a', 'span'], class_='text-pci')
                    if valor_tag_candidata:
                        valor_final = valor_tag_candidata.get_text(strip=True)
                    else: 
                        valor_temp = ""
                        proximo_elemento = strong_tag.next_sibling
                        while proximo_elemento:
                            if hasattr(proximo_elemento, 'name') and proximo_elemento.name == 'br': break
                            if isinstance(proximo_elemento, str): valor_temp += proximo_elemento.strip()
                            elif hasattr(proximo_elemento, 'get_text'): valor_temp += " " + proximo_elemento.get_text(strip=True)
                            proximo_elemento = proximo_elemento.next_sibling
                        valor_final = " ".join(valor_temp.split()).strip()
                    
                    if valor_final:
                        if label == "cargo": dados_retorno["cargo_detalhe"] = valor_final
                        elif label == "ano": dados_retorno["ano_detalhe"] = valor_final
                        elif label == "órgão": dados_retorno["órgão_detalhe"] = valor_final
                        elif label == "instituição": dados_retorno["instituição_detalhe"] = valor_final
                        elif label == "nível": dados_retorno["nível_detalhe"] = valor_final
        
        if not dados_retorno.get("cargo_detalhe") and dados_retorno.get("nome_prova_detalhe"):
            dados_retorno["cargo_detalhe"] = dados_retorno.get("nome_prova_detalhe")
        return dados_retorno
    except requests.exceptions.RequestException as e_req:
        print(f"      Erro de requisição ao acessar detalhes {url_pagina_detalhes}: {e_req}")
    except Exception as e_det:
        print(f"      Erro inesperado ao processar detalhes de {url_pagina_detalhes}: {e_det}")
    return dados_retorno

def extrair_total_paginas(soup: BeautifulSoup) -> Optional[int]:
    try:
        span_paginacao = soup.find('span', id='prova_pagina')
        if span_paginacao:
            span_texto_interno = span_paginacao.find('span') 
            if span_texto_interno:
                texto_paginacao = span_texto_interno.get_text(strip=True)
                match = re.search(r'de\s+(\d+)', texto_paginacao)
                if match: return int(match.group(1))
    except Exception as e: print(f"    Erro ao extrair total de páginas: {e}")
    return None

def extrair_provas_da_pagina_listagem(url_listagem_categoria: str, base_url_para_join: str) -> tuple[list, bool, Optional[int]]:
    provas_nesta_pagina = []
    total_paginas_detectado = None 
    try:
        headers_listagem = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 PCIConcursosScraper/3.6 (Listagem)'}
        response = requests.get(url_listagem_categoria, headers=headers_listagem, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        total_paginas_detectado = extrair_total_paginas(soup)
        tabela_provas = soup.find('table', id='lista_provas')
        if not tabela_provas:
            return [], False, total_paginas_detectado
        tbody = tabela_provas.find('tbody')
        todas_as_linhas_da_secao_de_dados = tbody.find_all('tr') if tbody else tabela_provas.find_all('tr')
        if not todas_as_linhas_da_secao_de_dados: return [], True, total_paginas_detectado 
        
        linhas_de_dados = [] 
        if len(todas_as_linhas_da_secao_de_dados) > 0:
            primeira_linha_th = todas_as_linhas_da_secao_de_dados[0].find_all('th')
            primeira_linha_tds_com_classe_ua = todas_as_linhas_da_secao_de_dados[0].find_all('td', class_='ua', limit=1)
            if primeira_linha_th or primeira_linha_tds_com_classe_ua:
                 if len(todas_as_linhas_da_secao_de_dados) > 1:
                    linhas_de_dados = todas_as_linhas_da_secao_de_dados[1:]
                 else: 
                    return [], True, total_paginas_detectado 
            else: 
                linhas_de_dados = todas_as_linhas_da_secao_de_dados
        
        if not linhas_de_dados: return [], True, total_paginas_detectado

        for tr in linhas_de_dados:
            celulas = tr.find_all('td')
            if len(celulas) >= 5:
                try:
                    td_nome_link = celulas[0]
                    link_detalhes_tag = td_nome_link.find('a', class_='prova_download')
                    if not link_detalhes_tag: continue 
                    
                    nome_prova_cargo = link_detalhes_tag.get_text(strip=True)
                    url_pagina_detalhes_relativa = link_detalhes_tag.get('href')
                    url_pagina_detalhes_completa = urljoin(base_url_para_join, url_pagina_detalhes_relativa)
                    ano_str = celulas[1].get_text(strip=True)
                    orgao_tag = celulas[2].find('a')
                    orgao = orgao_tag.get_text(strip=True) if orgao_tag else celulas[2].get_text(strip=True)
                    banca_tag = celulas[3].find('a')
                    banca = banca_tag.get_text(strip=True) if banca_tag else celulas[3].get_text(strip=True)
                    nivel = celulas[4].get_text(strip=True)
                    
                    provas_nesta_pagina.append({
                        'id_prova_pci': url_pagina_detalhes_completa, 
                        'nome_prova_original': nome_prova_cargo, 
                        'url_pagina_detalhes': url_pagina_detalhes_completa,
                        'ano': ano_str,
                        'orgao_original': orgao, 
                        'banca_original': banca, 
                        'nivel_original': nivel,
                        'status_coleta_pdf': 'pendente_detalhes',
                        'url_pdf_prova_pci': None,
                        'url_pdf_gabarito_pci': None
                    })
                except Exception as e_linha:
                    print(f"      Erro ao processar linha da tabela: {e_linha} - Linha: {tr.get_text(strip=True)[:100]}")
                    continue
        return provas_nesta_pagina, True, total_paginas_detectado
    except requests.exceptions.RequestException as e_req_list:
        print(f"    Erro de requisição para {url_listagem_categoria}: {e_req_list}")
        return [], False, None
    except Exception as e_page_list:
        print(f"    Erro inesperado em {url_listagem_categoria}: {e_page_list}")
        return [], False, None

# ---------------------------------------------------------------------------
# --- FUNÇÃO DE ANÁLISE COM GEMINI (AJUSTADA) ---
# ---------------------------------------------------------------------------
def analisar_prova_com_gemini(gcs_uri_prova, gcs_uri_gabarito, metadados_prova,
                             project_id, location, 
                             model_name, 
                             item_inicio=1, item_fim=None) -> Optional[dict]:
    if not _google_cloud_ok or not all([aiplatform, GenerativeModel, Part, GenerationConfig, Candidate, GenerationResponse, HarmCategory, HarmBlockThreshold, FinishReason]):
        print("    [LLM ERRO] Bibliotecas Google AI não carregadas. Análise LLM pulada.")
        return None
    
    aiplatform.init(project=project_id, location=location)
    instrucao_lote = f"Analise APENAS as questões de número {item_inicio} até {item_fim if item_fim else 'o final da prova'} no PDF da prova."
    if not item_fim: 
        instrucao_lote = f"Analise as questões a partir do número {item_inicio} até o final da prova."
    
    prompt_llm = f"""Você é um especialista em análise de provas de exames de conhecimento, tais como vestibulares e concursos públicos.
Sua tarefa é processar os arquivos PDF de uma prova e seu respectivo gabarito (quando fornecido) e extrair, analisar e estruturar cada questão individualmente.

Metadados da Prova Fornecidos:
- Ano: {metadados_prova.get('ano', 'N/A')}
- Banca Organizadora: {metadados_prova.get('banca_original', 'N/A')}
- Órgão Aplicador: {metadados_prova.get('orgao_original', 'N/A')}
- Cargo/Prova (Nome): {metadados_prova.get('nome_prova_original', 'N/A')}
- Nível de Escolaridade: {metadados_prova.get('nivel_original', 'N/A')}
- Tipo de Exame: {metadados_prova.get('tipo_exame', 'Concurso Público')}
- URL da Prova no GCS: {metadados_prova.get('gcs_uri_prova', 'N/A')} 
- ID da Prova no PCI Concursos: {metadados_prova.get('id_prova_pci', 'N/A')}
- Categoria PCI (Usada para agrupar provas, pode se relacionar ao Cargo): {metadados_prova.get('categoria_pci', 'N/A')}

Instruções Detalhadas para Extração de Questões:
{instrucao_lote}
Para CADA questão DENTRO DESTE INTERVALO encontrada no PDF da prova, você deve fornecer as seguintes informações em um objeto JSON dentro de uma lista chamada "questoes":
1.  "sequencial_original": (Integer) O número original da questão como aparece na prova. Se não houver número, tente inferir a sequência.
2.  "statement": (String) O enunciado completo da questão. Remova qualquer texto como "Questão X" do início do enunciado. Se o enunciado for muito curto ou parecer incompleto, indique.
3.  "item_a": (String ou null) Texto completo da alternativa A. Se for questão Certo/Errado, deixe null. Se a alternativa não existir (ex: menos de 4 alternativas), deixe null.
4.  "explanation_a": (String ou null) Uma breve explicação concisa (1-2 frases) do porquê a alternativa A está correta ou incorreta. Se for questão Certo/Errado ou se não houver alternativa A, deixe null.
5.  "item_b": (String ou null) Texto completo da alternativa B. Se for questão Certo/Errado, deixe null.
6.  "explanation_b": (String ou null) Breve explicação para B. Se for questão Certo/Errado ou se não houver alternativa B, deixe null.
7.  "item_c": (String ou null) Texto completo da alternativa C. Se for questão Certo/Errado, deixe null.
8.  "explanation_c": (String ou null) Breve explicação para C. Se for questão Certo/Errado ou se não houver alternativa C, deixe null.
9.  "item_d": (String ou null) Texto completo da alternativa D. Se for questão Certo/Errado, deixe null.
10. "explanation_d": (String ou null) Breve explicação para D. Se for questão Certo/Errado ou se não houver alternativa D, deixe null.
11. "item_e": (String ou null, Opcional) Texto completo da alternativa E, se existir. Se não existir, deixe null.
12. "explanation_e": (String ou null, Opcional) Breve explicação para E. Se não houver alternativa E, deixe null.
13. "item_text": (String ou null) Se for uma questão do tipo Certo/Errado (onde se julga uma afirmativa), este campo deve conter o texto completo da afirmativa a ser julgada. Se for múltipla escolha, deixe null.
14. "explanation_text": (String ou null) Se for uma questão do tipo Certo/Errado E "item_text" estiver preenchido, forneça uma breve explicação concisa (1-2 frases) do porquê o "item_text" é Certo ou Errado, com base no gabarito. Se for múltipla escolha, deixe null. É crucial fornecer esta explicação para questões Certo/Errado.
15. "correct_option": (String) Identifique a alternativa correta (ex: "A", "B", "C", "D", "E", "CERTO", "ERRADO", "ANULADA"). Use o PDF do Gabarito Oficial como fonte primária. Se o gabarito não estiver disponível/claro, tente inferir e mencione isso na sua análise ou use "INDEFINIDA". Se a questão foi anulada, use "ANULADA".
16. "reference_text": (String ou null, Opcional) Se a questão se basear explicitamente em um trecho de texto de apoio (texto base) apresentado na prova, extraia e inclua esse texto aqui.
17. "reference_image_description": (String ou null, Opcional) Se a questão se referir a uma imagem, descreva-a detalhadamente. Sua descrição será usada como prompt para que ela seja recriada posteriormente por outra LLM.
18. "exam_subject_sugerido": (String) A disciplina (matéria) principal da questão (ex: "Língua Portuguesa", "Matemática", "Direito Constitucional"). Deve ser um valor coerente.
19. "exam_topic_sugerido": (String) O tópico mais específico dentro da disciplina (ex: "Concordância Verbal", "Porcentagem", "Controle de Constitucionalidade"). Deve ser um valor coerente.
20. "exam_subtopic_sugerido": (String ou null, Opcional) Um subtópico ainda mais específico.
21. "knowledge_area_sugerido": (String) Classifique a disciplina principal da questão em uma das seguintes áreas de conhecimento: "Conhecimentos Gerais", "Conhecimentos Básicos", "Conhecimentos Específicos", "Língua Portuguesa", "Raciocínio Lógico", "Informática", "Legislação". Escolha APENAS UMA e a mais apropriada. Se não se encaixar claramente, use "Conhecimentos Específicos" se for de uma área técnica do cargo, ou "Conhecimentos Gerais" caso contrário.
22. "question_style": (String) Use "ME5" (5 alternativas A,B,C,D,E), "ME4" (4 alternativas A,B,C,D), ou "CE" (Certo/Errado).
23. "difficulty_level_sugerido": (Integer) Nível de dificuldade percebido: 1 (Elementar), 2 (Fácil), 3 (Moderado), 4 (Difícil), 5 (Desafiador).
24. "ai_confidence_score": (Float) Sua confiança (de 0.0 a 1.0) na precisão da extração e análise desta questão específica.

Requisitos Obrigatórios para Múltipla Escolha (ME4, ME5):
- Os campos "item_a", "item_b", "item_c", "item_d" DEVEM ser preenchidos com o texto da alternativa.
- Se for ME5, "item_e" também DEVE ser preenchido.
- Se for ME4 e a prova só tiver 4 alternativas, "item_e" DEVE ser null.
- É crucial que para cada alternativa (A, B, C, D, E), uma explicação concisa seja fornecida em explanation_X.
- Ensure that the output is valid JSON. Do not include any reasoning or additional text.
- SUA ÚNICA E EXCLUSIVA SAÍDA DEVE SER UM OBJETO JSON VÁLIDO.
- NÃO inclua nenhum texto introdutório, pensamentos, ou qualquer outro conteúdo fora da estrutura JSON.
- Se, por qualquer motivo, você não conseguir processar o documento ou encontrar questões no intervalo especificado, sua resposta AINDA ASSIM DEVE SER um JSON contendo uma lista vazia para a chave "questoes".
- É ABSOLUTAMENTE PROIBIDO retornar qualquer texto que não seja o JSON formatado. Qualquer desvio do formato JSON será considerado uma falha.



Formato da Resposta Obrigatório: Retorne um ÚNICO objeto JSON contendo uma chave "questoes", cujo valor é uma lista dos objetos de questão. Analise APENAS as questões no intervalo especificado. Se nenhuma questão for encontrada no intervalo, retorne uma lista vazia para "questoes".
"""
    model = GenerativeModel(model_name)
    content_parts = [Part.from_text(prompt_llm)] 
    
    prova_part = Part.from_uri(mime_type="application/pdf", uri=gcs_uri_prova)
    content_parts.append(prova_part)
    
    if gcs_uri_gabarito:
        gabarito_part = Part.from_uri(mime_type="application/pdf", uri=gcs_uri_gabarito)
        content_parts.append(gabarito_part)
    
    generation_config = GenerationConfig(
        response_mime_type="application/json",
        temperature=0.1,
        max_output_tokens=MAX_OUTPUT_TOKENS_GEMINI 
    )
    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }

    try:
        response: VertexGenerationResponse_TypeHint = model.generate_content(
            content_parts, 
            generation_config=generation_config, 
            stream=False,
            safety_settings=safety_settings
        )

        if not response.candidates:
            print("    [LLM ERRO] Resposta do Gemini não contém 'candidates'.")
            if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                print(f"      [LLM DEBUG] Prompt Feedback: {response.prompt_feedback}")
            return None

        candidate: VertexCandidate_TypeHint = response.candidates[0]
        
        finish_reason_value = candidate.finish_reason
        finish_reason_name_str = finish_reason_value.name if hasattr(finish_reason_value, 'name') else "DESCONHECIDO"


        if finish_reason_value == FinishReason.MAX_TOKENS:
            print(f"    [LLM AVISO] Geração finalizada por MAX_TOKENS. A resposta pode estar incompleta ou o JSON truncado.")
        elif finish_reason_value == FinishReason.SAFETY:
            print(f"    [LLM AVISO] Geração finalizada por SAFETY (filtros de segurança). A resposta pode estar vazia ou incompleta.")
            if hasattr(candidate, 'safety_ratings') and candidate.safety_ratings:
                print(f"      [LLM DEBUG] Safety Ratings: {candidate.safety_ratings}")
        elif finish_reason_value != FinishReason.STOP:
             print(f"    [LLM AVISO] Geração finalizada por motivo não ideal: {finish_reason_name_str}")


        if not hasattr(candidate, 'content') or not candidate.content or not hasattr(candidate.content, 'parts') or not candidate.content.parts:
            print(f"    [LLM ERRO] Candidato da resposta (finish_reason: {finish_reason_name_str}) não tem 'content' ou 'parts' válidos.")
            if finish_reason_value == FinishReason.SAFETY:
                return {"questoes": []} 
            return None 
        
        response_text_from_parts = "".join(part.text for part in candidate.content.parts if hasattr(part, "text"))

        if not response_text_from_parts:
            print(f"    [LLM ERRO] Conteúdo das partes da resposta do candidato (finish_reason: {finish_reason_name_str}) está vazio.")
            if finish_reason_value == FinishReason.SAFETY:
                return {"questoes": []}
            return None

        cleaned_response_text = response_text_from_parts.strip()
        if cleaned_response_text.startswith("```json"):
            cleaned_response_text = cleaned_response_text[7:]
        if cleaned_response_text.endswith("```"):
            cleaned_response_text = cleaned_response_text[:-3]
        cleaned_response_text = cleaned_response_text.strip()

        try:
            parsed_json = json.loads(cleaned_response_text)
            if "questoes" not in parsed_json or not isinstance(parsed_json["questoes"], list):
                print("    [LLM ERRO] Chave 'questoes' ausente ou não é uma lista no JSON retornado.")
                return {"questoes": []} 
            return parsed_json
        except json.JSONDecodeError as e_json:
            print(f"    [LLM ERRO JSONDecodeError] Falha ao decodificar JSON (finish_reason: {finish_reason_name_str}): {e_json}")
            if len(cleaned_response_text) < 1000:
                 print(f"      [LLM DEBUG] Texto completo que falhou no parse JSON:\n{cleaned_response_text}")
            else:
                context_around_error = 200
                error_snippet = cleaned_response_text[max(0, e_json.pos - context_around_error) : e_json.pos + context_around_error]
                print(f"      [LLM DEBUG] Trecho do texto que falhou no parse JSON (em torno do erro - char {e_json.pos}):\n{error_snippet}")
            
            if finish_reason_value == FinishReason.MAX_TOKENS:
                 print("      [LLM INFO] JSONDecodeError provavelmente devido a MAX_TOKENS ter truncado o JSON.")
            elif finish_reason_value == FinishReason.STOP:
                 print("      [LLM INFO] JSONDecodeError ocorreu apesar do finish_reason ser STOP. A resposta do modelo pode não ter sido um JSON válido ou estava vazia.")
            return None 

    except ValueError as ve: 
        print(f"    [LLM ERRO ValueError] Erro ao acessar/processar resposta: {ve}")
        if 'response' in locals() and response and hasattr(response, 'candidates') and response.candidates:
            for cand_idx, cand_obj in enumerate(response.candidates):
                fr_val = getattr(cand_obj, 'finish_reason', None)
                fr_name = fr_val.name if hasattr(fr_val, 'name') else 'N/A'
                print(f"        Candidato {cand_idx}: Finish Reason: {fr_name}, Safety: {getattr(cand_obj, 'safety_ratings', 'N/A')}")
        return None
    except Exception as e:
        print(f"    [LLM ERRO INESPERADO GERAL] Ao gerar conteúdo com Gemini: {type(e).__name__} - {e}")
        return None

# ---- Funções de Interação com Supabase ----
def get_supabase_client() -> typing.Optional[SupabaseClient_TypeHint]: 
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_SERVICE_KEY") 
    if not url or not key:
        print("[ERRO SUPABASE] SUPABASE_URL ou SUPABASE_SERVICE_KEY não definidas no ambiente ou .env")
        return None
    if not _supabase_create_client_runtime: 
        print("[ERRO SUPABASE] Função create_client do Supabase não importada corretamente.")
        return None
    try:
        supabase: SupabaseClient_TypeHint = _supabase_create_client_runtime(url, key) 
        return supabase
    except Exception as e:
        print(f"[ERRO SUPABASE] Falha ao criar cliente Supabase: {e}")
        return None

def get_or_create_reference_id(
    supabase: SupabaseClient_TypeHint, 
    table_name: str, 
    name_column: str, 
    name_value: Optional[str], 
    other_columns: Optional[dict] = None 
) -> typing.Optional[str]:
    if not supabase: 
        return None
    
    if not name_value or not name_value.strip():
        if table_name == "exam_subtopics" and name_column == "name": 
            return None 
        elif name_value is None: 
            return None
        elif not name_value.strip(): 
            return None
            
    name_value_cleaned = name_value.strip()
    
    try:
        query = supabase.table(table_name).select("id", count="exact").eq(name_column, name_value_cleaned)
        
        # Aplicar filtros de FK específicos para a busca
        if other_columns: 
            # Para exam_topics, a FK para exam_subjects é exam_subject_id
            if table_name == "exam_topics" and "exam_subject_id" in other_columns and other_columns["exam_subject_id"]:
                query = query.eq("exam_subject_id", other_columns["exam_subject_id"]) 
            # Para exam_subtopics, a FK para exam_topics é exam_topic_id
            elif table_name == "exam_subtopics" and "exam_topic_id" in other_columns and other_columns["exam_topic_id"]:
                query = query.eq("exam_topic_id", other_columns["exam_topic_id"]) 
            # Para exam_subjects, a FK para exam_areas é exam_area_id
            elif table_name == "exam_subjects" and "exam_area_id" in other_columns and other_columns["exam_area_id"]:
                query = query.eq("exam_area_id", other_columns["exam_area_id"])
            # Para exam_areas, a FK para exam_positions era exam_position_id (agora NULLABLE ou removida)
            # Se ainda existir e for relevante para a busca (improvável para criação de áreas genéricas):
            # elif table_name == "exam_areas" and "exam_position_id" in other_columns and other_columns["exam_position_id"]:
            #     query = query.eq("exam_position_id", other_columns["exam_position_id"])
        
        response = query.limit(1).execute()

        if response.data:
            return response.data[0]['id']
        else: 
            data_to_insert = {name_column: name_value_cleaned}
            if other_columns: 
                # Adicionar FKs ao criar novo registro, usando os nomes corretos das colunas
                if table_name == "exam_topics" and "exam_subject_id" in other_columns and other_columns["exam_subject_id"]:
                    data_to_insert["exam_subject_id"] = other_columns["exam_subject_id"]
                elif table_name == "exam_subtopics" and "exam_topic_id" in other_columns and other_columns["exam_topic_id"]:
                    data_to_insert["exam_topic_id"] = other_columns["exam_topic_id"] 
                elif table_name == "exam_subjects" and "exam_area_id" in other_columns and other_columns["exam_area_id"]:
                     data_to_insert["exam_area_id"] = other_columns["exam_area_id"]
                # Não adicionar exam_position_id automaticamente para exam_areas, pois uma área de conhecimento é genérica
                # elif table_name == "exam_areas" and "exam_position_id" in other_columns:
                #      if other_columns.get("exam_position_id"): 
                #         data_to_insert["exam_position_id"] = other_columns["exam_position_id"]

            insert_response = supabase.table(table_name).insert(data_to_insert).execute()
            
            if insert_response.data and len(insert_response.data) > 0:
                new_id = insert_response.data[0]['id']
                return new_id
            else:
                return None

    except _PostgrestAPIError_runtime as e: 
        print(f"    [SUPABASE API ERRO] Tabela: '{table_name}', Col: '{name_column}', Valor: '{name_value_cleaned}'. Erro: {getattr(e, 'message', str(e))}")
        return None
    except Exception as e:
        print(f"    [SUPABASE ERRO GENÉRICO] Em get_or_create_reference_id para tabela '{table_name}', valor '{name_value_cleaned}': {e}")
        return None

def get_or_create_exam_paper_id(
    supabase: SupabaseClient_TypeHint,
    prova_info_scraper: dict, 
    position_id: Optional[str] 
) -> Optional[str]:
    if not supabase: return None

    gcs_uri_prova = prova_info_scraper.get('gcs_uri_prova')
    if not gcs_uri_prova:
        print("    [SUPABASE ERRO] GCS URI da prova (gcs_uri_prova) não fornecido para exam_paper_id.")
        return None

    try:
        response = supabase.table("exam_papers").select("id").eq("file_storage_path", gcs_uri_prova).limit(1).execute()

        if response.data:
            return response.data[0]['id']
        else:
            year_val = None
            if prova_info_scraper.get('ano','').isdigit():
                year_val = int(prova_info_scraper.get('ano'))
            
            if not year_val:
                print(f"        [SUPABASE ERRO CRÍTICO] 'year_applied' é obrigatório para 'exam_papers' (prova: {gcs_uri_prova}).")
                return None

            exam_paper_data = {
                "file_storage_path": gcs_uri_prova, 
                "year_applied": year_val,          
                "description": prova_info_scraper.get('nome_prova_original'), 
                "exam_position_id": position_id, 
            }
            exam_paper_data_cleaned = {k:v for k,v in exam_paper_data.items() if v is not None}
            insert_response = supabase.table("exam_papers").insert(exam_paper_data_cleaned).execute()

            if insert_response.data and len(insert_response.data) > 0:
                new_id = insert_response.data[0]['id']
                return new_id
            else:
                return None

    except _PostgrestAPIError_runtime as e:
        print(f"    [SUPABASE API ERRO] Ao processar 'exam_papers' para '{gcs_uri_prova}'. Erro: {getattr(e, 'message', str(e))}")
        return None
    except Exception as e:
        print(f"    [SUPABASE ERRO GENÉRICO] Em get_or_create_exam_paper_id para '{gcs_uri_prova}': {e}")
        return None


def inserir_questoes_supabase(supabase: SupabaseClient_TypeHint, lista_questoes_llm: list, metadados_prova_gerais: dict) -> int:
    if not supabase:
        print("    [SUPABASE ERRO] Cliente Supabase não inicializado.")
        return 0
    
    questoes_para_inserir_supa = []
    sucessos = 0
    
    # Cargo/Posição (extraído pelo scraper)
    position_id_geral = get_or_create_reference_id(supabase, "exam_positions", "name", metadados_prova_gerais.get('nome_prova_original'))
    
    # Outras entidades de metadados da prova
    banca_id = get_or_create_reference_id(supabase, "exam_bancas", "name", metadados_prova_gerais.get('banca_original'))
    institution_id = get_or_create_reference_id(supabase, "exam_institutions", "name", metadados_prova_gerais.get('orgao_original'))
    education_id_geral = get_or_create_reference_id(supabase, "exam_education", "name", metadados_prova_gerais.get('nivel_original'))

    exam_paper_uuid = get_or_create_exam_paper_id(
        supabase,
        metadados_prova_gerais,
        position_id=position_id_geral
    )

    if not exam_paper_uuid:
        gcs_uri_debug = metadados_prova_gerais.get('gcs_uri_prova', 'GCS URI não disponível')
        print(f"    [SUPABASE ERRO CRÍTICO] Não foi possível obter/criar exam_paper_id para GCS: {gcs_uri_debug}. Questões não serão inseridas.")
        return 0

    SYSTEM_USER_ID = os.getenv("SYSTEM_USER_ID_FOR_QUESTIONS")
    if not SYSTEM_USER_ID:
        print("    [ERRO FATAL SUPABASE] SYSTEM_USER_ID_FOR_QUESTIONS não definido no .env. Este ID de usuário DEVE existir na sua tabela de usuários.")
        return 0 

    COLUNA_IDENTIFICADORA_EXAM_STYLES = "name" 

    for q_llm in lista_questoes_llm:
        # 1. ÁREA DE CONHECIMENTO (Knowledge Area) - Sugerida pela LLM
        knowledge_area_sugerido_pela_llm = q_llm.get('knowledge_area_sugerido')
        knowledge_area_id_para_questao = None 
        if knowledge_area_sugerido_pela_llm:
            # Popula a tabela 'exam_areas' com as áreas de conhecimento da LLM
            knowledge_area_id_para_questao = get_or_create_reference_id(supabase, "exam_areas", "name", knowledge_area_sugerido_pela_llm)

        # 2. DISCIPLINA (Subject) - Sugerida pela LLM, FK para knowledge_area_id (exam_areas)
        subject_id = None
        if knowledge_area_id_para_questao: # Só prossegue se a área de conhecimento foi definida
            subject_id = get_or_create_reference_id(supabase, "exam_subjects", "name", q_llm.get('exam_subject_sugerido'),
                                                    other_columns={"exam_area_id": knowledge_area_id_para_questao})
        else:
             # Se não tem área de conhecimento, tenta criar a disciplina sem ela (se exam_subjects.exam_area_id for NULLABLE)
             # Ou loga um aviso se for NOT NULL e não puder criar.
             # Schema atual: exam_subjects.exam_area_id é NOT NULL. Então subject_id será None se knowledge_area_id_para_questao for None.
             print(f"    [AVISO SUPABASE] Questão {q_llm.get('sequencial_original', '')}: knowledge_area_sugerido pela LLM não encontrado/criado ('{knowledge_area_sugerido_pela_llm}'). exam_subject_id não será definido.")
             subject_id = get_or_create_reference_id(supabase, "exam_subjects", "name", q_llm.get('exam_subject_sugerido')) # Tentativa sem exam_area_id
        
        # 3. TÓPICO (Topic) - Sugerido pela LLM, FK para exam_subject_id
        # exam_topics.exam_subject_id é NOT NULL.
        topic_id = None
        if subject_id: 
            topic_id = get_or_create_reference_id(supabase, "exam_topics", "name", q_llm.get('exam_topic_sugerido'), 
                                                  {"exam_subject_id": subject_id})
        
        # 4. SUBTÓPICO (Subtopic) - Sugerido pela LLM, FK para exam_topic_id
        # exam_subtopics.exam_topic_id é NOT NULL.
        subtopic_id = None
        if topic_id: 
            subtopic_id = get_or_create_reference_id(supabase, "exam_subtopics", "name", q_llm.get('exam_subtopic_sugerido'), 
                                                     {"exam_topic_id": topic_id})
        
        style_id = get_or_create_reference_id(supabase, "exam_styles", COLUNA_IDENTIFICADORA_EXAM_STYLES, q_llm.get('question_style')) 

        source_year_val = None
        if metadados_prova_gerais.get('ano','').isdigit():
            source_year_val = int(metadados_prova_gerais.get('ano'))
        
        # Validações de IDs FK obrigatórios para a tabela 'questions'
        if not subject_id: 
            print(f"    [AVISO SUPABASE] Questão {q_llm.get('sequencial_original', '')} pulada: 'exam_subject_id' é obrigatório e não pôde ser obtido/criado (valor: {q_llm.get('exam_subject_sugerido')}).")
            continue
        if not position_id_geral: # FK Not Null em 'questions'
            print(f"    [AVISO SUPABASE] Questão {q_llm.get('sequencial_original', '')} pulada: 'exam_position_id' é obrigatório e não pôde ser obtido/criado (valor: {metadados_prova_gerais.get('nome_prova_original')}).")
            continue
        if not style_id: # FK Not Null em 'questions'
            print(f"    [AVISO SUPABASE] Questão {q_llm.get('sequencial_original', '')} pulada: 'question_style_id' é obrigatório e não pôde ser obtido/criado (valor LLM: '{q_llm.get('question_style')}').")
            continue
        if not q_llm.get("statement"): # Not Null em 'questions'
            print(f"    [AVISO SUPABASE] Questão {q_llm.get('sequencial_original', '')} pulada: 'statement' está vazio.")
            continue

        questao_supa = {
            "origin_user": SYSTEM_USER_ID,                                  
            "area": knowledge_area_id_para_questao, # Esta é a FK para knowledge_areas (novo entendimento) - NULLABLE
            "exam_subject_id": subject_id,                                  
            "exam_position_id": position_id_geral,                          
            "exam_topic_id": topic_id,                                      
            "exam_subtopic_id": subtopic_id,                                
            "question_style_id": style_id, 
            "statement": q_llm.get("statement"),                            
            "item_a": q_llm.get("item_a"),                                  
            "explanation_a": q_llm.get("explanation_a"),                    
            "item_b": q_llm.get("item_b"),                                  
            "explanation_b": q_llm.get("explanation_b"),                    
            "item_c": q_llm.get("item_c"),                                  
            "explanation_c": q_llm.get("explanation_c"),                    
            "item_d": q_llm.get("item_d"),                                  
            "explanation_d": q_llm.get("explanation_d"),                    
            "item_e": q_llm.get("item_e"),                                  
            "explanation_e": q_llm.get("explanation_e"),                    
            "item_text": q_llm.get("item_text"),  
            "explanation_text": q_llm.get("explanation_text"), # NOVA COLUNA                          
            "correct_option": q_llm.get("correct_option"),                  
            "reference_text": q_llm.get("reference_text"),                  
            "reference_image_url": q_llm.get("reference_image_description"),
            "source_exam_paper_id": exam_paper_uuid,                        
            "exam_institution_id": institution_id,                          
            "source_year": source_year_val,                                 
            # "created_by_ai": False, # Omitido, DEFAULT é FALSE no schema de questions
            "difficulty_level": q_llm.get("difficulty_level_sugerido"),     
            "exam_banca_id": banca_id,                                      
            "exam_type": metadados_prova_gerais.get('tipo_exame', "Concurso Público"), 
            "education_level_id": education_id_geral,                       
        }
        
        questao_supa_limpa = {k: v for k, v in questao_supa.items() if v is not None}
        questoes_para_inserir_supa.append(questao_supa_limpa)

    if questoes_para_inserir_supa:
        try:
            batch_size = 50 
            for i_batch in range(0, len(questoes_para_inserir_supa), batch_size):
                batch = questoes_para_inserir_supa[i_batch:i_batch + batch_size]
                response = supabase.table('questions').insert(batch).execute()

                if response.data:
                    sucessos += len(response.data)
                else:
                    print(f"        [SUPABASE WARN] Inserção de lote não retornou dados claros. Resposta: {response}")
            # print(f"    [SUPABASE] Total de {sucessos} questões inseridas com sucesso.")


        except _PostgrestAPIError_runtime as e: 
            print(f"        [SUPABASE API ERRO] Falha ao inserir lote de questões: {getattr(e, 'message', str(e))}")
            if hasattr(e, 'message'):
                msg_lower = e.message.lower()
                first_item_debug_json = json.dumps(batch[0] if batch else {}, indent=2, ensure_ascii=False)
                if 'violates foreign key constraint' in msg_lower:
                    print(f"          [DEBUG FK VIOLATION] Primeiro item do lote:\n{first_item_debug_json}")
                elif 'invalid input syntax for type uuid' in msg_lower:
                     print(f"          [DEBUG UUID SYNTAX] Primeiro item do lote:\n{first_item_debug_json}")
                elif 'null value in column' in msg_lower and 'violates not-null constraint' in msg_lower:
                     column_name_match = re.search(r'column "([^"]+)" of relation "questions"', msg_lower)
                     column_name = column_name_match.group(1) if column_name_match else "DESCONHECIDA"
                     print(f"          [DEBUG NOT-NULL VIOLATION] Coluna '{column_name}'. Primeiro item do lote:\n{first_item_debug_json}")
        except Exception as e: 
            print(f"    [SUPABASE ERRO INESPERADO] Ao inserir questões: {e}")
    return sucessos

# --- Início do if __name__ == "__main__": ---
if __name__ == "__main__":
    print("Carregando variáveis de ambiente...")
    dotenv_path_main = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(dotenv_path_main):
        load_dotenv(dotenv_path_main)
    else:
        print(f"    Arquivo .env NÃO encontrado em: {dotenv_path_main}.")
    
    GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
    GCP_LOCATION = os.getenv("GCP_LOCATION")     
    GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
    GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME") 
    
    print(f"    Configurações: GCP_PROJECT_ID: {GCP_PROJECT_ID}, GCP_LOCATION: {GCP_LOCATION}, GCS_BUCKET_NAME: {GCS_BUCKET_NAME}, GEMINI_MODEL_NAME: {GEMINI_MODEL_NAME}")

    url_categoria_base_input = input("Por favor, insira a URL da categoria do PCI Concursos (ex: https://www.pciconcursos.com.br/provas/medico-veterinario): ")
    if not url_categoria_base_input or not url_categoria_base_input.startswith("https://www.pciconcursos.com.br/provas/"):
        print("URL inválida. Usando exemplo: https://www.pciconcursos.com.br/provas/medico-veterinario")
        url_categoria_base_input = "https://www.pciconcursos.com.br/provas/medico-veterinario"
    
    categorias_para_raspar = [url_categoria_base_input]
    
    raiz_output_dir = "output_scraper_pci"
    pdf_download_dir_local = os.path.join(raiz_output_dir, "downloaded_pdfs_local")
    os.makedirs(pdf_download_dir_local, exist_ok=True)
    
    supabase_client = get_supabase_client() 
    if not supabase_client:
        print("[ERRO FATAL] Cliente Supabase não pôde ser inicializado. Encerrando script.")
        exit()


    nome_arquivo_csv_geral_provas = os.path.join(raiz_output_dir, 'todas_provas_coletadas_pci_com_gcs.csv')
    
    fieldnames_geral_provas = [
        'id_prova_pci', 'categoria_pci', 'nome_prova_original', 'url_pagina_detalhes', 
        'ano', 'orgao_original', 'banca_original', 'nivel_original',
        'url_pdf_prova_pci', 'caminho_local_prova_pdf', 'gcs_uri_prova',
        'url_pdf_gabarito_pci', 'caminho_local_gabarito_pdf', 'gcs_uri_gabarito',
        'status_coleta_pdf', 'status_upload_gcs', 'status_llm', 'status_supabase',
        'todos_url_pdf_encontrados_detalhe'
    ]

    ids_provas_ja_processadas_com_sucesso_llm_e_supabase = set()
    if os.path.exists(nome_arquivo_csv_geral_provas):
        try:
            with open(nome_arquivo_csv_geral_provas, 'r', newline='', encoding='utf-8') as f_read:
                reader = csv.DictReader(f_read)
                for row in reader:
                    if row.get('id_prova_pci') and \
                       row.get('status_llm', '').startswith('sucesso_') and \
                       row.get('status_supabase', '').startswith('sucesso_'): 
                        ids_provas_ja_processadas_com_sucesso_llm_e_supabase.add(row['id_prova_pci'])
            if ids_provas_ja_processadas_com_sucesso_llm_e_supabase:
                print(f"Encontradas {len(ids_provas_ja_processadas_com_sucesso_llm_e_supabase)} provas já processadas com sucesso no CSV.")
        except Exception as e_read_csv:
            print(f"Erro ao ler CSV de provas processadas: {e_read_csv}.")

    primeira_escrita_header = not os.path.exists(nome_arquivo_csv_geral_provas) or os.path.getsize(nome_arquivo_csv_geral_provas) == 0

    with open(nome_arquivo_csv_geral_provas, 'a', newline='', encoding='utf-8') as csvfile_geral:
        writer_geral = csv.DictWriter(csvfile_geral, fieldnames=fieldnames_geral_provas, extrasaction='ignore')
        if primeira_escrita_header:
            writer_geral.writeheader()

        for url_categoria_base in categorias_para_raspar:
            path_parts = [part for part in url_categoria_base.strip('/').split('/') if part]
            categoria_pci_do_scraper = path_parts[-1] if path_parts else "desconhecida" # Nome da categoria PCI original
            categoria_atual_fs = sanitizar_nome_arquivo(categoria_pci_do_scraper)
            
            print(f"\n\n--- Iniciando scraper para CATEGORIA PCI: {categoria_pci_do_scraper} ({url_categoria_base}) ---")
            
            todas_as_provas_desta_categoria = []
            pagina_atual = 1
            MAX_PAGINAS_POR_CATEGORIA_FALLBACK = 3 
            LIMITE_ITENS_DETALHES_POR_CATEGORIA_PARA_TESTE = 70
            
            total_paginas_categoria = None
            limite_paginacao_real = MAX_PAGINAS_POR_CATEGORIA_FALLBACK

            while True: 
                if pagina_atual == 1: url_alvo_listagem = url_categoria_base
                else: url_alvo_listagem = urljoin(f"{url_categoria_base.strip('/')}/", str(pagina_atual))

                provas_da_pagina, processada_ok, paginas_detectadas = extrair_provas_da_pagina_listagem(url_alvo_listagem, BASE_URL_SITE_RAIZ)

                if not processada_ok: break
                if pagina_atual == 1 and paginas_detectadas:
                    total_paginas_categoria = paginas_detectadas
                    limite_paginacao_real = min(total_paginas_categoria, MAX_PAGINAS_POR_CATEGORIA_FALLBACK) if MAX_PAGINAS_POR_CATEGORIA_FALLBACK is not None else total_paginas_categoria
                elif pagina_atual == 1 and not paginas_detectadas:
                    pass
                if not provas_da_pagina: break
                
                for prova_listagem in provas_da_pagina:
                    prova_listagem['categoria_pci'] = categoria_pci_do_scraper # Armazena a categoria original do PCI
                    todas_as_provas_desta_categoria.append(prova_listagem)
                if pagina_atual >= limite_paginacao_real: break
                pagina_atual += 1
                time.sleep(0.7)

            print(f"\n  --- Coleta da listagem para '{categoria_pci_do_scraper}' finalizada. Total: {len(todas_as_provas_desta_categoria)} links. ---")

            if todas_as_provas_desta_categoria:
                print(f"  --- Iniciando processamento detalhado para {LIMITE_ITENS_DETALHES_POR_CATEGORIA_PARA_TESTE} itens de '{categoria_pci_do_scraper}' ---")
                itens_para_detalhar_nesta_cat = todas_as_provas_desta_categoria[:LIMITE_ITENS_DETALHES_POR_CATEGORIA_PARA_TESTE]

                for i, prova_info_original_da_lista in enumerate(itens_para_detalhar_nesta_cat):
                    id_prova_pci_atual = prova_info_original_da_lista['id_prova_pci']
                    if id_prova_pci_atual in ids_provas_ja_processadas_com_sucesso_llm_e_supabase:
                        print(f"    PROVA {id_prova_pci_atual} já processada com sucesso. Pulando.")
                        continue 
                    
                    print(f"    Processando PROVA {i+1}/{len(itens_para_detalhar_nesta_cat)} de '{categoria_pci_do_scraper}': \"{prova_info_original_da_lista['nome_prova_original']}\" ({id_prova_pci_atual})")
                    
                    prova_info_para_processar_nesta_iteracao = json.loads(json.dumps(prova_info_original_da_lista))

                    dados_detalhe = extrair_dados_detalhes_prova(prova_info_para_processar_nesta_iteracao['url_pagina_detalhes'], prova_info_para_processar_nesta_iteracao)
                    
                    if dados_detalhe.get("nome_prova_detalhe"): prova_info_para_processar_nesta_iteracao["nome_prova_original"] = dados_detalhe["nome_prova_detalhe"]
                    if dados_detalhe.get("cargo_detalhe"): prova_info_para_processar_nesta_iteracao["nome_prova_original"] = dados_detalhe["cargo_detalhe"]
                    if dados_detalhe.get("ano_detalhe"): prova_info_para_processar_nesta_iteracao["ano"] = dados_detalhe["ano_detalhe"]
                    if dados_detalhe.get("órgão_detalhe"): prova_info_para_processar_nesta_iteracao["orgao_original"] = dados_detalhe["órgão_detalhe"]
                    if dados_detalhe.get("instituição_detalhe"): prova_info_para_processar_nesta_iteracao["banca_original"] = dados_detalhe["instituição_detalhe"]
                    if dados_detalhe.get("nível_detalhe"): prova_info_para_processar_nesta_iteracao["nivel_original"] = dados_detalhe["nível_detalhe"]
                    
                    prova_info_para_processar_nesta_iteracao['url_pdf_prova_pci'] = dados_detalhe.get('url_pdf_prova')
                    prova_info_para_processar_nesta_iteracao['url_pdf_gabarito_pci'] = dados_detalhe.get('url_pdf_gabarito')
                    prova_info_para_processar_nesta_iteracao['todos_url_pdf_encontrados_detalhe'] = json.dumps(dados_detalhe.get('todos_url_pdf_encontrados', []))

                    # Usa categoria_atual_fs para caminhos de arquivo, que é a versão sanitizada
                    diretorio_local_da_prova = os.path.join(pdf_download_dir_local, categoria_atual_fs, sanitizar_nome_arquivo(os.path.basename(urlparse(id_prova_pci_atual).path) if urlparse(id_prova_pci_atual).path else prova_info_para_processar_nesta_iteracao.get('nome_prova_original', 'prova_desconhecida')))
                    os.makedirs(diretorio_local_da_prova, exist_ok=True)
                    
                    for f_key in ['caminho_local_prova_pdf', 'caminho_local_gabarito_pdf', 'gcs_uri_prova', 'gcs_uri_gabarito', 'status_llm', 'status_supabase']:
                        prova_info_para_processar_nesta_iteracao[f_key] = None
                    prova_info_para_processar_nesta_iteracao['status_upload_gcs'] = 'nao_tentado'

                    status_download_prova = False
                    status_download_gabarito = False

                    if prova_info_para_processar_nesta_iteracao.get('url_pdf_prova_pci'):
                        nome_arquivo_prova_local = "prova_" + sanitizar_nome_arquivo(os.path.basename(urlparse(prova_info_para_processar_nesta_iteracao['url_pdf_prova_pci']).path))
                        caminho_local_prova = os.path.join(diretorio_local_da_prova, nome_arquivo_prova_local)
                        if baixar_pdf_para_arquivo(prova_info_para_processar_nesta_iteracao['url_pdf_prova_pci'], caminho_local_prova):
                            prova_info_para_processar_nesta_iteracao['caminho_local_prova_pdf'] = caminho_local_prova
                            status_download_prova = True
                            if GCS_BUCKET_NAME: 
                                chave_gcs_prova = f"provas_gabaritos_pdf/{categoria_atual_fs}/{sanitizar_nome_arquivo(os.path.basename(urlparse(id_prova_pci_atual).path))}/{nome_arquivo_prova_local}" 
                                uri_gcs = upload_para_gcs(caminho_local_prova, GCS_BUCKET_NAME, chave_gcs_prova)
                                if uri_gcs:
                                    prova_info_para_processar_nesta_iteracao['gcs_uri_prova'] = uri_gcs
                                    prova_info_para_processar_nesta_iteracao['status_upload_gcs'] = 'prova_gcs_ok'
                                else:
                                    prova_info_para_processar_nesta_iteracao['status_upload_gcs'] = 'prova_gcs_falhou'
                    
                    if prova_info_para_processar_nesta_iteracao.get('url_pdf_gabarito_pci'):
                        nome_arquivo_gabarito_local = "gabarito_" + sanitizar_nome_arquivo(os.path.basename(urlparse(prova_info_para_processar_nesta_iteracao['url_pdf_gabarito_pci']).path))
                        caminho_local_gabarito = os.path.join(diretorio_local_da_prova, nome_arquivo_gabarito_local)
                        if baixar_pdf_para_arquivo(prova_info_para_processar_nesta_iteracao['url_pdf_gabarito_pci'], caminho_local_gabarito):
                            prova_info_para_processar_nesta_iteracao['caminho_local_gabarito_pdf'] = caminho_local_gabarito
                            status_download_gabarito = True
                            if GCS_BUCKET_NAME: 
                                chave_gcs_gabarito = f"provas_gabaritos_pdf/{categoria_atual_fs}/{sanitizar_nome_arquivo(os.path.basename(urlparse(id_prova_pci_atual).path))}/{nome_arquivo_gabarito_local}"
                                uri_gcs_gab = upload_para_gcs(caminho_local_gabarito, GCS_BUCKET_NAME, chave_gcs_gabarito)
                                if uri_gcs_gab:
                                    prova_info_para_processar_nesta_iteracao['gcs_uri_gabarito'] = uri_gcs_gab
                                    current_gcs_status = prova_info_para_processar_nesta_iteracao.get('status_upload_gcs', 'nao_tentado')
                                    if current_gcs_status == 'prova_gcs_ok': prova_info_para_processar_nesta_iteracao['status_upload_gcs'] = 'ambos_gcs_ok'
                                    elif current_gcs_status == 'nao_tentado': prova_info_para_processar_nesta_iteracao['status_upload_gcs'] = 'gabarito_gcs_ok'
                                else: 
                                    current_gcs_status = prova_info_para_processar_nesta_iteracao.get('status_upload_gcs', 'nao_tentado')
                                    if current_gcs_status == 'prova_gcs_ok': prova_info_para_processar_nesta_iteracao['status_upload_gcs'] = 'prova_gcs_ok_gabarito_gcs_falhou'
                    
                    if status_download_prova and status_download_gabarito: prova_info_para_processar_nesta_iteracao['status_coleta_pdf'] = 'ambos_baixados'
                    elif status_download_prova: prova_info_para_processar_nesta_iteracao['status_coleta_pdf'] = 'apenas_prova_baixada'
                    elif status_download_gabarito: prova_info_para_processar_nesta_iteracao['status_coleta_pdf'] = 'apenas_gabarito_baixado'
                    elif prova_info_para_processar_nesta_iteracao.get('url_pdf_prova_pci') or prova_info_para_processar_nesta_iteracao.get('url_pdf_gabarito_pci'): prova_info_para_processar_nesta_iteracao['status_coleta_pdf'] = 'links_encontrados_download_falhou'
                    else: prova_info_para_processar_nesta_iteracao['status_coleta_pdf'] = 'sem_links_pdf'

                    if not GCP_PROJECT_ID or not GCS_BUCKET_NAME or not GCP_LOCATION:
                        prova_info_para_processar_nesta_iteracao['status_llm'] = 'gcp_constantes_env_nao_configuradas'
                    elif not prova_info_para_processar_nesta_iteracao.get('gcs_uri_prova'):
                        prova_info_para_processar_nesta_iteracao['status_llm'] = 'sem_pdf_gcs_para_llm'
                    else:
                        questoes_agregadas_da_prova = []
                        houve_falha_geral_llm = False
                        item_atual_inicio_lote = 1
                        lote_atual_idx = 0
                        
                        metadados_para_llm_e_db = {
                            'ano': prova_info_para_processar_nesta_iteracao.get('ano'),
                            'banca_original': prova_info_para_processar_nesta_iteracao.get('banca_original'),
                            'orgao_original': prova_info_para_processar_nesta_iteracao.get('orgao_original'),
                            'nome_prova_original': prova_info_para_processar_nesta_iteracao.get('nome_prova_original'), # Cargo
                            'nivel_original': prova_info_para_processar_nesta_iteracao.get('nivel_original'),
                            'tipo_exame': "Concurso Público", 
                            'gcs_uri_prova': prova_info_para_processar_nesta_iteracao.get('gcs_uri_prova'),
                            'gcs_uri_gabarito': prova_info_para_processar_nesta_iteracao.get('gcs_uri_gabarito'),
                            'id_prova_pci': id_prova_pci_atual, 
                            'categoria_pci': prova_info_para_processar_nesta_iteracao.get('categoria_pci'), # Categoria original do PCI
                        }
                        
                        print(f"      Iniciando processamento de questões em lotes de {TAMANHO_LOTE_QUESTOES_LLM}...")
                        while True:
                            lote_atual_idx += 1
                            item_atual_fim_lote = item_atual_inicio_lote + TAMANHO_LOTE_QUESTOES_LLM - 1
                            
                            resultado_lote_json = analisar_prova_com_gemini(
                                metadados_para_llm_e_db['gcs_uri_prova'], 
                                metadados_para_llm_e_db.get('gcs_uri_gabarito'),
                                metadados_para_llm_e_db, 
                                GCP_PROJECT_ID, GCP_LOCATION, GEMINI_MODEL_NAME, 
                                item_inicio=item_atual_inicio_lote, item_fim=item_atual_fim_lote
                            )
                            
                            if resultado_lote_json and "questoes" in resultado_lote_json and isinstance(resultado_lote_json['questoes'], list):
                                num_questoes_neste_lote = len(resultado_lote_json['questoes'])
                                
                                if num_questoes_neste_lote > 0:
                                    questoes_agregadas_da_prova.extend(resultado_lote_json['questoes'])
                                
                                if num_questoes_neste_lote < TAMANHO_LOTE_QUESTOES_LLM:
                                    break 
                                
                                item_atual_inicio_lote = item_atual_fim_lote + 1 
                            else:
                                print(f"        Lote {lote_atual_idx}: LLM não retornou dados de questões válidos ou houve erro na API/processamento da resposta.")
                                houve_falha_geral_llm = True
                                break 
                            
                            time.sleep(PAUSA_ENTRE_LOTES_LLM_SEGUNDOS) 
                        
                        if not houve_falha_geral_llm and questoes_agregadas_da_prova:
                            prova_info_para_processar_nesta_iteracao['status_llm'] = f"sucesso_{len(questoes_agregadas_da_prova)}_questoes"
                            json_llm_output_path = os.path.join(diretorio_local_da_prova, "llm_output_agregado.json")
                            try:
                                with open(json_llm_output_path, 'w', encoding='utf-8') as f_json:
                                    json.dump({"questoes": questoes_agregadas_da_prova, "metadados_prova": metadados_para_llm_e_db}, f_json, ensure_ascii=False, indent=2)
                            except Exception as e_json_save:
                                print(f"        ERRO AO SALVAR JSON LLM: {e_json_save}")
                            
                            if supabase_client:
                                # Passar o dicionário completo da prova (que agora inclui a categoria_pci original)
                                num_inseridos = inserir_questoes_supabase(supabase_client, questoes_agregadas_da_prova, prova_info_para_processar_nesta_iteracao)
                                if num_inseridos > 0:
                                    prova_info_para_processar_nesta_iteracao['status_supabase'] = f"sucesso_{num_inseridos}_inseridos"
                                    print(f"      ✔ {num_inseridos} questões inseridas com sucesso no Supabase.")
                                else:
                                    prova_info_para_processar_nesta_iteracao['status_supabase'] = 'falha_insercao_supabase_ou_nenhuma_valida'
                                    print(f"      ✖ Nenhuma questão inserida no Supabase.")
                            else:
                                prova_info_para_processar_nesta_iteracao['status_supabase'] = 'cliente_supabase_indisponivel'
                        elif houve_falha_geral_llm:
                            prova_info_para_processar_nesta_iteracao['status_llm'] = 'falha_llm_lote'
                        else: 
                             prova_info_para_processar_nesta_iteracao['status_llm'] = 'nenhum_item_llm_agregado'
                    
                    writer_geral.writerow(prova_info_para_processar_nesta_iteracao)
                    csvfile_geral.flush() 
                    time.sleep(1)
            else:
                print(f"  Nenhuma prova coletada para '{categoria_pci_do_scraper}'.")
        
        print(f"\nProcessamento de categorias finalizado.")
        print(f"Dados salvos em: {nome_arquivo_csv_geral_provas}")

    print("Scraper finalizado.")