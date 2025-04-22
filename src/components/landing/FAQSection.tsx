
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
    {
      question: "A Forefy funciona para qualquer concurso?",
      answer: "Sim! Nossa plataforma é adaptável e conta com materiais para os principais concursos federais, estaduais e municipais. Nossos algoritmos personalizam o conteúdo de acordo com o edital e banca do concurso que você está visando."
    },
    {
      question: "Quanto tempo por dia preciso dedicar?",
      answer: "A Forefy se adapta à sua rotina. Nossos planos de estudo são flexíveis e podem ser ajustados para quem tem apenas 1 hora por dia ou para quem pode dedicar estudos em período integral. O sistema otimiza seu tempo disponível para máxima eficiência."
    },
    {
      question: "Qual a diferença entre a Forefy e um cursinho tradicional?",
      answer: "Enquanto cursinhos oferecem conteúdo padronizado para todos os alunos, a Forefy utiliza inteligência artificial para criar um plano 100% personalizado. Identificamos suas lacunas específicas e direcionamos os estudos para maximizar seus resultados no tempo disponível."
    },
    {
      question: "Como a IA sabe o que funciona melhor para mim?",
      answer: "Nossa IA analisa seus padrões de erros e acertos, tempo de resposta, histórico de estudos e compara com dados de milhares de aprovados. Com base nessas informações, identificamos as melhores estratégias de estudo para seu perfil cognitivo específico."
    },
    {
      question: "Posso testar a plataforma antes de assinar?",
      answer: "Sim! Oferecemos um período de teste gratuito de 7 dias com acesso a todas as funcionalidades. Você pode experimentar nosso diagnóstico inicial e ver como funciona o plano personalizado antes de decidir pela assinatura."
    },
    {
      question: "O que acontece se eu mudar de concurso durante minha preparação?",
      answer: "Sem problemas! Você pode ajustar seu objetivo a qualquer momento. O sistema irá recalcular seu plano de estudos, identificando conteúdos em comum e novas prioridades, para que você não perca o progresso já feito."
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
            Dúvidas Comuns
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tudo que você precisa saber sobre como a Forefy pode impulsionar sua aprovação
          </p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-0 last:border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 text-left">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-1 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
