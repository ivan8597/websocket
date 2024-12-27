import React, { useEffect, useState } from "react";

const Chat = ({ socket, user, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: user,
        
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((prevlist) => [...prevlist, messageData]);
    }
  };

  const messages = async () => {
    const lucky = {
      message: currentMessage + ":" + "9",
    };
    await socket.emit("messages", lucky);
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((prevList) => [...prevList, data]);
    });
  }, [socket]);

  return (
    <div>
      <div className="chat-window">
        <div className="chat-header">
          <p>Live Chat</p>
        </div>
        <div className="chat-body">
          {messageList.map((lucky) => {
            return <h3>{lucky.message}</h3>;
          })}
        </div>
        <div className="chat-footer">
          <input
            type="text"
            placeholder="Hey..."
            onChange={(e) => {
              setCurrentMessage(e.target.value);
            }}
          />
          <button onClick={() => sendMessage()}>&#9658;</button>

          <button onClick={() => messages()}>&#9658;</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
