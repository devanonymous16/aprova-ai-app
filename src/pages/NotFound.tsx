
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <h1 className="text-7xl font-bold text-gray-900 mb-2 font-heading">404</h1>
      <p className="text-xl text-gray-600 mb-8">Oops! Página não encontrada</p>
      <p className="text-gray-500 max-w-md text-center mb-8">
        Parece que esta página não existe ou o endereço está incorreto. 
        Verifique a URL ou volte para a página inicial.
      </p>
      <div className="flex flex-col md:flex-row gap-4">
        <Link to="/">
          <Button>
            Voltar para a página inicial
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline">
            Ir para o Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
