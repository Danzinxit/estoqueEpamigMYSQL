import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Trash } from 'lucide-react';

export function StockMovements() {
  const [equipment, setEquipment] = useState([]);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({ equipmentId: '', quantity: 0, type: 'in', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch equipment and movements
  useEffect(() => {
    fetch('/api/equipment')
      .then((response) => response.json())
      .then((data) => setEquipment(data))
      .catch((error) => console.error('Erro ao carregar equipamentos:', error));

    fetch('/api/stock')
      .then((response) => response.json())
      .then((data) => setMovements(data))
      .catch((error) => console.error('Erro ao carregar movimentações:', error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.equipmentId || form.quantity <= 0) {
      setError('Equipamento e quantidade válidos são obrigatórios.');
      return;
    }

    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registrar movimentação.');
      }

      const data = await response.json();
      setSuccess(data.message);
      setForm({ equipmentId: '', quantity: 0, type: 'in', description: '' });

      // Atualizar lista de movimentações
      fetch('/api/stock')
        .then((response) => response.json())
        .then((data) => setMovements(data))
        .catch((error) => console.error('Erro ao carregar movimentações:', error));
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      setError(error.message || 'Erro ao registrar movimentação.');
    }
  };

  const handleDeleteMovement = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta movimentação?')) return;

    try {
      const response = await fetch(`/api/stock/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Erro ao deletar movimentação.');
      }

      setSuccess('Movimentação deletada com sucesso.');
      setMovements(movements.filter((movement) => movement.id !== id));
    } catch (error) {
      console.error('Erro ao deletar movimentação:', error);
      setError('Erro ao deletar movimentação.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Movimentações de Estoque</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <ArrowUpCircle className="text-green-600" />
            <span>Registrar Movimentação</span>
          </h3>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">{success}</div>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Equipamento</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={form.equipmentId}
                onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}
              >
                <option value="">Selecione um equipamento...</option>
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantidade</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="in">Entrada</option>
                <option value="out">Saída</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              ></textarea>
            </div>
            <button type="submit" className="btn-primary w-full">
              Registrar Movimentação
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Histórico de Movimentações</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Equipamento</th>
                  <th className="table-header">Quantidade</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Descrição</th>
                  <th className="table-header">Data</th>
                  <th className="table-header">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="table-cell">{movement.equipment_name}</td>
                    <td className="table-cell">{movement.quantity}</td>
                    <td className="table-cell">{movement.type === 'in' ? 'Entrada' : 'Saída'}</td>
                    <td className="table-cell">{movement.description || 'Sem descrição'}</td>
                    <td className="table-cell">{new Date(movement.created_at).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <button
                        className="btn-outline text-red-500"
                        onClick={() => handleDeleteMovement(movement.id)}
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td className="table-cell" colSpan={6}>
                      Nenhuma movimentação registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}