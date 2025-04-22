
import { motion } from "framer-motion";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  
  const pricingPlans = [
    {
      name: "Essencial",
      price: billingPeriod === "monthly" ? 89.90 : 59.90,
      popular: false,
      description: "Plano ideal para concurseiros iniciantes",
      features: [
        { included: true, text: "Plano de estudos básico" },
        { included: true, text: "Banco de questões" },
        { included: true, text: "Diagnóstico inicial" },
        { included: false, text: "Plano de estudos avançado com IA" },
        { included: false, text: "Análise de desempenho detalhada" },
        { included: false, text: "Suporte prioritário" }
      ]
    },
    {
      name: "Pro",
      price: billingPeriod === "monthly" ? 147.90 : 97.90,
      popular: true,
      description: "Nossa melhor escolha para concursos de média dificuldade",
      features: [
        { included: true, text: "Tudo do plano Essencial" },
        { included: true, text: "Plano de estudos avançado com IA" },
        { included: true, text: "Simulador de provas personalizado" },
        { included: true, text: "Análise de desempenho detalhada" },
        { included: true, text: "Suporte prioritário" },
        { included: false, text: "Mentoria individual" }
      ]
    },
    {
      name: "Premium",
      price: billingPeriod === "monthly" ? 297.90 : 197.90,
      popular: false,
      description: "Solução completa para concursos de alta competitividade",
      features: [
        { included: true, text: "Tudo do plano Pro" },
        { included: true, text: "Mentoria individual quinzenal" },
        { included: true, text: "Análise profunda de performance" },
        { included: true, text: "Conteúdos exclusivos para top concursos" },
        { included: true, text: "Grupos de estudo exclusivos" },
        { included: true, text: "Atendimento VIP 24/7" }
      ]
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
    <section id="planos" className="py-16 md:py-24 bg-white">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 font-heading">
            Chegou a hora de tomar a decisão que define seu futuro
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Escolha o plano ideal e comece sua jornada rumo à aprovação
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`font-medium ${billingPeriod === "monthly" ? "text-gray-900" : "text-gray-500"}`}>Mensal</span>
            <button 
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
              ${billingPeriod === "yearly" ? "bg-primary-600" : "bg-gray-200"}`}
              role="switch"
              aria-checked={billingPeriod === "yearly"}
            >
              <span 
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                ${billingPeriod === "yearly" ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <span className={`font-medium ${billingPeriod === "yearly" ? "text-gray-900" : "text-gray-500"}`}>Anual <span className="text-sm text-primary-700 font-semibold ml-1">(Economize 33%)</span></span>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {pricingPlans.map((plan, index) => (
            <motion.div 
              key={index} 
              variants={item}
              className={`rounded-xl overflow-hidden border ${plan.popular ? 'border-primary-500 shadow-lg shadow-primary-100' : 'border-gray-200 shadow-sm'} relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 text-center bg-primary-500 text-white py-1 text-sm font-medium">
                  Mais Popular
                </div>
              )}
              <div className={`p-6 ${plan.popular ? 'pt-9' : 'pt-6'}`}>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mb-4 h-12">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    R$ {plan.price.toFixed(2)}
                  </span>
                  <span className="text-gray-600">/mês</span>
                  {billingPeriod === "yearly" && (
                    <p className="text-sm text-primary-700 font-medium mt-1">Cobrança anual</p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full ${feature.included ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'} flex items-center justify-center mr-3 mt-0.5`}>
                        {feature.included ? <Check size={14} /> : <X size={14} />}
                      </span>
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-500'}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild
                  className={`w-full ${plan.popular ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                  id={`cta-assinar-${plan.name.toLowerCase()}`}
                >
                  <Link to="/signup">
                    Assinar {plan.name}
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-10">
          <p className="text-gray-600 mb-4">
            Não tem certeza sobre qual plano escolher?
          </p>
          <Button variant="outline" asChild>
            <Link to="/signup?trial=true">
              Experimentar grátis por 7 dias
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
