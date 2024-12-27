import React, { useEffect, useRef } from "react";

const VideoChat = ({ socket, user, room }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    const getUserMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerRef.current = new RTCPeerConnection();
      stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));

      peerRef.current.onicecandidate = event => {
        if (event.candidate) {
          socket.emit("signal", { candidate: event.candidate, room });
        }
      };

      peerRef.current.ontrack = event => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
    };

    getUserMedia();

    socket.on("signal", async (data) => {
      if (data.offer) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit("signal", { answer, room });
      } else if (data.answer) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } else if (data.candidate) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      socket.off("signal");
    };
  }, [socket,user, room]);

  return (
    <div>
      <h2>Video Chat</h2>
      <video ref={localVideoRef} autoPlay muted style={{ width: '300px', height: '200px' }} />
      <video ref={remoteVideoRef} autoPlay style={{ width: '300px', height: '200px' }} />
    </div>
  );
};

export default VideoChat;
