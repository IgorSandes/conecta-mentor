"use client";

import { FaCommentDots, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";

type Profile = {
  id: string;
  type: string;
  profession: string;
  description: string;
  userName?: string;
};

type FavoriteWithUser = {
  id: string;
  userName?: string;
  profile?: Profile;
};

interface AddedUsersListProps {
  loggedUserProfileId: string;
  loggedUserId: string;
}

export default function AddedUsersList({ loggedUserProfileId, loggedUserId }: AddedUsersListProps) {
  const [favorites, setFavorites] = useState<FavoriteWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function fetchFavorites() {
    if (!loggedUserProfileId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/favorites?userProfileId=${loggedUserProfileId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Erro ao buscar favoritos.");
        return;
      }
      setFavorites(data);
    } catch (err) {
      console.error("Erro ao buscar favoritos:", err);
      alert("Erro ao buscar favoritos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFavorites();
  }, [loggedUserProfileId]);

  async function handleRemoveFavorite(favoriteId: string) {
    if (!confirm("Tem certeza que deseja remover este favorito?")) return;

    setRemovingId(favoriteId);
    try {
      const response = await fetch(`/api/favorites`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: favoriteId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao remover favorito.");
      } else {
        alert("Favorito removido com sucesso!");
        // Atualiza a lista após remoção
        await fetchFavorites();
      }
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      alert("Erro ao remover favorito.");
    } finally {
      setRemovingId(null);
    }
  }

  const normalizedSearch = search.toLowerCase();

  const filteredFavorites = favorites.filter(({ userName, profile }) => {
    return (
      (userName?.toLowerCase() || "").includes(normalizedSearch) ||
      (profile?.type?.toLowerCase() || "").includes(normalizedSearch) ||
      (profile?.profession?.toLowerCase() || "").includes(normalizedSearch) ||
      (profile?.description?.toLowerCase() || "").includes(normalizedSearch)
    );
  });

  return (
    <section className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Favoritos</h2>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {loading && <p className="text-gray-600">Carregando...</p>}

      {!loading && filteredFavorites.length === 0 && (
        <p className="text-gray-600">Nenhum favorito encontrado.</p>
      )}

      {!loading &&
        filteredFavorites.map(({ id, profile, userName }) => (
          <div
            key={id}
            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center mb-4 hover:bg-gray-50 transition"
          >
            <div>
              <strong className="text-gray-900">
                {(userName || "Usuário sem nome")} - {(profile?.type || "Tipo não informado")}
              </strong>
              <p className="text-gray-600 text-sm">{profile?.profession || "Profissão não informada"}</p>
              <div className="text-gray-500 text-sm">{profile?.description || "Sem descrição."}</div>
            </div>

            <div className="flex gap-3 text-gray-600">
              <button title="Mensagem" className="hover:text-purple-600 transition">
                <FaCommentDots />
              </button>

              <button
                title="Remover favorito"
                className="hover:text-red-600 transition disabled:opacity-50"
                onClick={() => handleRemoveFavorite(id)}
                disabled={removingId === id}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
    </section>
  );
}
