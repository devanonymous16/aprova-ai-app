from __future__ import annotations  # Garante que anotações de tipo futuras sejam strings

import os
import re
import csv
import json
import time
import typing
import traceback
import logging
from typing import TYPE_CHECKING, Any, Optional
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor

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
TAMANHO_LOTE_QUESTOES_LLM = 10
PAUSA_ENTRE_LOTES_LLM_SEGUNDOS = 3

# ---------------------------------------------------------------------------
# ─── FUNÇÕES UTILITÁRIAS ──────────────────────────────────────────────────
# ---------------------------------------------------------------------------

def baixar_pdf_para_arquivo(url_pdf: str, destino: str) -> bool:
    if not url_pdf or not destino: return False
    try:
        headers = {"User-Agent": ("Mozilla/5.0 PCIConcursosScraper/3.6 (+https://aprova-ai.com)")}
        r = requests.get(url_pdf, headers=headers, timeout=45, stream=True)
        r.raise_for_status()
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        with open(destino, "wb") as f:
            for chunk in r.iter_content(8192): f.write(chunk)
        return True
    except requests.exceptions.Timeout: print(f"        ✖ TIMEOUT ao baixar PDF: {url_pdf}")
    except requests.exceptions.RequestException as e_req: print(f"        ✖ ERRO DE REQUISIÇÃO ao baixar PDF {url_pdf}: {e_req}")
    except OSError as e_os: print(f"        ✖ ERRO DE OS ao salvar PDF {destino}: {e_os}")
    except Exception as exc: print(f"        ✖ ERRO INESPERADO ao baixar/salvar PDF {url_pdf}: {exc}"); return False

def upload_para_gcs(caminho_local: str, bucket_name: str, blob_name: str) -> typing.Optional[str]:
    if not _google_cloud_ok or not gcs_storage: return None
    if not os.path.exists(caminho_local): print(f"[GCS] Arquivo não encontrado: {caminho_local}"); return None
    try:
        client = gcs_storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        blob.upload_from_filename(caminho_local)
        return f"gs://{bucket_name}/{blob_name}"
    except Exception as exc: print(f"        [GCS] ERRO INESPERADO no upload: {exc}"); return None

def sanitizar_nome_arquivo(nome: str) -> str:
    nome_str = str(nome) if nome is not None else ""
    nome_str = re.sub(r"[^\w\s-]", "", nome_str)
    nome_str = re.sub(r"[-\s]+", "_", nome_str).strip("_")
    return nome_str[:100]

def formatar_duracao(segundos: float) -> str:
    """Formata uma duração em segundos para uma string legível (H:M:S)."""
    if segundos < 0: return "0s"
    secs = int(segundos)
    horas, rem = divmod(secs, 3600)
    minutos, segs = divmod(rem, 60)
    if horas > 0: return f"{horas}h {minutos}m {segs}s"
    if minutos > 0: return f"{minutos}m {segs}s"
    return f"{segs}s"

# ---------------------------------------------------------------------------
# ─── FUNÇÕES DE SCRAPING E PARSE ──────────────────────────────────────────
# ---------------------------------------------------------------------------

