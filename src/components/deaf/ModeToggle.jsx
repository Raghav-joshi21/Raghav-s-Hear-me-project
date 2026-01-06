import React from "react";

const ModeToggle = ({ mode, onModeChange }) => {
  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      backgroundColor: "white",
      borderRadius: "9999px",
      padding: "12px 16px",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      fontFamily: "'Bricolage Grotesque', sans-serif",
    },
    label: {
      color: "#374151",
      fontWeight: 500,
      fontSize: "14px",
    },
    toggleContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      backgroundColor: "#e5e7eb",
      borderRadius: "9999px",
      padding: "4px",
    },
    slider: {
      position: "absolute",
      top: "4px",
      bottom: "4px",
      left: "4px",
      width: "calc(50% - 4px)",
      backgroundColor: "white",
      borderRadius: "9999px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.3s ease",
      transform: mode === "alphabet" ? "translateX(0)" : "translateX(calc(100% + 4px))",
    },
    button: {
      position: "relative",
      zIndex: 10,
      padding: "8px 24px",
      borderRadius: "9999px",
      fontWeight: 500,
      fontSize: "14px",
      transition: "color 0.3s ease",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      flex: 1,
      minWidth: 0,
    },
    buttonActive: {
      color: "#0574DF",
      fontWeight: 600,
    },
    buttonInactive: {
      color: "#4b5563",
    },
  };

  return (
    <div style={styles.container}>
      {/* Left Label */}
      <span style={styles.label}>Mode</span>

      {/* Toggle Container */}
      <div style={styles.toggleContainer}>
        {/* Slider Indicator */}
        <div style={styles.slider} />

        {/* Toggle Buttons */}
        <button
          onClick={() => onModeChange("alphabet")}
          style={{
            ...styles.button,
            ...(mode === "alphabet" ? styles.buttonActive : styles.buttonInactive),
          }}
        >
          ALPHABET
        </button>
        <button
          onClick={() => onModeChange("word")}
          style={{
            ...styles.button,
            ...(mode === "word" ? styles.buttonActive : styles.buttonInactive),
          }}
        >
          WORD
        </button>
      </div>
    </div>
  );
};

export default ModeToggle;

