import { useEffect, useState, useRef } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatSlider from "../components/ChatSlider";
import UserList from "../components/UserList";
import type { User } from "../components/User";
import "./Chat.css";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import UserProfile from "../components/UserProfile";

const MIN_WIDTH = 240;
const MAX_WIDTH = 480;

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [showProfile, setShowProfile] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const hasAutoSelected = useRef(false);


  const [tempSidebarUsers, setTempSidebarUsers] = useState<User[]>([]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    const restoreLastChat = async () => {
      const lastChatUserId = localStorage.getItem("lastChatUserId");
      if (!lastChatUserId) return;

      try {
        const userDoc = await getDoc(doc(db, "users", lastChatUserId));
        if (userDoc.exists()) {
          setSelectedUser({
            id: userDoc.id,
            ...(userDoc.data() as Omit<User, "id">),
          });
        }
      } catch (err) {
        console.error("Failed to restore last chat", err);
      }
    };
    restoreLastChat();
  }, []);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [existingChatUserIds, setExistingChatUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchChatPartners = async () => {
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUser.uid)
      );

      const snap = await getDocs(q);
      const ids = new Set<string>();

      snap.docs.forEach((docSnap) => {
        const data = docSnap.data();


        if (!data.lastMessage) return;

        data.participants.forEach((id: string) => {
          if (id !== currentUser.uid) ids.add(id);
        });
      });

      setExistingChatUserIds(Array.from(ids));
    };

    fetchChatPartners();
  }, [currentUser?.uid]);

  return (
    <div className="chat-container">
      <div className="chat-sidebar-wrapper">
        <ChatSidebar
          selectedUser={selectedUser}
          tempUsers={tempSidebarUsers} 
          onSelectUser={(user) => {
            setSelectedUser(user);
            setShowUserList(false);


            setTempSidebarUsers((prev) => {
              if (prev.find((u) => u.id === user.id)) return prev;
              return [...prev, user];
            });

            localStorage.setItem("lastChatUserId", user.id);
          }}
          onProfileClick={() => setShowProfile(true)}
          onNewUserClick={() => setShowUserList(true)}
          onUsersLoaded={(users: User[]) => {
            if (!currentUser) return;
            const otherUsers = users.filter(
              (u) => u.id !== currentUser.uid
            );

            if (
              !hasAutoSelected.current &&
              !selectedUser &&
              otherUsers.length > 0 &&
              !localStorage.getItem("lastChatUserId")
            ) {
              setSelectedUser(otherUsers[0]);
              localStorage.setItem("lastChatUserId", otherUsers[0].id);
              hasAutoSelected.current = true;
            }
          }}
        />

        <div
          className="sidebar-resize-handle"
          onMouseDown={startResize}
        />
      </div>

      <div className="chat-slider-wrapper">
        {showProfile ? (
          <div className="profile-wrapper">
            <UserProfile onBack={() => setShowProfile(false)} />
          </div>
        ) : (
          <ChatSlider
            selectedUser={selectedUser}
            currentUserId={currentUser?.uid || ""}
            showProfile={showProfile}
            onBack={() => setShowProfile(false)}
          />
        )}

        {showUserList && (
          <div className="popup-overlay">
            <div className="popup-box">
              <UserList
                excludeIds={[
                  currentUser?.uid || "",
                  selectedUser?.id || "",
                  ...existingChatUserIds, 
                ]}
                onSelectUser={(user) => {
                  setSelectedUser(user);
                  setShowUserList(false);


                  setTempSidebarUsers((prev) => {
                    if (prev.find((u) => u.id === user.id)) return prev;
                    return [...prev, user];
                  });

                  localStorage.setItem("lastChatUserId", user.id);
                }}
                onBack={() => setShowUserList(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
