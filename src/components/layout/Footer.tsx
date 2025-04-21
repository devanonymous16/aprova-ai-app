
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
              Empresa
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-base text-gray-500 hover:text-gray-900">
                  Carreiras
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
              Produto
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/features" className="text-base text-gray-500 hover:text-gray-900">
                  Recursos
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-base text-gray-500 hover:text-gray-900">
                  Planos
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-base text-gray-500 hover:text-gray-900">
                  Depoimentos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
              Suporte
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/faq" className="text-base text-gray-500 hover:text-gray-900">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/help-center" className="text-base text-gray-500 hover:text-gray-900">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-base text-gray-500 hover:text-gray-900">
                  Suporte
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-500 hover:text-gray-900">
                  Termos
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Forefy. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
