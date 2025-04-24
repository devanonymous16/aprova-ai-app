
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Fornecer variáveis globais ao aplicativo com valores explícitos
    // Usando VITE_ prefix para que estejam disponíveis no cliente através de import.meta.env
    'import.meta.env.SUPABASE_URL': JSON.stringify('https://supabase.aprova-ai.com'),
    'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyMjc0ODQ0MCwiZXhwIjo0ODc4NDIyMDQwLCJyb2xlIjoiYW5vbiJ9.ozSzs-WV4AU67whaN9d5b01ZaJcNPqcYyQFrHWu3gAQ'),
    // Versões com prefixo VITE_ para garantir acesso pelo import.meta.env
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://supabase.aprova-ai.com'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyMjc0ODQ0MCwiZXhwIjo0ODc4NDIyMDQwLCJyb2xlIjoiYW5vbiJ9.ozSzs-WV4AU67whaN9d5b01ZaJcNPqcYyQFrHWu3gAQ')
  }
}));
