import VideoFrame from "./VideoFrame";
import GestureDetection from "./GestureDetection";
import AudioBar from "./AudioBar";

const DeafUserPanel = () => {
  return (
    <div className="glass-card-glow p-6 flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="pill-badge glow-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
          <span className="text-primary-foreground font-medium">You</span>
        </div>
      </div>

      {/* Video Section */}
      <div className="mb-6">
        <VideoFrame isMicActive={false} />
      </div>

      {/* Gesture Detection */}
      <div className="flex-1 mb-6">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
          Hand Gesture Detection
        </h3>
        <GestureDetection />
      </div>

      {/* Audio Bar */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
          Audio Output
        </h3>
        <AudioBar />
      </div>
    </div>
  );
};

export default DeafUserPanel;
