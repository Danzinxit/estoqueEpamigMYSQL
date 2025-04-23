import React, { useState, useEffect } from 'react';

export function StockReduction() {
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState({
    equipmentId: '',
    quantity: '',
    ticket: '',
    observation: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch equipment data
  useEffect(() => {
    fetch('/api/equipment')
      .then((response) => response.json())
      .then((data) => setEquipment(data))
      .catch((error) => console.error('Erro ao carregar equipamentos:', error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.equipmentId || !form.quantity || Number(form.quantity) <= 0) {
      setError('Equipamento e quantidade válidos são obrigatórios.');
      return;
    }

    try {
      // Preparar os dados para a API
      const stockData = {
        equipment_id: form.equipmentId,
        quantity: Number(form.quantity),
        type: 'out', // Sempre será saída para baixas
        description: form.ticket ? `Chamado: ${form.ticket}. ${form.observation}` : form.observation
      };

      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registrar baixa.');
      }

      setSuccess('Baixa registrada com sucesso!');
      setForm({ equipmentId: '', quantity: '', ticket: '', observation: '' });
    } catch (error) {
      console.error('Erro ao registrar baixa:', error);
      setError(error.message || 'Erro ao registrar baixa.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registrar Baixa no Estoque</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
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
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Chamado</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={form.ticket}
            onChange={(e) => setForm({ ...form, ticket: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observação</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            rows={4}
            value={form.observation}
            onChange={(e) => setForm({ ...form, observation: e.target.value })}
          ></textarea>
        </div>

        <button type="submit" className="btn-primary w-full">
          Registrar Baixa
        </button>
      </form>
    </div>
  );
}