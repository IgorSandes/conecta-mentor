'use client';

import { FaCommentDots, FaMinus } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

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

function getChatId(profileId1: string, profileId2: string) {
  return [profileId1, profileId2].sort().join('_');
}

async function markMessagesAsRead(chatId: string, loggedProfileId: string) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
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

export default function AddedUsersList({ loggedUserProfileId, loggedUserId }: AddedUsersListProps) {
  const [favorites, setFavorites] = useState<FavoriteWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [chatWithProfileId, setChatWithProfileId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  async function fetchFavorites() {
    if (!loggedUserProfileId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/favorites?userProfileId=${loggedUserProfileId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Erro ao buscar favoritos.');
        return;
      }
      setFavorites(data);
    } catch (err) {
      console.error('Erro ao buscar favoritos:', err);
      alert('Erro ao buscar favoritos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFavorites();
  }, [loggedUserProfileId]);

  async function handleRemoveFavorite(favoriteId: string) {
    if (!confirm('Tem certeza que deseja remover este favorito?')) return;

    setRemovingId(favoriteId);
    try {
      const response = await fetch(`/api/favorites`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: favoriteId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao remover favorito.');
      } else {
        alert('Favorito removido com sucesso!');
        await fetchFavorites();
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      alert('Erro ao remover favorito.');
    } finally {
      setRemovingId(null);
    }
  }

  // Escuta mensagens não lidas para cada favorito para mostrar badge
  const listenUnreadMessages = useCallback(() => {
    if (!loggedUserProfileId) return;

    const unsubList: (() => void)[] = [];

    favorites.forEach(({ profile }) => {
      if (!profile) return;
      const chatId = getChatId(loggedUserProfileId, profile.id);
      const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
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

      unsubList.push(unsubscribe);
    });

    return () => {
      unsubList.forEach((unsub) => unsub());
    };
  }, [favorites, loggedUserProfileId]);

  useEffect(() => {
    const unsub = listenUnreadMessages();
    return () => unsub && unsub();
  }, [listenUnreadMessages]);

  const normalizedSearch = search.toLowerCase();

  const filteredFavorites = favorites.filter(({ userName, profile }) => {
    return (
      (userName?.toLowerCase() || '').includes(normalizedSearch) ||
      (profile?.type?.toLowerCase() || '').includes(normalizedSearch) ||
      (profile?.profession?.toLowerCase() || '').includes(normalizedSearch) ||
      (profile?.description?.toLowerCase() || '').includes(normalizedSearch)
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
        filteredFavorites.map(({ id, profile, userName }) => {
          const unread = profile ? unreadCounts[profile.id] || 0 : 0;

          return (
            <div
              key={id}
              className="border border-gray-200 rounded-lg p-4 flex justify-between items-center mb-4 hover:bg-gray-50 transition"
            >
              <div>
                <strong className="text-gray-900">
                  {(userName || 'Usuário sem nome')}
                </strong>
                <p className="text-gray-600 text-sm">{profile?.profession || 'Profissão não informada'}</p>
                <div className="text-gray-500 text-sm">{profile?.description || 'Sem descrição.'}</div>
              </div>

              <div className="flex gap-3 text-gray-600 items-center relative">
                <button
                  title="Remover favorito"
                  className="hover:text-red-600 transition disabled:opacity-50"
                  onClick={() => handleRemoveFavorite(id)}
                  disabled={removingId === id}
                >
                  <FaMinus />
                </button>
                <button
                  title="Mensagem"
                  className="relative hover:text-purple-600 transition"
                  onClick={() => profile && setChatWithProfileId(profile.id)}
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
