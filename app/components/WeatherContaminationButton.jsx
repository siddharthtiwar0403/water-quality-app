// src/components/WeatherContaminationButton.jsx
import { useState } from "react";
import axios from "axios";

const LOOKAHEAD_HOURS = 3;

export default function WeatherContaminationButton({ turbidity }) {
  const [loading, setLoading] = useState(false);
  const [contaminationProbability, setContaminationProbability] = useState(null);
  const [nextRain, setNextRain] = useState(null);
  const [place, setPlace] = useState(null);
  const [error, setError] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  function findStartIndex(timesISO = []) {
    const now = Date.now();
    for (let i = 0; i < timesISO.length; i++) {
      if (new Date(timesISO[i]).getTime() >= now) return i;
    }
    return Math.max(0, timesISO.length - 1);
  }

  function analyzeRainRisk(hourlyData) {
    if (!hourlyData?.time?.length) return null;
    const { time, precipitation = [], precipitation_probability = [] } = hourlyData;
    const start = findStartIndex(time);
    const end = Math.min(start + LOOKAHEAD_HOURS, time.length - 1);

    let earliestIdx = -1;
    let highestProb = 0;
    let highestPrecip = 0;

    for (let i = start; i <= end; i++) {
      const mm = precipitation[i] ?? 0;
      const prob = precipitation_probability[i] ?? 0;
      if (mm > highestPrecip) highestPrecip = mm;
      if (prob > highestProb) highestProb = prob;
      if ((mm >= 0.2 || prob >= 50) && earliestIdx === -1) earliestIdx = i;
    }

    return {
      earliestLikelyIndex: earliestIdx,
      highestProbability: highestProb,
      highestPrecipMM: highestPrecip,
      startTime: time[start],
      endTime: time[end],
    };
  }

  async function handleClick() {
    setLoading(true);
    setError("");
    setNextRain(null);
    setContaminationProbability(null);
    setWeatherData(null);

    try {
      if (!("geolocation" in navigator)) {
        throw new Error("Geolocation not available in this browser.");
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setPlace({ name: `Your location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})` });

          // 1️⃣ Fetch weather data
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation,precipitation_probability,temperature_2m,relativehumidity_2m&forecast_days=1&timezone=auto`;
          const weatherRes = await axios.get(weatherUrl);
          const hourly = weatherRes.data.hourly;
          setWeatherData(hourly);

          // 2️⃣ Analyze rain
          const rainAnalysis = analyzeRainRisk(hourly);
          if (rainAnalysis?.earliestLikelyIndex !== -1) {
            const t = new Date(hourly.time[rainAnalysis.earliestLikelyIndex]);
            setNextRain(`Rain likely around ${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
          } else {
            setNextRain("No likely rain in the next few hours.");
          }

          // 3️⃣ Prepare values for contamination API
          const start = findStartIndex(hourly.time);
          const temperatureValue = Math.round((hourly.temperature_2m[start] ?? 25) * 10) / 10;
          const humidity = Math.round(hourly.relativehumidity_2m[start] ?? 70);
          const rainfallSum = hourly.precipitation
            .slice(start, start + LOOKAHEAD_HOURS)
            .reduce((a, b) => a + (b ?? 0), 0);

          // 4️⃣ Call contamination API using Axios
          const resp = await axios.post(
            "https://water-contamination-probability.onrender.com/predict",
            {
              rainfall: Math.round(rainfallSum * 10) / 10,
              temperature: temperatureValue,
              humidity,
              turbidity: Number(turbidity),
            },
            { headers: { "Content-Type": "application/json" } }
          );

          setContaminationProbability(resp.data.contamination_probability);

        } catch (err) {
          console.error(err);
          setError(err.response?.data?.message || err.message || "Could not fetch data.");
        } finally {
          setLoading(false);
        }
      }, (geoErr) => {
        setLoading(false);
        setError(geoErr.message || "Could not get your location.");
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(err.message || "Something went wrong.");
    }
  }

  // Function to determine risk level based on probability
  const getRiskLevel = (probability) => {
    if (probability < 30) return { level: "Low", color: "text-green-600", bgColor: "bg-green-100" };
    if (probability < 60) return { level: "Moderate", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    if (probability < 80) return { level: "High", color: "text-orange-600", bgColor: "bg-orange-100" };
    return { level: "Very High", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const riskInfo = contaminationProbability !== null ? getRiskLevel(contaminationProbability) : null;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        Weather Impact Analysis
      </h2>
      
      <button
        onClick={handleClick}
        disabled={loading || turbidity === ""}
        className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center ${
          loading || turbidity === "" 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg"
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Check Contamination Risk
          </>
        )}
      </button>

      <div className="mt-6 space-y-4">
        {place && (
          <div className="flex items-center text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location: {place.name}
          </div>
        )}
        
        {nextRain && (
          <div className="flex items-center text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            {nextRain}
          </div>
        )}
        
        {contaminationProbability !== null && (
          <div className={`p-4 rounded-lg ${riskInfo.bgColor} border-l-4 ${riskInfo.color.replace('text', 'border')}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Contamination Probability</h3>
                <p className={`text-2xl font-bold ${riskInfo.color} mt-1`}>
                  {contaminationProbability}%
                </p>
                <p className={`text-sm font-medium ${riskInfo.color} mt-1`}>
                  Risk Level: {riskInfo.level}
                </p>
              </div>
              <div className="text-3xl">
                {riskInfo.level === "Low" && "✅"}
                {riskInfo.level === "Moderate" && "⚠️"}
                {riskInfo.level === "High" && "🔴"}
                {riskInfo.level === "Very High" && "🚨"}
              </div>
            </div>
            
            {weatherData && (
              <div className="mt-3 pt-3 border-t border-gray-200 border-opacity-50">
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div className="flex flex-col items-center">
                    <span>Temperature</span>
                    <span className="font-semibold">
                      {Math.round((weatherData.temperature_2m[findStartIndex(weatherData.time)] ?? 25) * 10) / 10}°C
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span>Humidity</span>
                    <span className="font-semibold">
                      {Math.round(weatherData.relativehumidity_2m[findStartIndex(weatherData.time)] ?? 70)}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span>Turbidity</span>
                    <span className="font-semibold">{turbidity} NTU</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}
      </div>

      {contaminationProbability !== null && (
        <div className="mt-4 text-xs text-gray-500">
          <p>Analysis based on current weather conditions and water turbidity readings. Higher probabilities indicate increased risk of water contamination due to environmental factors.</p>
        </div>
      )}
    </div>
  );
}