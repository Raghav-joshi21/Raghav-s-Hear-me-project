import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useState } from "react";

interface VideoFrameProps {
  isMicActive?: boolean;
  isLive?: boolean;
}

const VideoFrame = ({ isMicActive = false, isLive = false }: VideoFrameProps) => {
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(isMicActive);

  return (
    <div className="video-frame aspect-video w-full relative group">
      {/* Simulated video background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 to-background/80 flex items-center justify-center">
        {cameraOn ? (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center border border-primary/30">
            <span className="text-4xl">👤</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center border border-border/50">
              <VideoOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Camera Off</span>
          </div>
        )}
      </div>

      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-3 right-3 pill-badge glow-danger">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft" />
          <span className="text-red-400">Live</span>
        </div>
      )}

      {/* Glass control buttons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {/* Camera Toggle Button */}
        <button
          onClick={() => setCameraOn(!cameraOn)}
          className={`glass-control-btn ${cameraOn ? "glass-control-active" : "glass-control-off"}`}
        >
          {cameraOn ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </button>

        {/* Mic Toggle Button */}
        <button
          onClick={() => setMicOn(!micOn)}
          className={`glass-control-btn ${micOn ? "glass-control-mic-on" : "glass-control-off"}`}
        >
          {micOn ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Status labels */}
      <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className={`glass-status-pill ${cameraOn ? "glass-status-active" : "glass-status-off"}`}>
          {cameraOn ? (
            <>
              <Video className="w-3 h-3" />
              <span>Camera On</span>
            </>
          ) : (
            <>
              <VideoOff className="w-3 h-3" />
              <span>Camera Off</span>
            </>
          )}
        </div>

        <div className={`glass-status-pill ${micOn ? "glass-status-mic" : "glass-status-off"}`}>
          {micOn ? (
            <>
              <Mic className="w-3 h-3" />
              <span>Mic On</span>
            </>
          ) : (
            <>
              <MicOff className="w-3 h-3" />
              <span>Mic Off</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoFrame;