def extrair_dados_detalhes_prova(url_pagina_detalhes: str, info_listagem_original: Optional[dict] = None) -> dict:
    dados_retorno = { "url_pdf_prova": None, "url_pdf_gabarito": None, "todos_url_pdf_encontrados": [], "nome_prova_detalhe": info_listagem_original.get('nome_prova_original') if info_listagem_original else "Não encontrado (detalhe)", "cargo_detalhe": info_listagem_original.get('nome_prova_original') if info_listagem_original else None, "ano_detalhe": info_listagem_original.get('ano') if info_listagem_original else None, "órgão_detalhe": info_listagem_original.get('orgao_original') if info_listagem_original else None, "instituição_detalhe": info_listagem_original.get('banca_original') if info_listagem_original else None, "nível_detalhe": info_listagem_original.get('nivel_original') if info_listagem_original else None, }
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
                if not dados_retorno["cargo_detalhe"]: dados_retorno["cargo_detalhe"] = dados_retorno["nome_prova_detalhe"]
        links_item_link = soup_detalhe.find_all('a', class_='item-link', href=lambda href: href and href.endswith('.pdf'))
        if links_item_link:
            for link_tag in links_item_link:
                url_pdf_relativa_ou_abs = link_tag.get('href')
                texto_link = link_tag.get_text(strip=True).lower()
                url_pdf_completa = ""
                if url_pdf_relativa_ou_abs:
                    url_pdf_completa = urljoin(BASE_URL_SITE_RAIZ, url_pdf_relativa_ou_abs)
                    if url_pdf_completa not in dados_retorno["todos_url_pdf_encontrados"]: dados_retorno["todos_url_pdf_encontrados"].append(url_pdf_completa)
                    is_gabarito = "gabarito" in texto_link or "gabarito" in url_pdf_completa.lower()
                    is_caderno = "caderno" in texto_link or "prova" in texto_link or ("edital" not in texto_link and "gabarito" not in texto_link and "resultado" not in texto_link and "inscrições" not in texto_link)
                    if is_gabarito:
                        if not dados_retorno["url_pdf_gabarito"]: dados_retorno["url_pdf_gabarito"] = url_pdf_completa
                        elif "definitivo" in texto_link and (not dados_retorno.get("url_pdf_gabarito","") or "definitivo" not in dados_retorno.get("url_pdf_gabarito","").lower()): dados_retorno["url_pdf_gabarito"] = url_pdf_completa
                        elif "preliminar" not in texto_link and "preliminar" in dados_retorno.get("url_pdf_gabarito","").lower() : dados_retorno["url_pdf_gabarito"] = url_pdf_completa
                    elif is_caderno:
                        if not dados_retorno["url_pdf_prova"]: dados_retorno["url_pdf_prova"] = url_pdf_completa
            if not dados_retorno["url_pdf_prova"] and dados_retorno["todos_url_pdf_encontrados"]:
                for url_pdf in dados_retorno["todos_url_pdf_encontrados"]:
                    if url_pdf != dados_retorno.get("url_pdf_gabarito"):
                        if not ("gabarito" in url_pdf.lower() or "edital" in url_pdf.lower() or "resultado" in url_pdf.lower() or "inscrições" in url_pdf.lower()):
                            dados_retorno["url_pdf_prova"] = url_pdf
                            break
            if not dados_retorno["url_pdf_prova"] and len(dados_retorno["todos_url_pdf_encontrados"]) == 1 and dados_retorno["todos_url_pdf_encontrados"][0] != dados_retorno.get("url_pdf_gabarito") and not ("edital" in dados_retorno["todos_url_pdf_encontrados"][0].lower() or "gabarito" in dados_retorno["todos_url_pdf_encontrados"][0].lower() or "resultado" in dados_retorno["todos_url_pdf_encontrados"][0].lower() or "inscrições" in dados_retorno["todos_url_pdf_encontrados"][0].lower()): dados_retorno["url_pdf_prova"] = dados_retorno["todos_url_pdf_encontrados"][0]
        ul_metadados = soup_detalhe.find('ul', class_='list-unstyled')
        if ul_metadados:
            for li_item in ul_metadados.find_all('li', recursive=False):
                strong_tag = li_item.find('strong')
                if strong_tag:
                    label_bruto = strong_tag.get_text(strip=True).lower()
                    label = label_bruto.replace(":", "").strip()
                    valor_final = ""
                    valor_tag_candidata = strong_tag.parent.find(['a', 'span'], class_='text-pci')
                    if valor_tag_candidata: valor_final = valor_tag_candidata.get_text(strip=True)
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
        if not dados_retorno.get("cargo_detalhe") and dados_retorno.get("nome_prova_detalhe"): dados_retorno["cargo_detalhe"] = dados_retorno.get("nome_prova_detalhe")
        return dados_retorno
    except requests.exceptions.RequestException as e_req: print(f"      Erro de requisição ao acessar detalhes {url_pagina_detalhes}: {e_req}"); return dados_retorno
    except Exception as e_det: print(f"      Erro inesperado ao processar detalhes de {url_pagina_detalhes}: {e_det}"); return dados_retorno

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
        if not tabela_provas: return [], False, total_paginas_detectado
        tbody = tabela_provas.find('tbody')
        todas_as_linhas_da_secao_de_dados = tbody.find_all('tr') if tbody else tabela_provas.find_all('tr')
        if not todas_as_linhas_da_secao_de_dados: return [], True, total_paginas_detectado
        linhas_de_dados = []
        if len(todas_as_linhas_da_secao_de_dados) > 0:
            primeira_linha_th = todas_as_linhas_da_secao_de_dados[0].find_all('th')
            primeira_linha_tds_com_classe_ua = todas_as_linhas_da_secao_de_dados[0].find_all('td', class_='ua', limit=1)
            if primeira_linha_th or primeira_linha_tds_com_classe_ua:
                 if len(todas_as_linhas_da_secao_de_dados) > 1: linhas_de_dados = todas_as_linhas_da_secao_de_dados[1:]
                 else: return [], True, total_paginas_detectado
            else: linhas_de_dados = todas_as_linhas_da_secao_de_dados
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
                    provas_nesta_pagina.append({ 'id_prova_pci': url_pagina_detalhes_completa, 'nome_prova_original': nome_prova_cargo, 'url_pagina_detalhes': url_pagina_detalhes_completa, 'ano': ano_str, 'orgao_original': orgao, 'banca_original': banca, 'nivel_original': nivel, 'status_coleta_pdf': 'pendente_detalhes', 'url_pdf_prova_pci': None, 'url_pdf_gabarito_pci': None })
                except Exception as e_linha: print(f"      Erro ao processar linha da tabela: {e_linha} - Linha: {tr.get_text(strip=True)[:100]}")
        return provas_nesta_pagina, True, total_paginas_detectado
    except requests.exceptions.RequestException as e_req_list: print(f"    Erro de requisição para {url_listagem_categoria}: {e_req_list}"); return [], False, None
    except Exception as e_page_list: print(f"    Erro inesperado em {url_listagem_categoria}: {e_page_list}"); return [], False, None

