import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useGameStore } from "../../lib/stores/useGameStore";

interface SwordProps {
  isSwinging: boolean;
}

const Sword = ({ isSwinging }: SwordProps) => {
  const swordRef = useRef<THREE.Group>(null);
  const initialRotation = useRef(new THREE.Euler(0, 0, 0));
  const swingProgress = useRef(0);
  const { setSwordSwinging } = useGameStore();
  
  // Load wood texture for handle
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Update sword swing animation
  useFrame((state, delta) => {
    if (!swordRef.current) return;
    
    if (isSwinging) {
      // Increment swing progress
      swingProgress.current += delta * 5; // Control swing speed
      
      if (swingProgress.current <= 1) {
        // Swing forward (0 to 1)
        swordRef.current.rotation.x = initialRotation.current.x - Math.PI * swingProgress.current;
      } else if (swingProgress.current <= 2) {
        // Swing back (1 to 2)
        swordRef.current.rotation.x = initialRotation.current.x - Math.PI + Math.PI * (swingProgress.current - 1);
      } else {
        // Reset swing
        swingProgress.current = 0;
        swordRef.current.rotation.x = initialRotation.current.x;
        setSwordSwinging(false);
      }
    }
  });
  
  // Store the initial rotation and update sword swinging state
  useEffect(() => {
    if (swordRef.current) {
      initialRotation.current.copy(swordRef.current.rotation);
    }
    
    setSwordSwinging(isSwinging);
  }, [isSwinging, setSwordSwinging]);
  
  return (
    <group ref={swordRef} position={[1, 1.5, 0]} rotation={[0, 0, 0]}>
      {/* Sword handle */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial map={woodTexture} roughness={0.8} />
      </mesh>
      
      {/* Sword guard */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.3]} />
        <meshStandardMaterial color="gray" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Sword blade */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.1, 1.5, 0.05]} />
        <meshStandardMaterial color="silver" metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
};

export default Sword;
