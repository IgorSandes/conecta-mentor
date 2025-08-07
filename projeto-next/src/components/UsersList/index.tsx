'use client';

import { FaPlus, FaCommentDots } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';

import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../lib/firebase'; // ajuste o caminho conforme seu projeto

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
  loggedUserProfession: string;
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

function getChatId(profileId1: string, profileId2: string) {
  return [profileId1, profileId2].sort().join('_');
}

async function markMessagesAsRead(chatId: string, loggedProfileId: string) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');

  // Pega todas mensagens do chat
  const snapshot = await getDocs(messagesRef);

  const batchUpdates = snapshot.docs
    .filter((docSnap) => {
      const data = docSnap.data();
      const readBy: string[] = data.readBy || [];
      return !readBy.includes(loggedProfileId);
    })
    .map((docSnap) =>
      updateDoc(doc(db, 'chats', chatId, 'messages', docSnap.id), {
        readBy: arrayUnion(loggedProfileId),
      })
    );

  await Promise.all(batchUpdates);
}

function Chat({
  loggedProfileId,
  otherProfileId,
  onClose,
}: {
  loggedProfileId: string;
  otherProfileId: string;
  onClose: () => void;
}) {
  const chatId = getChatId(loggedProfileId, otherProfileId);
  const [messages, setMessages] = useState<
    { id: string; text: string; senderProfileId: string; createdAt: any }[]
  >([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text || '',
          senderProfileId: data.senderProfileId || '',
          createdAt: data.createdAt || null,
        };
      });
      setMessages(msgs);

      // Marca mensagens como lidas
      markMessagesAsRead(chatId, loggedProfileId).catch(console.error);
    });

    return () => unsubscribe();
  }, [chatId, loggedProfileId]);

  async function sendMessage() {
    if (!input.trim()) return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: input.trim(),
      senderProfileId: loggedProfileId,
      createdAt: Timestamp.now(),
      readBy: [], // ninguém leu ainda
    });

    setInput('');
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-indigo-100 bg-opacity-90 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Chat</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-bold"
            aria-label="Fechar chat"
          >
            ✕
          </button>
        </div>

        <div className="flex-grow overflow-y-auto border p-2 mb-4 rounded">
          {messages.length === 0 && (
            <p className="text-gray-500 text-sm">Nenhuma mensagem ainda.</p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 flex flex-col ${msg.senderProfileId === loggedProfileId ? 'items-end' : 'items-start'
                }`}
            >
              {/* Nome ou descrição do remetente */}
              <span className="text-xs text-gray-600 mb-1">
                {msg.senderProfileId === loggedProfileId ? 'Você (Mentor)' : 'Mentorado'}
              </span>

              {/* Caixa da mensagem */}
              <div
                className={`p-2 rounded max-w-[80%] ${msg.senderProfileId === loggedProfileId
                    ? 'bg-blue-300 text-right'
                    : 'bg-gray-300 text-left'
                  }`}
              >
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow border border-gray-300 rounded px-3 py-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
            disabled={!input.trim()}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [chatWithProfileId, setChatWithProfileId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

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

  // Função para escutar mensagens não lidas por perfil e atualizar contador
  const listenUnreadMessages = useCallback(() => {
    if (!loggedUserProfileId) return;

    // Para cada perfil da lista, vamos ouvir as mensagens
    // Na prática, vamos ouvir as mensagens onde loggedUserProfileId não está em readBy

    // Isso é custoso, então vamos simplificar: vamos escutar todos chats onde loggedUserProfileId participa

    // Aqui vamos escutar mensagens de todos chats que envolvem o perfil logado e atualizar contador para cada outro perfil

    const unsubscribeList: (() => void)[] = [];

    users.forEach((user) => {
      user.profiles.forEach((profile) => {
        // Ignorar próprio perfil e só perfis opostos
        if (profile.id === loggedUserProfileId) return;
        if (
          loggedUserProfileType === 'MENTOR' &&
          profile.type !== 'MENTORADO'
        )
          return;
        if (
          loggedUserProfileType === 'MENTORADO' &&
          profile.type !== 'MENTOR'
        )
          return;

        if (profile.profession !== loggedUserProfession) return;

        const chatId = getChatId(loggedUserProfileId, profile.id);
        const q = query(
          collection(db, 'chats', chatId, 'messages'),
          orderBy('createdAt')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          // Contar mensagens que não contém loggedUserProfileId em readBy
          const unreadCount = snapshot.docs.reduce((count, docSnap) => {
            const data = docSnap.data();
            const readBy: string[] = data.readBy || [];
            if (!readBy.includes(loggedUserProfileId)) return count + 1;
            return count;
          }, 0);

          setUnreadCounts((prev) => ({
            ...prev,
            [profile.id]: unreadCount,
          }));
        });

        unsubscribeList.push(unsubscribe);
      });
    });

    return () => {
      unsubscribeList.forEach((unsub) => unsub());
    };
  }, [loggedUserProfileId, loggedUserProfileType, loggedUserProfession, users]);

  useEffect(() => {
    listUsers();
  }, []);

  useEffect(() => {
    listFavorites();
  }, [loggedUserProfileId]);

  useEffect(() => {
    const unsub = listenUnreadMessages();
    return () => unsub && unsub();
  }, [listenUnreadMessages]);

  const normalizedSearch = search.toLowerCase();

  const filteredProfiles: Profile[] = users.flatMap((user) =>
    user.profiles
      .filter((profile) => {
        if (user.id === loggedUserId) return false;
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

        if (profile.profession !== loggedUserProfession) return false;

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
    <section className="bg-white rounded-xl shadow-md p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Lista de {loggedUserProfileType === 'MENTOR' ? 'Mentorados' : 'Mentores'} em
          <span className="text-blue-600 ml-1">{capitalize(loggedUserProfession)}</span>
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

          const unread = unreadCounts[profile.id] || 0;

          return (
            <div
              key={profile.id}
              className="border border-gray-200 rounded-lg p-4 flex justify-between items-center mb-4 hover:bg-gray-50 transition"
            >
              <div>
                <strong className="text-gray-900">
                  {profile.userName}
                </strong>
                <p className="text-gray-600 text-sm">{profile.profession}</p>
                <div className="text-gray-500 text-sm">{profile.description}</div>
              </div>

              <div className="flex gap-3 text-gray-600 items-center">
                <button
                  title="Adicionar"
                  className="hover:text-blue-600 transition disabled:opacity-50"
                  onClick={() => handleAddFavorite(profile.id)}
                  disabled={addingFavoriteId === profile.id || jaFavoritado}
                >
                  <FaPlus />
                </button>

                <button
                  title="Mensagem"
                  className="relative hover:text-purple-600 transition"
                  onClick={() => setChatWithProfileId(profile.id)}
                >
                  <FaCommentDots />
                  {unread > 0 && (
                    <span className="absolute -top-3 -right-4 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}

      {chatWithProfileId && (
        <Chat
          loggedProfileId={loggedUserProfileId}
          otherProfileId={chatWithProfileId}
          onClose={() => setChatWithProfileId(null)}
        />
      )}
    </section>
  );
}
