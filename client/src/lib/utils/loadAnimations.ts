import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

// The collection of animations we want to load
const ANIMATION_FILES = [
  { name: 'idle', path: '/models/idle.glb' },
  { name: 'walking', path: '/models/animation_library.glb' },
  { name: 'running', path: '/models/running.glb' },
  { name: 'punch', path: '/models/punch.glb' }
];

// Load a single GLB file and extract its animations
const loadAnimationFile = (file: { name: string, path: string }): Promise<THREE.AnimationClip[]> => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      file.path,
      (gltf) => {
        const animations = gltf.animations.map(anim => {
          // Clone the animation and set its name to match our expected format
          const newAnim = anim.clone();
          newAnim.name = file.name;
          return newAnim;
        });
        resolve(animations);
      },
      undefined,
      (error) => {
        console.error(`Error loading animation ${file.path}:`, error);
        reject(error);
      }
    );
  });
};

// Load all animations and combine them
export const loadAllAnimations = async (): Promise<THREE.AnimationClip[]> => {
  try {
    const animationsArray = await Promise.all(ANIMATION_FILES.map(loadAnimationFile));
    // Flatten the array of arrays
    const allAnimations = animationsArray.flat();
    console.log('Loaded animations:', allAnimations.map(a => a.name).join(', '));
    return allAnimations;
  } catch (error) {
    console.error('Failed to load animations:', error);
    return [];
  }
};

// A cache for animations to avoid reloading
let cachedAnimations: THREE.AnimationClip[] | null = null;

// Get animations, using cache if available
export const getAnimations = async (): Promise<THREE.AnimationClip[]> => {
  if (cachedAnimations) {
    return cachedAnimations;
  }
  
  cachedAnimations = await loadAllAnimations();
  return cachedAnimations;
};