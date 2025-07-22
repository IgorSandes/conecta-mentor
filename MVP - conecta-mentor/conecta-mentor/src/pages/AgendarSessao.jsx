export function AgendarSessao() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Agendar Sessão</h2>
      <input className="w-full mb-3 p-2 border rounded" type="datetime-local" />
      <button className="bg-blue-600 text-white p-2 rounded">Confirmar Agendamento</button>
    </div>
  );
}
