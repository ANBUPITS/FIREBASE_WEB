import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import type { User } from "./User";
import closeIcon from "../assets/cancel.png";

type UserListProps = {
  onSelectUser: (user: User) => void;
  excludeIds?: string[];
  onBack?: () => void;
};

const UserList = ({ onSelectUser, excludeIds = [], onBack }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const allUsers = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<User, "id">),
      }));

      const filtered = allUsers.filter(
        (u) => ![...(excludeIds || []), currentUserId].includes(u.id)
      );

      setUsers(filtered);
    };

    fetchUsers();
  }, [excludeIds, currentUserId]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Close user list"
            style={{
              background: "transparent",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            <img src={closeIcon} alt="close" />
          </button>
        )}
      </div>

      {users.map((u) => (
        <div
          key={u.id}
          className="user-row"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "6px",
          }}
        >
          <input
            type="checkbox"
            onChange={() => onSelectUser(u)}
            style={{ marginRight: "10px" }}
          />
          <span>
            {u.firstName} {u.lastName}
          </span>
        </div>
      ))}
    </div>
  );
};

export default UserList;
