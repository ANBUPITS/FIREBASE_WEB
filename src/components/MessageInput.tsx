import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import sendIcon from "../assets/sent.png";

type MessageInputProps = {
  receiverId: string;
};

const MessageInput: React.FC<MessageInputProps> = ({ receiverId }) => {
  const [message, setMessage] = useState("");
  const [senderId, setSenderId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setSenderId(user.uid);
    });
    return () => unsub();
  }, []);

  if (!senderId) return null;

  const chatId =
    senderId < receiverId
      ? `${senderId}_${receiverId}`
      : `${receiverId}_${senderId}`;

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const now = Date.now();

      // fetch sender and receiver info
      const [senderDoc, receiverDoc] = await Promise.all([
        getDoc(doc(db, "users", senderId)),
        getDoc(doc(db, "users", receiverId))
      ]);

      const senderData = senderDoc.data();
      const receiverData = receiverDoc.data();

      const senderUsername = `${senderData?.firstName || ""} ${senderData?.lastName || ""}`.trim();
      const receiverUsername = `${receiverData?.firstName || ""} ${receiverData?.lastName || ""}`.trim();


      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: message.trim(),
        senderId,
        receiverId,
        createdAt: new Date(),
        timestamp: now,
        readstatus: {
          [senderId]: true,      
          [receiverId]: false   
        }
      });

      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {

        await setDoc(chatRef, {
          participants: [senderId, receiverId],
          participantInfo: {
            [senderId]: {
              lastRead: now,
              unreadCount: 0,
              username: senderUsername,
            },
            [receiverId]: {
              lastRead: 0,
              unreadCount: 1,
              username: receiverUsername,
            },
          },
          lastMessage: {
            text: message.trim(),
            senderId,
            timestamp: now,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // update existing chat doc
        const chatData = chatSnap.data();

        await updateDoc(chatRef, {
          [`participantInfo.${receiverId}.unreadCount`]:
            (chatData?.participantInfo?.[receiverId]?.unreadCount || 0) + 1,
          [`participantInfo.${receiverId}.lastRead`]:
            chatData?.participantInfo?.[receiverId]?.lastRead || 0,
          lastMessage: {
            text: message.trim(),
            senderId,
            timestamp: now,
          },
          updatedAt: new Date(),
        });
      }

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="message-input">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button className="send-button" onClick={handleSend}>
        <img src={sendIcon} alt="Send" />
      </button>
    </div>
  );
};

export default MessageInput;
