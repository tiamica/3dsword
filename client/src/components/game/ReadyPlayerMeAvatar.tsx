import { useEffect, useState, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { ANIMATIONS } from '../../lib/constants';

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
  animations: THREE.AnimationClip[];
};

interface ReadyPlayerMeAvatarProps {
  avatarUrl: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  animation?: string;
  isMoving?: boolean;
  isAttacking?: boolean;
}

const ReadyPlayerMeAvatar = ({ 
  avatarUrl, 
  position = [0, 0, 0], 
  scale = [1, 1, 1],
  animation = ANIMATIONS.IDLE,
  isMoving = false,
  isAttacking = false
}: ReadyPlayerMeAvatarProps) => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const avatarRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const activeAnimationRef = useRef<string | null>(null);
  
  // Load the model with animations
  const { scene: avatarScene, animations } = useGLTF(avatarUrl) as GLTFResult;
  const { actions } = useAnimations(animations, avatarRef);
  
  // Set up the model and animations once loaded
  useEffect(() => {
    if (avatarScene) {
      setModelLoaded(true);
      console.log("Avatar model loaded successfully");
      
      // Traverse the model to enable shadows
      avatarScene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      
      // Create a mixer for animations
      if (!mixerRef.current) {
        mixerRef.current = new THREE.AnimationMixer(avatarScene);
      }
    }
  }, [avatarScene]);
  
  // Handle animation changes
  useEffect(() => {
    if (!actions || !modelLoaded) return;
    
    // Determine which animation to play based on props
    let currentAnimation = animation;
    
    if (isAttacking) {
      currentAnimation = ANIMATIONS.ATTACK;
    } else if (isMoving) {
      currentAnimation = ANIMATIONS.RUNNING;
    }
    
    // If animation changed, play the new one
    if (activeAnimationRef.current !== currentAnimation) {
      // Fade out all current animations
      Object.values(actions).forEach(action => {
        if (action?.isRunning()) {
          action.fadeOut(0.5);
        }
      });
      
      // Check if the animation exists and play it
      const newAction = actions[currentAnimation];
      if (newAction) {
        newAction.reset().fadeIn(0.5).play();
        activeAnimationRef.current = currentAnimation;
        console.log(`Playing animation: ${currentAnimation}`);
      } else {
        // Fallback to idle if the requested animation isn't available
        const idleAction = actions[ANIMATIONS.IDLE];
        if (idleAction) {
          idleAction.reset().fadeIn(0.5).play();
          activeAnimationRef.current = ANIMATIONS.IDLE;
          console.log(`Fallback to idle animation (${currentAnimation} not found)`);
        }
      }
    }
  }, [actions, animation, isMoving, isAttacking, modelLoaded]);
  
  // Update animation mixer in the render loop
  useFrame((state, delta) => {
    if (mixerRef.current && modelLoaded) {
      mixerRef.current.update(delta);
    }
  });
  
  return (
    <group ref={avatarRef} position={position as [number, number, number]} scale={scale}>
      {modelLoaded ? (
        <primitive object={avatarScene.clone()} />
      ) : (
        // Fallback while loading
        <mesh castShadow>
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial color="#5555FF" />
        </mesh>
      )}
    </group>
  );
};

// Pre-load model to improve performance
useGLTF.preload("https://models.readyplayer.me/65843dbeb966a506c88a5e56.glb");

export default ReadyPlayerMeAvatar;