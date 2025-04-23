import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Equipment } from './pages/Equipment';
import { StockMovements } from './pages/StockMovements';
import { StockReduction } from './pages/StockReduction';
import { Users } from './pages/Users';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente para proteger rotas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rotas protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout><Home /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/equipment" element={
        <ProtectedRoute>
          <Layout><Equipment /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/stock-movements" element={
        <ProtectedRoute>
          <Layout><StockMovements /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/stock-reduction" element={
        <ProtectedRoute>
          <Layout><StockReduction /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <Layout><Users /></Layout>
        </ProtectedRoute>
      } />
      
      {/* Redirecionar para login se a rota não existir */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
