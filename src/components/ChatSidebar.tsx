import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import type { User } from "./User";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import newIcon from "../assets/add.png";

type ChatSidebarProps = {
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  onProfileClick: () => void;
  onNewUserClick: () => void;
  onUsersLoaded?: (users: User[]) => void;
  tempUsers: User[];
};

type ChatDoc = {
  participants: string[];
  participantInfo: Record<
    string,
    { username: string; lastRead: number; unreadCount: number }
  >;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: number;
  };
};

const ChatSidebar = ({
  selectedUser,
  onSelectUser,
  onProfileClick,
  onNewUserClick,
  onUsersLoaded,
  tempUsers,
}: ChatSidebarProps) => {
  const [chats, setChats] = useState<
    { chatId: string; data: ChatDoc; user: User }[]
  >([]);
  const currentUserId = auth.currentUser!.uid;
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUserId),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = await Promise.all(
        snap.docs
          .filter((d) => {
            const data = d.data() as ChatDoc;
            return !!data.lastMessage;
          })
          .map(async (d) => {
            const data = d.data() as ChatDoc;
            const otherUserId = data.participants.find(
              (id) => id !== currentUserId
            )!;

            const userSnap = await fetchUser(otherUserId);

            return {
              chatId: d.id,
              data,
              user: userSnap,
            };
          })
      );

      setChats(list);

      if (onUsersLoaded) {
        onUsersLoaded(list.map((c) => c.user));
      }
    });

    return () => unsub();
  }, [currentUserId, onUsersLoaded]);

  const handleSelect = async (chatId: string, user: User) => {
    onSelectUser(user);
    await updateDoc(doc(db, "chats", chatId), {
      [`participantInfo.${currentUserId}.unreadCount`]: 0,
      [`participantInfo.${currentUserId}.lastRead`]: Date.now(),
    });
  };

  return (
    <div className="chat-sidebar">
      <h3>Chats</h3>

      <div className="new-user-btn" onClick={onNewUserClick}>
        <img src={newIcon} alt="New User" className="new-user-icon" />
        <span className="new-user-text">New User</span>
      </div>

      <div className="chat-users-list">
        {/* 🔹 PERMANENT CHATS */}
        {chats.map(({ chatId, data, user }) => {
          const unread =
            data.participantInfo[currentUserId]?.unreadCount || 0;

          return (
            <div
              key={chatId}
              className={`chat-user ${selectedUser?.id === user.id ? "active" : ""
                }`}
              onClick={() => handleSelect(chatId, user)}
            >
              <div className="user-row">
                <span>
                  {user.firstName} {user.lastName}
                </span>
                {unread > 0 && (
                  <span className="unread-badge">{unread}</span>
                )}
              </div>

              <div className="last-message">
                {data.lastMessage!.senderId === currentUserId && "You: "}
                {data.lastMessage!.text}
              </div>
            </div>
          );
        })}

        {/* 🔹 TEMP (SESSION-ONLY) USERS */}
        {tempUsers.map((user) => (
          <div
            key={`temp-${user.id}`}
            className={`chat-user temp ${selectedUser?.id === user.id ? "active" : ""
              }`}
            onClick={() => onSelectUser(user)}
          >
            <div className="user-row">
              <span>
                {user.firstName} {user.lastName}
              </span>
            </div>

            <div className="last-message temp">
              No messages yet
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="footer-item" onClick={onProfileClick}>
          <img src={profileIcon} alt="Profile" />
          <span>Profile</span>
        </div>

        <div
          className="footer-item"
          onClick={async () => {
            await signOut(auth);
            localStorage.removeItem("lastChatUserId");
            navigate("/");
          }}
        >
          <img src={logoutIcon} alt="Logout" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;

const fetchUser = async (uid: string): Promise<User> => {
  const snap = await import("firebase/firestore").then(({ getDoc, doc }) =>
    getDoc(doc(db, "users", uid))
  );
  return { id: snap.id, ...(snap.data() as Omit<User, "id">) };
};
