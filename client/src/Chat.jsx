import React, { useEffect, useState } from "react";
import "./App.css"; // Импортируйте файл стилей

const Chat = ({ socket, user, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false); // Состояние для режима
  const [editIndex, setEditIndex] = useState(-1); // Индекс редактируемого сообщения

  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        room,
        author: user,
        message: currentMessage,
        time: new Date().toLocaleTimeString(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((prevList) => [...prevList, messageData]);
      setCurrentMessage("");
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    recorder.ondataavailable = async (event) => {
      const audioBlob = event.data;
      const audioUrl = URL.createObjectURL(audioBlob);
      const messageData = {
        room,
        author: user,
        message: audioUrl,
        time: new Date().toLocaleTimeString(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((prevList) => [...prevList, messageData]);
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const deleteMessage = (index) => {
    setMessageList((prevList) => prevList.filter((_, i) => i !== index));
  };

  const editMessage = (index) => {
    const messageToEdit = messageList[index];
    setCurrentMessage(messageToEdit.message);
    setEditIndex(index);
  };

  const updateMessage = async () => {
    if (currentMessage.trim() !== "" && editIndex >= 0) {
      const updatedMessageData = {
        ...messageList[editIndex],
        message: currentMessage,
      };
      setMessageList((prevList) =>
        prevList.map((msg, i) => (i === editIndex ? updatedMessageData : msg))
      );
      await socket.emit("send_message", updatedMessageData);
      setCurrentMessage("");
      setEditIndex(-1);
    }
  };

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      setMessageList((prevList) => {
        if (
          !prevList.find(
            (msg) => msg.time === data.time && msg.message === data.message
          )
        ) {
          return [...prevList, data];
        }
        return prevList;
      });
    };

    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, [socket]);

  return (
    <div>
      <div className="chat-window">
        <div className="chat-header">
          <p>Live Chat</p>
          <button onClick={() => setIsVoiceMode((prev) => !prev)}>
            {isVoiceMode ? "Switch to Text Mode" : "Switch to Voice Mode"}
          </button>
        </div>
        <div className="chat-body">
          {messageList.map((msg, index) => (
            <div key={index} className="message-container">
              <h3>
                <span style={{ flexGrow: 1 }}>
                  {msg.author}:
                  {msg.message.includes("blob") ? (
                    <audio class="track" controls src={msg.message} />
                  ) : ( <span className="msg">
                    {msg.message}</span>
                  )}
                  (<span className="time">{msg.time}</span>)
                </span>
                <div style={{ display: "flex", gap: "10px" }}>
                  {!msg.message.includes("blob") ? (
                    <button
                      className="delete-button"
                      onClick={() => deleteMessage(index)}
                    >
                      X
                    </button>
                  ) : (
                    <button
                      className="delete-button9"
                      onClick={() => deleteMessage(index)}
                    >
                      X
                    </button>
                  )}
                  {!msg.message.includes("blob") && (
                    <button
                      className="edit-button"
                      onClick={() => editMessage(index)}
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </h3>
            </div>
          ))}
        </div>
        <div className="chat-footer">
          {isVoiceMode ? (
            <>
              <button onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? "Stop Recording" : "Record Voice Message"}
                &#9658;
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Hey..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                className="messages"
              />
              <button onClick={editIndex >= 0 ? updateMessage : sendMessage}>
                {editIndex >= 0 ? "Update" : "Send"}
              </button>
              <button onClick={isRecording ? stopRecording : startRecording}>
                &#9658;
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
