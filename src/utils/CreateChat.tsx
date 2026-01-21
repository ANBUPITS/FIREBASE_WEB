
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { User } from "../components/User";

export const createChatIfNotExists = async (
  currentUserId: string,
  otherUser: User
) => {
  const chatId =
    currentUserId < otherUser.id
      ? `${currentUserId}_${otherUser.id}`
      : `${otherUser.id}_${currentUserId}`;

  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {

    const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
    const currentUserData = currentUserDoc.data();
    const currentUsername = `${currentUserData?.firstName || ""} ${currentUserData?.lastName || ""}`.trim();
    const otherUsername = `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim();

    const now = new Date();
    
    await setDoc(chatRef, {
      participants: [currentUserId, otherUser.id],
      participantInfo: {
        [currentUserId]: {
          lastRead: now.getTime(),
          unreadCount: 0,
          username: currentUsername,
        },
        [otherUser.id]: {
          lastRead: 0,
          unreadCount: 0, 
          username: otherUsername,
        },
      },
      lastMessage: null, 
      createdAt: now,
      updatedAt: now, 
    });
  }

  return chatId;
};