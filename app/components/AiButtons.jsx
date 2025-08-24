// components/AiButtons.js
import React from "react";

const AiButtons = ({ handleAiRequest, isLoading, activeAiButton }) => {
  const buttons = [
    { type: "prevention", color: "#4caf50", label: "AI Prevention", icon: "🛡️" },
    { type: "filtration", color: "#2196f3", label: "AI Filtration", icon: "💧" },
    { type: "cost", color: "#ff9800", label: "AI Cost Analysis", icon: "💰" },
  ];

  return (
    <div style={{ marginTop: "30px" }}>
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          marginBottom: "12px",
          color: "#01579b",
          textAlign: "center",
        }}
      >
        AI-Powered Analysis
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px",
        }}
      >
        {buttons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => handleAiRequest(btn.type)}
            disabled={isLoading}
            style={{
              background: isLoading && activeAiButton === btn.type ? "#ccc" : btn.color,
              color: "white",
              padding: "12px",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            {isLoading && activeAiButton === btn.type ? "⏳" : btn.icon} {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AiButtons;
