import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// --- IMPORTAR O HEADER DA LANDING PAGE ---
import StickyHeader from '@/components/landing/StickyHeader'; // <<-- IMPORTAR
import HeroSection from '@/components/landing/HeroSection';
import ProblemSolutionSection from '@/components/landing/ProblemSolutionSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FAQSection from '@/components/landing/FAQSection';
import PricingSection from '@/components/landing/PricingSection';
import ContactFormSection from '@/components/landing/ContactFormSection';
// --- IMPORTAR O FOOTER PADRÃO (OPCIONAL, MAS COMUM EM LANDING PAGES) ---
import Footer from '@/components/layout/Footer'; // <<-- IMPORTAR (Opcional)

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  // Se estiver autenticado, talvez não precise do StickyHeader,
  // pois o usuário será redirecionado ou verá a mensagem de boas-vindas
  // que já está dentro do contexto do MainLayout implicitamente (via navegação).
  // No entanto, o hook useAuthNavigation deve lidar com o redirecionamento.
  // Se quisermos mostrar algo ANTES do redirecionamento:
  if (isAuthenticated) {
    // Poderia ter um layout mínimo aqui ou apenas um spinner
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        {/* Pode ou não incluir um header/footer simples aqui */}
        <div className="py-20 text-center">
          <h1 className="text-3xl font-bold mb-6">Bem-vindo de volta!</h1>
          <p className="mb-8">Você já está conectado. Redirecionando...</p>
          {/* O redirecionamento é feito pelo useAuthNavigation */}
           <Link to="/dashboard/student"> {/* Link de fallback */}
             <Button>Ir para o Dashboard</Button>
           </Link>
        </div>
      </div>
    );
  }

  // Renderização para usuário NÃO autenticado
  return (
    // Envolve todo o conteúdo com um fragmento ou div se necessário
    <div className="flex flex-col min-h-screen">
      {/* --- RENDERIZAR O HEADER DA LANDING PAGE AQUI --- */}
      <StickyHeader /> {/* <<-- RENDERIZAR */}

      {/* O main agora pode precisar de um padding-top para não ficar atrás do header fixo */}
      {/* Ajuste o valor de pt-16 ou pt-20 conforme a altura do seu StickyHeader */}
      <main className="flex-grow pt-16 md:pt-20">
        <HeroSection />
        <ProblemSolutionSection />
        <BenefitsSection />
        <TestimonialsSection />
        <HowItWorksSection />
        <FAQSection />
        <PricingSection />
        <ContactFormSection />
      </main>

      {/* --- RENDERIZAR O FOOTER (OPCIONAL) --- */}
      <Footer /> {/* <<-- RENDERIZAR */}
    </div>
  );
}