import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

type Message = {
  id?: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: any;
  timestamp?: number;
};

type MessageListProps = {
  receiverId: string;
};

const MessageList: React.FC<MessageListProps> = ({ receiverId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [senderId, setSenderId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSenderId(user.uid);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!senderId || !receiverId) return;

    const chatId =
      senderId < receiverId
        ? `${senderId}_${receiverId}`
        : `${receiverId}_${senderId}`;   
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc") 
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            receiverId: data.receiverId,
            createdAt: data.createdAt,
            timestamp: data.timestamp
          } as Message;
        });
        
        setMessages(msgs);
      },
      (error) => {
        console.error("Snapshot error:", error);
      }
    );

    return () => unsubscribe();
  }, [senderId, receiverId]);

  if (!senderId) {
    return (
      <div className="message-list">
        <div style={{ textAlign: "center", color: "#999" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div style={{ textAlign: "center", color: "#999", marginTop: "20px" }}>
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((msg, index) => {
          const isSender = msg.senderId === senderId;
          return (
            <div
              key={msg.id || index}
              className={`message ${isSender ? "me" : "other"}`}
            >
              {msg.text || "(empty message)"}
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;