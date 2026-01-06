import React from "react";

const GestureRecognitionToggle = ({ enabled, onToggle }) => {
  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: "white",
      borderRadius: "9999px",
      padding: "10px 16px",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      fontFamily: "'Bricolage Grotesque', sans-serif",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    label: {
      color: "#374151",
      fontWeight: 500,
      fontSize: "14px",
      userSelect: "none",
    },
    toggleSwitch: {
      position: "relative",
      width: "44px",
      height: "24px",
      backgroundColor: enabled ? "#10b981" : "#d1d5db",
      borderRadius: "9999px",
      transition: "background-color 0.2s",
      cursor: "pointer",
    },
    toggleSlider: {
      position: "absolute",
      top: "2px",
      left: enabled ? "20px" : "2px",
      width: "20px",
      height: "20px",
      backgroundColor: "white",
      borderRadius: "50%",
      transition: "left 0.2s",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
    },
  };

  return (
    <div style={styles.container} onClick={onToggle}>
      <span style={styles.label}>Gesture Recognition</span>
      <div style={styles.toggleSwitch}>
        <div style={styles.toggleSlider} />
      </div>
    </div>
  );
};

export default GestureRecognitionToggle;




