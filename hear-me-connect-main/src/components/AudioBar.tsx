import { Play, Pause } from "lucide-react";
import { useState } from "react";

const AudioBar = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulated waveform bars
  const waveformBars = [0.4, 0.7, 0.5, 0.9, 0.3, 0.8, 0.6, 0.4, 0.7, 0.5, 0.8, 0.3, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8, 0.6, 0.4];

  return (
    <div className="input-bar flex items-center gap-4">
      {/* Play/Pause Button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="glass-button p-3 rounded-full glow-primary"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-primary" />
        ) : (
          <Play className="w-5 h-5 text-primary" />
        )}
      </button>

      {/* Waveform Visualization */}
      <div className="flex-1 flex items-center justify-center gap-[3px] h-10">
        {waveformBars.map((height, index) => (
          <div
            key={index}
            className="waveform-bar w-1"
            style={{
              height: `${height * 100}%`,
              animationDelay: `${index * 0.05}s`,
              animation: isPlaying ? `waveform 1.2s ease-in-out infinite ${index * 0.05}s` : "none",
              transform: isPlaying ? undefined : `scaleY(${height})`,
            }}
          />
        ))}
      </div>

      {/* Timestamp */}
      <div className="text-sm text-muted-foreground font-mono">
        {isPlaying ? "0:12" : "0:00"} / 0:45
      </div>
    </div>
  );
};

export default AudioBar;
