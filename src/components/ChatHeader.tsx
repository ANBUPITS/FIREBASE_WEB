import type { User } from "./User";
import infoIcon from "../assets/user.png";
import { useState } from "react";

type ChatHeaderProps = {
  user: User;
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ user }) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="chat-header" style={{ position: "relative" }}>
      <span className="chat-header-username">
        {user.firstName} {user.lastName}
      </span>
      <button onClick={() => setShowDetails(!showDetails)} 
      style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }} 
      aria-expanded={showDetails} >
      <img
        src={infoIcon}
        alt="Info"
        style={{
          width: "24px",
          height: "24px",
          cursor: "pointer",
          marginLeft: "auto"
        }}
      />   
      </button> 
      {showDetails && (
        <div
          style={{
            position: "absolute",
            top: "60px", 
            right: "16px",
            background: "#ffffff",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 10,
            minWidth: "200px",
          }}
        >
          <p><strong>Name: </strong>{user.firstName} {user.lastName}</p>
          <p><strong>Phone: </strong>{user.phone}</p>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