def parse_e_valida_questoes_do_texto(response_text: str) -> tuple[list, int, int]:
    """
    Faz o parse de um texto contendo uma resposta JSON da LLM de forma robusta.
    Retorna uma tupla: (lista de questoes validas, total de objetos encontrados, total de objetos validados).
    """
    questoes_validas = []
    match = re.search(r'"questoes"\s*:\s*\[(.*?)]', response_text, re.DOTALL)
    if not match:
        print("    [LLM PARSE ERRO] Bloco 'questoes' não encontrado na resposta da LLM.")
        return [], 0, 0

    bloco_questoes_bruto = match.group(1).strip()
    objetos_brutos = []
    stack_count = 0
    start_index = -1
    for i, char in enumerate(bloco_questoes_bruto):
        if char == '{':
            if stack_count == 0: start_index = i
            stack_count += 1
        elif char == '}':
            if stack_count > 0:
                stack_count -= 1
                if stack_count == 0 and start_index != -1:
                    objetos_brutos.append(bloco_questoes_bruto[start_index : i + 1])
                    start_index = -1
    if not objetos_brutos: return [], 0, 0

    for idx, texto_questao in enumerate(objetos_brutos):
        try:
            questao_dict = json.loads(texto_questao)
            if not questao_dict.get("statement") or not questao_dict.get("correct_option"):
                print(f"      [LLM VALIDAÇÃO AVISO] Questão potencial {idx+1} pulada: campos essenciais ausentes.")
                continue
            questoes_validas.append(questao_dict)
        except json.JSONDecodeError:
            print(f"      [LLM PARSE AVISO] Objeto de questão potencial {idx+1} pulado por ser um JSON inválido.")
            continue
    return questoes_validas, len(objetos_brutos), len(questoes_validas)

