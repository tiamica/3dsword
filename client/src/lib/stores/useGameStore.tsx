import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { useAudio } from "./useAudio";

export type GamePhase = "ready" | "playing" | "ended";

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Enemy {
  id: string;
  position: Position;
  health: number;
}

interface GameState {
  // Game state
  phase: GamePhase;
  score: number;
  playerPosition: Position;
  enemies: Enemy[];
  swordSwinging: boolean;
  lastSpawnTime: number;
  playerAvatarUrl: string | null;
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  addScore: (points: number) => void;
  setPlayerPosition: (position: Position) => void;
  spawnEnemy: (position: Position) => void;
  removeEnemy: (id: string) => void;
  setSwordSwinging: (isSwinging: boolean) => void;
  triggerSwordSwing: () => void;
  setPlayerAvatarUrl: (url: string) => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    phase: "ready",
    score: 0,
    playerPosition: { x: 0, y: 1, z: 0 },
    enemies: [],
    swordSwinging: false,
    lastSpawnTime: 0,
    playerAvatarUrl: null,
    
    // Game control actions
    start: () => {
      set({ phase: "playing", score: 0, enemies: [] });
    },
    
    restart: () => {
      set({ 
        phase: "playing", 
        score: 0, 
        playerPosition: { x: 0, y: 1, z: 0 },
        enemies: [],
        lastSpawnTime: 0
      });
    },
    
    end: () => {
      set({ phase: "ended" });
    },
    
    // Game mechanics actions
    addScore: (points) => {
      set((state) => ({ score: state.score + points }));
    },
    
    setPlayerPosition: (position) => {
      set({ playerPosition: position });
    },
    
    spawnEnemy: (position) => {
      const newEnemy: Enemy = {
        id: uuidv4(),
        position,
        health: 1
      };
      
      set((state) => ({
        enemies: [...state.enemies, newEnemy],
        lastSpawnTime: Date.now()
      }));
    },
    
    removeEnemy: (id) => {
      set((state) => ({
        enemies: state.enemies.filter(enemy => enemy.id !== id)
      }));
    },
    
    setSwordSwinging: (isSwinging) => {
      set({ swordSwinging: isSwinging });
    },
    
    triggerSwordSwing: () => {
      const { swordSwinging } = get();
      
      if (!swordSwinging) {
        set({ swordSwinging: true });
        
        // Reset sword swinging state after animation completes
        setTimeout(() => {
          set({ swordSwinging: false });
        }, 500);
      }
    },
    
    // Set player avatar URL
    setPlayerAvatarUrl: (url) => {
      set({ playerAvatarUrl: url });
    }
  }))
);
