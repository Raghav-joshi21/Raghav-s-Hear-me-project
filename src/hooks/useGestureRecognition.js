import { useEffect, useRef, useState } from "react";
import { initMediaPipeHands, processHandResults } from "../mediaPipeGesture";
import { flattenLandmarks, predictASL } from "../api/aslApi";
import { gestureRelay } from "../utils/gestureRelay";

/**
 * Hook for gesture recognition that sends predictions to hearing participant
 * Uses existing video stream (does not reinitialize camera)
 * @param {Object} config - Configuration object
 * @param {React.RefObject} videoRef - Reference to existing video element
 * @param {string} mode - "alphabet" or "word"
 * @param {boolean} enabled - Whether gesture recognition is enabled
 * @param {string} roomId - Room ID for sending predictions
 * @param {string} participantName - Participant name
 */
export const useGestureRecognition = ({
  videoRef,
  mode = "alphabet",
  enabled = false,
  roomId = null,
  participantName = "Participant",
  showLandmarks = false, // NEW: Control landmarks visibility
  canvasRef = null, // NEW: Optional canvas ref for landmarks
}) => {
  const [prediction, setPrediction] = useState(null);
  const [predictionLabel, setPredictionLabel] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [error, setError] = useState("");

  const handsRef = useRef(null);
  const lastPredictionTimeRef = useRef(0);
  const sequenceBufferRef = useRef([]);
  const modeRef = useRef(mode);
  const enabledRef = useRef(enabled);
  const showLandmarksRef = useRef(showLandmarks);
  const lastSentPredictionRef = useRef(""); // Avoid sending duplicate predictions

  const PREDICTION_THROTTLE_MS = 200;
  const SEQUENCE_LENGTH = 30;

  // Update refs when props change
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    showLandmarksRef.current = showLandmarks;
  }, [showLandmarks]);

  // Initialize gesture relay when enabled and roomId is available
  useEffect(() => {
    if (enabled && roomId && participantName) {
      gestureRelay.initialize(roomId, "deaf", participantName, null);
      console.log("🤲 Gesture relay initialized for deaf participant in room:", roomId);
    } else {
      // Cleanup if disabled
      if (roomId) {
        gestureRelay.cleanup();
      }
    }

    return () => {
      // Cleanup on unmount
      gestureRelay.cleanup();
    };
  }, [enabled, roomId, participantName]);

  // CREDIT-SAFE: Initialize MediaPipe and start gesture recognition ONLY when enabled
  useEffect(() => {
    // CREDIT-SAFE RULE: Do NOT run MediaPipe, AI model, or API calls when toggle is OFF
    if (!enabled || !videoRef?.current) {
      // HARD STOP: Cleanup everything when disabled
      console.log("⏹️ Gesture Recognition toggle OFF - stopping all ML processing to save credits");
      if (handsRef.current) {
        // Stop MediaPipe camera processing
        if (handsRef.current.camera) {
          try {
            handsRef.current.camera.stop();
          } catch (err) {
            console.warn("Error stopping camera:", err);
          }
        }
        // Cleanup resize observer
        if (handsRef.current.resizeObserver) {
          try {
            handsRef.current.resizeObserver.disconnect();
          } catch (err) {
            console.warn("Error disconnecting resize observer:", err);
          }
        }
        // Close MediaPipe hands
        try {
          handsRef.current.close();
        } catch (err) {
          console.warn("Error closing hands:", err);
        }
        handsRef.current = null;
      }
      // Clear all state
      setPrediction(null);
      setPredictionLabel("");
      setHandDetected(false);
      setError("");
      sequenceBufferRef.current = [];
      lastSentPredictionRef.current = "";
      // Cleanup gesture relay
      gestureRelay.cleanup();
      return;
    }

    const video = videoRef.current;
    let isMounted = true;

    const initializeGestureRecognition = async () => {
      try {
        // CREDIT-SAFE: Initialize MediaPipe Hands ONLY when enabled
        console.log("✅ Gesture Recognition toggle ON - starting ML processing");
        const hands = await initMediaPipeHands(async (results) => {
          // CREDIT-SAFE: Do NOT process if toggle turned OFF
          if (!isMounted || !enabledRef.current) {
            console.log("⏹️ Gesture Recognition disabled during processing - aborting");
            return;
          }

          // Draw landmarks on canvas if enabled
          if (showLandmarksRef.current && canvasRef?.current) {
            processHandResults(results, () => {}, canvasRef.current);
          }

          const hasHand =
            results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
          const handCount = results.multiHandLandmarks
            ? results.multiHandLandmarks.length
            : 0;
          const hasBothHands = handCount === 2;
          setHandDetected(hasHand);

          const currentMode = modeRef.current;

          // Check for two hands - "BYE BYE" gesture
          if (hasBothHands && currentMode === "word") {
            const byeByeText = "BYE BYE";
            setPredictionLabel(byeByeText);
            setPrediction(null);
            setError("");
            setIsPredicting(false);
            sequenceBufferRef.current = [];

            // Send prediction if not already sent
            if (lastSentPredictionRef.current !== byeByeText && roomId) {
              lastSentPredictionRef.current = byeByeText;
              gestureRelay.sendGesturePrediction(byeByeText).catch((err) => {
                console.error("Error sending gesture prediction:", err);
              });
            }
            return;
          }

          if (
            hasHand &&
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0
          ) {
            const landmarks = results.multiHandLandmarks[0];
            const flatLandmarks = flattenLandmarks(landmarks);

            if (flatLandmarks && !isPredicting) {
              const currentMode = modeRef.current;

              if (currentMode === "alphabet") {
                const now = Date.now();
                const timeSinceLastPrediction =
                  now - lastPredictionTimeRef.current;

                if (timeSinceLastPrediction >= PREDICTION_THROTTLE_MS) {
                  lastPredictionTimeRef.current = now;
                  setIsPredicting(true);
                  setError("");

                  try {
                    const result = await predictASL("alphabet", flatLandmarks);
                    if (result && result.label && isMounted) {
                      setPrediction(result.prediction);
                      setPredictionLabel(result.label);

                      // Send prediction if not already sent
                      if (
                        lastSentPredictionRef.current !== result.label &&
                        roomId
                      ) {
                        lastSentPredictionRef.current = result.label;
                        gestureRelay
                          .sendGesturePrediction(result.label)
                          .catch((err) => {
                            console.error("Error sending gesture prediction:", err);
                          });
                      }
                    } else if (isMounted) {
                      setError("No prediction received");
                      setPrediction(null);
                      setPredictionLabel("");
                    }
                  } catch (error) {
                    console.error("ASL prediction error:", error);
                    if (isMounted) {
                      setError(
                        error.message || "Prediction failed. Is backend running?"
                      );
                      setPrediction(null);
                      setPredictionLabel("");
                    }
                  } finally {
                    if (isMounted) {
                      setIsPredicting(false);
                    }
                  }
                }
              } else if (currentMode === "word") {
                sequenceBufferRef.current.push(...flatLandmarks);

                if (sequenceBufferRef.current.length > SEQUENCE_LENGTH * 63) {
                  sequenceBufferRef.current = sequenceBufferRef.current.slice(
                    -SEQUENCE_LENGTH * 63
                  );
                }

                if (sequenceBufferRef.current.length >= SEQUENCE_LENGTH * 63) {
                  const now = Date.now();
                  const timeSinceLastPrediction =
                    now - lastPredictionTimeRef.current;

                  if (timeSinceLastPrediction >= PREDICTION_THROTTLE_MS * 5) {
                    lastPredictionTimeRef.current = now;
                    setIsPredicting(true);
                    setError("");

                    const sequenceBuffer = [...sequenceBufferRef.current];

                    try {
                      const result = await predictASL("word", sequenceBuffer);
                      if (result && result.label && isMounted) {
                        setPrediction(result.prediction);
                        setPredictionLabel(result.label);

                        // Send prediction if not already sent
                        if (
                          lastSentPredictionRef.current !== result.label &&
                          roomId
                        ) {
                          lastSentPredictionRef.current = result.label;
                          gestureRelay
                            .sendGesturePrediction(result.label)
                            .catch((err) => {
                              console.error("Error sending gesture prediction:", err);
                            });
                        }
                      } else if (isMounted) {
                        setError("No prediction received");
                        setPrediction(null);
                        setPredictionLabel("");
                      }
                    } catch (error) {
                      console.error("ASL prediction error:", error);
                      if (isMounted) {
                        setError(
                          error.message || "Prediction failed. Is backend running?"
                        );
                        setPrediction(null);
                        setPredictionLabel("");
                      }
                    } finally {
                      if (isMounted) {
                        setIsPredicting(false);
                      }
                    }
                  }
                }
              }
            }
          } else {
            // No hand detected
            if (isMounted) {
              setPrediction(null);
              setPredictionLabel("");
              setError("");
              if (currentMode === "word") {
                sequenceBufferRef.current = [];
              }
              // Reset last sent prediction when hand is not detected
              lastSentPredictionRef.current = "";
            }
          }
        });

        handsRef.current = hands;

        // Setup canvas for landmarks if provided
        if (canvasRef?.current) {
          // Sync canvas size with video container
          const updateCanvasSize = () => {
            if (canvasRef.current && video) {
              const container = video.parentElement || video;
              const rect = container.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                canvasRef.current.width = rect.width;
                canvasRef.current.height = rect.height;
              }
            }
          };
          updateCanvasSize();
          // Update on resize
          const resizeObserver = new ResizeObserver(updateCanvasSize);
          if (video.parentElement) {
            resizeObserver.observe(video.parentElement);
          } else {
            resizeObserver.observe(video);
          }
          handsRef.current.resizeObserver = resizeObserver;
        }

        // Find the actual video element (Azure WebRTC renders video inside container)
        // Try multiple strategies to find the video element
        let actualVideoElement = null;
        
        // Strategy 1: Check if container itself is a video element
        if (video.tagName === "VIDEO") {
          actualVideoElement = video;
        } 
        // Strategy 2: Look for video element inside container (Azure WebRTC pattern)
        else {
          const videoElement = video.querySelector("video");
          if (videoElement) {
            actualVideoElement = videoElement;
          } else {
            // Strategy 3: Wait a bit for Azure to render video, then try again
            await new Promise(resolve => setTimeout(resolve, 500));
            const videoElementAfterWait = video.querySelector("video");
            if (videoElementAfterWait) {
              actualVideoElement = videoElementAfterWait;
            }
          }
        }

        if (!actualVideoElement) {
          console.warn("⚠️ No video element found in container. Waiting for Azure to render...");
          // Retry with multiple attempts (Azure may take time to render)
          for (let attempt = 0; attempt < 10; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const retryVideo = video.querySelector("video");
            if (retryVideo) {
              actualVideoElement = retryVideo;
              console.log(`✅ Found video element after retry (attempt ${attempt + 1})`);
              break;
            }
          }
          
          if (!actualVideoElement) {
            console.error("❌ Could not find video element for gesture recognition after all retries");
            if (isMounted) {
              setError("Video element not found. Please ensure camera is on and video is rendered.");
            }
            return;
          }
        }

        console.log("✅ Found video element for gesture recognition:", {
          element: actualVideoElement,
          tagName: actualVideoElement.tagName,
          hasSrcObject: !!actualVideoElement.srcObject,
        });
        
        // Wait for video to be ready (same pattern as Communication page)
        if (actualVideoElement.readyState < 2) {
          await new Promise((resolve) => {
            const timeout = setTimeout(resolve, 5000); // 5 second timeout
            actualVideoElement.onloadedmetadata = () => {
              clearTimeout(timeout);
              actualVideoElement.play().then(resolve).catch(resolve);
            };
            // If already loaded, resolve immediately
            if (actualVideoElement.readyState >= 2) {
              clearTimeout(timeout);
              resolve();
            }
          });
        }

        // Use startMediaPipeCamera (same as Communication page) for consistency
        const { startMediaPipeCamera } = await import("../mediaPipeGesture");
        const camera = await startMediaPipeCamera(hands, actualVideoElement);
        
        // Store camera ref for cleanup
        handsRef.current.camera = camera;
        handsRef.current.videoElement = actualVideoElement;
      } catch (error) {
        console.error("Error initializing gesture recognition:", error);
        if (isMounted) {
          setError("Failed to initialize gesture recognition");
        }
      }
    };

    initializeGestureRecognition();

    return () => {
      isMounted = false;
      if (handsRef.current) {
        if (handsRef.current.camera) {
          try {
            handsRef.current.camera.stop();
          } catch (err) {
            console.warn("Error stopping camera:", err);
          }
        }
        // No need to cleanup video element - it's managed by Azure WebRTC
        // Cleanup resize observer
        if (handsRef.current.resizeObserver) {
          try {
            handsRef.current.resizeObserver.disconnect();
          } catch (err) {
            console.warn("Error disconnecting resize observer:", err);
          }
        }
        try {
          handsRef.current.close();
        } catch (err) {
          console.warn("Error closing hands:", err);
        }
        handsRef.current = null;
      }
      setPrediction(null);
      setPredictionLabel("");
      setHandDetected(false);
      sequenceBufferRef.current = [];
      lastSentPredictionRef.current = "";
    };
  }, [enabled, videoRef, roomId, participantName]);

  return {
    prediction,
    predictionLabel,
    isPredicting,
    handDetected,
    error,
  };
};