def analisar_prova_com_gemini(gcs_uri_prova, gcs_uri_gabarito, metadados_prova,
                             project_id, location, model_name,
                             item_inicio=1, item_fim=None) -> tuple[Optional[list], int, int]:
    """ Retorna (lista_questoes | None, total_encontrado, total_validado) """
    if not _google_cloud_ok:
        print("    [LLM ERRO] Bibliotecas Google AI não carregadas. Análise LLM pulada.")
        return None, 0, 0

    aiplatform.init(project=project_id, location=location)
    instrucao_lote = f"Analise APENAS as questões de número {item_inicio} até {item_fim if item_fim else 'o final da prova'} no PDF da prova."
    if not item_fim: instrucao_lote = f"Analise as questões a partir do número {item_inicio} até o final da prova."

    prompt_llm = f"""Você é um especialista em análise de provas de exames de conhecimento, tais como vestibulares e concursos públicos.
Sua tarefa é processar os arquivos PDF de uma prova e seu respectivo gabarito (quando fornecido) e extrair, analisar e estruturar cada questão individualmente.

Metadados da Prova Fornecidos:
- Ano: {metadados_prova.get('ano', 'N/A')}
- Banca Organizadora: {metadados_prova.get('banca_original', 'N/A')}
- Órgão Aplicador: {metadados_prova.get('orgao_original', 'N/A')}
- Cargo/Prova (Nome): {metadados_prova.get('nome_prova_original', 'N/A')}
- Nível de Escolaridade: {metadados_prova.get('nivel_original', 'N/A')}

Instruções Detalhadas para Extração de Questões:
{instrucao_lote}
Para CADA questão DENTRO DESTE INTERVALO encontrada no PDF da prova, você deve fornecer as seguintes informações em um objeto JSON dentro de uma lista chamada "questoes":
1.  "sequencial_original": (Integer) O número original da questão como aparece na prova. Se não houver número, tente inferir a sequência.
2.  "statement": (String) O enunciado completo da questão. Remova qualquer texto como "Questão X" do início do enunciado.
3.  "item_a", "item_b", "item_c", "item_d", "item_e": (String ou null) Texto completo da alternativa correspondente. Se a alternativa não existir, deixe null.
4.  "explanation_a", "explanation_b", "explanation_c", "explanation_d", "explanation_e": (String ou null) Uma breve explicação concisa (1-2 frases) do porquê a alternativa está correta ou incorreta. Se não houver alternativa, deixe null.
5.  "item_text": (String ou null) Se for uma questão do tipo Certo/Errado (onde se julga uma afirmativa), este campo deve conter o texto completo da afirmativa a ser julgada. Se for múltipla escolha, deixe null.
6.  "explanation_text": (String ou null) Se for uma questão do tipo Certo/Errado, forneça uma breve explicação do porquê o "item_text" é Certo ou Errado. Se for múltipla escolha, deixe null.
7.  "correct_option": (String) A alternativa correta (ex: "A", "B", "C", "D", "E", "CERTO", "ERRADO", "ANULADA"). Use o PDF do gabarito como fonte primária. Se não estiver claro, use "INDEFINIDA".
8.  "reference_text": (String ou null) Se a questão se basear em um texto de apoio, extraia e inclua esse texto aqui.
9.  "reference_image_description": (String ou null) Se a questão se referir a uma imagem, descreva-a detalhadamente para que outra IA possa recriá-la.
10. "exam_subject_sugerido": (String) A disciplina (matéria) principal da questão (ex: "Língua Portuguesa", "Matemática", "Direito Constitucional"). Use termos genéricos e amplos.
11. "exam_topic_sugerido": (String) O tópico mais específico dentro da disciplina (ex: "Concordância Verbal", "Porcentagem", "Controle de Constitucionalidade").
12. "exam_subtopic_sugerido": (String ou null) Um subtópico ainda mais específico, se aplicável.
13. "knowledge_area_sugerido": (String) A área de conhecimento. Use APENAS uma das seguintes: "Conhecimentos Básicos", "Conhecimentos Específicos", "Conhecimentos Gerais".
14. "question_style": (String) O estilo da questão. Use APENAS: "ME5" (5 alternativas), "ME4" (4 alternativas), ou "CE" (Certo/Errado).
15. "difficulty_level_sugerido": (Integer) Nível de dificuldade percebido: 1 (Muito Fácil), 2 (Fácil), 3 (Médio), 4 (Difícil), 5 (Muito Difícil).
16. "ai_confidence_score": (Float) Sua confiança (de 0.0 a 1.0) na precisão da extração e análise desta questão.

REQUISITOS DE FORMATAÇÃO (MUITO IMPORTANTE):
- A sua única e exclusiva saída deve ser um objeto JSON válido, começando diretamente com '{{' e terminando com '}}'.
- É PROIBIDO incluir qualquer texto, explicação ou comentário fora do JSON.
- É IMPERATIVO fazer o escape correto de aspas duplas (") dentro dos valores de string usando uma barra invertida (\\"). Exemplo: "campo": "O texto diz \\"olá\\".".
- Se, por qualquer motivo, você não conseguir processar o documento, sua resposta DEVE ser um JSON contendo uma lista vazia para a chave "questoes". Ex: {{"questoes": []}}.
"""
    model = GenerativeModel(model_name)
    content_parts = [Part.from_text(prompt_llm)]
    prova_part = Part.from_uri(mime_type="application/pdf", uri=gcs_uri_prova)
    content_parts.append(prova_part)
    if gcs_uri_gabarito:
        gabarito_part = Part.from_uri(mime_type="application/pdf", uri=gcs_uri_gabarito)
        content_parts.append(gabarito_part)

    generation_config = GenerationConfig(response_mime_type="application/json", temperature=0.1, max_output_tokens=MAX_OUTPUT_TOKENS_GEMINI)
    safety_settings = { HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE, HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE, HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE, HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE, }

    try:
        response: VertexGenerationResponse_TypeHint = model.generate_content(content_parts, generation_config=generation_config, stream=False, safety_settings=safety_settings)
        if not response.candidates:
            print("    [LLM ERRO] Resposta do Gemini não contém 'candidates'.")
            if hasattr(response, 'prompt_feedback') and response.prompt_feedback: print(f"      [LLM DEBUG] Prompt Feedback: {response.prompt_feedback}")
            return None, 0, 0

        candidate: VertexCandidate_TypeHint = response.candidates[0]
        finish_reason_value = candidate.finish_reason
        if finish_reason_value != FinishReason.STOP: print(f"    [LLM AVISO] Geração finalizada por motivo não ideal: {finish_reason_value.name if hasattr(finish_reason_value, 'name') else 'DESCONHECIDO'}")
        
        if not hasattr(candidate, 'content') or not candidate.content or not hasattr(candidate.content, 'parts') or not candidate.content.parts:
            print(f"    [LLM ERRO] Candidato da resposta não tem 'content' ou 'parts' válidos.")
            return None, 0, 0

        response_text_from_parts = "".join(part.text for part in candidate.content.parts if hasattr(part, "text"))
        if not response_text_from_parts:
            print(f"    [LLM ERRO] Conteúdo das partes da resposta está vazio.")
            return None, 0, 0

        cleaned_response_text = response_text_from_parts.strip()
        if cleaned_response_text.startswith("```json"): cleaned_response_text = cleaned_response_text[7:]
        if cleaned_response_text.endswith("```"): cleaned_response_text = cleaned_response_text[:-3]
        cleaned_response_text = cleaned_response_text.strip()
        
        questoes_list, total_encontrado, total_validado = parse_e_valida_questoes_do_texto(cleaned_response_text)
        return questoes_list, total_encontrado, total_validado

    except Exception as e:
        print(f"    [LLM ERRO INESPERADO GERAL] Ao gerar conteúdo com Gemini: {type(e).__name__} - {e}")
        return None, 0, 0

# ---------------------------------------------------------------------------
# ─── FUNÇÕES DE BANCO DE DADOS (SUPABASE) ──────────────────────────────────
# ---------------------------------------------------------------------------

_supabase_client_instance = None
def get_supabase_client() -> typing.Optional[SupabaseClient_TypeHint]:
    global _supabase_client_instance
    if _supabase_client_instance:
        return _supabase_client_instance
        
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key: print("[ERRO SUPABASE] SUPABASE_URL ou SUPABASE_SERVICE_KEY não definidas."); return None
    if not _supabase_create_client_runtime: print("[ERRO SUPABASE] Função create_client do Supabase não importada."); return None
    try: 
        _supabase_client_instance = _supabase_create_client_runtime(url, key)
        return _supabase_client_instance
    except Exception as e: print(f"[ERRO SUPABASE] Falha ao criar cliente Supabase: {e}"); return None

