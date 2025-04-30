// src/lib/react-query.ts

// Tenta importar diretamente do caminho interno (menos ideal, mas pode resolver problemas de resolução)
// import { QueryClient } from '@tanstack/react-query/build/modern/index.js'; // Ou '/build/legacy/index.js' dependendo da build

// Alternativa mais comum se o acima não funcionar ou se quiser manter o import padrão:
// Usar a importação padrão do módulo principal
import { QueryClient } from '@tanstack/react-query';

// Define as opções padrão para as queries do TanStack Query
const defaultQueryOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    // cacheTime: 1000 * 60 * 10, // foi renomeado para gcTime
    gcTime: 1000 * 60 * 10, // 10 minutos (Garbage Collection Time)
    // refetchOnWindowFocus: false,
    // retry: 1,
  },
};

// Cria e exporta a instância singleton do QueryClient
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

// Verifica se a importação funcionou (log para debug)
if (typeof QueryClient !== 'function') {
  console.error("ERRO CRÍTICO: Falha ao importar QueryClient de @tanstack/react-query. Verifique a instalação e a compatibilidade de versão.");
} else {
  console.log("QueryClient importado com sucesso em react-query.ts");
}