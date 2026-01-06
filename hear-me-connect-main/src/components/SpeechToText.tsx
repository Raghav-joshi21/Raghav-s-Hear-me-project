import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { MessageSquare } from "lucide-react";

const SpeechToText = () => {
  const [showTranscription, setShowTranscription] = useState(true);

  // Simulated live transcription
  const transcriptionLines = [
    { text: "Hello, can you hear me?", time: "0:02" },
    { text: "I'm going to explain the project now.", time: "0:05" },
    { text: "Let me know if you need anything repeated.", time: "0:09" },
  ];

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center gap-3">
        <Switch
          checked={showTranscription}
          onCheckedChange={setShowTranscription}
          className="data-[state=checked]:bg-accent"
        />
        <span className="text-sm text-foreground/80">Show Speech-to-Text</span>
      </div>

      {/* Transcription Display */}
      {showTranscription && (
        <div className="transcription-box min-h-[160px] space-y-3">
          <div className="flex items-center gap-2 text-accent mb-3">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-medium">Live Subtitles</span>
          </div>

          <div className="space-y-2">
            {transcriptionLines.map((line, index) => (
              <div
                key={index}
                className="flex items-start gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="text-[10px] text-muted-foreground font-mono mt-1 shrink-0">
                  {line.time}
                </span>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {line.text}
                </p>
              </div>
            ))}
          </div>

          {/* Typing indicator */}
          <div className="flex items-center gap-2 pt-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" style={{ animationDelay: "0s" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
            </div>
            <span className="text-xs text-muted-foreground">Listening...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
