# verify_versions.py
import sys
import inspect

try:
    # --- Parte 1: Verificar versões e caminhos ---
    print("-" * 60)
    print(f"Python Executable:    {sys.executable}")
    print(f"Python Version:       {sys.version}")
    
    import google.cloud.aiplatform as aiplatform
    import google.generativeai as genai
    from vertexai.generative_models import GenerationConfig

    print(f"aiplatform Version:     {aiplatform.__version__}")
    print(f"aiplatform Path:        {aiplatform.__file__}")
    print(f"genai Version:          {genai.__version__}")
    print(f"genai Path:             {genai.__file__}")

    # --- Parte 2: Inspecionar a classe que está causando o erro ---
    print("-" * 60)
    print("Inspecionando os argumentos de 'GenerationConfig.__init__':")
    
    # Isso nos mostrará todos os argumentos que a classe realmente aceita
    arg_spec = inspect.getfullargspec(GenerationConfig.__init__)
    print(arg_spec.args)
    print("-" * 60)

    if 'thinking_config' in arg_spec.args:
        print("RESULTADO: SUCESSO! 'thinking_config' FOI encontrado nos argumentos.")
    else:
        print("RESULTADO: FALHA! 'thinking_config' NÃO FOI encontrado nos argumentos.")
        print("Isto confirma que a versão da biblioteca carregada é antiga.")

    print("-" * 60)

except ImportError as e:
    print(f"\nERRO DE IMPORTAÇÃO: {e}")
    print("Isso indica que uma das bibliotecas do Google não está instalada corretamente neste ambiente.")
except Exception as e:
    print(f"\nUM ERRO INESPERADO OCORREU: {e}")