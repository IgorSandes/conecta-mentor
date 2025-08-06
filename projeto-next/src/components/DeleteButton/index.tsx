'use client';

import { useRouter } from 'next/navigation';
import { FaTrash } from 'react-icons/fa';

interface DeleteButtonProps {
  id: string;
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const router = useRouter()
  const handleDeletar = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao deletar.');
        return;
      }
      router.refresh()
      router.push('/home')
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleDeletar}
      className="flex items-center px-4 py-4 bg-red-400 text-white rounded-lg hover:bg-red-700 transition"
    >
      <FaTrash size={20}/>
    </button>
  );
}
