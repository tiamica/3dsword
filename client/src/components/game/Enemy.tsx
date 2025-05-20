import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../lib/stores/useGameStore";
import ReadyPlayerMeAvatar from "./ReadyPlayerMeAvatar";
import { ENEMY_AVATAR_URLS, ANIMATIONS } from "../../lib/constants";

interface EnemyProps {
  id: string;
  position: { x: number; y: number; z: number };
}

const Enemy = ({ id, position }: EnemyProps) => {
  const enemyRef = useRef<THREE.Group>(null);
  const { playerPosition, removeEnemy, enemies, phase } = useGameStore();
  const [isMoving, setIsMoving] = useState(false);
  const [avatarUrl] = useState(() => {
    // Randomly select one of the enemy avatar URLs
    const randomIndex = Math.floor(Math.random() * ENEMY_AVATAR_URLS.length);
    return ENEMY_AVATAR_URLS[randomIndex];
  });
  
  // Enemy movement speed
  const speed = 1.5;
  
  // Enemy movement in the game loop
  useFrame((state, delta) => {
    if (!enemyRef.current || phase !== "playing") return;
    
    // Calculate direction to player
    const direction = new THREE.Vector3(
      playerPosition.x - enemyRef.current.position.x,
      0,
      playerPosition.z - enemyRef.current.position.z
    );
    
    // Check if the enemy is moving (for animation state)
    const isCurrentlyMoving = direction.length() > 0.1;
    if (isCurrentlyMoving !== isMoving) {
      setIsMoving(isCurrentlyMoving);
    }
    
    // Normalize and apply speed
    if (isCurrentlyMoving) {
      direction.normalize();
      direction.multiplyScalar(speed * delta);
      
      // Move enemy towards player
      enemyRef.current.position.x += direction.x;
      enemyRef.current.position.z += direction.z;
      
      // Update position in the store
      const enemy = enemies.find(e => e.id === id);
      if (enemy) {
        enemy.position.x = enemyRef.current.position.x;
        enemy.position.z = enemyRef.current.position.z;
      }
      
      // Make enemy face towards player
      enemyRef.current.lookAt(
        new THREE.Vector3(playerPosition.x, enemyRef.current.position.y, playerPosition.z)
      );
    }
    
    // Check if enemy has reached the player
    const distanceToPlayer = new THREE.Vector3(
      playerPosition.x - enemyRef.current.position.x,
      0,
      playerPosition.z - enemyRef.current.position.z
    ).length();
    
    if (distanceToPlayer < 1) {
      // Enemy has reached the player - game over
      useGameStore.getState().end();
    }
  });
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      removeEnemy(id);
    };
  }, [id, removeEnemy]);
  
  return (
    <group
      ref={enemyRef}
      position={[position.x, position.y, position.z]}
      scale={[0.8, 0.8, 0.8]} // Scale down the enemies slightly
    >
      <ReadyPlayerMeAvatar 
        avatarUrl={avatarUrl}
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
        animation={ANIMATIONS.IDLE}
        isMoving={isMoving}
      />
    </group>
  );
};

export default Enemy;
