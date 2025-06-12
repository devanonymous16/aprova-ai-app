// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // Mantenha este se não houver problemas específicos com SWC
import path from 'path';

// Não é necessário __filename e __dirname com import.meta.url em módulos ES
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias principal para src
      // Adicionando aliases específicos do components.json para redundância/clareza
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'), // Se você usa este alias
      // O alias para "@/components/ui" é implicitamente coberto por "@/components"
    },
  },
  server: {
    port: 5173,
  },
});