def get_or_create_reference_id(
    supabase: SupabaseClient_TypeHint,
    table_name: str,
    name_column: str,
    name_value: Optional[str],
    other_columns: Optional[dict] = None
) -> typing.Optional[str]:
    """
    Obtém ou cria um registro de referência de forma segura e definitiva,
    usando a estratégia UPSERT. Esta função é para ser usada na fase de pré-cache.
    """
    if not supabase or not name_value or not name_value.strip():
        return None

    name_value_cleaned = name_value.strip()

    try:
        data_to_upsert = {name_column: name_value_cleaned}
        if other_columns:
            data_to_upsert.update({k: v for k, v in other_columns.items() if v is not None})

        conflict_columns = [name_column]
        if table_name in ("exam_topics", "exam_subtopics") and other_columns:
            conflict_columns.extend(k for k, v in other_columns.items() if v is not None)
        
        supabase.table(table_name).upsert(data_to_upsert, on_conflict=",".join(conflict_columns)).execute()

        find_query = supabase.table(table_name).select("id").eq(name_column, name_value_cleaned)
        
        if table_name in ("exam_topics", "exam_subtopics") and other_columns:
            for key, value in other_columns.items():
                if value is not None:
                    find_query = find_query.eq(key, value)
        
        find_response = find_query.limit(1).execute()
        
        if find_response.data:
            return find_response.data[0]['id']
        else:
            time.sleep(0.1)
            retry_response = find_query.limit(1).execute()
            if retry_response.data: return retry_response.data[0]['id']
            print(f"    [SUPABASE ERRO CRÍTICO] Falha ao obter ID para '{name_value_cleaned}' em '{table_name}' após UPSERT.")
            return None

    except Exception as e:
        print(f"    [SUPABASE ERRO GENÉRICO] Em get_or_create_reference_id para '{table_name}', valor '{name_value_cleaned}': {e}")
        return None

def get_or_create_exam_paper_id(supabase: SupabaseClient_TypeHint, prova_info_scraper: dict, position_id: Optional[str]) -> Optional[str]:
    if not supabase: return None
    gcs_uri_prova = prova_info_scraper.get('gcs_uri_prova')
    if not gcs_uri_prova: print("    [SUPABASE ERRO] GCS URI da prova (gcs_uri_prova) não fornecido."); return None
    try:
        response = supabase.table("exam_papers").select("id").eq("file_storage_path", gcs_uri_prova).limit(1).execute()
        if response.data: return response.data[0]['id']
        else:
            year_val = None
            if prova_info_scraper.get('ano','').isdigit(): year_val = int(prova_info_scraper.get('ano'))
            if not year_val: print(f"        [SUPABASE ERRO CRÍTICO] 'year_applied' é obrigatório (prova: {gcs_uri_prova})."); return None
            exam_paper_data = { "file_storage_path": gcs_uri_prova, "year_applied": year_val, "description": prova_info_scraper.get('nome_prova_original'), "exam_position_id": position_id, }
            exam_paper_data_cleaned = {k:v for k,v in exam_paper_data.items() if v is not None}
            insert_response = supabase.table("exam_papers").insert(exam_paper_data_cleaned).execute()
            if insert_response.data and len(insert_response.data) > 0: return insert_response.data[0]['id']
            else: return None
    except _PostgrestAPIError_runtime as e: print(f"    [SUPABASE API ERRO] Ao processar 'exam_papers' para '{gcs_uri_prova}'. Erro: {getattr(e, 'message', str(e))}"); return None
    except Exception as e: print(f"    [SUPABASE ERRO GENÉRICO] Em get_or_create_exam_paper_id para '{gcs_uri_prova}': {e}"); return None

