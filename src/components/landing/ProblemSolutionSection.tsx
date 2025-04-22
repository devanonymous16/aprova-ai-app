
import { motion } from "framer-motion";
import { Brain, Target, CloudRain, HelpCircle, BarChart3, Rocket } from "lucide-react";

export default function ProblemSolutionSection() {
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

  const problems = [
    { 
      icon: CloudRain, 
      title: "Estudando no escuro", 
      description: "Sem saber onde estão suas lacunas de conhecimento ou como priorizá-las." 
    },
    { 
      icon: HelpCircle, 
      title: "Erros recorrentes", 
      description: "Sem entender por que você erra as mesmas questões repetidamente." 
    },
    { 
      icon: BarChart3, 
      title: "Progresso lento", 
      description: "Sem visibilidade clara do seu avanço e aonde focar seus esforços." 
    }
  ];

  const solutions = [
    { 
      icon: Brain, 
      title: "Diagnóstico preciso", 
      description: "Nossa IA identifica exatamente onde estão suas lacunas de conhecimento." 
    },
    { 
      icon: Target, 
      title: "Plano personalizado", 
      description: "Roteiros de estudo adaptados ao seu perfil e objetivos específicos." 
    },
    { 
      icon: Rocket, 
      title: "Aprovação acelerada", 
      description: "Resultados até 40% mais rápidos que métodos tradicionais de estudo." 
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 font-heading">
            Você se identifica com essa jornada?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare a preparação tradicional com a revolução que a Forefy traz para seus estudos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Coluna da Dor */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">Preparação Tradicional</h3>
            
            {problems.map((problem, index) => (
              <motion.div 
                key={index} 
                variants={item}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                  <problem.icon size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1 text-gray-800">{problem.title}</h4>
                  <p className="text-gray-600">{problem.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Coluna da Solução */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-xl font-bold text-primary-900 mb-6">A Solução Forefy</h3>
            
            {solutions.map((solution, index) => (
              <motion.div 
                key={index}
                variants={item}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700">
                  <solution.icon size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1 text-primary-900">{solution.title}</h4>
                  <p className="text-gray-600">{solution.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
