// src/pages/dashboard/manager/Index.tsx
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, BookOpen, BarChart2, Award, Settings, Newspaper, SearchCheck, LineChart // Adiciona LineChart para Análises
} from 'lucide-react';
import StudentsTab from './tabs/StudentsTab';
import AnalyticsTab from './tabs/AnalyticsTab'; // <<-- IMPORTAR AnalyticsTab

export default function ManagerDashboard() {
  useEffect(() => {
    document.title = 'Forefy | Painel de Gerente';
  }, []);

  // KPIs Mockados (serão substituídos pelos do hook na aba Análises)
  // Podemos remover estes ou mantê-los apenas na Visão Geral se fizer sentido
  // const kpiData = { ... }; // Removido daqui por enquanto

  const institutionName = 'Cursinho Preparatório XYZ';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabeçalho da Página (sem alterações) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        {/* ... */}
         <div>
            <h1 className="text-3xl font-bold font-heading">Painel de Gerente</h1>
            <p className="text-muted-foreground mt-1">
                Gerencie seus alunos e monitore o desempenho da sua instituição
            </p>
         </div>
         <div className="flex items-center gap-2 bg-secondary-50 p-2 rounded-lg border border-secondary-100 whitespace-nowrap shrink-0">
            {/* ... */}
         </div>
      </div>

      {/* KPIs Principais (Movidos para dentro da aba Análises) */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> ... </div> */}

      {/* Abas Principais */}
      {/* Default pode ser 'analytics' agora */}
      <Tabs defaultValue="analytics" className="w-full">
        <div className="overflow-x-auto pb-1 mb-6">
          <TabsList className="inline-grid w-full grid-cols-3 sm:grid-cols-5"> {/* Ajuste conforme as abas ativas */}
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="content">Materiais</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
        </div>

        {/* Conteúdo das Abas */}

        {/* Aba: Visão Geral */}
        <TabsContent value="overview" className="mt-0 space-y-6">
           {/* ... (Conteúdo da Visão Geral sem alterações) ... */}
        </TabsContent>

        {/* Aba: Alunos */}
        <TabsContent value="students" className="mt-0">
          <StudentsTab />
        </TabsContent>

        {/* --- Aba: Análises --- */}
        <TabsContent value="analytics" className="mt-0">
          {/* Renderiza o novo componente da aba */}
          <AnalyticsTab />
        </TabsContent>

        {/* Aba: Materiais */}
        <TabsContent value="content" className="mt-0">
          {/* ... (Placeholder Materiais) ... */}
           <Card className="mt-6"> {/* Adicionado mt-6 para consistência */}
             <CardHeader>
               <CardTitle>Materiais e Conteúdos</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md border">
                 <BookOpen className="h-16 w-16 text-success-500 mb-4" />
                 <h3 className="text-lg font-medium mb-2">Gerenciamento de Materiais</h3>
                 <p className="text-muted-foreground text-center max-w-md mb-6">
                   Placeholder: Upload/organização de PDFs, vídeos, simulados, etc.
                 </p>
                 <Button disabled>Gerenciar Conteúdo (Em breve)</Button>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        {/* Aba: Configurações */}
        <TabsContent value="settings" className="mt-0">
           {/* ... (Placeholder Configurações) ... */}
            <Card className="mt-6">
             <CardHeader>
               <CardTitle>Configurações da Instituição</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="p-10 flex flex-col items-center justify-center bg-gray-50 rounded-md border">
                 <Settings className="h-16 w-16 text-gray-600 mb-4" />
                 <h3 className="text-lg font-medium mb-2">Configurações</h3>
                 <p className="text-muted-foreground text-center max-w-md mb-6">
                  Placeholder: Dados da instituição, branding, integrações, gerenciamento de usuários manager.
                 </p>
                 <Button disabled>Configurar (Em breve)</Button>
               </div>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}