import VideoFrame from "./VideoFrame";
import SpeechToText from "./SpeechToText";
import { MessageSquareText } from "lucide-react";

const HearingUserPanel = () => {
  return (
    <div className="glass-card-glow p-6 flex flex-col h-full animate-fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="pill-badge glow-accent">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
          <span className="text-accent font-medium">Hearing Section</span>
        </div>
        <div className="pill-badge glow-danger">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft" />
          <span className="text-red-400">Live 🔴</span>
        </div>
      </div>

      {/* Video Section */}
      <div className="mb-6">
        <VideoFrame isMicActive={true} isLive={true} />
      </div>

      {/* Speech to Text */}
      <div className="flex-1 mb-6">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
          Speech Recognition
        </h3>
        <SpeechToText />
      </div>

      {/* Input Bar */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
          Transcription Output
        </h3>
        <div className="input-bar flex items-center gap-3">
          <MessageSquareText className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Live transcription output..."
            className="flex-1 bg-transparent text-sm text-foreground/80 placeholder:text-muted-foreground outline-none"
            readOnly
          />
          <div className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse-soft" style={{ animationDelay: "0s" }} />
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse-soft" style={{ animationDelay: "0.15s" }} />
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse-soft" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HearingUserPanel;
