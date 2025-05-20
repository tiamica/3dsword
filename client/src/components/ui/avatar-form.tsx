import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Button } from "./button";
import { Label } from "./label";
import { useGameStore } from "../../lib/stores/useGameStore";
import { DEFAULT_PLAYER_AVATAR_URL } from "../../lib/constants";

export const AvatarForm = () => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { setPlayerAvatarUrl, playerAvatarUrl } = useGameStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (avatarUrl.trim()) {
      setPlayerAvatarUrl(avatarUrl);
      setIsFormOpen(false);
    }
  };

  const handleUseDefault = () => {
    setPlayerAvatarUrl(DEFAULT_PLAYER_AVATAR_URL);
    setIsFormOpen(false);
  };

  const createReadyPlayerMeURL = () => {
    window.open("https://readyplayer.me/", "_blank");
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      {!isFormOpen ? (
        <Button 
          onClick={() => setIsFormOpen(true)}
          variant="outline"
          className="bg-white/80 text-black hover:bg-white/90 pointer-events-auto"
        >
          {playerAvatarUrl ? "Change Avatar" : "Set Custom Avatar"}
        </Button>
      ) : (
        <Card className="w-80 pointer-events-auto bg-white/90">
          <CardHeader>
            <CardTitle>Custom Avatar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Ready Player Me URL</Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://models.readyplayer.me/your-avatar.glb"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
                <p className="text-xs text-gray-600">
                  Paste the URL to your Ready Player Me avatar (.glb file)
                </p>
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-xs p-0 h-auto" 
                  onClick={createReadyPlayerMeURL}
                >
                  Create your own avatar at ReadyPlayer.me
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={handleUseDefault}
            >
              Use Default
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!avatarUrl.trim()}
            >
              Apply
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};