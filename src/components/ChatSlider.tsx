import { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { User } from "./User";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import React from "react";

type Props = {
  selectedUser: User | null;
  chatId: string;
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
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledToUnread = useRef(false);
  const markReadTimerRef = useRef<number | null>(null);
  const hasStartedTimer = useRef(false); // ✅ Track if timer already started

  // 🔹 Load last read timestamp on mount
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    const loadLastRead = async () => {
      const snap = await getDoc(doc(db, "chats", chatId));
      const data = snap.data();
      setLastRead(data?.participantInfo?.[currentUserId]?.lastRead ?? 0);
    };
    loadLastRead();
    
    // Reset timer tracking when chat changes
    hasStartedTimer.current = false;
  }, [chatId, currentUserId]);

  // 🔹 Listen to messages
  useEffect(() => {
    if (!selectedUser || !currentUserId || !chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [selectedUser, currentUserId, chatId]);

  // 🔹 Scroll to unread divider or bottom when messages load
  useEffect(() => {
    if (!messages.length || lastRead === 0) return;

    // Find if there are unread messages
    const hasUnread = messages.some((m) => {
      const ts = m.createdAt?.toMillis?.() ?? 0;
      return ts > lastRead && m.senderId !== currentUserId;
    });

    if (hasUnread && !hasScrolledToUnread.current && unreadRef.current) {
      // Scroll to unread divider
      hasScrolledToUnread.current = true;
      setTimeout(() => {
        unreadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else if (!hasUnread && bottomRef.current) {
      // No unread messages, scroll to bottom
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, lastRead, currentUserId]);

  // 🔹 Mark as read after 5 seconds of viewing - ONLY START ONCE
  useEffect(() => {
    const hasUnread = messages.some((m) => {
      const ts = m.createdAt?.toMillis?.() ?? 0;
      return ts > lastRead && m.senderId !== currentUserId;
    });

    // ✅ Only start timer if there are unread messages AND timer hasn't started yet
    if (!hasUnread || hasStartedTimer.current) return;

    hasStartedTimer.current = true; // ✅ Mark timer as started

    // Set timer to mark as read after 5 seconds
    markReadTimerRef.current = window.setTimeout(async () => {
      try {
        const now = Date.now();
        await updateDoc(doc(db, "chats", chatId), {
          [`participantInfo.${currentUserId}.lastRead`]: now,
          [`participantInfo.${currentUserId}.unreadCount`]: 0,
        });
        setLastRead(now);
        hasStartedTimer.current = false; // ✅ Reset for next batch of unread messages
      } catch (error) {
        console.error("Error marking as read:", error);
        hasStartedTimer.current = false;
      }
    }, 5000);

    return () => {
      if (markReadTimerRef.current !== null) {
        clearTimeout(markReadTimerRef.current);
      }
    };
  }, [messages.length, lastRead, chatId, currentUserId]); // ✅ Changed dependency to messages.length

  return (
    <div className="chat-window">
      {selectedUser && <ChatHeader user={selectedUser} />}

      <div className="message-list" ref={messageListRef}>
        {messages.map((m, index) => {
          const ts = m.createdAt?.toMillis?.() ?? 0;
          const isUnread = ts > lastRead && m.senderId !== currentUserId;
          const prevMsg = messages[index - 1];
          const prevTs = prevMsg?.createdAt?.toMillis?.() ?? 0;
          const prevWasUnread =
            prevMsg &&
            prevTs > lastRead &&
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
        <div ref={bottomRef} />
      </div>

      {selectedUser && <MessageInput receiverId={selectedUser.id} />}
    </div>
  );
};

export default ChatSlider;