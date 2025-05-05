// vite.config.ts (Versão CORRIGIDA que eu enviei antes)

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url';
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5173,
      historyApiFallback: true,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // --- SEÇÃO 'define' FOI REMOVIDA ---
    // As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
    // definidas no arquivo .env são carregadas automaticamente
    // pelo Vite e acessíveis via import.meta.env no código frontend.
  };
});