import { useState, useCallback, useEffect } from "react";
import { useGameStore } from "../stores/useGameStore";
import { useAudio } from "../stores/useAudio";

export const useSwordSwing = () => {
  const [isSwinging, setIsSwinging] = useState(false);
  const { swordSwinging, setSwordSwinging } = useGameStore();
  const { playHit } = useAudio();
  
  // Start a sword swing
  const startSwing = useCallback(() => {
    if (isSwinging) return;
    
    setIsSwinging(true);
    setSwordSwinging(true);
    
    // Play sword swing sound
    playHit();
    
    // Reset swing after animation completes
    setTimeout(() => {
      setIsSwinging(false);
      setSwordSwinging(false);
    }, 400); // 400ms for a full swing animation
  }, [isSwinging, setSwordSwinging, playHit]);
  
  // Listen for global sword swing triggers
  useEffect(() => {
    if (swordSwinging && !isSwinging) {
      startSwing();
    }
  }, [swordSwinging, isSwinging, startSwing]);
  
  return { isSwinging, startSwing };
};
