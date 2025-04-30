import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useManagerStudents } from '@/hooks/manager/useManagerStudents'; // Ajuste o path se necessário
import { StudentsTable } from '@/components/manager/StudentsTable'; // Ajuste o path se necessário
import { Users } from 'lucide-react'; // Ícone
import { Button } from '@/components/ui/button'; // Para futuros botões

const StudentsTab: React.FC = () => {
  // Usa o hook para buscar os dados e gerenciar os estados
  const { data: students, isLoading, error, refetch } = useManagerStudents();

  return (
    // O Card foi removido daqui e colocado no Index.tsx (TabsContent) para manter a estrutura anterior
    // Se preferir o Card aqui, remova do Index.tsx e descomente aqui.
    // <Card className="mt-6">
    <>
      <CardHeader className="px-0 pt-0 pb-4 mb-4 border-b"> {/* Ajuste de estilo */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <Users className="h-6 w-6 text-primary-800" />
                 <CardTitle className="text-xl">Gerenciamento de Alunos</CardTitle>
            </div>
           {/* Área para futuros botões de ação e filtros */}
           <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                    {/* Adicionar ícone de refresh se desejar */}
                    Atualizar Lista
                </Button>
                {/* Placeholder para botão Adicionar Aluno */}
                <Button size="sm" disabled>Adicionar Aluno</Button>
           </div>
        </div>
         {/* TODO: Adicionar área de Filtros/Busca abaixo do header se necessário */}
      </CardHeader>
      <CardContent className="px-0 pb-0"> {/* Remove padding padrão para a tabela ocupar espaço */}
        {/* Renderiza a tabela passando os dados e estados do hook */}
        <StudentsTable students={students ?? []} isLoading={isLoading} error={error} />
      </CardContent>
    </>
    // </Card>
  );
};

export default StudentsTab;