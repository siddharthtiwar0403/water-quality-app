"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Droplets } from "lucide-react";

const LOOKAHEAD_HOURS = 3;

export default function WeatherContaminationModal({ turbidity }) {
  const [loading, setLoading] = useState(false);
  const [contaminationProbability, setContaminationProbability] = useState(null);
  const [nextRain, setNextRain] = useState(null);
  const [place, setPlace] = useState(null);
  const [error, setError] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  async function handleCheck() {
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

          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation,precipitation_probability,temperature_2m,relativehumidity_2m&forecast_days=1&timezone=auto`;
          const weatherRes = await axios.get(weatherUrl);
          const hourly = weatherRes.data.hourly;
          setWeatherData(hourly);

          const rainAnalysis = analyzeRainRisk(hourly);
          if (rainAnalysis?.earliestLikelyIndex !== -1) {
            const t = new Date(hourly.time[rainAnalysis.earliestLikelyIndex]);
            setNextRain(`Rain likely around ${t.getHours()}:${t.getMinutes().toString().padStart(2, "0")}`);
          } else {
            setNextRain("No likely rain in the next few hours.");
          }

          const start = findStartIndex(hourly.time);
          const temperatureValue = Math.round((hourly.temperature_2m[start] ?? 25) * 10) / 10;
          const humidity = Math.round(hourly.relativehumidity_2m[start] ?? 70);
          const rainfallSum = hourly.precipitation
            .slice(start, start + LOOKAHEAD_HOURS)
            .reduce((a, b) => a + (b ?? 0), 0);

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

  const getRiskLevel = (probability) => {
    if (probability < 30) return { level: "Low", color: "text-green-600", bgColor: "bg-green-100" };
    if (probability < 60) return { level: "Moderate", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    if (probability < 80) return { level: "High", color: "text-orange-600", bgColor: "bg-orange-100" };
    return { level: "Very High", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const riskInfo = contaminationProbability !== null ? getRiskLevel(contaminationProbability) : null;

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Button that opens modal */}
     <button
  onClick={() => setIsOpen(true)}
  disabled={turbidity === ""}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition ${
    turbidity === "" 
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  <Droplets className="w-5 h-5" />
  Check Contamination Risk
</button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🌦️ Weather Impact Analysis
            </h2>

            <button
              onClick={handleCheck}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              {loading ? "Analyzing..." : "Run Analysis"}
            </button>

            <div className="mt-4 space-y-3">
              {place && <p className="text-sm text-gray-600">📍 Location: {place.name}</p>}
              {nextRain && <p className="text-sm text-gray-600">🌧️ {nextRain}</p>}
              {contaminationProbability !== null && (
                <div className={`p-3 rounded-lg ${riskInfo.bgColor} border-l-4 ${riskInfo.color.replace("text", "border")}`}>
                  <h3 className="font-semibold text-gray-800">Contamination Probability</h3>
                  <p className={`text-lg font-bold ${riskInfo.color}`}>
                    {contaminationProbability}% - {riskInfo.level}
                  </p>
                </div>
              )}
              {error && <p className="p-2 bg-red-100 text-red-700 rounded">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
