import React, { useState } from "react";
import {  AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";

const DiseaseScreen = ({ ph, tds, turbidity }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("https://water-disease-prediction.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pH: ph, tds, turbidity }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchPrediction();
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-md transition"
      >
        <ShieldCheck className="w-5 h-5" />
        Analyze Water Disease
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-sky-700 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-sky-500" />
              Water Risk Analysis
            </h2>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                <span className="ml-2 text-sky-600 font-medium">Analyzing...</span>
              </div>
            )}

            {/* Results */}
            {!loading && result && (
              <div>
                <p className="text-gray-700 mb-4">
                  <AlertTriangle className="w-5 h-5 inline text-yellow-500 mr-1" />
                  <span className="font-semibold">Advice:</span> {result.advice}
                </p>

                <p className="text-gray-800 mb-2">
                  <span className="font-semibold">Predicted Risk:</span>{" "}
                  <span className="text-red-600">{result.predicted_risk}</span>
                </p>

                <h3 className="font-semibold mt-4 mb-2 text-sky-700">Confidence Scores:</h3>
                <ul className="space-y-1 text-gray-600">
                  {Object.entries(result.confidence_scores).map(([key, value]) => (
                    <li key={key} className="flex justify-between border-b pb-1">
                      <span>{key.replace(/_/g, " ")}</span>
                      <span className="font-medium">{(value * 100).toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>

                <h3 className="font-semibold mt-4 mb-2 text-sky-700">Input Parameters:</h3>
                <div className="grid grid-cols-3 gap-3 text-gray-700">
                  <div className="p-2 bg-sky-50 rounded-md text-center">
                    <span className="font-semibold">pH</span>
                    <p>{result.input.pH}</p>
                  </div>
                  <div className="p-2 bg-sky-50 rounded-md text-center">
                    <span className="font-semibold">TDS</span>
                    <p>{result.input.tds} ppm</p>
                  </div>
                  <div className="p-2 bg-sky-50 rounded-md text-center">
                    <span className="font-semibold">Turbidity</span>
                    <p>{result.input.turbidity} NTU</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DiseaseScreen;
