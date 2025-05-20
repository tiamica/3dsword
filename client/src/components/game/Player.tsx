import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../../lib/stores/useGameStore";
import Sword from "./Sword";
import { useSwordSwing } from "../../lib/hooks/useSwordSwing";
import ReadyPlayerMeAvatar from "./ReadyPlayerMeAvatar";

const Player = () => {
  const playerRef = useRef<THREE.Group>(null);
  const { isSwinging, startSwing } = useSwordSwing();
  const { playerPosition, setPlayerPosition, phase, playerAvatarUrl } = useGameStore();
  const [isMoving, setIsMoving] = useState(false);
  
  // Get keyboard controls state
  const [, getKeyboardControls] = useKeyboardControls();
  
  // Player movement speed
  const moveSpeed = 5;
  
  // Track the movement direction
  const [moveDirection] = useState(() => new THREE.Vector3());
  const [rotationY, setRotationY] = useState(0);
  
  // Handle player movement in the game loop
  useFrame((state, delta) => {
    if (!playerRef.current || phase !== "playing") return;
    
    const { forward, backward, leftward, rightward, swing } = getKeyboardControls();
    
    // Reset movement direction
    moveDirection.set(0, 0, 0);
    
    // Apply movement based on key presses
    if (forward) moveDirection.z -= 1;
    if (backward) moveDirection.z += 1;
    if (leftward) moveDirection.x -= 1;
    if (rightward) moveDirection.x += 1;
    
    // Check if player is moving (for animation state)
    const isCurrentlyMoving = moveDirection.length() > 0;
    if (isCurrentlyMoving !== isMoving) {
      setIsMoving(isCurrentlyMoving);
    }
    
    // Handle rotation based on movement direction
    if (isCurrentlyMoving) {
      // Calculate angle in radians for player rotation
      let targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      
      // Update rotation smoothly
      const rotationSpeed = 10 * delta;
      const angleDiff = targetRotation - rotationY;
      
      // Ensure we rotate the shortest way
      let normalizeDiff = angleDiff;
      while (normalizeDiff > Math.PI) normalizeDiff -= 2 * Math.PI;
      while (normalizeDiff < -Math.PI) normalizeDiff += 2 * Math.PI;
      
      setRotationY(rotationY + normalizeDiff * rotationSpeed);
      
      // Apply rotation to player model
      if (playerRef.current) {
        playerRef.current.rotation.y = rotationY;
      }
      
      // Normalize movement direction for consistent speed
      moveDirection.normalize();
    }
    
    // Apply movement speed and delta time
    moveDirection.multiplyScalar(moveSpeed * delta);
    
    // Update player position
    const newPosition = {
      x: playerPosition.x + moveDirection.x,
      y: playerPosition.y,
      z: playerPosition.z + moveDirection.z
    };
    
    // Limit player movement within boundaries
    newPosition.x = Math.max(-20, Math.min(20, newPosition.x));
    newPosition.z = Math.max(-20, Math.min(20, newPosition.z));
    
    // Update the position in the store and the 3D object
    setPlayerPosition(newPosition);
    playerRef.current.position.set(newPosition.x, newPosition.y, newPosition.z);
    
    // Handle sword swing
    if (swing && !isSwinging) {
      startSwing();
    }
  });
  
  // Default ReadyPlayerMe avatar URL if none is provided
  const defaultAvatarUrl = "https://models.readyplayer.me/65843dbeb966a506c88a5e56.glb";
  
  return (
    <group 
      ref={playerRef} 
      position={[playerPosition.x, playerPosition.y, playerPosition.z]}
    >
      {playerAvatarUrl || defaultAvatarUrl ? (
        // Use ReadyPlayerMe avatar 
        <ReadyPlayerMeAvatar 
          avatarUrl={playerAvatarUrl || defaultAvatarUrl} 
          position={[0, 0, 0]} 
          scale={[1, 1, 1]} 
          isMoving={isMoving}
          isAttacking={isSwinging}
        />
      ) : (
        // Fallback to default avatar model (should not happen)
        <>
          {/* Player body */}
          <mesh castShadow position={[0, 1, 0]}>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color="blue" />
          </mesh>
          
          {/* Player head */}
          <mesh castShadow position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="lightblue" />
          </mesh>
        </>
      )}
      
      {/* Only show separate sword when not using avatar (avatars have built-in animations) */}
      {!playerAvatarUrl && !defaultAvatarUrl && (
        <Sword isSwinging={isSwinging} />
      )}
    </group>
  );
};

export default Player;
