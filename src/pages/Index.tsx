
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl font-heading">
                Preparação inteligente para concursos
              </h1>
              <p className="mt-3 max-w-md mx-auto text-lg text-gray-100 sm:text-xl md:mt-5 md:max-w-3xl">
                Use inteligência artificial para otimizar seus estudos e aumentar suas chances de aprovação em concursos públicos.
              </p>
              <div className="mt-10 flex gap-4">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button className="bg-white text-primary-900 hover:bg-gray-100">
                      Acessar Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button className="bg-white text-primary-900 hover:bg-gray-100">
                        Comece agora
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" className="border-white text-white hover:bg-primary-800">
                        Já tenho conta
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:w-1/2">
              <div className="pl-4 sm:pl-6 md:pl-8">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    className="rounded-lg shadow-xl ring-1 ring-black ring-opacity-5"
                    src="https://placehold.co/600x400/1a365d/ffffff/?text=Forefy+Demo"
                    alt="App demo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-heading">
              Como o Forefy ajuda você a ser aprovado
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Nossa plataforma combina tecnologia e metodologia para maximizar seu tempo de estudo
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 font-heading">Planos de estudo personalizados</h3>
              <p className="mt-4 text-gray-600">
                Algoritmos de IA analisam seu desempenho e criam roteiros de estudo otimizados para suas necessidades.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 font-heading">Estatísticas avançadas</h3>
              <p className="mt-4 text-gray-600">
                Visualização detalhada do seu progresso com métricas que ajudam a identificar pontos fortes e fracos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-success-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 font-heading">Banco de questões inteligente</h3>
              <p className="mt-4 text-gray-600">
                Acesso a milhares de questões organizadas por tema e com dificuldade adaptada ao seu nível atual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-heading">
              Soluções para todos os perfis
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Seja você estudante individual ou uma instituição preparatória, o Forefy tem a solução ideal
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Student B2C */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 font-heading">Estudante individual</h3>
              <p className="mt-4 text-gray-600">
                Planos flexíveis para quem está estudando por conta própria e busca uma ferramenta completa para maximizar seu desempenho.
              </p>
              <div className="mt-6">
                <Link to="/signup">
                  <Button variant="outline" size="sm">
                    Saiba mais
                  </Button>
                </Link>
              </div>
            </div>

            {/* Student B2B */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 font-heading">Aluno de cursinho</h3>
              <p className="mt-4 text-gray-600">
                Se você é aluno de um cursinho parceiro, acesse nossa plataforma com as configurações específicas da sua instituição.
              </p>
              <div className="mt-6">
                <Link to="/login?type=b2b">
                  <Button variant="outline" size="sm">
                    Acesse sua conta
                  </Button>
                </Link>
              </div>
            </div>

            {/* Institution Manager */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 font-heading">Cursinhos e instituições</h3>
              <p className="mt-4 text-gray-600">
                Ofereça uma experiência diferenciada aos seus alunos com nossa solução white-label e análises gerenciais avançadas.
              </p>
              <div className="mt-6">
                <Link to="/enterprise">
                  <Button variant="outline" size="sm">
                    Fale conosco
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white font-heading">
            Pronto para transformar seu modo de estudar?
          </h2>
          <p className="mt-4 text-xl text-gray-100">
            Junte-se a milhares de concurseiros que já estão otimizando seu tempo de estudo com o Forefy.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/signup">
              <Button className="bg-white text-primary-900 hover:bg-gray-100">
                Experimentar grátis
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" className="border-white text-white hover:bg-primary-800">
                Ver planos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
