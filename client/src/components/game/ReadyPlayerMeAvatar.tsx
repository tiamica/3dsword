import { useEffect, useState, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
};

interface ReadyPlayerMeAvatarProps {
  avatarUrl: string;
  position?: [number, number, number];
  scale?: [number, number, number];
}

const ReadyPlayerMeAvatar = ({ 
  avatarUrl, 
  position = [0, 0, 0], 
  scale = [1, 1, 1] 
}: ReadyPlayerMeAvatarProps) => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const avatarRef = useRef<THREE.Group>(null);
  
  // Load the model
  const { scene: avatarScene } = useGLTF(avatarUrl) as GLTFResult;
  
  // Set up the model once it's loaded
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
    }
  }, [avatarScene]);
  
  // Animation (simple idle)
  useFrame((state, delta) => {
    if (avatarRef.current && modelLoaded) {
      // Optional: Add subtle breathing animation
      const t = state.clock.getElapsedTime();
      avatarRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.05;
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

export default ReadyPlayerMeAvatar;