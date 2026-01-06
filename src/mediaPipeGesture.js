// Real-time hand gesture detection using MediaPipe Hands
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

/**
 * Classify gesture from hand landmarks
 * @param {Array} landmarks - Hand landmarks array
 * @returns {string|null} Detected gesture (HELP, YES, NO) or null
 */
function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  // Get key points
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const indexMcp = landmarks[5];
  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const middleMcp = landmarks[9];
  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const ringMcp = landmarks[13];
  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const pinkyMcp = landmarks[17];
  const wrist = landmarks[0];

  // Helper: Check if finger is extended
  const isExtended = (tip, pip, mcp) => {
    return tip.y < pip.y && pip.y < mcp.y;
  };

  // Helper: Check if finger is curled
  const isCurled = (tip, pip, mcp) => {
    return tip.y > pip.y && pip.y > mcp.y;
  };

  // Check thumb direction (left/right hand)
  const thumbExtended = thumbTip.x > thumbIp.x || thumbTip.x < thumbIp.x;
  const thumbUp = thumbTip.y < thumbMcp.y;

  // Check each finger
  const indexExtended = isExtended(indexTip, indexPip, indexMcp);
  const middleExtended = isExtended(middleTip, middlePip, middleMcp);
  const ringExtended = isExtended(ringTip, ringPip, ringMcp);
  const pinkyExtended = isExtended(pinkyTip, pinkyPip, pinkyMcp);

  // HELP: All fingers extended (open palm)
  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return "HELP";
  }

  // YES: Thumbs up (thumb extended upward, other fingers curled)
  if (
    thumbUp &&
    !indexExtended &&
    !middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {
    return "YES";
  }

  // NO: Thumbs down or closed fist
  if (
    !thumbUp &&
    !indexExtended &&
    !middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {
    return "NO";
  }

  return null;
}

/**
 * Initialize MediaPipe Hands model
 * @param {Function} onResults - Callback for when hands are detected
 * @returns {Promise<Hands>} Initialized Hands instance
 */
export const initMediaPipeHands = async (onResults) => {
  console.log("🚀 Initializing MediaPipe Hands...");

  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  hands.onResults(onResults);

  console.log("✅ MediaPipe Hands initialized");
  return hands;
};

/**
 * Start camera feed with MediaPipe processing
 * @param {Hands} hands - MediaPipe Hands instance
 * @param {HTMLVideoElement} videoElement - Video element
 * @returns {Promise<Camera>} Camera instance
 */
export const startMediaPipeCamera = async (hands, videoElement) => {
  console.log("📹 Starting MediaPipe camera...");

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
    facingMode: "user",
  });

  await camera.start();
  console.log("✅ MediaPipe camera started");

  return camera;
};

/**
 * Draw hand landmarks on canvas (optimized)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} landmarks - Hand landmarks
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export const drawHandLandmarks = (ctx, landmarks, width, height) => {
  if (!ctx || !landmarks) return;

  // Don't clear here - already cleared in processHandResults
  // Optimize drawing by setting styles once
  ctx.strokeStyle = "#FFFFFF";
  ctx.fillStyle = "#FFFFFF";
  ctx.lineWidth = 1;

  // Draw connections with white thin lines
  drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
    color: "#FFFFFF",
    lineWidth: 1,
  });
  
  // Draw landmarks with white dots
  drawLandmarks(ctx, landmarks, {
    color: "#FFFFFF",
    lineWidth: 1,
    radius: 2,
  });
};

// Cache canvas size to avoid setting it on every frame
let cachedCanvasWidth = 0;
let cachedCanvasHeight = 0;

/**
 * Process MediaPipe results and detect gesture (optimized for performance)
 * @param {Object} results - MediaPipe results object
 * @param {Function} onGestureDetected - Callback when gesture is detected
 * @param {HTMLCanvasElement} canvas - Canvas for drawing
 * @returns {string|null} Detected gesture
 */
export const processHandResults = (
  results,
  onGestureDetected,
  canvas = null
) => {
  // Draw video and landmarks if canvas is provided
  if (canvas) {
    const ctx = canvas.getContext("2d");
    
    // Only set canvas size if it changed (avoids expensive reflows)
    if (results.image) {
      const newWidth = results.image.width;
      const newHeight = results.image.height;
      if (cachedCanvasWidth !== newWidth || cachedCanvasHeight !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        cachedCanvasWidth = newWidth;
        cachedCanvasHeight = newHeight;
      }
    }

    // Clear canvas efficiently
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame first
    if (results.image) {
      ctx.drawImage(
        results.image,
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    // Draw landmarks if hand(s) is detected
    if (
      results.multiHandLandmarks &&
      results.multiHandLandmarks.length > 0
    ) {
      // Draw landmarks for all detected hands
      results.multiHandLandmarks.forEach((landmarks) => {
        drawHandLandmarks(
          ctx,
          landmarks,
          canvas.width,
          canvas.height
        );
      });
    }
  }

  // Detect gesture from landmarks
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const gesture = classifyGesture(landmarks);

    if (gesture && onGestureDetected) {
      onGestureDetected(gesture);
    }

    return gesture;
  }

  return null;
};
