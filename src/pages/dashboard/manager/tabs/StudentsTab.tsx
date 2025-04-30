import React, { useState, useMemo } from 'react'; // Importa useState e useMemo
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Removido Card pois está no Index
import { useManagerStudents } from '@/hooks/manager/useManagerStudents';
import { StudentsTable } from '@/components/manager/StudentsTable';
import { Users, RefreshCw } from 'lucide-react'; // Adicionado RefreshCw para ícone
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"; // Importa o Input

const StudentsTab: React.FC = () => {
  // Usa o hook para buscar os dados e gerenciar os estados
  const { data: students, isLoading, error, refetch, isFetching } = useManagerStudents();

  // Estado para armazenar o termo de busca digitado pelo usuário
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra os alunos baseado no searchTerm (client-side)
  // useMemo evita recalcular a cada renderização se students ou searchTerm não mudarem
  const filteredStudents = useMemo(() => {
    // Se não há alunos ou termo de busca, retorna a lista original (ou vazia)
    if (!students || !searchTerm) {
      return students ?? [];
    }
    // Converte o termo de busca para minúsculo uma vez
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Filtra a lista
    return students.filter(student => {
      // Verifica se o nome (convertido para minúsculo) inclui o termo de busca
      const nameMatch = student.name?.toLowerCase().includes(lowerCaseSearchTerm);
      // Verifica se o email (convertido para minúsculo) inclui o termo de busca
      const emailMatch = student.email?.toLowerCase().includes(lowerCaseSearchTerm);
      // Retorna true se encontrou em qualquer um dos campos
      return nameMatch || emailMatch;
    });
  }, [students, searchTerm]); // Dependências do useMemo

  return (
    <>
      {/* Cabeçalho com Título e Botões */}
      <CardHeader className="px-0 pt-0 pb-4 mb-4 border-b flex flex-row items-center justify-between">
        {/* Título */}
        <div className="flex items-center gap-3">
             <Users className="h-6 w-6 text-primary-800" />
             <CardTitle className="text-xl">Gerenciamento de Alunos</CardTitle>
        </div>
       {/* Botões de Ação */}
       <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching} // Desabilita enquanto carrega ou busca novamente
            >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> {/* Ícone com animação */}
                {isFetching ? 'Atualizando...' : 'Atualizar Lista'}
            </Button>
            <Button size="sm" disabled>Adicionar Aluno</Button>
       </div>
      </CardHeader>

       {/* Área de Busca/Filtro */}
      <div className="mb-4"> {/* Espaçamento abaixo do input */}
        <Input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm" // Limita a largura do input
        />
        {/* TODO: Adicionar mais filtros (status, turma, etc.) aqui no futuro */}
      </div>

      {/* Conteúdo Principal (Tabela) */}
      <CardContent className="px-0 pb-0">
        {/* Renderiza a tabela passando a lista FILTRADA */}
        <StudentsTable students={filteredStudents} isLoading={isLoading} error={error} />
      </CardContent>
    </>
  );
};

export default StudentsTab;