import { useEffect } from "react";
import { useGameStore } from "../../lib/stores/useGameStore";
import { useAudio } from "../../lib/stores/useAudio";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Card, CardContent } from "./card";

export const GameUI = () => {
  const { score, phase, restart, enemies } = useGameStore();
  const { toggleMute, isMuted } = useAudio();

  // When game is over, show the game over screen and restart button
  useEffect(() => {
    if (phase === "ended") {
      console.log("Game over! Final score:", score);
    }
  }, [phase, score]);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* HUD: Score and Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Score display */}
        <div className="bg-black/70 text-white px-4 py-2 rounded-lg pointer-events-auto">
          <h2 className="text-xl font-bold">Score: {score}</h2>
          <p className="text-sm">Enemies: {enemies.length}</p>
        </div>

        {/* Controls info */}
        <div className="bg-black/70 text-white px-4 py-2 rounded-lg">
          <p className="text-sm">WASD or Arrow Keys: Move</p>
          <p className="text-sm">Space: Swing Sword</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleMute} 
            className="mt-2 pointer-events-auto"
          >
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </Button>
        </div>
      </div>

      {/* Game over screen */}
      {phase === "ended" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Card className="w-80 pointer-events-auto">
            <CardContent className="pt-6 flex flex-col items-center">
              <h1 className="text-2xl font-bold mb-4">Game Over!</h1>
              <p className="text-xl mb-6">Final Score: {score}</p>
              <Button onClick={restart} className="w-full">
                Play Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Click visual feedback overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <div 
          id="click-overlay" 
          className={cn(
            "w-full h-full cursor-pointer flex items-center justify-center"
          )}
          onClick={() => {
            // Trigger sword swing on click
            if (phase === "playing") {
              useGameStore.getState().triggerSwordSwing();
            }
          }}
        />
      </div>
    </div>
  );
};
