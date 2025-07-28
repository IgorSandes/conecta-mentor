"use client";

import { FaPlus, FaCommentDots } from "react-icons/fa";
import { useEffect, useState } from "react";

type Profile = {
  id: string;
  type: string;
  profession: string;
  description: string;
  userName: string;
};

type User = {
  id: string;
  name?: string;
  email: string;
  profiles: Omit<Profile, "userName">[];
};

interface UsersListProps {
  loggedUserId: string;
  loggedUserProfileId: string;
}

export default function UsersList({ loggedUserId, loggedUserProfileId }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addingFavoriteId, setAddingFavoriteId] = useState<string | null>(null);

  async function listUsers() {
    try {
      const response = await fetch("/api/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao buscar usuários.");
        return;
      }

      setUsers(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      alert("Erro ao buscar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    listUsers();
  }, []);

  const normalizedSearch = search.toLowerCase();

  const filteredProfiles: Profile[] = users.flatMap((user) =>
    user.profiles
      .filter((profile) => {
        const name = user.name?.toLowerCase() || ""; // Evita erro se name for undefined
        return (
          name.includes(normalizedSearch) ||
          profile.type.toLowerCase().includes(normalizedSearch) ||
          profile.profession.toLowerCase().includes(normalizedSearch) ||
          profile.description.toLowerCase().includes(normalizedSearch)
        );
      })
      .map((profile) => ({
        ...profile,
        userName: user.name || "Sem nome",
      }))
  );

  async function handleAddFavorite(favoriteId: string) {
    if (!loggedUserId || !loggedUserProfileId) {
      alert("Usuário não autenticado ou perfil não carregado.");
      return;
    }

    setAddingFavoriteId(favoriteId);
    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: loggedUserId,
          userProfileId: loggedUserProfileId,
          favoriteId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao adicionar favorito.");
      } else {
        alert("Favorito adicionado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
      alert("Erro ao adicionar favorito.");
    } finally {
      setAddingFavoriteId(null);
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Lista de Usuários</h2>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {loading && <p className="text-gray-600">Carregando...</p>}

      {!loading && filteredProfiles.length === 0 && (
        <p className="text-gray-600">Nenhum resultado encontrado.</p>
      )}

      {!loading &&
        filteredProfiles.map((profile) => (
          <div
            key={profile.id}
            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center mb-4 hover:bg-gray-50 transition"
          >
            <div>
              <strong className="text-gray-900">
                {profile.userName} - {profile.type}
              </strong>
              <p className="text-gray-600 text-sm">{profile.profession}</p>
              <div className="text-gray-500 text-sm">{profile.description}</div>
            </div>

            <div className="flex gap-3 text-gray-600">
              <button
                title="Adicionar"
                className="hover:text-blue-600 transition disabled:opacity-50"
                onClick={() => handleAddFavorite(profile.id)}
                disabled={addingFavoriteId === profile.id}
              >
                <FaPlus />
              </button>
              <button title="Mensagem" className="hover:text-purple-600 transition">
                <FaCommentDots />
              </button>
            </div>
          </div>
        ))}

      {!loading && users.length > 0 && (
        <div className="text-blue-600 hover:underline cursor-pointer text-sm text-right">
          Ver mais &gt;
        </div>
      )}
    </section>
  );
}
