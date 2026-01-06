import React, { useState, useRef, useEffect } from "react";
import DeafVideoPanel from "../components/deaf/DeafVideoPanel";
import HearingFeaturePanel from "../components/hearing/HearingFeaturePanel";
import HearingTranscriptionPanel from "../components/HearingTranscriptionPanel";
import { PhoneOffIcon } from "../components/Icons";
import { gestureRelay } from "../utils/gestureRelay";

const HearingCommunication = ({
  roomId,
  callState,
  isMuted: externalIsMuted,
  isCameraOn: externalIsCameraOn,
  onToggleMute,
  onToggleCamera,
  onLeaveCall,
  localVideoRef: externalLocalVideoRef,
  remoteParticipants = [],
  statusMessage,
  error,
  localParticipantName = "Participant",
  transcriptionText = "",
  transcriptionMessages = [],
  showTranscription = true,
  onToggleTranscription,
  transcriptionError = null,
}) => {
  const participantName = localParticipantName;
  const [isMuted, setIsMuted] = useState(externalIsMuted || false);
  const [isCameraOn, setIsCameraOn] = useState(externalIsCameraOn || true);
  const [showMyTranscription, setShowMyTranscription] = useState(showTranscription);
  const [gestureMessages, setGestureMessages] = useState([]);

  // Initialize gesture relay for hearing participant
  useEffect(() => {
    if (roomId && participantName) {
      gestureRelay.initialize(roomId, "hearing", participantName, (message) => {
        console.log(`🤲 Received gesture prediction: "${message.text}" from ${message.participantName}`);
        setGestureMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some((msg) => msg.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      });
      console.log("🤲 Gesture relay initialized for hearing participant");
    }

    return () => {
      gestureRelay.cleanup();
    };
  }, [roomId, participantName]);

  // Use external ref if provided, otherwise create internal one
  const internalLocalVideoRef = useRef(null);
  const localVideoRef = externalLocalVideoRef || internalLocalVideoRef;

  // Sync with external state
  useEffect(() => {
    if (externalIsMuted !== undefined) {
      setIsMuted(externalIsMuted);
    }
  }, [externalIsMuted]);

  useEffect(() => {
    if (externalIsCameraOn !== undefined) {
      setIsCameraOn(externalIsCameraOn);
    }
  }, [externalIsCameraOn]);

  const handleMuteToggle = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleCameraToggle = () => {
    if (onToggleCamera) {
      onToggleCamera();
    } else {
      setIsCameraOn(!isCameraOn);
    }
  };

  const handleTranscriptionToggle = () => {
    const newValue = !showMyTranscription;
    setShowMyTranscription(newValue);
    if (onToggleTranscription) {
      onToggleTranscription(newValue);
    }
  };

  const [activeNav, setActiveNav] = useState("communicate");
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const navItemsRef = useRef({});

  // Update indicator position when active nav changes
  useEffect(() => {
    if (indicatorRef.current && navItemsRef.current[activeNav]) {
      const activeItem = navItemsRef.current[activeNav];
      const navContainer = navRef.current;

      if (activeItem && navContainer) {
        const navRect = navContainer.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();

        indicatorRef.current.style.left = `${itemRect.left - navRect.left}px`;
        indicatorRef.current.style.width = `${itemRect.width}px`;
      }
    }
  }, [activeNav]);

  const handleNavClick = (navId) => {
    setActiveNav(navId);
    if (navId === "home") {
      window.location.href = "/";
    }
  };

  const styles = {
    container: {
      height: "100vh",
      maxHeight: "100vh",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "'Bricolage Grotesque', sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 60px",
      position: "relative",
      zIndex: 10,
      flexShrink: 0,
      backgroundColor: "#ffffff",
      gap: "20px",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      height: "110px",
      backgroundColor: "transparent",
    },
    logoImage: {
      height: "110px",
      width: "auto",
      maxWidth: "none",
      objectFit: "contain",
      display: "block",
      backgroundColor: "transparent",
    },
    nav: {
      display: "flex",
      gap: "40px",
      alignItems: "center",
      position: "relative",
    },
    navIndicator: {
      position: "absolute",
      bottom: "-8px",
      height: "3px",
      background: "linear-gradient(90deg, #7D52FD 0%, #6366f1 100%)",
      borderRadius: "2px",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 0 10px rgba(125, 82, 253, 0.4), 0 0 20px rgba(99, 102, 241, 0.3)",
      zIndex: 1,
    },
    navLink: {
      color: "#1a1a1a",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: 500,
      transition: "all 0.3s ease",
      cursor: "pointer",
      opacity: 0.8,
      padding: "8px 16px",
      borderRadius: "6px",
      position: "relative",
      zIndex: 2,
      fontFamily: "'Bricolage Grotesque', sans-serif",
    },
    navLinkActive: {
      color: "#ffffff",
      backgroundColor: "#000000",
      opacity: 1,
      fontWeight: 600,
    },
    contactButton: {
      padding: "10px 24px",
      backgroundColor: "#000000",
      color: "white",
      border: "none",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
      fontFamily: "'Bricolage Grotesque', sans-serif",
    },
    mainContent: {
      flex: 1,
      display: "flex",
      gap: "16px",
      padding: "16px",
      maxWidth: "1920px",
      margin: "0 auto",
      width: "100%",
      minHeight: 0,
      overflow: "hidden",
    },
    leftPanel: {
      flex: "0.7",
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
    },
    videoWrapper: {
      flex: 1,
      minHeight: 0,
    },
    statusIndicator: {
      position: "absolute",
      bottom: "80px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(10px)",
      padding: "8px 16px",
      borderRadius: "20px",
      zIndex: 20,
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: "14px",
      fontWeight: 500,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    statusDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    },
    statusText: {
      color: "white",
    },
    transcriptionToggleWrapper: {
      marginTop: "16px",
      display: "flex",
      justifyContent: "flex-start",
      paddingLeft: "16px",
    },
    transcriptionToggle: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(10px)",
      padding: "10px 20px",
      borderRadius: "20px",
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: "14px",
      fontWeight: 500,
      color: "white",
      cursor: "pointer",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    transcriptionToggleLabel: {
      color: "white",
    },
    transcriptionSwitch: {
      position: "relative",
      width: "44px",
      height: "24px",
      backgroundColor: showMyTranscription ? "#10b981" : "#6b7280",
      borderRadius: "9999px",
      transition: "background-color 0.2s",
      cursor: "pointer",
    },
    transcriptionSwitchKnob: {
      position: "absolute",
      top: "2px",
      left: showMyTranscription ? "20px" : "2px",
      width: "20px",
      height: "20px",
      backgroundColor: "white",
      borderRadius: "50%",
      transition: "left 0.2s",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
    },
    rightPanel: {
      flex: "0.3",
      minHeight: 0,
      paddingTop: "0",
    },
    roomCodeBadge: {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(10px)",
      color: "white",
      padding: "8px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 600,
      fontFamily: "'Bricolage Grotesque', sans-serif",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    callEndButton: {
      position: "absolute",
      top: "16px",
      right: "16px",
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "48px",
      height: "48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: "all 0.2s",
      zIndex: 100,
    },
  };

  const handleEndCall = () => {
    if (onLeaveCall) {
      onLeaveCall();
    } else {
      window.location.href = "/test-communication";
    }
  };

  return (
    <div style={styles.container}>
      {/* Header/Navbar */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <img
              src="https://res.cloudinary.com/drvllglbk/image/upload/f_png/cs_srgb/q_auto/hear_me_logo_jvyfgf.jpg"
              alt="He@r Me Logo"
              style={styles.logoImage}
              onError={(e) => {
                console.error("Logo failed to load from Cloudinary");
                if (!e.target.src.includes("hear_me_logo_jvyfgf.jpg")) {
                  e.target.src =
                    "https://res.cloudinary.com/drvllglbk/image/upload/hear_me_logo_jvyfgf.jpg";
                } else if (!e.target.src.includes("/logo.png")) {
                  e.target.src = "/logo.png";
                }
              }}
            />
          </div>
          {/* Room Code Badge - Top Left */}
          {roomId && (
            <div style={styles.roomCodeBadge}>
              Room: {roomId}
            </div>
          )}
        </div>
        <nav ref={navRef} style={styles.nav}>
          {activeNav === "communicate" && <div ref={indicatorRef} style={styles.navIndicator} />}
          <a
            ref={(el) => (navItemsRef.current.home = el)}
            href="#home"
            style={{
              ...styles.navLink,
              ...(activeNav === "home" ? styles.navLinkActive : {}),
            }}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("home");
            }}
          >
            HOME
          </a>
          <a
            ref={(el) => (navItemsRef.current.communicate = el)}
            href="#communicate"
            style={{
              ...styles.navLink,
              ...(activeNav === "communicate" ? styles.navLinkActive : {}),
            }}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("communicate");
            }}
          >
            Communicate
          </a>
          <a
            ref={(el) => (navItemsRef.current.features = el)}
            href="#features"
            style={{
              ...styles.navLink,
              ...(activeNav === "features" ? styles.navLinkActive : {}),
            }}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("features");
            }}
          >
            Features
          </a>
          <a
            ref={(el) => (navItemsRef.current.howitworks = el)}
            href="#howitworks"
            style={{
              ...styles.navLink,
              ...(activeNav === "howitworks" ? styles.navLinkActive : {}),
            }}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("howitworks");
            }}
          >
            How it Works
          </a>
        </nav>
        <button style={styles.contactButton}>Contact me</button>
      </header>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Left Panel - Video (70%) */}
        <div style={styles.leftPanel}>
          <div style={styles.videoWrapper}>
            <DeafVideoPanel
              participantName={participantName}
              isMuted={isMuted}
              isCameraOn={isCameraOn}
              onMuteToggle={handleMuteToggle}
              onCameraToggle={handleCameraToggle}
              localVideoRef={localVideoRef}
              remoteParticipants={remoteParticipants}
              onEndCall={handleEndCall}
            />
          </div>
          
          {/* Status Indicator */}
          {statusMessage && (
            <div style={styles.statusIndicator}>
              <div 
                style={{
                  ...styles.statusDot,
                  backgroundColor: 
                    statusMessage.includes("Error") || statusMessage.includes("Failed") ? "#ef4444" :
                    statusMessage.includes("Connected") || statusMessage.includes("initialized") ? "#10b981" :
                    "#fbbf24"
                }}
              />
              <span style={styles.statusText}>{statusMessage}</span>
            </div>
          )}
          
          {/* Transcription Toggle at Bottom (replaces Mode Toggle) */}
          <div style={styles.transcriptionToggleWrapper}>
            <div style={styles.transcriptionToggle} onClick={handleTranscriptionToggle}>
              <span style={styles.transcriptionToggleLabel}>🎤 My Transcription</span>
              <div style={styles.transcriptionSwitch}>
                <div style={styles.transcriptionSwitchKnob}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Features (30%) */}
        <div style={styles.rightPanel}>
          <HearingFeaturePanel gestureMessages={gestureMessages} />
        </div>
      </div>

      {/* Transcription Panel - Show/Hide based on toggle */}
      {showMyTranscription && (
        <HearingTranscriptionPanel
          transcriptionText={transcriptionText}
          transcriptionMessages={transcriptionMessages}
          isEnabled={showMyTranscription}
          onToggle={handleTranscriptionToggle}
          error={transcriptionError}
        />
      )}
    </div>
  );
};

export default HearingCommunication;

