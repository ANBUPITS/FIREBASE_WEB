import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import profileIcon from "../assets/profile.png";
import backIcon from "../assets/back.png";

type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type UserProfileProps = {
  onBack: () => void;
};

const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const fetchUser = async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          setUser(snap.data() as UserData);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    fetchUser();
  }, [uid]);

  if (!user) {
    return <div className="profile-box">Loading profile...</div>;
  }

  return (
    <div className="profile-box">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}>
          <img src={backIcon} alt="BackButton" />
        </button>
        <div className="profile-user-row">
          <img src={profileIcon} alt="Avatar" className="profile-avatar" onClick={onBack} />
          <div className="profile-username">
            {user.firstName} {user.lastName}
          </div>
        </div>

      </div>

      <div className="profile-field">
        <div className="profile-label">Email</div>
        <div className="profile-value">{user.email || "Not provided"}</div>
      </div>

      <div className="profile-field">
        <div className="profile-label">Phone</div>
        <div className="profile-value">{user.phone || "Not provided"}</div>
      </div>
    </div>
  );
};

export default UserProfile;
