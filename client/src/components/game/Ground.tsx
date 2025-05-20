import { useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";

const Ground = () => {
  // Load the grass texture
  const grassTexture = useTexture("/textures/grass.png");
  
  // Set texture repeat
  grassTexture.wrapS = RepeatWrapping;
  grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(10, 10);
  
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} 
      receiveShadow
    >
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial 
        map={grassTexture} 
        roughness={1} 
        metalness={0}
      />
    </mesh>
  );
};

export default Ground;
