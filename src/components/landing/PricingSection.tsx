
import { motion } from "framer-motion";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function PricingSection() {
  const [paymentType, setPaymentType] = useState<"annual" | "installments">("installments");
  const [careerLevel, setCareerLevel] = useState("superior");
  
  const careerLevels = [
    { value: "fundamental", label: "Nível Fundamental" },
    { value: "medio", label: "Nível Médio" },
    { value: "medio-tecnico", label: "Nível Médio-Técnico" },
    { value: "policial-medio", label: "Carreiras Policiais (Nível Médio)" },
    { value: "superior", label: "Nível Superior" },
    { value: "policial-superior", label: "Carreiras Policiais (Nível Superior)" },
    { value: "medica", label: "Carreiras Médicas" },
    { value: "juridica", label: "Carreiras Jurídicas" },
    { value: "promotoria", label: "Carreiras de Promotoria" },
    { value: "magistratura", label: "Carreiras de Magistratura" }
  ];

  const prices = {
    "fundamental": { annual: 99, monthly: 9.90 },
    "medio": { annual: 159, monthly: 15.90 },
    "medio-tecnico": { annual: 159.90, monthly: 15.90 },
    "policial-medio": { annual: 159.90, monthly: 15.90 },
    "superior": { annual: 499, monthly: 49.90 },
    "policial-superior": { annual: 699, monthly: 69.90 },
    "medica": { annual: 999, monthly: 99.90 },
    "juridica": { annual: 999, monthly: 99.90 },
    "promotoria": { annual: 1999, monthly: 199.90 },
    "magistratura": { annual: 1999, monthly: 199.90 }
  };
  
  const pricingPlans = [
    {
      name: "Essencial",
      price: 0,
      popular: false,
      description: "Plano inicial para conhecer a plataforma",
      features: [
        { included: true, text: "+14 milhões de questões de provas anteriores" },
        { included: true, text: "1º Plano de Estudos Personalizado gratuito" },
        { included: true, text: "Análise de Trend Topics para identificar temas relevantes" },
        { included: false, text: "Plano de estudos semanal atualizado" },
        { included: false, text: "Questões inéditas no padrão da banca" },
        { included: false, text: "Análise de desempenho detalhada" }
      ]
    },
    {
      name: "Unlimited",
      price: careerLevel ? (paymentType === "annual" ? prices[careerLevel as keyof typeof prices].annual : prices[careerLevel as keyof typeof prices].monthly) : 0,
      popular: true,
      description: "Ideal para concursos específicos de sua carreira",
      features: [
        { included: true, text: "Tudo do plano Essencial" },
        { included: true, text: "Plano de estudos semanal atualizado com IA" },
        { included: true, text: "Questões inéditas no padrão da banca" },
        { included: true, text: "Análise de desempenho detalhada" },
        { included: true, text: "Suporte prioritário" },
        { included: false, text: "Sessões de mentoria especializada" }
      ]
    },
    {
      name: "Competitive",
      price: careerLevel ? (paymentType === "annual" ? prices[careerLevel as keyof typeof prices].annual * 2 : prices[careerLevel as keyof typeof prices].monthly * 2) : 0,
      popular: false,
      description: "Solução completa para concursos de alta competitividade",
      features: [
        { included: true, text: "Tudo do plano Unlimited" },
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

  const handleCareerLevelChange = (value: string) => {
    setCareerLevel(value);
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
          
          <div className="flex flex-col gap-6 items-center justify-center mb-8">
            <div className="flex items-center justify-center space-x-4">
              <span className={`font-medium ${paymentType === "installments" ? "text-gray-900" : "text-gray-500"}`}>12x</span>
              <button 
                onClick={() => setPaymentType(paymentType === "installments" ? "annual" : "installments")}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                ${paymentType === "annual" ? "bg-primary-600" : "bg-gray-200"}`}
                role="switch"
                aria-checked={paymentType === "annual"}
              >
                <span 
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${paymentType === "annual" ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span className={`font-medium ${paymentType === "annual" ? "text-gray-900" : "text-gray-500"}`}>Anual <span className="text-sm text-primary-700 font-semibold ml-1">(Economia de 15%)</span></span>
            </div>
            
            <div className="w-full max-w-xs">
              <p className="text-sm text-gray-600 mb-2 text-center">Selecione seu cargo/concurso:</p>
              <Select value={careerLevel} onValueChange={handleCareerLevelChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione seu cargo" />
                </SelectTrigger>
                <SelectContent>
                  {careerLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold text-gray-900">Grátis</span>
                  ) : (
                    <>
                      {paymentType === "annual" ? (
                        <>
                          <span className="text-4xl font-bold text-gray-900">
                            R$ {plan.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-gray-600">/ano</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-gray-900">
                            12x R$ {plan.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-gray-600">/mês</span>
                        </>
                      )}
                    </>
                  )}
                  {plan.price > 0 && paymentType === "annual" && (
                    <p className="text-sm text-primary-700 font-medium mt-1">Pagamento anual à vista</p>
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
                  className={`w-full ${plan.popular ? 'bg-primary-600 hover:bg-primary-700' : plan.price === 0 ? 'bg-gray-800 hover:bg-gray-900' : 'bg-gray-800 hover:bg-gray-900'}`}
                  id={`cta-assinar-${plan.name.toLowerCase()}`}
                >
                  <Link to="/signup">
                    {plan.price === 0 ? "Começar Grátis" : `Assinar ${plan.name}`}
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
