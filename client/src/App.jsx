import "./App.css";
import { useState } from "react";
import io from "socket.io-client";
import Chat from "./Chat";
import VideoChat from "./VideoChat";

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
      setIsVideoChatEnabled(true); // Включить видеочат, если необходимо
    }
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
          {isVideoChatEnabled && <VideoChat socket={socket} user={user} room={room} />}
          <Chat socket={socket} user={user} room={room} />
        </div>
      )}
    </div>
  );
}

export default App;