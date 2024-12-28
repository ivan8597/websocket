import "./components/App.css";
import { useState } from "react";
import io from "socket.io-client";
import Chat from "./components/Chat";
import VideoChat from "./components/VideoChat";

const socket = io.connect("http://localhost:3001");

function App() {
  const [user, setUser] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isVideoChatEnabled, setIsVideoChatEnabled] = useState(false);

  const joinRoom = () => {
    if (user !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  const toggleVideoChat = () => {
    setIsVideoChatEnabled((prev) => !prev);
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join chat</h3>
          <input
            type="text"
            placeholder="John..."
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <button onClick={toggleVideoChat}>
            {isVideoChatEnabled ? "Disable Video Chat" : "Enable Video Chat"}
          </button>
          {isVideoChatEnabled && <VideoChat socket={socket} user={user} room={room} />}
          <Chat socket={socket} user={user} room={room} />
        </div>
      )}
    </div>
  );
}

export default App;
