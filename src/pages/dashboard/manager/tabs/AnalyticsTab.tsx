// src/pages/dashboard/manager/tabs/AnalyticsTab.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, BarChart3, TrendingUp, Users, ListX, Award } from 'lucide-react';
import { useOrganizationMetrics } from '@/hooks/manager/useOrganizationMetrics';

const AnalyticsTab: React.FC = () => {
  const { data: metrics, isLoading, error } = useOrganizationMetrics();

  // --- Helper renderKPICard CORRIGIDO com 'return' ---
  const renderKPICard = (title: string, value: number | string | null, icon: React.ElementType, unit: string = "", description?: string, valueColor?: string) => {
      const Icon = icon;
      const displayValue = value !== null && value !== undefined ? `${value}${unit}` : '-';
      const colorClass = valueColor || 'text-gray-900 dark:text-gray-100';

      // --- ADICIONADO 'return' AQUI ---
      return (
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  {isLoading ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                  ) : error ? (
                       <span className='text-xs text-red-500'>Erro</span>
                  ): (
                      <div className={`text-2xl font-bold ${colorClass}`}>{displayValue}</div>
                  )}
                   {description && !isLoading && !error && (
                       <p className="text-xs text-muted-foreground pt-1">{description}</p>
                   )}
              </CardContent>
          </Card>
      ); // <<-- Fechamento do return
  } // <<-- Fechamento da função

  return (
    <div className="space-y-6 mt-6">
      {/* Linha de KPIs Rápidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Chamadas ao helper (sem alterações aqui) */}
          {renderKPICard("Acerto Médio Geral", metrics?.averageAccuracy, BarChart3, "%", "Média de acertos em todas as questões", "text-blue-600")}
          {renderKPICard("Taxa de Aprovação", metrics?.approvalRate, Award, "%", "Baseado nos últimos concursos informados", "text-green-600")}
          {renderKPICard("Engajamento Semanal", metrics?.engagementRate, TrendingUp, "%", "Alunos ativos nos últimos 7 dias")}
          {renderKPICard("Tópicos Críticos", metrics?.criticalTopicsCount, ListX, "", "Tópicos com menor desempenho médio", "text-red-600")}
      </div>

      {/* Abas para Análises Detalhadas (sem alterações) */}
      <Tabs defaultValue="performanceByPosition" className="w-full">
         {/* ... */}
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;