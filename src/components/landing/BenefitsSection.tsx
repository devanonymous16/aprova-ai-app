
import { motion } from "framer-motion";
import { CalendarCheck, Target, BookOpen, LineChart, Users, BookOpenCheck } from "lucide-react";

export default function BenefitsSection() {
  const benefitsList = [
    {
      icon: CalendarCheck,
      title: "Seu Plano de Estudos Ideal",
      description: "Algoritmos de IA criam planos personalizados com base no seu perfil e desempenho."
    },
    {
      icon: Target,
      title: "Diagnóstico de Erros Cirúrgico",
      description: "Identificamos padrões nos seus erros para direcionar seu foco onde realmente importa."
    },
    {
      icon: BookOpen,
      title: "Questões que Imitam a Banca",
      description: "Pratique com questões adaptadas ao estilo da banca do seu concurso específico."
    },
    {
      icon: LineChart,
      title: "Progresso Real e Visível",
      description: "Acompanhe métricas concretas de evolução e veja seu crescimento a cada semana."
    },
    {
      icon: Users,
      title: "Comunidade e Suporte",
      description: "Conecte-se com outros concurseiros e receba suporte especializado da nossa equipe."
    },
    {
      icon: BookOpenCheck,
      title: "Ciência do Aprendizado",
      description: "Metodologias baseadas em evidências científicas para otimizar sua retenção de conteúdo."
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
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
            Pare de adivinhar. Comece a aprovar.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nossa plataforma combina inteligência artificial com metodologias comprovadas para maximizar seus resultados
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {benefitsList.map((benefit, index) => (
            <motion.div 
              key={index} 
              variants={item}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 mb-4">
                <benefit.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
