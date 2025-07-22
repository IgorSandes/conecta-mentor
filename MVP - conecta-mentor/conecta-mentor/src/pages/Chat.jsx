export function Chat() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      <div className="border h-64 mb-4 p-2 overflow-y-auto bg-white rounded">
        <p><strong>Mentor:</strong> Olá, como posso ajudar?</p>
        <p><strong>Você:</strong> Quero dicas para entrevistas</p>
      </div>
      <input
        className="w-full p-2 border rounded"
        placeholder="Digite uma mensagem..."
      />
    </div>
  );
}
