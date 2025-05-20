import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import GameScene from "./components/game/GameScene";
import { GameUI } from "./components/ui/game-ui";

// Define control keys for the game
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "swing", keys: ["Space"] }
];

// Main App component
function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  
  // Load audio assets when the component mounts
  useEffect(() => {
    // Create audio elements for the game sounds
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    
    const hitSfx = new Audio("/sounds/hit.mp3");
    hitSfx.volume = 0.6;
    
    const successSfx = new Audio("/sounds/success.mp3");
    successSfx.volume = 0.5;
    
    // Set the audio elements in the store
    setBackgroundMusic(bgMusic);
    setHitSound(hitSfx);
    setSuccessSound(successSfx);
    
    console.log("Audio assets loaded");
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        <Canvas
          shadows
          camera={{
            position: [0, 5, 10],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "default"
          }}
        >
          <color attach="background" args={["#87CEEB"]} />
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
        </Canvas>
        <GameUI />
      </KeyboardControls>
    </div>
  );
}

export default App;
