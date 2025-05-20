// ReadyPlayerMe URLs for enemies to randomly select from
export const ENEMY_AVATAR_URLS = [
  "https://models.readyplayer.me/67ba74ab124f94955b57849e.glb",
  "https://models.readyplayer.me/67b675132bf733e659d826d9.glb", 
  "https://models.readyplayer.me/67ba67bd4d4cd8cc3d3cd280.glb", 
  "https://models.readyplayer.me/67b669d71baa959986313bf7.glb"
];

// Default models
export const PLAYER_MODEL_PATH = "https://models.readyplayer.me/67b64c34a70de751bf534803.glb";
export const ENEMY_MODEL_PATH = "/models/enemy.glb";

// Animation states - these don't match specific animations since we're using simple models
// but we use them to track the animation state
export const ANIMATIONS = {
  IDLE: "idle",
  WALKING: "walking",
  RUNNING: "running",
  ATTACK: "attack"
};