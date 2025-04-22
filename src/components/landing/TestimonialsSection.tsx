
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "A análise personalizada da Forefy identificou exatamente onde eu estava falhando. Em 6 meses fui aprovado em um concurso que tentava há 2 anos.",
      name: "Carlos Silva",
      position: "Aprovado - Analista Tributário",
      image: "https://placehold.co/100x100/1a365d/ffffff/?text=CS"
    },
    {
      quote: "O sistema de planos de estudo adaptativo foi revolucionário. A cada semana eu via minha evolução nas estatísticas e isso me manteve motivada até a aprovação.",
      name: "Mariana Costa",
      position: "Aprovada - Técnica Judiciária",
      image: "https://placehold.co/100x100/1a365d/ffffff/?text=MC"
    },
    {
      quote: "As questões geradas pela IA eram tão precisas que quando fiz a prova real parecia que já tinha visto tudo aquilo antes. Aprovado no primeiro concurso!",
      name: "Rafael Mendes",
      position: "Aprovado - Auditor Fiscal",
      image: "https://placehold.co/100x100/1a365d/ffffff/?text=RM"
    },
    {
      quote: "Depois de tentar vários métodos, a Forefy me deu a estrutura e o direcionamento que eu precisava. O diagnóstico de pontos fracos foi certeiro.",
      name: "Juliana Alves",
      position: "Aprovada - Analista Judiciário",
      image: "https://placehold.co/100x100/1a365d/ffffff/?text=JA"
    }
  ];

  const stats = [
    { value: 87, label: "Aumento Médio de Acertos", suffix: "%" },
    { value: 76, label: "Aprovados em Menos de 1 Ano*", suffix: "%" },
    { value: 92, label: "Taxa de Satisfação", suffix: "%" }
  ];

  // Counter animation for stats
  const CounterAnimation = ({ value, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const nodeRef = useRef(null);
    
    useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const duration = 2000;
          const step = timestamp => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          observer.disconnect();
        }
      });
      
      if (nodeRef.current) {
        observer.observe(nodeRef.current);
      }
      
      return () => observer.disconnect();
    }, [value]);
    
    return (
      <span className="text-4xl font-bold text-primary-900" ref={nodeRef}>
        {count}{suffix}
      </span>
    );
  };

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
            Histórias Reais de Aprovação
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Veja como a Forefy tem transformado a jornada de concurseiros por todo o Brasil
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <Carousel className="max-w-5xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                  <div className="h-full p-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                      <div className="mb-4 flex-grow">
                        <p className="italic text-gray-700">"{testimonial.quote}"</p>
                      </div>
                      <div className="flex items-center mt-4">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="w-12 h-12 rounded-full mr-4 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-primary-700">{testimonial.position}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-6">
              <CarouselPrevious className="relative inset-auto translate-y-0" />
              <CarouselNext className="relative inset-auto translate-y-0" />
            </div>
          </Carousel>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white rounded-xl p-8 shadow-sm border border-gray-100"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <CounterAnimation value={stat.value} suffix={stat.suffix} />
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="text-center mt-6 text-sm text-gray-500">
          * Baseado em uma pesquisa com 1.200 usuários ativos entre 2023-2024.
        </div>
      </div>
    </section>
  );
}
