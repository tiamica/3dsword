import { useCallback } from "react";
import * as THREE from "three";
import { useGameStore } from "../stores/useGameStore";
import { useAudio } from "../stores/useAudio";

export const useCollisionDetection = () => {
  const { 
    playerPosition, 
    enemies, 
    removeEnemy, 
    addScore, 
    swordSwinging 
  } = useGameStore();
  
  const { playHit } = useAudio();
  
  // Sword collision parameters
  const swordLength = 1.5;
  const swordWidth = 0.5;
  const swordHitboxOffset = 1.0; // Offset from player center
  
  // Check for collisions between sword and enemies
  const checkCollisions = useCallback(() => {
    // Only check collisions if the sword is swinging
    if (!swordSwinging) return;
    
    // Create a simple sword hitbox (a box in front of the player)
    const swordHitbox = new THREE.Box3(
      new THREE.Vector3(
        playerPosition.x + swordHitboxOffset - swordWidth/2,
        playerPosition.y,
        playerPosition.z - swordWidth/2
      ),
      new THREE.Vector3(
        playerPosition.x + swordHitboxOffset + swordLength,
        playerPosition.y + 2,
        playerPosition.z + swordWidth/2
      )
    );
    
    // Check each enemy for collision with the sword
    for (const enemy of enemies) {
      // Create enemy hitbox
      const enemyHitbox = new THREE.Box3(
        new THREE.Vector3(
          enemy.position.x - 0.5,
          enemy.position.y,
          enemy.position.z - 0.5
        ),
        new THREE.Vector3(
          enemy.position.x + 0.5,
          enemy.position.y + 2,
          enemy.position.z + 0.5
        )
      );
      
      // Check for intersection
      if (swordHitbox.intersectsBox(enemyHitbox)) {
        // Enemy is hit by the sword
        console.log("Enemy hit:", enemy.id);
        
        // Play hit sound
        playHit();
        
        // Remove the enemy
        removeEnemy(enemy.id);
        
        // Add score
        addScore(10);
      }
    }
  }, [swordSwinging, playerPosition, enemies, removeEnemy, addScore, playHit]);
  
  return { checkCollisions };
};
