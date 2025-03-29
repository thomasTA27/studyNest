

import React, { useEffect, useState, useRef } from "react";
import Peer from "peerjs";

const VideoChat = () => {

  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const myStreamRef = useRef(); // Store user's media stream

  // useEffect(() => {
  //   const newPeer = new Peer(); // Creates a new PeerJS instance
  //   setPeer(newPeer);

  //   newPeer.on("open", (id) => {
  //     setPeerId(id);
  //   });

  //   newPeer.on("call", (call) => {
  //     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
  //       myVideoRef.current.srcObject = stream;
  //       call.answer(stream);
  //       call.on("stream", (remoteStream) => {
  //         remoteVideoRef.current.srcObject = remoteStream;
  //       });
  //     });
  //   });

  //   return () => newPeer.destroy();
  // }, []);

  // const callUser = () => {
  //   navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
  //     myVideoRef.current.srcObject = stream;
  //     const call = peer.call(remotePeerId, stream);
  //     call.on("stream", (remoteStream) => {
  //       remoteVideoRef.current.srcObject = remoteStream;
  //     });
  //   });
  // };

  // const toggleMute = () => {
  //   if (myStreamRef.current) {
  //     myStreamRef.current.getAudioTracks()[0].enabled = isMuted; // Toggle audio track
  //     setIsMuted(!isMuted);
  //   }
  // };
  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);
  
    newPeer.on("open", (id) => {
      setPeerId(id);
    });
  
    newPeer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        myStreamRef.current = stream; // Store stream
        myVideoRef.current.srcObject = stream;
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });
    });
  
    return () => newPeer.destroy();
  }, []);
  
  const callUser = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      myStreamRef.current = stream; // Store stream
      myVideoRef.current.srcObject = stream;
      const call = peer.call(remotePeerId, stream);
      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
    });
  };
  
  const toggleMute = () => {
    if (myStreamRef.current) {
      const audioTrack = myStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleRemoteMute = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isRemoteMuted;
      setIsRemoteMuted(!isRemoteMuted);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">Webcam Room</h2>
      <p>Your ID: {peerId}
      <button
    onClick={() => {
      navigator.clipboard.writeText(peerId);
      alert("Copied to clipboard!");
    }}
    className="p-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
  >
    📋 Copy
  </button>

      </p>

      <video ref={myVideoRef} autoPlay playsInline className="w-full rounded-lg shadow-md" />
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-lg shadow-md" />

      <input
        type="text"
        value={remotePeerId}
        onChange={(e) => setRemotePeerId(e.target.value)}
        placeholder="Enter Room Code"
        className="w-full p-2 border rounded-lg"
      />

      <button onClick={callUser} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        Join Room
      </button>

      <button onClick={toggleMute} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          {isMuted ? "Unmute Yourself" : "Mute Yourself"}
        </button>


        <button onClick={toggleRemoteMute} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          {isRemoteMuted ? "Unmute Remote" : "Mute Remote"}
        </button>

    </div>
  );
};

export default VideoChat;






//////////1





