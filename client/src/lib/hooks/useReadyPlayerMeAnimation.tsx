import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Animation states
export type AnimationState = 'idle' | 'walking' | 'running' | 'attack';

interface ReadyPlayerMeAnimationProps {
  isMoving: boolean;
  isAttacking: boolean;
  animations: THREE.AnimationClip[] | undefined;
  animationMixer: THREE.AnimationMixer | null;
  scene: THREE.Group | null;
}

// Mapping from our animation states to the ReadyPlayerMe animation names
const ANIMATION_MAPPING = {
  idle: 'idle',
  walking: 'walking',
  running: 'running',
  attack: 'punch'
};

export const useReadyPlayerMeAnimation = ({ 
  isMoving, 
  isAttacking,
  animations,
  animationMixer,
  scene
}: ReadyPlayerMeAnimationProps) => {
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const isAttackingRef = useRef<boolean>(false);
  const animationActionsRef = useRef<{[key: string]: THREE.AnimationAction}>({});
  
  // Initialize animation actions when animations are loaded
  useEffect(() => {
    if (!animations || !animationMixer || !scene) return;
    
    // Create animation actions for each clip
    const animationActions: {[key: string]: THREE.AnimationAction} = {};
    
    animations.forEach(clip => {
      // Some animations have names like "walking.001", normalize them
      const baseName = clip.name.split('.')[0].toLowerCase();
      animationActions[baseName] = animationMixer.clipAction(clip);
    });
    
    console.log("Available animations:", Object.keys(animationActions));
    animationActionsRef.current = animationActions;
    
    // Start with idle animation
    const idleAction = animationActions[ANIMATION_MAPPING.idle];
    if (idleAction) {
      idleAction.play();
      currentActionRef.current = idleAction;
    }
  }, [animations, animationMixer, scene]);
  
  // Update animation state based on props
  useEffect(() => {
    if (!animationMixer || Object.keys(animationActionsRef.current).length === 0) return;
    
    let newState: AnimationState = 'idle';
    if (isAttacking && !isAttackingRef.current) {
      newState = 'attack';
      isAttackingRef.current = true;
      
      // Reset attack state after animation completes
      setTimeout(() => {
        isAttackingRef.current = false;
      }, 1000); // 1 second for attack animation
    } else if (isMoving && !isAttacking) {
      newState = 'running';
    } else if (!isMoving && !isAttacking) {
      newState = 'idle';
    }
    
    if (newState !== animationState) {
      setAnimationState(newState);
      
      // Get the corresponding RPM animation name
      const rpmAnimationName = ANIMATION_MAPPING[newState];
      const newAction = animationActionsRef.current[rpmAnimationName];
      
      if (newAction && currentActionRef.current !== newAction) {
        // Crossfade to the new animation
        if (currentActionRef.current) {
          newAction.reset();
          newAction.setEffectiveTimeScale(1);
          newAction.setEffectiveWeight(1);
          newAction.crossFadeFrom(currentActionRef.current, 0.3, true);
          newAction.play();
        } else {
          newAction.play();
        }
        
        currentActionRef.current = newAction;
        console.log(`Changed animation to: ${newState} (RPM: ${rpmAnimationName})`);
      }
    }
  }, [isMoving, isAttacking, animationState, animationMixer]);
  
  // Update animations in the frame loop
  useFrame((_, delta) => {
    if (animationMixer) {
      animationMixer.update(delta);
    }
  });
  
  return {
    animationState
  };
};