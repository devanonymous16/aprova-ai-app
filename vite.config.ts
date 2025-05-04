import { defineConfig, loadEnv } from "vite"; // Importa loadEnv para lidar com .env
import react from "@vitejs/plugin-react-swc";
import path from "path"; // Módulo Node para caminhos
import { fileURLToPath } from 'url'; // Helper para ES Modules
import { componentTagger } from "lovable-tagger"; // Mantido se você usa Lovable

// Alternativa ao __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis .env para o processo Node (não para o cliente diretamente)
  // O terceiro argumento '' garante que mesmo variáveis sem VITE_ prefix sejam carregadas aqui, se necessário
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      // host: "::", // Remover ou comentar pode ajudar se localhost não funcionar
      port: 5173, // Voltando para a porta padrão (ou a que você preferir)
      // Adicionar historyApiFallback para SPAs (Single Page Applications)
      // Essencial para react-router funcionar corretamente em desenvolvimento
      // E também no preview se configurado lá
      historyApiFallback: true,
    },
    plugins: [
      react(),
      // Executa o tagger apenas em modo de desenvolvimento
      mode === 'development' && componentTagger(),
    ].filter(Boolean), // Remove valores falsy (como o resultado do tagger em produção)
    resolve: {
      alias: {
        // Usa a variável __dirname corrigida
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // REMOVIDA a seção 'define'. O Vite lida com variáveis prefixadas com VITE_
    // do seu arquivo .env automaticamente via import.meta.env.
    // Garanta que seu arquivo .env tenha:
    // VITE_SUPABASE_URL=https://supabase.aprova-ai.com
    // VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_REAL
  };
});