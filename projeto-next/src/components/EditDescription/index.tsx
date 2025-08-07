'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit } from 'react-icons/fa';

interface EditDescriptionProps {
  profileId: string;
  initialDescription: string;
}

export default function EditDescription({
  profileId,
  initialDescription,
}: EditDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [tempDescription, setTempDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSave = async () => {
    if (tempDescription.trim() === '') {
      alert('A descrição não pode estar vazia.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/profile/${profileId}/description`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: tempDescription }),
      });

      if (!res.ok) {
        throw new Error('Erro ao atualizar a descrição');
      }

      setDescription(tempDescription);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Falha ao salvar a descrição.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempDescription(description);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      {isEditing ? (
        <>
          <textarea
            className="w-full border rounded p-2 resize-none"
            rows={4}
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            disabled={loading}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Salvar
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between">
          <p className="whitespace-pre-wrap text-gray-700">
            {description || 'Nenhuma descrição cadastrada.'}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-600 hover:text-blue-600"
            title="Editar descrição"
          >
            <FaEdit className="text-5xl" />
          </button>
        </div>
      )}
    </div>
  );
}
