import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
  animations: THREE.AnimationClip[];
};

interface AnimatedModelProps {
  modelPath: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  isMoving?: boolean;
  isAttacking?: boolean;
}

const AnimatedModel = ({
  modelPath,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  isMoving = false,
  isAttacking = false,
}: AnimatedModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Load the model with animations
  const { scene, animations } = useGLTF(modelPath) as GLTFResult;
  const { actions, mixer } = useAnimations(animations, scene);
  
  // Track current animation
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  
  // Clone the scene to avoid issues with multiple instances
  const modelScene = scene.clone(true);
  
  // Set up the model and play animations
  useEffect(() => {
    if (modelScene) {
      setModelLoaded(true);
      console.log(`Model loaded successfully: ${modelPath}`);
      
      // Make sure all meshes cast shadows
      modelScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Start with idle animation
      if (actions["idle"]) {
        actions["idle"].reset().fadeIn(0.5).play();
        setCurrentAnimation("idle");
      }
    }
  }, [modelPath, modelScene, actions]);
  
  // Update animation based on movement and attack states
  useEffect(() => {
    if (!actions || !mixer) return;
    
    let newAnimation = "idle";
    
    if (isAttacking) {
      newAnimation = "punch";
    } else if (isMoving) {
      newAnimation = "running";
    }
    
    // Only change animation if it's different from the current one
    if (newAnimation !== currentAnimation && actions[newAnimation]) {
      // Fade out current animation
      const current = currentAnimation ? actions[currentAnimation] : null;
      if (current) {
        current.fadeOut(0.3);
      }
      
      // Fade in new animation
      actions[newAnimation].reset().fadeIn(0.3).play();
      setCurrentAnimation(newAnimation);
      console.log(`Changed animation to: ${newAnimation}`);
    }
  }, [isMoving, isAttacking, actions, mixer, currentAnimation]);
  
  // Update animations in the frame loop
  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
  });
  
  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale} 
      rotation={rotation}
    >
      {modelLoaded ? (
        <primitive object={modelScene} />
      ) : (
        // Fallback cube while loading
        <mesh castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#5555FF" />
        </mesh>
      )}
    </group>
  );
};

export default AnimatedModel;