import { useRef, useEffect, useState, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { useReadyPlayerMeAnimation } from "../../lib/hooks/useReadyPlayerMeAnimation";
import { getAnimations } from "../../lib/utils/loadAnimations";

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
  animations: THREE.AnimationClip[];
};

interface ReadyPlayerMeModelProps {
  modelPath: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  isMoving?: boolean;
  isAttacking?: boolean;
}

// Preload animation files
useGLTF.preload('/models/idle.glb');
useGLTF.preload('/models/animation_library.glb');
useGLTF.preload('/models/running.glb');
useGLTF.preload('/models/punch.glb');

const ReadyPlayerMeModel = ({
  modelPath,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  color,
  isMoving = false,
  isAttacking = false,
}: ReadyPlayerMeModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load the avatar model
  const { scene: avatarScene, animations: avatarAnimations } = useGLTF(modelPath, true) as GLTFResult;
  
  // Set up animations
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [combinedAnimations, setCombinedAnimations] = useState<THREE.AnimationClip[]>([]);
  
  // Initialize the model and animations
  useEffect(() => {
    if (avatarScene) {
      const newMixer = new THREE.AnimationMixer(avatarScene);
      setMixer(newMixer);
      
      // Load all animations and combine them with any avatar animations
      getAnimations().then(loadedAnimations => {
        const allAnimations = [
          ...(avatarAnimations || []),
          ...loadedAnimations
        ];
        
        setCombinedAnimations(allAnimations);
        setModelLoaded(true);
        console.log(`ReadyPlayerMe model loaded: ${modelPath}`);
        console.log(`Available animations: ${allAnimations.map(a => a.name).join(', ')}`);
      });
    }
  }, [avatarScene, avatarAnimations]);

  // Set up the animation controller
  const { animationState } = useReadyPlayerMeAnimation({
    isMoving,
    isAttacking,
    animations: combinedAnimations,
    animationMixer: mixer,
    scene: avatarScene
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
          <primitive object={avatarScene.clone(true)} />
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

export default ReadyPlayerMeModel;