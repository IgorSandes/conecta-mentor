'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

type ProfileType = 'MENTOR' | 'MENTORADO';

type ChatPreview = {
  chatId: string;
  otherProfileId: string;
  otherUserName: string;
  otherUserPhotoUrl?: string;
  otherProfileType: ProfileType;
  lastMessageText: string;
  lastMessageCreatedAt: Timestamp | null;
  unreadCount: number;
};

interface ChatsListProps {
  loggedUserProfileId: string;
}

function getChatId(profileId1: string, profileId2: string) {
  return [profileId1, profileId2].sort().join('_');
}

export default function ChatsList({ loggedUserProfileId }: ChatsListProps) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedUserProfileId) return;

    const chatsRef = collection(db, 'chats');

    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
      // Filtra chats que contenham o perfil logado
      const chatPromises = snapshot.docs
        .filter((doc) => doc.id.includes(loggedUserProfileId))
        .map(async (docSnap) => {
          const chatId = docSnap.id;
          const profileIds = chatId.split('_');
          const otherProfileId = profileIds[0] === loggedUserProfileId ? profileIds[1] : profileIds[0];

          // Busca dados do perfil do outro usuário
          const profileDoc = await getDoc(doc(db, 'profiles', otherProfileId));
          const profileData = profileDoc.data() as
            | { userName?: string; photoUrl?: string; type?: ProfileType }
            | undefined;

          // Busca mensagens do chat ordenadas por criação
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const messagesQuery = query(messagesRef, orderBy('createdAt'));
          const messagesSnapshot = await getDocs(messagesQuery);
          if (messagesSnapshot.empty) return null;

          const messagesDocs = messagesSnapshot.docs;

          // Última mensagem
          const lastMessageDoc = messagesDocs[messagesDocs.length - 1];
          const lastMessageData = lastMessageDoc.data();

          // Contagem de mensagens não lidas
          const unreadCount = messagesDocs.reduce((acc, m) => {
            const readBy: string[] = m.data().readBy || [];
            if (!readBy.includes(loggedUserProfileId)) return acc + 1;
            return acc;
          }, 0);

          return {
            chatId,
            otherProfileId,
            otherUserName: profileData?.userName || 'Usuário sem nome',
            otherUserPhotoUrl: profileData?.photoUrl,
            otherProfileType: profileData?.type || 'MENTORADO',
            lastMessageText: lastMessageData.text || '',
            lastMessageCreatedAt: lastMessageData.createdAt || null,
            unreadCount,
          } as ChatPreview;
        });

      const chatsData = (await Promise.all(chatPromises)).filter(Boolean) as ChatPreview[];

      // Ordena chats pelo timestamp da última mensagem (mais recente primeiro)
      chatsData.sort((a, b) => {
        if (!a.lastMessageCreatedAt) return 1;
        if (!b.lastMessageCreatedAt) return -1;
        return b.lastMessageCreatedAt.seconds - a.lastMessageCreatedAt.seconds;
      });

      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loggedUserProfileId]);

  return (
    <section className="p-6 bg-white rounded-xl shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-6">Mensagens</h2>

      {loading && <p>Carregando chats...</p>}

      {!loading && chats.length === 0 && <p>Nenhum chat encontrado.</p>}

      {!loading &&
        chats.map((chat) => (
          <div
            key={chat.chatId}
            className="flex items-center gap-4 p-3 border rounded mb-3 cursor-pointer hover:bg-gray-100"
            title={`${chat.otherUserName} - ${chat.otherProfileType}`}
            onClick={() => {
              /* Aqui você pode disparar callback para abrir chat */
            }}
          >
            <img
              src={chat.otherUserPhotoUrl || '/default-avatar.png'}
              alt={chat.otherUserName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-grow">
              <p className="font-semibold">{chat.otherUserName}</p>
              <p className="text-sm text-gray-500">{chat.otherProfileType}</p>
              <p className="text-xs text-gray-400 truncate max-w-xs">{chat.lastMessageText}</p>
            </div>
            {chat.unreadCount > 0 && (
              <div className="bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {chat.unreadCount}
              </div>
            )}
          </div>
        ))}
    </section>
  );
}
