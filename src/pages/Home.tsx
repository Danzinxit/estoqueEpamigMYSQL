
import { Link } from 'react-router-dom';
export function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabeçalho */}
      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        <h2 className="text-2xl font-semibold mb-4">Bem-vindo ao Sistema de Controle de Estoque</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Usuários do Sistema</h3>
            <p className="text-sm text-gray-600">Gerencie os usuários cadastrados no sistema.</p>
            <Link to="/users" className="btn-primary mt-4 inline-block">
              Acessar
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Equipamentos</h3>
            <p className="text-sm text-gray-600">Gerencie o inventário de equipamentos.</p>
            <Link to="/equipment" className="btn-primary mt-4 inline-block">
              Acessar
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Movimentações de Estoque</h3>
            <p className="text-sm text-gray-600">Registre entradas e saídas de estoque.</p>
            <Link to="/stock-movements" className="btn-primary mt-4 inline-block">
              Acessar
            </Link>
          </div>
        </div>
      </main>

    
    </div>
  );
}