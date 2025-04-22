
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StickyHeader from '@/components/landing/StickyHeader';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSolutionSection from '@/components/landing/ProblemSolutionSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FAQSection from '@/components/landing/FAQSection';
import PricingSection from '@/components/landing/PricingSection';
import ContactFormSection from '@/components/landing/ContactFormSection';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Bem-vindo de volta!</h1>
        <p className="mb-8">Você já está conectado. Continue sua jornada para a aprovação.</p>
        <Link to="/dashboard">
          <Button>Ir para o Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <StickyHeader />
      <main>
        <HeroSection />
        <ProblemSolutionSection />
        <BenefitsSection />
        <TestimonialsSection />
        <HowItWorksSection />
        <FAQSection />
        <PricingSection />
        <ContactFormSection />
      </main>
    </>
  );
}
