import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package2, Users, ArrowDownUp, Home, ClipboardCheck, Mail, Globe, User, LogOut } from 'lucide-react';
import epamigLogo from '../fotos/epamig.png'; // Importar a imagem
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-green-700 text-white py-3 border-b">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-2 md:mb-0">
            <img
              src={epamigLogo} // Usar a imagem importada
              alt="Logo EPAMIG"
              className="h-12 w-auto mr-4"
            />
            <div>
              <h5 className="text-lg font-semibold mb-0">Empresa de Pesquisa Agropecuária de Minas Gerais</h5>
              <small className="text-gray-200">Secretaria de Estado de Agricultura, Pecuária e Abastecimento</small>
            </div>
          </div>
          <div className="flex space-x-2">
            <a
              href="https://www.epamig.br"
              className="btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe size={16} />
              <span>Site</span>
            </a>
            <a
              href="https://mail.google.com/mail/u/0/#inbox"
              className="btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Mail size={16} />
              <span>E-mail</span>
            </a>
            <a
              href="https://empresade125369.rm.cloudtotvs.com.br/Corpore.Net/Login.aspx"
              className="btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <User size={16} />
              <span>Portal ADM</span>
            </a>
            <button
              onClick={handleLogout}
              className="btn-outline bg-red-600 hover:bg-red-700"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navegação */}
      <nav className="bg-green-800 text-white">
        <div className="container mx-auto flex space-x-4 py-3">
          <Link to="/" className="nav-link">
            <Home size={20} />
            <span>Início</span>
          </Link>
          <Link to="/equipment" className="nav-link">
            <Package2 size={20} />
            <span>Equipamentos</span>
          </Link>
          <Link to="/stock-movements" className="nav-link">
            <ArrowDownUp size={20} />
            <span>Movimentações de Estoque</span>
          </Link>
          <Link to="/stock-reduction" className="nav-link">
            <ClipboardCheck size={20} />
            <span>Registrar Baixa</span>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/users" className="nav-link">
              <Users size={20} />
              <span>Usuários do Sistema</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>

      {/* Rodapé */}
      <footer className="bg-green-700 text-white text-center py-3">
        <p>&copy; {new Date().getFullYear()} EPAMIG - Sistema de Controle de Estoque</p>
      </footer>
    </div>
  );
}