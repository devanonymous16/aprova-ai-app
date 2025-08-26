import csv
import os

# Caminho para o seu arquivo de controle
csv_file_path = os.path.join('output_scraper_pci', 'todas_provas_coletadas_pci_com_gcs.csv')

# Status que indicam uma falha silenciosa (sem resultado da LLM ou inserção no DB)
status_de_falha_silenciosa = [
    'sem_pdf_gcs_para_llm',
    'nenhum_item_llm_agregado',
    'falha_llm_lote',
    'falha_insercao_supabase_ou_nenhuma_valida',
    'falha_geral_worker',
    'cliente_supabase_indisponivel'
]

# Lista para armazenar as linhas modificadas
updated_rows = []
reset_count = 0

print(f"Lendo o arquivo: {csv_file_path}")

try:
    with open(csv_file_path, 'r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        
        for row in reader:
            # Faz uma cópia da linha para poder modificá-la
            new_row = row.copy()
            
            # Verifica se o status da LLM ou do Supabase corresponde a um dos status de falha
            if new_row.get('status_llm') in status_de_falha_silenciosa or \
               new_row.get('status_supabase') in status_de_falha_silenciosa:
                
                # Reseta os status para forçar o reprocessamento
                new_row['status_llm'] = 'resetado_para_reprocessar'
                new_row['status_supabase'] = 'resetado_para_reprocessar'
                reset_count += 1
            
            updated_rows.append(new_row)

    # Se alguma linha foi resetada, reescreve o arquivo inteiro com os dados atualizados
    if reset_count > 0:
        print(f"Encontradas {reset_count} provas com falha silenciosa. Resetando status...")
        with open(csv_file_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(updated_rows)
        print("Arquivo atualizado com sucesso. Provas com falha serão reprocessadas na próxima execução.")
    else:
        print("Nenhuma prova com status de falha silenciosa encontrada para resetar.")

except FileNotFoundError:
    print(f"ERRO: O arquivo '{csv_file_path}' não foi encontrado.")
except Exception as e:
    print(f"Ocorreu um erro inesperado: {e}")