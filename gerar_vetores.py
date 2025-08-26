#!/usr/bin/env python3
import os
from supabase import create_client, Client
import pandas as pd
from sentence_transformers import SentenceTransformer
import numpy as np
from tqdm import tqdm
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configurações do Supabase (mesmas do frontend)
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL', 'https://supabase.aprova-ai.com')
SUPABASE_ANON_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

def get_supabase_client() -> Client:
    """Cria cliente Supabase usando as mesmas credenciais do frontend"""
    try:
        print(f"🔗 Conectando ao Supabase: {SUPABASE_URL}")
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("✅ Cliente Supabase criado com sucesso!")
        return supabase
    except Exception as e:
        print(f"❌ Erro ao criar cliente Supabase: {e}")
        return None

def get_topics_without_embeddings(supabase: Client):
    """Busca tópicos sem embeddings usando RPC call"""
    try:
        print("🔍 Buscando tópicos sem embeddings...")
        
        # Usando RPC call como no frontend
        response = supabase.rpc('get_topics_without_embeddings').execute()
        
        if response.data:
            print(f"📊 Encontrados {len(response.data)} tópicos sem embeddings")
            return response.data
        else:
            print("ℹ️ Nenhum tópico sem embeddings encontrado")
            return []
            
    except Exception as e:
        print(f"❌ Erro ao buscar tópicos: {e}")
        return []

def generate_embeddings(texts, model):
    """Gera embeddings usando sentence-transformers"""
    try:
        print("🤖 Gerando embeddings...")
        embeddings = model.encode(texts, show_progress_bar=True)
        return embeddings
    except Exception as e:
        print(f"❌ Erro ao gerar embeddings: {e}")
        return None

def update_embeddings_in_db(supabase: Client, topic_ids, embeddings):
    """Atualiza embeddings no banco usando RPC call"""
    try:
        print("💾 Salvando embeddings no banco...")
        
        # Atualiza um por um (mais simples)
        for i, topic_id in enumerate(tqdm(topic_ids, desc="Salvando embeddings")):
            try:
                # Atualiza diretamente na tabela
                response = supabase.table('exam_topics').update({
                    'embedding': embeddings[i].tolist()
                }).eq('id', topic_id).execute()
                
                # Verifica se houve erro
                if hasattr(response, 'error') and response.error:
                    print(f"❌ Erro ao atualizar tópico {topic_id}: {response.error}")
                elif hasattr(response, 'data') and not response.data:
                    print(f"⚠️ Tópico {topic_id} não encontrado")
                    
            except Exception as e:
                print(f"❌ Erro ao atualizar tópico {topic_id}: {e}")
                
        print("✅ Processo de atualização concluído!")
                
    except Exception as e:
        print(f"❌ Erro geral ao atualizar embeddings: {e}")

def main():
    print("🚀 Iniciando geração de embeddings...")
    
    # Verifica credenciais
    if not SUPABASE_ANON_KEY:
        print("❌ VITE_SUPABASE_ANON_KEY não encontrada no .env")
        return
    
    # Cria cliente Supabase
    supabase = get_supabase_client()
    if not supabase:
        return
    
    # Busca tópicos sem embeddings
    topics = get_topics_without_embeddings(supabase)
    if not topics:
        print("✅ Todos os tópicos já têm embeddings!")
        return
    
    # Carrega modelo de embeddings (384 dimensões)
    print("📚 Carregando modelo de embeddings...")
    model = SentenceTransformer('all-MiniLM-L6-v2')  # Gera vetores de 384 dimensões
    
    # Prepara textos para embedding
    topic_texts = [topic['name'] for topic in topics]
    topic_ids = [topic['id'] for topic in topics]
    
    # Gera embeddings
    embeddings = generate_embeddings(topic_texts, model)
    if embeddings is None:
        return
    
    # Atualiza no banco
    update_embeddings_in_db(supabase, topic_ids, embeddings)
    
    print("🎉 Processo concluído com sucesso!")

if __name__ == "__main__":
    main()