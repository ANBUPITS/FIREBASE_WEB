import { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { User } from "./User";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import React from "react";

type Props = {
  selectedUser: User | null;
  chatId: string;              // 🔹 added
  currentUserId: string;
  showProfile: boolean;
  onBack: () => void;
};

const ChatSlider: React.FC<Props> = ({
  selectedUser,
  chatId,
  currentUserId,
  showProfile: _showProfile,
  onBack: _onBack,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [lastRead, setLastRead] = useState<number>(0);
  const unreadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedUser || !currentUserId || !chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const markAsRead = async () => {
      try {
        const now = Date.now();
        setLastRead(now);
        await updateDoc(doc(db, "chats", chatId), {
          [`participantInfo.${currentUserId}.lastRead`]: now,
          [`participantInfo.${currentUserId}.unreadCount`]: 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    markAsRead();

    return () => unsub();
  }, [selectedUser, currentUserId, chatId]);

  useEffect(() => {
    if (unreadRef.current) {
      unreadRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages]);

  return (
    <div className="chat-window">
      {selectedUser && <ChatHeader user={selectedUser} />}

      <div className="message-list">
        {messages.map((m, index) => {
          const isUnread =
            m.timestamp > lastRead && m.senderId !== currentUserId;
          const prevMsg = messages[index - 1];
          const prevWasUnread =
            prevMsg &&
            prevMsg.timestamp > lastRead &&
            prevMsg.senderId !== currentUserId;

          if (isUnread && !prevWasUnread) {
            return (
              <React.Fragment key={m.id}>
                <div className="unread-divider" ref={unreadRef}>
                  Unread Messages
                </div>
                <div
                  className={`message ${
                    m.senderId === currentUserId ? "me" : "other"
                  }`}
                >
                  {m.text}
                </div>
              </React.Fragment>
            );
          }

          return (
            <div
              key={m.id}
              className={`message ${
                m.senderId === currentUserId ? "me" : "other"
              }`}
            >
              {m.text}
            </div>
          );
        })}
      </div>

      {selectedUser && <MessageInput receiverId={selectedUser.id} />}
    </div>
  );
};

export default ChatSlider;
