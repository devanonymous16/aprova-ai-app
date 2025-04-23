
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, BookOpen, CheckSquare } from "lucide-react";

export default function StudentStudyPlan() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/student/dashboard">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Dashboard
        </Button>
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Meu Plano de Estudos</h1>
        <p className="text-muted-foreground">
          Seu plano de estudos personalizado para aprovação no TJ-SP
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Próximas atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Direito Constitucional - Controle de Constitucionalidade", type: "Estudo", duration: "45min", priority: "Alta" },
                  { title: "Direito Administrativo - Licitações", type: "Questões", duration: "30min", priority: "Média" },
                  { title: "Português - Concordância Verbal", type: "Revisão", duration: "25min", priority: "Baixa" }
                ].map((activity, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        {activity.type === "Estudo" && <BookOpen className="h-5 w-5 text-primary-900" />}
                        {activity.type === "Questões" && <CheckSquare className="h-5 w-5 text-primary-900" />}
                        {activity.type === "Revisão" && <Clock className="h-5 w-5 text-primary-900" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{activity.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" /> {activity.duration}
                          </span>
                          <span>Prioridade: {activity.priority}</span>
                        </div>
                        <Button size="sm">Iniciar agora</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Progresso semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tempo de estudo</span>
                    <span>8h / 12h</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Questões</span>
                    <span>156 / 200</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tópicos</span>
                    <span>12 / 20</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cronograma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="rounded-md bg-primary-50 border border-primary-100 p-2 text-primary-900 flex flex-col items-center justify-center min-w-[48px] h-12">
                      <span className="text-xs font-medium">
                        {["SEG", "TER", "QUA"][i-1]}
                      </span>
                      <span className="font-bold">
                        {[15, 16, 17][i-1]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {i === 1 ? 
                          'Direito Constitucional' : 
                          i === 2 ? 
                          'Direito Administrativo' : 
                          'Português e Raciocínio'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i === 1 ? 
                          '3h previstas • 45 questões' : 
                          i === 2 ? 
                          '2h previstas • 30 questões' : 
                          '2h30 previstas • 40 questões'
                        }
                      </p>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver cronograma completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de estudos por tópico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {[
              { topic: "Direito Constitucional", hours: 45, questions: 150, priority: "Alta" },
              { topic: "Direito Administrativo", hours: 40, questions: 130, priority: "Alta" },
              { topic: "Direito Processual Civil", hours: 35, questions: 120, priority: "Média" },
              { topic: "Português", hours: 30, questions: 100, priority: "Média" },
              { topic: "Raciocínio Lógico", hours: 25, questions: 80, priority: "Baixa" },
              { topic: "Informática", hours: 15, questions: 50, priority: "Baixa" }
            ].map((topic, index) => (
              <div key={index} className="border-b pb-3">
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium">{topic.topic}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    topic.priority === 'Alta' ? 'bg-red-100 text-red-800' : 
                    topic.priority === 'Média' ? 'bg-amber-100 text-amber-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {topic.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" /> {topic.hours}h
                  </span>
                  <span className="flex items-center">
                    <CheckSquare className="h-4 w-4 mr-1 text-muted-foreground" /> {topic.questions} questões
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
