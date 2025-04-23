import React, { useState, useEffect } from 'react';

export function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', description: '', quantity: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch equipment data
  useEffect(() => {
    fetch('/api/equipment')
      .then((response) => response.json())
      .then((data) => setEquipment(data))
      .catch((error) => console.error('Erro ao carregar equipamentos:', error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEditing ? `/api/equipment/${form.id}` : '/api/equipment';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, description: form.description, quantity: form.quantity }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar equipamento.');
      }

      setForm({ id: null, name: '', description: '', quantity: 0 });
      setIsEditing(false);

      // Refresh equipment list
      fetch('/api/equipment')
        .then((response) => response.json())
        .then((data) => setEquipment(data));
    } catch (error) {
      console.error('Erro ao salvar equipamento:', error);
    }
  };

  const handleEdit = (item) => {
    setForm({ id: item.id, name: item.name, description: item.description, quantity: item.quantity });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este equipamento?')) return;

    try {
      await fetch(`/api/equipment/${id}`, { method: 'DELETE' });

      // Refresh equipment list
      setEquipment(equipment.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Erro ao deletar equipamento:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Equipamentos</h1>

      {/* Formulário de Cadastro/Atualização */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? 'Editar Equipamento' : 'Cadastrar Equipamento'}
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nome do Equipamento</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Quantidade</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
        >
          {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
        </button>
      </form>

      {/* Campo de Busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar equipamentos..."
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabela de Equipamentos */}
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nome</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Descrição</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantidade</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {equipment
            .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.description || 'Sem descrição'}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2 space-x-2 flex items-center">
                  <button
                    className="btn-outline flex items-center text-blue-500 hover:text-blue-700"
                    onClick={() => handleEdit(item)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-outline flex items-center text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(item.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          {equipment.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                Nenhum equipamento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}