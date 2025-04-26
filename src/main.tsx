
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { StrictMode } from 'react'

console.log('[DIAGNÓSTICO] main.tsx: Inicializando aplicação...');

const rootElement = document.getElementById("root");
console.log('[DIAGNÓSTICO] main.tsx: Elemento root encontrado?', !!rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  console.log('[DIAGNÓSTICO] main.tsx: Root criado, pronto para renderizar App');
  
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
  
  console.log('[DIAGNÓSTICO] main.tsx: Renderização inicial concluída');
} else {
  console.error('[DIAGNÓSTICO] main.tsx: ERRO - Elemento root não encontrado!');
}
