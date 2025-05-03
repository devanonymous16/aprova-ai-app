import { ReactNode } from 'react';
import { Link } from 'react-router-dom'; // Link não está sendo usado, pode remover se quiser
import { Outlet } from 'react-router-dom'; // <<-- IMPORTAR Outlet

interface AuthLayoutProps {
  children?: ReactNode; // <<-- Torna children opcional
  // title: string; // <<-- REMOVIDO title das props
  subtitle?: ReactNode;
}

// Remove 'title' dos argumentos da função
export default function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center text-gradient font-heading">
          Forefy
        </h1>
        {/* Título agora deve ser definido pela PÁGINA específica (Login, Signup) */}
        {/* Removido: <h2 className="mt-6 ...">{title}</h2> */}
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Renderiza as rotas filhas (Login, Signup) através do Outlet */}
          {children ?? <Outlet />} {/* <<-- Usa children se passado, senão usa Outlet */}
        </div>
      </div>
    </div>
  );
}