def inserir_questoes_com_cache(supabase: SupabaseClient_TypeHint, questoes_processadas: list, cache_ids: dict) -> tuple[int, int]:
    questoes_para_inserir_lote = []

    for item in questoes_processadas:
        metadados_prova = item['metadados']
        
        position_id = cache_ids['positions'].get(metadados_prova.get('nome_prova_original'))
        banca_id = cache_ids['bancas'].get(metadados_prova.get('banca_original'))
        institution_id = cache_ids['institutions'].get(metadados_prova.get('orgao_original'))
        education_id = cache_ids['education'].get(metadados_prova.get('nivel_original'))
        
        exam_paper_uuid = get_or_create_exam_paper_id(supabase, metadados_prova, position_id)
        if not exam_paper_uuid: continue
        
        SYSTEM_USER_ID = os.getenv("SYSTEM_USER_ID_FOR_QUESTIONS")
        if not SYSTEM_USER_ID: return 0, 0

        for q_llm in item['questoes']:
            area_id = cache_ids['areas'].get(q_llm.get('knowledge_area_sugerido', "Conhecimentos Gerais"))
            subject_key = (q_llm.get('exam_subject_sugerido'), area_id)
            subject_id = cache_ids['subjects'].get(subject_key)
            
            topic_id = None
            if subject_id and q_llm.get('exam_topic_sugerido'):
                topic_key = (q_llm.get('exam_topic_sugerido'), subject_id)
                topic_id = cache_ids['topics'].get(topic_key)

            subtopic_id = None
            if topic_id and q_llm.get('exam_subtopic_sugerido'):
                subtopic_key = (q_llm.get('exam_subtopic_sugerido'), topic_id)
                subtopic_id = cache_ids['subtopics'].get(subtopic_key)

            style_id = cache_ids['styles'].get(q_llm.get('question_style'))
            
            if not q_llm.get("statement") or not subject_id or not style_id:
                continue
            
            questao_supa = { 
                "origin_user": SYSTEM_USER_ID, "area": area_id, "exam_subject_id": subject_id, 
                "exam_position_id": position_id, "exam_topic_id": topic_id, "exam_subtopic_id": subtopic_id, 
                "question_style_id": style_id, "statement": q_llm.get("statement"), "item_a": q_llm.get("item_a"), 
                "explanation_a": q_llm.get("explanation_a"), "item_b": q_llm.get("item_b"), "explanation_b": q_llm.get("explanation_b"), 
                "item_c": q_llm.get("item_c"), "explanation_c": q_llm.get("explanation_c"), "item_d": q_llm.get("item_d"), 
                "explanation_d": q_llm.get("explanation_d"), "item_e": q_llm.get("item_e"), "explanation_e": q_llm.get("explanation_e"), 
                "item_text": q_llm.get("item_text"), "explanation_text": q_llm.get("explanation_text"), 
                "correct_option": q_llm.get("correct_option"), "reference_text": q_llm.get("reference_text"), 
                "reference_image_url": q_llm.get("reference_image_description"), "source_exam_paper_id": exam_paper_uuid, 
                "exam_institution_id": institution_id, "source_year": int(metadados_prova_gerais.get('ano')) if str(metadados_prova_gerais.get('ano','')).isdigit() else None, 
                "difficulty_level": q_llm.get("difficulty_level_sugerido"), "exam_banca_id": banca_id, 
                "exam_type": metadados_prova_gerais.get('tipo_exame', "Concurso Público"), "education_level_id": education_id, 
            }
            questoes_para_inserir_lote.append({k: v for k, v in questao_supa.items() if v is not None})
    
    if not questoes_para_inserir_lote:
        return 0, 0

    total_a_inserir = len(questoes_para_inserir_lote)
    sucessos = 0
    try:
        response = supabase.table('questions').insert(questoes_para_inserir_lote).execute()
        if response.data:
            sucessos = len(response.data)
    except Exception as e:
        print(f"      [ERRO DB LOTE FINAL] Falha na inserção em lote: {e}")

    return sucessos, total_a_inserir

# ---------------------------------------------------------------------------
# ─── FUNÇÃO WORKER PRINCIPAL ────────────────────────────────────────────────
# ---------------------------------------------------------------------------
def analisar_prova_worker(args: tuple) -> Optional[dict]:
    ( prova_info, contador, total_provas, gcp_vars, pdf_download_dir_local ) = args
    
    print(f"  Analisando prova {contador}/{total_provas}: {prova_info['nome_prova_original']}")

    try:
        id_prova_pci_atual = prova_info['id_prova_pci']
        dados_detalhe = extrair_dados_detalhes_prova(prova_info['url_pagina_detalhes'], prova_info)
        prova_info.update(dados_detalhe)
        
        categoria_fs = sanitizar_nome_arquivo(prova_info['categoria_pci'])
        diretorio_local = os.path.join(pdf_download_dir_local, categoria_fs, sanitizar_nome_arquivo(os.path.basename(urlparse(id_prova_pci_atual).path) or prova_info['nome_prova_original']))
        os.makedirs(diretorio_local, exist_ok=True)

        if prova_info.get('url_pdf_prova'):
            nome_arquivo_local = "prova_" + sanitizar_nome_arquivo(os.path.basename(urlparse(prova_info['url_pdf_prova']).path))
            caminho_local = os.path.join(diretorio_local, nome_arquivo_local)
            if baixar_pdf_para_arquivo(prova_info['url_pdf_prova'], caminho_local):
                chave_gcs = f"provas_gabaritos_pdf/{categoria_fs}/{sanitizar_nome_arquivo(os.path.basename(urlparse(id_prova_pci_atual).path))}/{nome_arquivo_local}"
                prova_info['gcs_uri_prova'] = upload_para_gcs(caminho_local, gcp_vars['GCS_BUCKET_NAME'], chave_gcs)

        if prova_info.get('url_pdf_gabarito'):
            nome_arquivo_local = "gabarito_" + sanitizar_nome_arquivo(os.path.basename(urlparse(prova_info['url_pdf_gabarito']).path))
            caminho_local = os.path.join(diretorio_local, nome_arquivo_local)
            if baixar_pdf_para_arquivo(prova_info['url_pdf_gabarito'], caminho_local):
                chave_gcs = f"provas_gabaritos_pdf/{categoria_fs}/{sanitizar_nome_arquivo(os.path.basename(urlparse(id_prova_pci_atual).path))}/{nome_arquivo_local}"
                prova_info['gcs_uri_gabarito'] = upload_para_gcs(caminho_local, gcp_vars['GCS_BUCKET_NAME'], chave_gcs)
                
        if not prova_info.get('gcs_uri_prova'):
            return None
            
        lista_questoes, total_encontrado, total_validado = analisar_prova_com_gemini(
            prova_info.get('gcs_uri_prova'),
            prova_info.get('gcs_uri_gabarito'),
            prova_info,
            gcp_vars['GCP_PROJECT_ID'], gcp_vars['GCP_LOCATION'], gcp_vars['GEMINI_MODEL_NAME']
        )
        
        if lista_questoes:
            return {'metadados': prova_info, 'questoes': lista_questoes}
        return None
    except Exception as e:
        print(f"    [ERRO WORKER] Erro ao processar prova {prova_info.get('id_prova_pci')}: {e}")
        return None

