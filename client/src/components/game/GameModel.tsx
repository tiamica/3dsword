import { useEffect, useState, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ANIMATIONS } from '../../lib/constants';

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
  const modelRef = useRef<THREE.Group>(null);
  
  // Load the model
  const { scene: modelScene } = useGLTF(modelPath);
  
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
            node.material = new THREE.MeshStandardMaterial({ color });
          }
        }
      });
    }
  }, [modelScene, modelPath, color]);
  
  // Basic animation based on state
  useFrame((state, delta) => {
    if (modelRef.current && modelLoaded) {
      if (isAttacking) {
        // Simple attack animation - rotate the model forward and back
        const attackSpeed = 10;
        const attackAmount = Math.sin(state.clock.getElapsedTime() * attackSpeed) * 0.2;
        modelRef.current.rotation.x = rotation[0] + attackAmount;
      } else if (isMoving) {
        // Simple movement animation - slight bouncing
        const bounceSpeed = 8;
        const bounceAmount = Math.abs(Math.sin(state.clock.getElapsedTime() * bounceSpeed)) * 0.1;
        modelRef.current.position.y = position[1] + bounceAmount;
      } else {
        // Idle animation - subtle breathing movement
        const breathSpeed = 1.5;
        const breathAmount = Math.sin(state.clock.getElapsedTime() * breathSpeed) * 0.05;
        modelRef.current.position.y = position[1] + breathAmount;
      }
    }
  });
  
  return (
    <group 
      ref={modelRef} 
      position={position} 
      scale={scale} 
      rotation={rotation}
    >
      {modelLoaded ? (
        <primitive object={modelScene.clone()} />
      ) : (
        // Fallback while loading
        <mesh castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color={color || "#5555FF"} />
        </mesh>
      )}
    </group>
  );
};

export default GameModel;