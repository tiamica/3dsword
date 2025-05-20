import { useCallback } from "react";
import { useGameStore } from "../stores/useGameStore";
import * as THREE from "three";

export const useEnemySpawner = () => {
  const { phase, playerPosition, lastSpawnTime, enemies, spawnEnemy } = useGameStore();
  
  // Spawn radius and spawn interval
  const spawnRadius = 15;
  const minSpawnInterval = 2000; // 2 seconds
  
  // Get a random position around the player
  const getRandomSpawnPosition = useCallback(() => {
    // Generate a random angle
    const angle = Math.random() * Math.PI * 2;
    
    // Calculate position on the circle
    const x = playerPosition.x + Math.cos(angle) * spawnRadius;
    const z = playerPosition.z + Math.sin(angle) * spawnRadius;
    
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
