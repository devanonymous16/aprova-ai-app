import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom'; // <<-- IMPORTAR Outlet
import Navbar from './Navbar';
import Footer from './Footer';
// import { useAuth } from '@/contexts/AuthContext'; // useAuth não está sendo usado aqui

interface MainLayoutProps {
  children?: ReactNode; // <<-- Torna children opcional
}

export default function MainLayout({ children }: MainLayoutProps) {
  // const { isAuthenticated, user } = useAuth(); // Removido se não for usado diretamente aqui

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
         {/* Renderiza as rotas filhas (Dashboards) através do Outlet */}
         {children ?? <Outlet />} {/* <<-- Usa children se passado, senão usa Outlet */}
      </main>
      <Footer />
    </div>
  );
}