
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-900">Forefy</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#planos" className={`text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-primary-700' : 'text-white hover:text-white/80'}`}>
            Planos
          </a>
          <a href="#" className={`text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-primary-700' : 'text-white hover:text-white/80'}`}>
            Como Funciona
          </a>
          <a href="#" className={`text-sm font-medium ${scrolled ? 'text-gray-700 hover:text-primary-700' : 'text-white hover:text-white/80'}`}>
            Para Cursinhos
          </a>
          <Link to="/login" className={`text-sm font-medium ${scrolled ? 'text-primary-700 hover:text-primary-800' : 'text-white hover:text-white/80'}`}>
            Entrar
          </Link>
          
          <Button asChild size="sm" className={scrolled ? "bg-primary-600 hover:bg-primary-700" : "bg-white text-primary-900 hover:bg-white/90"}>
            <a href="#planos">Começar Agora</a>
          </Button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm" className={scrolled ? "text-gray-700" : "text-white"}>
            Menu
          </Button>
        </div>
      </div>
    </header>
  );
}
