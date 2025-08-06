'use client';

import { FaPlus, FaCommentDots } from 'react-icons/fa';
import { useEffect, useState } from 'react';

type ProfileType = 'MENTOR' | 'MENTORADO';

type Profile = {
  id: string;
  type: ProfileType;
  profession: string;
  description: string;
  userName: string;
  userId: string;
};

type User = {
  id: string;
  name?: string;
  email: string;
  profiles: Omit<Profile, 'userName' | 'userId'>[];
};

interface UsersListProps {
  loggedUserId: string;
  loggedUserProfileId: string;
  loggedUserProfileType: ProfileType;
  loggedUserProfession: string; // <- Pegamos a profissão do perfil logado
}

type Favorite = {
  id: string;
  userName: string;
  profile: {
    id: string;
    type: ProfileType;
    profession: string;
    description: string;
  };
};

export default function UsersList({
  loggedUserId,
  loggedUserProfileId,
  loggedUserProfileType,
  loggedUserProfession,
}: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [addingFavoriteId, setAddingFavoriteId] = useState<string | null>(null);

  async function listUsers() {
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao buscar usuários.');
        return;
      }

      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      alert('Erro ao buscar usuários.');
    } finally {
      setLoading(false);
    }
  }

  async function listFavorites() {
    if (!loggedUserProfileId) return;

    try {
      const response = await fetch(
        `/api/favorites?userProfileId=${loggedUserProfileId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      const data = await response.json();

      if (response.ok) {
        setFavorites(data);
      } else {
        console.error('Erro ao buscar favoritos:', data.error);
      }
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    }
  }

  useEffect(() => {
    listUsers();
  }, []);

  useEffect(() => {
    listFavorites();
  }, [loggedUserProfileId]);

  const normalizedSearch = search.toLowerCase();

  const filteredProfiles: Profile[] = users.flatMap((user) =>
    user.profiles
      .filter((profile) => {
        // Não listar o próprio usuário
        if (user.id === loggedUserId) return false;

        // Listar apenas perfis do tipo oposto
        if (
          loggedUserProfileType === 'MENTOR' &&
          profile.type !== 'MENTORADO'
        )
          return false;
        if (
          loggedUserProfileType === 'MENTORADO' &&
          profile.type !== 'MENTOR'
        )
          return false;

        // Filtro por profissão (automático)
        if (profile.profession !== loggedUserProfession) return false;

        // Filtro de busca (texto)
        const name = user.name?.toLowerCase() || '';
        return (
          name.includes(normalizedSearch) ||
          profile.type.toLowerCase().includes(normalizedSearch) ||
          profile.profession.toLowerCase().includes(normalizedSearch) ||
          profile.description.toLowerCase().includes(normalizedSearch)
        );
      })
      .map((profile) => ({
        ...profile,
        userName: user.name || 'Sem nome',
        userId: user.id,
      }))
  );

  async function handleAddFavorite(favoriteId: string) {
    if (!loggedUserId || !loggedUserProfileId) {
      alert('Usuário não autenticado ou perfil não carregado.');
      return;
    }

    const jaFavoritado = favorites.some((fav) => fav.profile.id === favoriteId);
    if (jaFavoritado) {
      alert('Este perfil já foi favoritado.');
      return;
    }

    setAddingFavoriteId(favoriteId);
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: loggedUserId,
          userProfileId: loggedUserProfileId,
          favoriteId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao adicionar favorito.');
      } else {
        alert('Favorito adicionado com sucesso!');
        await listFavorites();
      }
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      alert('Erro ao adicionar favorito.');
    } finally {
      setAddingFavoriteId(null);
    }
  }

  function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  return (
    <section className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Lista de {loggedUserProfileType === 'MENTOR' ? 'Mentorados' : 'Mentores'} em
          <span className="text-blue-600 ml-1">
            {capitalize(loggedUserProfession)}
          </span>
        </h2>

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
        filteredProfiles.map((profile) => {
          const jaFavoritado = favorites.some(
            (fav) => fav.profile.id === profile.id
          );

          return (
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
                  disabled={addingFavoriteId === profile.id || jaFavoritado}
                >
                  <FaPlus />
                </button>
                <button title="Mensagem" className="hover:text-purple-600 transition">
                  <FaCommentDots />
                </button>
              </div>
            </div>
          );
        })}
    </section>
  );
}
