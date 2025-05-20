import { useCallback } from "react";
import { useGameStore } from "../stores/useGameStore";
import * as THREE from "three";

export const useEnemySpawner = () => {
  const { phase, playerPosition, lastSpawnTime, enemies, spawnEnemy } = useGameStore();
  
  // Spawn radius and spawn interval
  const spawnRadius = 15;
  const minSpawnInterval = 2000; // 2 seconds
  
  // Get a random position anywhere around the game world boundaries
  const getRandomSpawnPosition = useCallback(() => {
    // Game world boundary
    const worldSize = 20;
    
    // Determine spawn method (0 = edge of world, 1 = random in world)
    const spawnMethod = Math.random() > 0.5 ? 0 : 1;
    
    let x, z;
    
    if (spawnMethod === 0) {
      // Spawn on the edge of the world
      const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
      
      if (side === 0) {
        // Top edge
        x = (Math.random() * 2 - 1) * worldSize;
        z = -worldSize;
      } else if (side === 1) {
        // Right edge
        x = worldSize;
        z = (Math.random() * 2 - 1) * worldSize;
      } else if (side === 2) {
        // Bottom edge
        x = (Math.random() * 2 - 1) * worldSize;
        z = worldSize;
      } else {
        // Left edge
        x = -worldSize;
        z = (Math.random() * 2 - 1) * worldSize;
      }
    } else {
      // Spawn randomly in the world, but away from the player
      // Default values in case the loop doesn't run
      x = -worldSize;
      z = -worldSize;
      
      // Try to find a valid position
      for (let attempts = 0; attempts < 10; attempts++) {
        const tempX = (Math.random() * 2 - 1) * worldSize;
        const tempZ = (Math.random() * 2 - 1) * worldSize;
        
        // Calculate distance to player
        const distanceToPlayer = Math.sqrt(
          Math.pow(tempX - playerPosition.x, 2) + 
          Math.pow(tempZ - playerPosition.z, 2)
        );
        
        // Make sure spawn is at least 10 units away from player
        if (distanceToPlayer > 10) {
          x = tempX;
          z = tempZ;
          break;
        }
      }
    }
    
    return { x, y: 1, z };
  }, [playerPosition]);
  
  // Spawn enemies based on time
  const spawnEnemies = useCallback((delta: number) => {
    if (phase !== "playing") return;
    
    // Check if enough time has passed since the last spawn
    const currentTime = Date.now();
    const timeSinceLastSpawn = currentTime - lastSpawnTime;
    
    // Calculate spawn interval based on current number of enemies
    // More enemies = longer spawn interval to prevent overwhelming the player
    const enemyCount = enemies.length;
    const maxEnemies = 10;
    
    // Only spawn if we're below the max enemy count
    if (enemyCount < maxEnemies && timeSinceLastSpawn > minSpawnInterval) {
      // Get random spawn position
      const spawnPosition = getRandomSpawnPosition();
      
      // Make sure spawn position is far enough from player
      const distanceToPlayer = new THREE.Vector3(
        playerPosition.x - spawnPosition.x,
        0,
        playerPosition.z - spawnPosition.z
      ).length();
      
      if (distanceToPlayer >= spawnRadius * 0.8) {
        spawnEnemy(spawnPosition);
        console.log("Spawned enemy at", spawnPosition);
      }
    }
  }, [phase, playerPosition, lastSpawnTime, enemies.length, getRandomSpawnPosition, spawnEnemy]);
  
  return { spawnEnemies };
};
