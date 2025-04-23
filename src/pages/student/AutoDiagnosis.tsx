
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function StudentAutoDiagnosis() {
  const { examPositionId } = useParams<{ examPositionId: string }>();
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={`/student/exams/${examPositionId}`}>
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para detalhes do exame
        </Button>
      </Link>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Autodiagnóstico</h1>
        <p className="text-muted-foreground">
          Responda algumas questões para avaliarmos seu nível de conhecimento e criarmos um plano de estudos personalizado.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc pl-5">
            <li>O autodiagnóstico consiste em questões de múltipla escolha.</li>
            <li>Responda com sinceridade para obter um plano de estudos adequado ao seu nível.</li>
            <li>Você terá aproximadamente 20-30 minutos para completar o autodiagnóstico.</li>
            <li>As questões abrangem os principais tópicos do concurso.</li>
            <li>Ao final, você receberá um relatório detalhado de suas áreas fortes e fracas.</li>
          </ul>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Link to={`/student/study-plan`}>
          <Button size="lg">
            Iniciar Autodiagnóstico
          </Button>
        </Link>
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Nota: Este diagnóstico inicial ajudará a personalizar seu plano de estudos.
          Você poderá refazê-lo a qualquer momento para atualizar seu progresso.
        </p>
      </div>
    </div>
  );
}
