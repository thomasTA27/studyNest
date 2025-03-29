
// import React, { useRef } from 'react';

// const RainSoundButton = () => {
//   const audioRef = useRef(null);

//   // Function to play rain sound
//   const playRainSound = () => {
//     console.log("Playing rain sound...");
//     if (audioRef.current) {
//       audioRef.current.play();  
//     }
//   };

//   return (
//     <div>
//       <button onClick={playRainSound} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
//         Play Rain Sound
//       </button>

//       <audio ref={audioRef} preload="auto">
//         <source src="/light-rain-109591.mp3" type="audio/mp3" />
//         Your browser does not support the audio element.
//       </audio>
//     </div>
//   );
// };

// export default RainSoundButton;







import React, { useRef, useState } from 'react';

const RainSoundButton = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to toggle rain sound
  const toggleRainSound = () => {
    if (isPlaying) {
      console.log("Stopping rain sound...");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <button 
        onClick={toggleRainSound} 
        className={`p-2 text-white rounded-lg ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        {isPlaying ? 'Stop Rain Sound' : 'Play Rain Sound'}
      </button>

      <audio ref={audioRef} preload="auto" loop>
        <source src="/light-rain-109591.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default RainSoundButton;
