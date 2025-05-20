import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../lib/stores/useGameStore";

interface EnemyProps {
  id: string;
  position: { x: number; y: number; z: number };
}

const Enemy = ({ id, position }: EnemyProps) => {
  const enemyRef = useRef<THREE.Mesh>(null);
  const { playerPosition, removeEnemy, enemies, phase } = useGameStore();
  
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
    
    // Normalize and apply speed
    if (direction.length() > 0.1) {
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
    <mesh
      ref={enemyRef}
      position={[position.x, position.y, position.z]}
      scale={[1, 2, 1]}
      castShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

export default Enemy;
