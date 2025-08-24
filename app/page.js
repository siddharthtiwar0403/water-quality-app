'use client'
import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function WaterAdvisorApp() {
  const [ph, setPh] = useState(7);
  const [tds, setTds] = useState(100);
  const [turbidity, setTurbidity] = useState(1);
  const [temperature, setTemperature] = useState(25);
  const [advice, setAdvice] = useState([]);
  const [waterQuality, setWaterQuality] = useState("Good");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAiButton, setActiveAiButton] = useState("");

  function getPurificationAdvice(ph, tds, turbidity, temperature) {
    let tips = [];
    let qualityScore = 0;
    
    if (ph < 6.5) {
      tips.push("⚠️ pH is too low (acidic). Add alkaline substances or use a neutralizer.");
      qualityScore += 2;
    } else if (ph > 8.5) {
      tips.push("⚠️ pH is too high (alkaline). Add acidic substances or use a neutralizer.");
      qualityScore += 2;
    } else {
      tips.push("✅ pH level is optimal.");
    }

    if (tds < 50) {
      tips.push("💧 TDS is very low. Water may lack beneficial minerals.");
      qualityScore += 1;
    } else if (tds > 500) {
      tips.push("💧 TDS is too high. Use RO filter to reduce dissolved salts.");
      qualityScore += 3;
    } else if (tds > 300) {
      tips.push("💧 TDS is moderately high. Consider using a water filter.");
      qualityScore += 2;
    } else {
      tips.push("✅ TDS level is optimal.");
    }

    if (turbidity > 5) {
      tips.push("🔍 High turbidity detected. Filter with ceramic/cloth filter before boiling.");
      qualityScore += 3;
    } else if (turbidity > 1) {
      tips.push("🔍 Moderate turbidity. Let water settle before filtration.");
      qualityScore += 1;
    } else {
      tips.push("✅ Turbidity level is optimal.");
    }

    if (temperature > 30) {
      tips.push("🌡️ Water temperature is high. This may promote bacterial growth.");
      qualityScore += 1;
    } else if (temperature < 10) {
      tips.push("🌡️ Water temperature is very cold. This may affect taste.");
    } else {
      tips.push("✅ Temperature is within acceptable range.");
    }

    let qualityStatus;
    if (qualityScore >= 6) {
      qualityStatus = "Poor";
    } else if (qualityScore >= 3) {
      qualityStatus = "Fair";
    } else {
      qualityStatus = "Good";
    }

    setWaterQuality(qualityStatus);
    return tips;
  }

  const handleCheck = () => {
    const result = getPurificationAdvice(ph, tds, turbidity, temperature);
    setAdvice(result);
    setAiResponse("");
  };

  const getAiResponse = async (type) => {
    setIsLoading(true);
    setActiveAiButton(type);
    setAiResponse("");
    
    try {
      // Build prompt for Cohere
      let prompt = "";
      if (type === "prevention") {
        prompt = `Water Quality Parameters:
pH: ${ph}, TDS: ${tds} ppm, Turbidity: ${turbidity} NTU, Temperature: ${temperature}°C.

Give me prevention recommendations to keep this water safe.`;
      } else if (type === "filtration") {
        prompt = `Water Quality Parameters:
pH: ${ph}, TDS: ${tds} ppm, Turbidity: ${turbidity} NTU, Temperature: ${temperature}°C.

Suggest the best filtration methods and systems for this water.`;
      } else if (type === "cost") {
        prompt = `Water Quality Parameters:
pH: ${ph}, TDS: ${tds} ppm, Turbidity: ${turbidity} NTU, Temperature: ${temperature}°C.

Estimate the cost breakdown for a purification system suitable for this water.`;
      }

      const response = await fetch("https://api.cohere.ai/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer 6xr5q0MxmzkQMq8tswl7KCuR5PWj9LpFXYk8eEWm` // ⚠️ Replace with env variable in production
        },
        body: JSON.stringify({
          model: "command-r-plus",
          prompt: prompt,
          max_tokens: 400,
          temperature: 0.7
        })
      });

      const data = await response.json();
      setAiResponse(data.generations?.[0]?.text || "No AI response received.");
      setIsLoading(false);

    } catch (error) {
      console.error("Error fetching AI advice:", error);
      setAiResponse("Sorry, we couldn't generate AI advice at this time. Please try again later.");
      setIsLoading(false);
    }
  };

  const chartData = [
    { name: "pH", value: ph, min: 6.5, max: 8.5 },
    { name: "TDS", value: tds, max: 500 },
    { name: "Turbidity", value: turbidity, max: 5 },
    { name: "Temperature", value: temperature, min: 10, max: 30 }
  ];

  const qualityData = advice.length > 0 ? [
    { name: 'Optimal', value: 4 - advice.filter(a => a.includes("⚠️") || a.includes("🔍") || a.includes("💧") || a.includes("🌡️")).length },
    { name: 'Needs Attention', value: advice.filter(a => a.includes("⚠️") || a.includes("🔍") || a.includes("💧") || a.includes("🌡️")).length }
  ] : [];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e0f7fa, #80deea)", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#01579b", marginBottom: "20px", textAlign: "center" }}>
        💧 Smart Water Quality Advisor
      </h1>

      <div style={{ background: "white", padding: "25px", borderRadius: "16px", boxShadow: "0 6px 20px rgba(0,0,0,0.15)", width: "100%", maxWidth: "900px" }}>
        
        {/* Input Sliders */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
          {/* pH */}
          <div>
            <label style={{ fontWeight: "600", color: "#0277bd" }}>pH Value (6.5-8.5)</label>
            <input type="range" min="0" max="14" step="0.1" value={ph} onChange={(e) => setPh(Number(e.target.value))} style={{ width: "100%", marginTop: "5px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#000" }}>
              <span>0</span>
              <span style={{ fontWeight: "bold" }}>{ph}</span>
              <span>14</span>
            </div>
          </div>
          {/* TDS */}
          <div>
            <label style={{ fontWeight: "600", color: "#0277bd" }}>TDS (ppm) &lt;500</label>
            <input type="range" min="0" max="1000" value={tds} onChange={(e) => setTds(Number(e.target.value))} style={{ width: "100%", marginTop: "5px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#000" }}>
              <span>0</span>
              <span style={{ fontWeight: "bold" }}>{tds} ppm</span>
              <span>1000</span>
            </div>
          </div>
          {/* Turbidity */}
          <div>
            <label style={{ fontWeight: "600", color: "#0277bd" }}>Turbidity (NTU) &lt;5</label>
            <input type="range" min="0" max="10" step="0.1" value={turbidity} onChange={(e) => setTurbidity(Number(e.target.value))} style={{ width: "100%", marginTop: "5px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#000" }}>
              <span>0</span>
              <span style={{ fontWeight: "bold" }}>{turbidity} NTU</span>
              <span>10</span>
            </div>
          </div>
          {/* Temperature */}
          <div>
            <label style={{ fontWeight: "600", color: "#0277bd" }}>Temperature (°C) 10-30</label>
            <input type="range" min="0" max="50" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} style={{ width: "100%", marginTop: "5px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#000" }}>
              <span>0</span>
              <span style={{ fontWeight: "bold" }}>{temperature}°C</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <button onClick={handleCheck} style={{ background: "#0288d1", color: "white", padding: "12px", borderRadius: "10px", width: "100%", fontWeight: "600", marginTop: "10px", cursor: "pointer", border: "none" }}>
          ✅ Analyze Water Quality
        </button>

        {advice.length > 0 && (
          <>
            {/* Quality Status */}
            <div style={{ marginTop: "25px", padding: "15px", borderRadius: "10px", background: waterQuality === "Good" ? "#e8f5e9" : waterQuality === "Fair" ? "#fff3e0" : "#ffebee", border: `2px solid ${waterQuality === "Good" ? "#4caf50" : waterQuality === "Fair" ? "#ff9800" : "#f44336"}` }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "12px", color: "#01579b", display: "flex", alignItems: "center" }}>
                Water Quality: 
                <span style={{ 
                  color: waterQuality === "Good" ? "#4caf50" : waterQuality === "Fair" ? "#ff9800" : "#f44336",
                  marginLeft: "10px"
                }}>
                  {waterQuality}
                </span>
              </h2>
              <ul style={{ listStyleType: "none", paddingLeft: "0", color: "#000" }}>
                {advice.map((tip, index) => (
                  <li key={index} style={{ marginBottom: "8px", padding: "8px", borderRadius: "5px", background: tip.includes("✅") ? "#e8f5e9" : "#ffebee", color: "#000" }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: "30px" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "12px", color: "#01579b", textAlign: "center" }}>Parameter Values vs Safe Limits</h3>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#0288d1" name="Current Value" />
                      <Bar dataKey="max" fill="#ff6b6b" name="Max Safe Limit" />
                      <Bar dataKey="min" fill="#4caf50" name="Min Safe Limit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "12px", color: "#01579b", textAlign: "center" }}>Water Quality Status</h3>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={qualityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {qualityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[1] : COLORS[3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Section */}
            <div style={{ marginTop: "30px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "12px", color: "#01579b", textAlign: "center" }}>AI-Powered Analysis</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                <button 
                  onClick={() => getAiResponse("prevention")} 
                  disabled={isLoading}
                  style={{ 
                    background: isLoading && activeAiButton === "prevention" ? "#ccc" : "#4caf50", 
                    color: "white", 
                    padding: "12px", 
                    borderRadius: "10px", 
                    fontWeight: "600", 
                    cursor: isLoading ? "not-allowed" : "pointer",
                    border: "none"
                  }}
                >
                  {isLoading && activeAiButton === "prevention" ? "⏳" : "🛡️"} AI Prevention
                </button>
                
                <button 
                  onClick={() => getAiResponse("filtration")} 
                  disabled={isLoading}
                  style={{ 
                    background: isLoading && activeAiButton === "filtration" ? "#ccc" : "#2196f3", 
                    color: "white", 
                    padding: "12px", 
                    borderRadius: "10px", 
                    fontWeight: "600", 
                    cursor: isLoading ? "not-allowed" : "pointer",
                    border: "none"
                  }}
                >
                  {isLoading && activeAiButton === "filtration" ? "⏳" : "💧"} AI Filtration
                </button>
                
                <button 
                  onClick={() => getAiResponse("cost")} 
                  disabled={isLoading}
                  style={{ 
                    background: isLoading && activeAiButton === "cost" ? "#ccc" : "#ff9800", 
                    color: "white", 
                    padding: "12px", 
                    borderRadius: "10px", 
                    fontWeight: "600", 
                    cursor: isLoading ? "not-allowed" : "pointer",
                    border: "none"
                  }}
                >
                  {isLoading && activeAiButton === "cost" ? "⏳" : "💰"} AI Cost Analysis
                </button>
              </div>
            </div>
          </>
        )}

        {aiResponse && (
          <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "10px", border: "2px solid #9c27b0" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "15px", color: "#7b1fa2", display: "flex", alignItems: "center" }}>
              {activeAiButton === "prevention" ? "🛡️ AI Prevention Advice" : 
               activeAiButton === "filtration" ? "💧 AI Filtration Solutions" : 
               "💰 AI Cost Analysis"}
            </h2>
            <div style={{ 
              padding: "15px", 
              backgroundColor: "white", 
              borderRadius: "8px", 
              border: "1px solid #e0e0e0",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
              color: "#000",
              fontFamily: "monospace",
              fontSize: "14px"
            }}>
              {aiResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
