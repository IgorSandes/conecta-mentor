'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  getDocs,
  limit,
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
  onSelectChat?: (chatId: string, otherProfileId: string) => void;
}

export default function ChatsList({ loggedUserProfileId, onSelectChat }: ChatsListProps) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedUserProfileId) return;

    const chatsRef = collection(db, 'chats');

    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
      // Filtra chats onde loggedUserProfileId está em qualquer posição do ID
      const chatDocs = snapshot.docs.filter(doc => {
        const [p1, p2] = doc.id.split('_');
        return p1 === loggedUserProfileId || p2 === loggedUserProfileId;
      });

      const chatPromises = chatDocs.map(async (chatDoc) => {
        const chatId = chatDoc.id;
        const [p1, p2] = chatId.split('_');
        const otherProfileId = p1 === loggedUserProfileId ? p2 : p1;

        // Busca dados do outro perfil
        const profileDoc = await getDoc(doc(db, 'profiles', otherProfileId));
        const profileData = profileDoc.data() as
          | { userName?: string; photoUrl?: string; type?: ProfileType }
          | undefined;

        // Busca última mensagem
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const lastMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
        const lastMessageSnapshot = await getDocs(lastMessageQuery);

        if (lastMessageSnapshot.empty) return null;

        const lastMessageDoc = lastMessageSnapshot.docs[0];
        const lastMessageData = lastMessageDoc.data();

        // Exemplo simplificado: unreadCount = 0
        const unreadCount = 0;

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

      chatsData.sort((a, b) => {
        const aTime = a.lastMessageCreatedAt?.seconds || 0;
        const bTime = b.lastMessageCreatedAt?.seconds || 0;
        return bTime - aTime;
      });

      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loggedUserProfileId]);

  return (
    <section className="p-6 bg-white rounded-xl shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-6">Mensagens</h2>

      {loading && <p className="text-gray-500">Carregando chats...</p>}

      {!loading && chats.length === 0 && (
        <p className="text-gray-500">Nenhum chat encontrado.</p>
      )}

      {!loading &&
        chats.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => onSelectChat?.(chat.chatId, chat.otherProfileId)}
            className="flex items-center gap-4 p-3 border rounded mb-3 cursor-pointer hover:bg-gray-100"
            title={`${chat.otherUserName} - ${chat.otherProfileType}`}
          >
            <img
              src={chat.otherUserPhotoUrl || '/default-avatar.png'}
              alt={chat.otherUserName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-grow overflow-hidden">
              <p className="font-semibold truncate">{chat.otherUserName}</p>
              <p className="text-sm text-gray-500">{chat.otherProfileType}</p>
              <p className="text-xs text-gray-400 truncate max-w-xs">
                {chat.lastMessageText}
              </p>
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
