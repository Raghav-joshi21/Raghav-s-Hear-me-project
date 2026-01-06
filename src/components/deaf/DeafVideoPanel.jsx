import React, { useState, useEffect, useRef } from "react";
import { MicIcon, CameraIcon, PhoneOffIcon } from "../Icons";

const DeafVideoPanel = ({
  participantName,
  isMuted,
  isCameraOn,
  onMuteToggle,
  onCameraToggle,
  localVideoRef,
  remoteParticipants = [],
  onEndCall = null,
}) => {
  // Create styles object that updates with state
  const getStyles = () => ({
    container: {
      position: "relative",
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      overflow: "hidden",
      minHeight: "600px",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      fontFamily: "'Bricolage Grotesque', sans-serif",
    },
    videoContainer: {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
    },
    placeholderVideo: {
      width: "100%",
      height: "100%",
      backgroundColor: "#000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderContent: {
      textAlign: "center",
      color: "#1f2937",
    },
    placeholderIcon: {
      fontSize: "64px",
      marginBottom: "16px",
    },
    placeholderText: {
      color: "#6b7280",
      fontSize: "16px",
      fontWeight: 500,
    },
    participantText: {
      color: "#9ca3af",
      fontSize: "14px",
      marginTop: "8px",
    },
    pipVideo: {
      position: "absolute",
      top: "16px",
      right: "16px",
      width: "192px",
      height: "128px",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      border: "2px solid rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    },
    pipContent: {
      width: "100%",
      height: "100%",
      background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    pipIcon: {
      fontSize: "24px",
      marginBottom: "8px",
    },
    pipText: {
      fontSize: "12px",
      color: "#6b7280",
    },
    bottomOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      background: "linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)",
      padding: "16px",
      zIndex: 10, // Ensure overlay is above video
      pointerEvents: "none", // Allow clicks through background
    },
    overlayContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      pointerEvents: "auto", // Re-enable clicks on content
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
    },
    centerSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
    },
    nameBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(4px)",
      padding: "8px 16px",
      borderRadius: "9999px",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    nameText: {
      color: "#1f2937",
      fontWeight: 500,
      fontSize: "14px",
    },
    controls: {
      display: "flex",
      gap: "12px",
    },
    controlButton: {
      padding: "12px",
      transition: "all 0.2s",
      cursor: "pointer",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    micButtonStyle: {
      borderRadius: "50%",
    },
    cameraButtonStyle: {
      borderRadius: "8px",
    },
    micButton: {
      backgroundColor: isMuted ? "#ef4444" : "transparent",
      border: "none",
      boxShadow: isMuted ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none",
    },
    micButtonHover: {
      backgroundColor: isMuted ? "#dc2626" : "transparent",
      opacity: isMuted ? 1 : 0.8,
    },
    cameraButton: {
      backgroundColor: !isCameraOn ? "#ef4444" : "transparent",
      border: "none",
      borderRadius: "8px",
      boxShadow: !isCameraOn ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none",
    },
    cameraButtonHover: {
      backgroundColor: !isCameraOn ? "#dc2626" : "transparent",
      opacity: !isCameraOn ? 1 : 0.8,
    },
    callEndButton: {
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      width: "56px",
      height: "48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: "all 0.2s",
    },
  });

  const styles = getStyles();

  // PiP / Main view state
  const [mainView, setMainView] = useState("local"); // 'local' or 'remote'
  const prevHadRemoteRef = useRef(false);

  const hasRemote = remoteParticipants && remoteParticipants.length > 0;

  // Auto-switch behavior:
  // - When first remote joins → make remote main
  // - When all remote leave → revert to local main
  useEffect(() => {
    const hadRemoteBefore = prevHadRemoteRef.current;
    const hasRemoteNow = hasRemote;

    if (hasRemoteNow && !hadRemoteBefore) {
      // First time a remote participant appears → show them as main video
      setMainView("remote");
    }
    if (!hasRemoteNow) {
      // No remote participants → always show local as main
      setMainView("local");
    }

    prevHadRemoteRef.current = hasRemoteNow;
  }, [hasRemote]);

  const isLocalMain = !hasRemote || mainView === "local";

  // Shared base styles for main vs PiP video areas
  const mainVideoStyle = {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    minHeight: "400px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  const pipBaseStyle = {
    ...styles.pipVideo,
    zIndex: 5,
    cursor: "pointer",
  };

  const localContainerStyle = isLocalMain ? mainVideoStyle : pipBaseStyle;

  return (
    <div style={styles.container}>
      {/* Main Video Container */}
      <div style={styles.videoContainer}>
        {/* Local Video Container - Always present (can be main or PiP) */}
        <div 
          ref={localVideoRef} 
          id="local-video-container"
          style={{
            ...localContainerStyle,
          }}
          // Click on PiP local video → make local main
          onClick={() => {
            if (!isLocalMain && hasRemote) {
              setMainView("local");
            }
          }}
        />
        {/* Video element styling - applied via CSS */}
        <style>{`
          #local-video-container video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center !important;
            transform: none !important;
          }
        `}</style>
        {/* Video element styling - applied via CSS class */}
        <style>{`
          ${localVideoRef.current ? `#${localVideoRef.current.id || ''}` : ''} video,
          ${localVideoRef.current ? `#${localVideoRef.current.id || ''}` : ''} > div > video,
          ${localVideoRef.current ? `#${localVideoRef.current.id || ''}` : ''} > video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center !important;
            transform: none !important;
          }
        `}</style>
        {/* Placeholder when camera is off - only on main local video */}
        {!isCameraOn && isLocalMain && (
          <div style={{
            ...styles.placeholderVideo,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2, // Above video but below controls
          }}>
            <div style={styles.placeholderContent}>
              <div style={styles.placeholderIcon}>📹</div>
              <p style={styles.placeholderText}>Main Video Feed</p>
              <p style={styles.participantText}>{participantName}</p>
            </div>
          </div>
        )}

        {/* Remote Participant Video - can be main or PiP */}
        {hasRemote ? (
          remoteParticipants.slice(0, 1).map((participant, index) => {
            const participantId =
              participant.identifier?.communicationUserId ||
              participant.identifier?.rawId ||
              String(participant.identifier) ||
              `participant-${index}`;

            // Remote container is main when mainView === 'remote', otherwise PiP
            const remoteContainerStyle = mainView === "remote"
              ? mainVideoStyle
              : pipBaseStyle;

            return (
              <div
                key={participantId}
                data-participant-id={participantId}
                style={remoteContainerStyle}
                // Click on PiP remote video → make remote main
                onClick={() => {
                  if (mainView !== "remote") {
                    setMainView("remote");
                  }
                }}
              >
                <div
                  className="video-element"
                  data-participant-id={participantId}
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000000",
                    objectFit: "cover",
                  }}
                ></div>
              </div>
            );
          })
        ) : (
          // No remote participant yet → show waiting PiP
          <div style={{...styles.pipVideo, zIndex: 5}}>
            <div style={styles.pipContent}>
              <div style={{ textAlign: "center", color: "white" }}>
                <div style={styles.pipIcon}>👤</div>
                <p style={styles.pipText}>Waiting for participant...</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Overlay */}
        <div style={styles.bottomOverlay}>
          <div style={styles.overlayContent}>
            {/* Left Section - Participant Name */}
            <div style={styles.leftSection}>
              <div style={styles.nameBadge}>
                <span style={styles.nameText}>{participantName}</span>
              </div>
            </div>

            {/* Center Section - Mic and Camera (No Background) */}
            <div style={styles.centerSection}>
              {/* Mic Toggle */}
              <button
                onClick={onMuteToggle}
                disabled={false}
                style={{
                  ...styles.controlButton,
                  ...styles.micButton,
                  ...styles.micButtonStyle,
                  backgroundColor: isMuted ? "#ef4444" : "transparent",
                  cursor: "pointer",
                  pointerEvents: "auto",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = isMuted ? "#dc2626" : "transparent";
                    if (!isMuted) {
                      e.currentTarget.style.opacity = "0.8";
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = isMuted ? "#ef4444" : "transparent";
                    e.currentTarget.style.opacity = "1";
                  }
                }}
                title={isMuted ? "Unmute" : "Mute"}
              >
                <MicIcon muted={isMuted} size={20} color="white" />
              </button>

              {/* Camera Toggle */}
              <button
                onClick={onCameraToggle}
                disabled={false}
                style={{
                  ...styles.controlButton,
                  ...styles.cameraButton,
                  ...styles.cameraButtonStyle,
                  backgroundColor: !isCameraOn ? "#ef4444" : "transparent",
                  cursor: "pointer",
                  pointerEvents: "auto",
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = !isCameraOn ? "#dc2626" : "transparent";
                    if (isCameraOn) {
                      e.currentTarget.style.opacity = "0.8";
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = !isCameraOn ? "#ef4444" : "transparent";
                    e.currentTarget.style.opacity = "1";
                  }
                }}
                title={isCameraOn ? "Turn off camera" : "Turn on camera"}
              >
                <CameraIcon off={!isCameraOn} size={20} color="white" />
              </button>
            </div>

            {/* Right Section - Call End Button */}
            <div style={styles.rightSection}>
              {onEndCall ? (
                <button
                  onClick={onEndCall}
                  style={styles.callEndButton}
                  title="End Call"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#dc2626";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ef4444";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeafVideoPanel;

