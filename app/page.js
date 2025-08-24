'use client'
import { useState } from "react";
import WeatherContaminationButton from "./components/WeatherContaminationButton";
import { getAiResponse } from "./lib/cohereApi";
import WaterCharts from "./components/WaterCharts";
import AiButtons from "./components/AiButtons";
import WaterQualityCard from "./components/WaterQualityChart";
import Navbar from "./components/NavBar";
import { CheckCircle } from "lucide-react";
import { Droplet } from "lucide-react";

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

//   const getAiResponse = async (type) => {
//     setIsLoading(true);
//     setActiveAiButton(type);
//     setAiResponse("");
    
//     try {
//       // Build prompt for Cohere
//       let prompt = "";
//       if (type === "prevention") {
//         prompt = `Water Quality Parameters:
// pH: ${ph}, TDS: ${tds} ppm, Turbidity: ${turbidity} NTU, Temperature: ${temperature}°C.

// Give me prevention recommendations to keep this water safe.`;
//       } else if (type === "filtration") {
//         prompt = `Water Quality Parameters:
// pH: ${ph}, TDS: ${tds} ppm, Turbidity: ${turbidity} NTU, Temperature: ${temperature}°C.

// Suggest the best filtration methods and systems for this water.`;
//       } else if (type === "cost") {
//         prompt = `Water Quality Parameters:
// pH: ${ph}, TDS: ${tds} ppm, Turbidity: ${turbidity} NTU, Temperature: ${temperature}°C.

// Estimate the cost breakdown for a purification system suitable for this water.`;
//       }

//       const response = await fetch("https://api.cohere.ai/v1/generate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer 6xr5q0MxmzkQMq8tswl7KCuR5PWj9LpFXYk8eEWm` // ⚠️ Replace with env variable in production
//         },
//         body: JSON.stringify({
//           model: "command-r-plus",
//           prompt: prompt,
//           max_tokens: 400,
//           temperature: 0.7
//         })
//       });

//       const data = await response.json();
//       setAiResponse(data.generations?.[0]?.text || "No AI response received.");
//       setIsLoading(false);

//     } catch (error) {
//       console.error("Error fetching AI advice:", error);
//       setAiResponse("Sorry, we couldn't generate AI advice at this time. Please try again later.");
//       setIsLoading(false);
//     }
//   };
 const handleAiRequest = async (type) => {
    setIsLoading(true);
    setActiveAiButton(type);
    setAiResponse("");

    try {
      const response = await getAiResponse({
        type,
        ph: 7.2,
        tds: 350,
        turbidity: 2,
        temperature: 25
      });
      setAiResponse(response);
    } catch (err) {
      setAiResponse("Sorry, we couldn't generate AI advice at this time.");
    } finally {
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
    <>
    <Navbar turbidity={turbidity}/>
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e0f7fa, #80deea)", padding: "20px" }}>
      <h1 className="text-4xl font-bold text-sky-900 mb-6 text-center flex items-center justify-center gap-2">
      <Droplet className="w-8 h-8 text-sky-600" />
      Smart Water Quality Advisor
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

       <button
  onClick={handleCheck}
  className="w-full mt-2 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl shadow-md transition duration-200"
>
  <CheckCircle size={18} />
  Analyze Water Quality
</button>

        {advice.length > 0 && (
          <>
            {/* Quality Status */}
           <WaterQualityCard waterQuality={waterQuality} advice={advice} />

            {/* Charts */}
             <WaterCharts chartData={chartData} qualityData={qualityData} COLORS={COLORS} />

            {/* AI Section */}
            
          <AiButtons
        handleAiRequest={handleAiRequest}
        isLoading={isLoading}
        activeAiButton={activeAiButton}
      />
            
          </>
        )}

        {aiResponse && (
          <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "10px", border: "2px solid #9c27b0" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "15px", color: "#7b1fa2", display: "flex", alignItems: "center" }}>
              {activeAiButton === "prevention" ? "🛡️ AI Prevention Advice" : 
               activeAiButton === "filtration" ? "💧 AI Filtration Solutions" : 
               "💰 AI Cost Analysis"}

            </h2>
           <div
  style={{
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    whiteSpace: "pre-wrap",
    lineHeight: "1.8",
    color: "#111827",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    fontSize: "15px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  }}
>
  {aiResponse}
</div>

          </div>
        )}
      </div>
    </div>
    </>
  );
}