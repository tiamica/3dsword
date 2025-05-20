import { useEffect, useState, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useModelAnimation } from '../../lib/hooks/useModelAnimation';

interface GameModelProps {
  modelPath: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  isMoving?: boolean;
  isAttacking?: boolean;
}

const GameModel = ({ 
  modelPath, 
  position = [0, 0, 0], 
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  color,
  isMoving = false,
  isAttacking = false
}: GameModelProps) => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  
  // Load the model
  const { scene: modelScene } = useGLTF(modelPath, true);
  
  // Set up animations
  const { animationState, updateAnimation } = useModelAnimation({
    isMoving,
    isAttacking
  });
  
  // Set up the model once it's loaded
  useEffect(() => {
    if (modelScene) {
      setModelLoaded(true);
      console.log(`Model loaded successfully: ${modelPath}`);
      
      // Traverse the model to enable shadows and change material color if provided
      modelScene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          
          // Apply custom color if provided
          if (color && node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.color.set(color);
                }
              });
            } else if (node.material instanceof THREE.MeshStandardMaterial) {
              node.material.color.set(color);
            }
          }
        }
      });
      
      // Store reference to model for animations
      if (modelRef.current) {
        modelRef.current.add(modelScene.clone());
      }
    }
  }, [modelScene, modelPath, color]);
  
  // Update animations in the game loop
  useFrame((state, delta) => {
    if (modelRef.current && modelLoaded) {
      updateAnimation(modelRef.current, delta);
    }
  });
  
  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale} 
      rotation={rotation}
    >
      <group ref={modelRef}>
        {modelLoaded ? (
          <primitive object={modelScene.clone(true)} />
        ) : (
          // Fallback while loading
          <mesh castShadow>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color={color || "#5555FF"} />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default GameModel;