# ---------------------------------------------------------------------------
# ─── BLOCO DE EXECUÇÃO PRINCIPAL ────────────────────────────────────────────
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    start_time_total = time.time()
    logging.basicConfig(filename='falhas_processamento.log', level=logging.ERROR, format='%(asctime)s - %(message)s')
    
    print("Carregando variáveis de ambiente...")
    dotenv_path_main = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(dotenv_path_main) if os.path.exists(dotenv_path_main) else print(f"    Arquivo .env NÃO encontrado em: {dotenv_path_main}.")
    
    GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
    GCP_LOCATION = os.getenv("GCP_LOCATION")
    GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
    GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME")
    gcp_vars_dict = { "GCP_PROJECT_ID": GCP_PROJECT_ID, "GCP_LOCATION": GCP_LOCATION, "GCS_BUCKET_NAME": GCS_BUCKET_NAME, "GEMINI_MODEL_NAME": GEMINI_MODEL_NAME }
    
    print(f"    Configurações: GCP_PROJECT_ID: {GCP_PROJECT_ID}, GCP_LOCATION: {GCP_LOCATION}, GCS_BUCKET_NAME: {GCS_BUCKET_NAME}, GEMINI_MODEL_NAME: {GEMINI_MODEL_NAME}")

    MAX_WORKERS_PARALELOS = 80
    LIMITE_ITENS_DETALHES_POR_CATEGORIA_PARA_TESTE = 10000

    url_categoria_base_input = input("Por favor, insira a URL da categoria do PCI Concursos (ex: https://www.pciconcursos.com.br/provas/medico-veterinario): ")
    if not url_categoria_base_input or not url_categoria_base_input.startswith("https://www.pciconcursos.com.br/provas/"):
        print("URL inválida. Usando exemplo: https://www.pciconcursos.com.br/provas/coveiro")
        url_categoria_base_input = "https://www.pciconcursos.com.br/provas/coveiro"

    categorias_para_raspar = [url_categoria_base_input]
    
    raiz_output_dir = "output_scraper_pci"
    pdf_download_dir_local = os.path.join(raiz_output_dir, "downloaded_pdfs_local")
    os.makedirs(pdf_download_dir_local, exist_ok=True)
    
    supabase = get_supabase_client()
    if not supabase: raise Exception("Cliente Supabase não inicializado.")

    provas_processadas_total = 0
    provas_com_sucesso = 0
    total_questoes_llm = 0
    total_questoes_inseridas_db = 0

    for url_categoria_base in categorias_para_raspar:
        categoria_pci_do_scraper = url_categoria_base.strip('/').split('/')[-1]
        print(f"\n--- FASE 1: Coletando metadados de provas para CATEGORIA: {categoria_pci_do_scraper} ---")

        todas_as_provas_desta_categoria = []
        pagina_atual = 1
        limite_paginacao_real = 10000
        
        while pagina_atual <= limite_paginacao_real:
            url_alvo = f"{url_categoria_base.strip('/')}/{pagina_atual}" if pagina_atual > 1 else url_categoria_base
            provas_pagina, _, paginas_detectadas = extrair_provas_da_pagina_listagem(url_alvo, BASE_URL_SITE_RAIZ)
            if not provas_pagina: break
            if pagina_atual == 1 and paginas_detectadas: limite_paginacao_real = min(paginas_detectadas, 10000)
            
            for prova in provas_pagina:
                prova['categoria_pci'] = categoria_pci_do_scraper
                todas_as_provas_desta_categoria.append(prova)
            
            pagina_atual += 1
            time.sleep(0.5)

        print(f"  Coleta finalizada. Total de {len(todas_as_provas_desta_categoria)} provas encontradas.")
        provas_a_processar = todas_as_provas_desta_categoria[:LIMITE_ITENS_DETALHES_POR_CATEGORIA_PARA_TESTE]

        print(f"\n--- FASE 2: Análise LLM paralela de {len(provas_a_processar)} provas ---")
        dados_processados_llm = []
        llm_tasks = [(p, i + 1, len(provas_a_processar), gcp_vars_dict, pdf_download_dir_local) for i, p in enumerate(provas_a_processar)]
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS_PARALELOS) as executor:
            resultados_llm = list(executor.map(analisar_prova_worker, llm_tasks))
        
        for res in resultados_llm:
            if res: dados_processados_llm.append(res)
        
        print(f"  Análise LLM concluída. {len(dados_processados_llm)} provas retornaram questões.")

        print("\n--- FASE 3: Pré-cache de IDs de referência (sequencial) ---")
        nomes_unicos = {'positions': set(), 'bancas': set(), 'institutions': set(), 'education': set(), 'areas': set(), 'subjects': set(), 'topics': set(), 'subtopics': set(), 'styles': set()}
        for item in dados_processados_llm:
            meta = item['metadados']
            nomes_unicos['positions'].add(meta.get('nome_prova_original')); nomes_unicos['bancas'].add(meta.get('banca_original')); nomes_unicos['institutions'].add(meta.get('orgao_original')); nomes_unicos['education'].add(meta.get('nivel_original'))
            for q in item['questoes']:
                nomes_unicos['areas'].add(q.get('knowledge_area_sugerido', "Conhecimentos Gerais")); nomes_unicos['styles'].add(q.get('question_style'))
                if q.get('exam_subject_sugerido'): nomes_unicos['subjects'].add((q.get('exam_subject_sugerido'), q.get('knowledge_area_sugerido', "Conhecimentos Gerais")))
                if q.get('exam_topic_sugerido') and q.get('exam_subject_sugerido'): nomes_unicos['topics'].add((q.get('exam_topic_sugerido'), q.get('exam_subject_sugerido')))
                if q.get('exam_subtopic_sugerido') and q.get('exam_topic_sugerido'): nomes_unicos['subtopics'].add((q.get('exam_subtopic_sugerido'), q.get('exam_topic_sugerido')))

        cache_ids = {k: {} for k in nomes_unicos.keys()}
        
        for tipo in ['positions', 'bancas', 'institutions', 'education', 'areas', 'styles']:
            print(f"  Cacheando {len(nomes_unicos[tipo])} nomes para '{tipo}'...")
            for nome in nomes_unicos[tipo]:
                if nome: cache_ids[tipo][nome] = get_or_create_reference_id(supabase, f"exam_{tipo.rstrip('s') if tipo != 'bancas' else 'bancas'}", "name", nome)

        print("  Cacheando disciplinas...")
        for nome_subject, nome_area in nomes_unicos['subjects']:
            area_id = cache_ids['areas'].get(nome_area)
            if nome_subject: cache_ids['subjects'][(nome_subject, area_id)] = get_or_create_reference_id(supabase, 'exam_subjects', 'name', nome_subject, {'exam_area_id': area_id})
        
        print("  Cacheando tópicos...")
        for nome_topic, nome_subject in nomes_unicos['topics']:
            subject_id = next((sid for (sname, aid), sid in cache_ids['subjects'].items() if sname == nome_subject), None)
            if nome_topic and subject_id: cache_ids['topics'][(nome_topic, subject_id)] = get_or_create_reference_id(supabase, 'exam_topics', 'name', nome_topic, {'exam_subject_id': subject_id})

        print("  Cacheando subtópicos...")
        for nome_subtopic, nome_topic in nomes_unicos['subtopics']:
            topic_id = next((tid for (tname, sid), tid in cache_ids['topics'].items() if tname == nome_topic), None)
            if nome_subtopic and topic_id: cache_ids['subtopics'][(nome_subtopic, topic_id)] = get_or_create_reference_id(supabase, 'exam_subtopics', 'name', nome_subtopic, {'exam_topic_id': topic_id})
        
        print("Pré-cache de IDs concluído.")

        print(f"\n--- FASE 4: Inserindo todas as questões no banco de dados ---")
        sucessos, total_a_inserir = inserir_questoes_com_cache(supabase, dados_processados_llm, cache_ids)
        
        provas_processadas_total += len(provas_a_processar)
        total_questoes_llm += total_a_inserir
        total_questoes_inseridas_db += sucessos
        if sucessos > 0:
            provas_com_sucesso = len(dados_processados_llm) # Aproximação

    end_time_total = time.time()
    duracao_total_execucao = end_time_total - start_time_total

    print("\n" + "="*80)
    print("||" + " RESUMO FINAL DO PROCESSAMENTO ".center(76) + "||")
    print("="*80)
    print(f"  TEMPO TOTAL DE EXECUÇÃO: {formatar_duracao(duracao_total_execucao)}")
    print("-" * 80)
    print(f"  PROVAS PROCESSADAS NESTA EXECUÇÃO: {provas_processadas_total}")
    print(f"    - Com sucesso (pelo menos 1 questão inserida): {provas_com_sucesso}")
    print(f"    - Com falha (nenhuma questão inserida): {provas_processadas_total - provas_com_sucesso}")
    if provas_processadas_total > 0: print(f"    - Tempo médio por prova: {formatar_duracao(duracao_total_execucao / provas_processadas_total)}")
    print("-" * 80)
    print(f"  QUESTÕES (ETAPA LLM):")
    print(f"    - Total de questões válidas (parse + validação OK): {total_questoes_llm}")
    print("-" * 80)
    print(f"  QUESTÕES (ETAPA BANCO DE DADOS):")
    print(f"    - Total de questões inseridas com sucesso no Supabase: {total_questoes_inseridas_db}")
    db_insertion_errors = total_questoes_llm - total_questoes_inseridas_db
    if db_insertion_errors > 0:
         print(f"    - Questões válidas que falharam na inserção (erro de FK, etc.): {db_insertion_errors}")
    print("-" * 80)
    print(f"  PERFORMANCE GERAL:")
    if total_questoes_inseridas_db > 0:
        print(f"    - Tempo médio por questão inserida: {duracao_total_execucao / total_questoes_inseridas_db:.2f} segundos")
    taxa_sucesso_db = (total_questoes_inseridas_db / total_questoes_llm * 100) if total_questoes_llm > 0 else 0
    print(f"    - Taxa de sucesso de inserção no DB: {taxa_sucesso_db:.2f}%")
    print("="*80)

    print("\nScraper finalizado.")