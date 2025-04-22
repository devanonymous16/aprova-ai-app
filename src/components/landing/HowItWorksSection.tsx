
import { motion } from "framer-motion";
import { UserCheck, Map, PenSquare, MessageCircle, PieChart } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: UserCheck,
      title: "Diagnóstico Inteligente",
      description: "Nossa IA analisa seu perfil, objetivos e nível de conhecimento atual para estabelecer a linha de base."
    },
    {
      icon: Map,
      title: "Plano Personalizado",
      description: "Receba um roteiro de estudos semanal que evolui junto com você. A cada semana, seu plano é recalculado com base no seu desempenho recente, priorizando áreas que necessitam mais atenção."
    },
    {
      icon: PenSquare,
      title: "Prática Focada",
      description: "Tenha acesso a questões exclusivas, desenvolvidas por nossa IA para simular com precisão o estilo e padrão da banca examinadora do seu concurso específico, garantindo familiaridade máxima no dia da prova."
    },
    {
      icon: MessageCircle,
      title: "Feedback Contínuo",
      description: "Obtenha explicações detalhadas sobre cada questão respondida, com esclarecimentos específicos sobre conceitos-chave e correção de possíveis interpretações equivocadas, acelerando seu processo de aprendizado."
    },
    {
      icon: PieChart,
      title: "Acompanhamento de Progresso",
      description: "Visualize sua evolução em tempo real e ajuste sua estratégia de estudos conforme necessário."
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 font-heading">
            Sua jornada para a aprovação em 5 passos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Um processo cientificamente projetado para maximizar suas chances de sucesso
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={item} className="relative">
              <div className="flex mb-12 last:mb-0">
                {/* Linha vertical conectando os passos */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-16 bg-primary-200"></div>
                )}
                
                {/* Ícone do passo */}
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 z-10">
                  <step.icon size={24} />
                </div>
                
                {/* Conteúdo do passo */}
                <div className="ml-6">
                  <h3 className="text-xl font-bold mb-2 text-primary-900">
                    Passo {index + 1}: {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
