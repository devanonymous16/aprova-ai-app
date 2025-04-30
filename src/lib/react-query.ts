// src/lib/react-query.ts
import { QueryClient } from '@tanstack/react-query'; // <<< CORREÇÃO AQUI

// Define as opções padrão para as queries do TanStack Query
const defaultQueryOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    // cacheTime: 1000 * 60 * 10, // 10 minutos (padrão)
    // refetchOnWindowFocus: false,
    // retry: 1,
  },
};

// Cria e exporta a instância singleton do QueryClient
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});