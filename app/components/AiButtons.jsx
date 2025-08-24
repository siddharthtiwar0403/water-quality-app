import React from "react";
import { Shield, Droplets, Wallet } from "lucide-react"; 

const AiButtons = ({ handleAiRequest, isLoading, activeAiButton }) => {
  const buttons = [
    { type: "prevention", color: "#4caf50", label: "AI Prevention", icon: <Shield size={18} /> },
    { type: "filtration", color: "#2196f3", label: "AI Filtration", icon: <Droplets size={18} /> },
    { type: "cost", color: "#ff9800", label: "AI Cost Analysis", icon: <Wallet size={18} /> },
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {isLoading && activeAiButton === btn.type ? "⏳ Getting AI Response..." : btn.icon}
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AiButtons;
