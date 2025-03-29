// import React, { useState } from 'react';

// const MyWidget = () => {
//   const [text, setText] = useState('Hello, World!');

//   const changeText = () => setText('Text has been changed!');

//   return (
//     <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg">
//       <div className="text-center space-y-4">
//         <h2 className="text-xl font-bold text-gray-800">test component</h2>

//         <div className="text-2xl font-bold text-blue-600">
//           {text}
//         </div>

//         <div className="flex justify-center">
//           <button
//             onClick={changeText}
//             className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
//           >
//             Change Text
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyWidget;





// import React, { useState, useRef } from "react";

// const CameraWidget = () => {
//   const [cameraOn, setCameraOn] = useState(false);
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       videoRef.current.srcObject = stream;
//       streamRef.current = stream; // Store the stream so we can stop it later
//       setCameraOn(true);
//     } catch (error) {
//       console.error("Error accessing camera:", error);
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     setCameraOn(false);
//   };

//   return (
//     <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4">
//       <h2 className="text-xl font-bold text-gray-800 text-center">Camera Component</h2>
      
//       <div className="flex justify-center">
//         {!cameraOn ? (
//           <button
//             onClick={startCamera}
//             className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//           >
//             Turn On Camera
//           </button>
//         ) : (
//           <button
//             onClick={stopCamera}
//             className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//           >
//             Turn Off Camera
//           </button>
//         )}
//       </div>

//       {cameraOn && (
//         <div className="mt-4">
//           <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg shadow-md" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default CameraWidget;


// import React from "react";
// import Webcam from "react-webcam";

// // const WebcamComponent = () => <Webcam />;

// const videoConstraints = {
//   width: 1280,
//   height: 720,
//   facingMode: "user"
// };

// const WebcamCapture = () => (
//   <Webcam
//     audio={false}
//     height={320}
//     screenshotFormat="image/jpeg"
//     width={200}
//     videoConstraints={videoConstraints}
// >

//   </Webcam>
// );


// export default WebcamCapture;



import React, { useEffect, useState, useRef } from "react";
import Peer from "peerjs";

const VideoChat = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const myVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    const newPeer = new Peer(); // Creates a new PeerJS instance
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      setPeerId(id);
    });

    newPeer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
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
      myVideoRef.current.srcObject = stream;
      const call = peer.call(remotePeerId, stream);
      call.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
    });
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">Webcam Room</h2>
      <p>Your ID: {peerId}</p>

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
    </div>
  );
};

export default VideoChat;