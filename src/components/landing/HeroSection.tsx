
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-secondary-500/80 z-0"></div>
      <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-5 z-0"></div>
      
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Sua Aprovação Começa com Inteligência
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Algoritmos de IA que analisam seu desempenho, identificam lacunas de conhecimento e 
            criam o plano de estudos perfeito para sua aprovação.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              asChild
              size="lg"
              className="bg-white text-primary-900 hover:bg-white/90 text-base font-medium px-8"
            >
              <a href="#planos">Quero ser aprovado mais rápido</a>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 text-base font-medium px-8 hover:text-white"
            >
              <Link to="/login">Já tenho uma conta</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
