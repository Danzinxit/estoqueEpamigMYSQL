import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
}

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

export function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({ name: '', email: '', password: '', role: 'user' });
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Função para buscar usuários do backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');  // Certifique-se de que a rota esteja correta no backend
      if (!response.ok) {
        throw new Error(`Erro ao buscar usuários. Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('Não foi possível carregar os usuários.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar usuário.');
      }

      alert('Usuário adicionado com sucesso!');
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      alert('Erro ao adicionar usuário.');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const updatedUser = { ...editingUser };
      if (!updatedUser.password || updatedUser.password.trim() === '') {
        delete updatedUser.password;
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar usuário.');
      }

      alert('Usuário atualizado com sucesso!');
      setShowModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'admin',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar usuário.');
      }

      alert('Usuário deletado com sucesso!');
      fetchUsers();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      alert('Erro ao deletar usuário.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Usuários do Sistema</h2>
        <button
          className="btn-primary flex items-center space-x-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} />
          <span>Adicionar Usuário</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              className="w-full border-none focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Nome</th>
                <th className="table-header">Email</th>
                <th className="table-header">Função</th>
                <th className="table-header">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users
                .filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((user) => (
                  <tr key={user.id || Math.random()}>
                    <td className="table-cell">{user.name || 'Nome não disponível'}</td>
                    <td className="table-cell">{user.email || 'Email não disponível'}</td>
                    <td className="table-cell">{user.role || 'Função não disponível'}</td>
                    <td className="table-cell space-x-2">
                      <button
                        className="btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        onClick={() => handleEditUser(user)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-danger bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              {users.length === 0 && (
                <tr>
                  <td className="table-cell" colSpan={4}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editingUser?.name || newUser.name}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, name: e.target.value })
                      : setNewUser({ ...newUser, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editingUser?.email || newUser.email}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, email: e.target.value })
                      : setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editingUser?.password || newUser.password}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, password: e.target.value })
                      : setNewUser({ ...newUser, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Função</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editingUser?.role || newUser.role}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, role: e.target.value })
                      : setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                onClick={() => setShowModal(false)}
              >
                Fechar
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                onClick={editingUser ? handleUpdateUser : handleAddUser}
              >
                {editingUser ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
