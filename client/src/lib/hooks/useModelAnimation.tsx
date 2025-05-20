import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Animation states
export type AnimationState = 'idle' | 'walking' | 'running' | 'attack';

interface ModelAnimationProps {
  isMoving: boolean;
  isAttacking: boolean;
}

export const useModelAnimation = ({ isMoving, isAttacking }: ModelAnimationProps) => {
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const timeRef = useRef<number>(0);
  const attackTimeRef = useRef<number>(0);
  const isAttackingRef = useRef<boolean>(false);
  
  // Update animation state based on props
  useEffect(() => {
    if (isAttacking && !isAttackingRef.current) {
      setAnimationState('attack');
      isAttackingRef.current = true;
      attackTimeRef.current = 0;
    } else if (isMoving && !isAttacking) {
      setAnimationState('running');
    } else if (!isMoving && !isAttacking) {
      setAnimationState('idle');
    }
  }, [isMoving, isAttacking]);
  
  // Animation parameters
  const getAnimationParams = () => {
    switch (animationState) {
      case 'idle':
        return {
          frequency: 1.5,
          amplitude: 0.05,
          rotationAmplitude: 0.02
        };
      case 'walking':
        return {
          frequency: 4,
          amplitude: 0.1,
          rotationAmplitude: 0.05
        };
      case 'running':
        return {
          frequency: 8,
          amplitude: 0.15,
          rotationAmplitude: 0.08
        };
      case 'attack':
        return {
          frequency: 12,
          amplitude: 0.3,
          rotationAmplitude: 0.5
        };
      default:
        return {
          frequency: 1.5,
          amplitude: 0.05,
          rotationAmplitude: 0.02
        };
    }
  };
  
  // Animation update function
  const updateAnimation = (modelRef: THREE.Object3D | null, delta: number) => {
    if (!modelRef) return;
    
    const params = getAnimationParams();
    timeRef.current += delta;
    
    if (animationState === 'attack') {
      // Attack animation lasts 0.5 seconds
      attackTimeRef.current += delta;
      if (attackTimeRef.current > 0.5) {
        isAttackingRef.current = false;
        attackTimeRef.current = 0;
        setAnimationState(isMoving ? 'running' : 'idle');
      } else {
        // Forward swing from 0 to 0.25 seconds, backward from 0.25 to 0.5
        const attackProgress = attackTimeRef.current / 0.5;
        const swingFactor = attackProgress <= 0.5
          ? attackProgress * 2
          : (1 - (attackProgress - 0.5) * 2);
        
        modelRef.rotation.x = swingFactor * params.rotationAmplitude;
      }
    } else {
      // Regular movement animations (idle, walking, running)
      const bounceValue = Math.sin(timeRef.current * params.frequency) * params.amplitude;
      const swayValue = Math.sin(timeRef.current * params.frequency * 0.5) * params.rotationAmplitude;
      
      modelRef.position.y = bounceValue;
      modelRef.rotation.z = swayValue;
    }
  };
  
  return {
    animationState,
    updateAnimation
  };
};