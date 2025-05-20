import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import Ground from "./Ground";
import Player from "./Player";
import { useGameStore } from "../../lib/stores/useGameStore";
import { useEnemySpawner } from "../../lib/hooks/useEnemySpawner";
import { useCollisionDetection } from "../../lib/hooks/useCollisionDetection";
import { useAudio } from "../../lib/stores/useAudio";

const GameScene = () => {
  const { phase, enemies, start, restart } = useGameStore();
  const { backgroundMusic, toggleMute, isMuted } = useAudio();
  const { spawnEnemies } = useEnemySpawner();
  const { checkCollisions } = useCollisionDetection();
  
  // Set up a reference to the scene
  const sceneRef = useRef<THREE.Group>(null);
  
  // Get the state of the forward key
  const forward = useKeyboardControls(state => state.forward);
  const backward = useKeyboardControls(state => state.backward);
  const leftward = useKeyboardControls(state => state.leftward);
  const rightward = useKeyboardControls(state => state.rightward);

  // Start the game and background music when the component mounts
  useEffect(() => {
    // Start the game
    if (phase === "ready") {
      start();
      console.log("Game started");
    }
    
    // Play background music
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
    
    return () => {
      // Stop the music when the component unmounts
      if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
      }
    };
  }, [backgroundMusic, isMuted, phase, start]);
  
  // Game loop
  useFrame((state, delta) => {
    if (phase !== "playing") return;
    
    // Spawn enemies
    spawnEnemies(delta);
    
    // Check for collisions
    checkCollisions();
    
    // Log control states for debugging
    if (forward || backward || leftward || rightward) {
      console.log(`Controls: forward=${forward}, backward=${backward}, leftward=${leftward}, rightward=${rightward}`);
    }
  });
  
  return (
    <group ref={sceneRef}>
      {/* Directional light for shadows */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Ambient light for overall scene brightness */}
      <ambientLight intensity={0.5} />
      
      {/* Ground */}
      <Ground />
      
      {/* Player */}
      <Player />
      
      {/* Render all enemies */}
      {enemies.map(enemy => (
        <mesh
          key={enemy.id}
          position={[enemy.position.x, enemy.position.y, enemy.position.z]}
          scale={[1, 2, 1]}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      ))}
    </group>
  );
};

export default GameScene;
