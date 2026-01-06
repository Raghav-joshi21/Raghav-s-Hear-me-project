import React from "react";

const DebugTools = ({
  showLandmarks,
  onToggleLandmarks,
  predictionLabel,
  handDetected,
  isPredicting,
}) => {
  const styles = {
    container: {
      position: "absolute",
      top: "16px",
      left: "16px",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      padding: "12px 16px",
      zIndex: 15,
      fontFamily: "'Bricolage Grotesque', sans-serif",
      minWidth: "200px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    title: {
      color: "white",
      fontSize: "12px",
      fontWeight: 600,
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    toggleRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "8px",
    },
    toggleLabel: {
      color: "rgba(255, 255, 255, 0.9)",
      fontSize: "12px",
      fontWeight: 500,
    },
    toggleSwitch: {
      position: "relative",
      width: "36px",
      height: "20px",
      backgroundColor: showLandmarks ? "#10b981" : "#6b7280",
      borderRadius: "9999px",
      transition: "background-color 0.2s",
      cursor: "pointer",
    },
    toggleSlider: {
      position: "absolute",
      top: "2px",
      left: showLandmarks ? "16px" : "2px",
      width: "16px",
      height: "16px",
      backgroundColor: "white",
      borderRadius: "50%",
      transition: "left 0.2s",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
    },
    predictionRow: {
      marginTop: "8px",
      paddingTop: "8px",
      borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    },
    predictionLabel: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "11px",
      marginBottom: "4px",
    },
    predictionText: {
      color: "#10b981",
      fontSize: "14px",
      fontWeight: 600,
      fontFamily: "monospace",
    },
    statusText: {
      color: handDetected ? "#10b981" : "#ef4444",
      fontSize: "11px",
      marginTop: "4px",
      fontWeight: 500,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Debug Tools</div>
      
      <div style={styles.toggleRow}>
        <span style={styles.toggleLabel}>Show Landmarks</span>
        <div style={styles.toggleSwitch} onClick={onToggleLandmarks}>
          <div style={styles.toggleSlider} />
        </div>
      </div>

      <div style={styles.predictionRow}>
        <div style={styles.predictionLabel}>Detected:</div>
        {predictionLabel ? (
          <div style={styles.predictionText}>{predictionLabel}</div>
        ) : isPredicting ? (
          <div style={{ ...styles.predictionText, color: "#fbbf24" }}>Processing...</div>
        ) : (
          <div style={{ ...styles.predictionText, color: "rgba(255, 255, 255, 0.5)" }}>—</div>
        )}
        <div style={styles.statusText}>
          {handDetected ? "✓ Hand Detected" : "✗ No Hand"}
        </div>
      </div>
    </div>
  );
};

export default DebugTools;




