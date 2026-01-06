import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Hand } from "lucide-react";

const GestureDetection = () => {
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [handDetected] = useState(true);
  const [currentGesture] = useState("YES");

  return (
    <div className="space-y-4">
      {/* Toggle and Status Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            checked={showLandmarks}
            onCheckedChange={setShowLandmarks}
            className="data-[state=checked]:bg-primary"
          />
          <span className="text-sm text-foreground/80">Show Hand Landmarks</span>
        </div>

        {/* Status Indicator */}
        <div className={`pill-badge ${handDetected ? "glow-success" : "glow-danger"}`}>
          <span
            className={`w-2 h-2 rounded-full ${
              handDetected ? "bg-glow-success" : "bg-glow-danger"
            } animate-pulse-soft`}
          />
          <span className={handDetected ? "text-glow-success" : "text-glow-danger"}>
            {handDetected ? "Hand Detected" : "No Hand Detected"}
          </span>
        </div>
      </div>

      {/* Gesture Display */}
      <div className="transcription-box min-h-[120px] flex flex-col items-center justify-center gap-3">
        {showLandmarks && (
          <Hand className="w-10 h-10 text-primary/60 animate-pulse-soft" />
        )}
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Detected Gesture
          </p>
          <p className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {currentGesture}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GestureDetection;
