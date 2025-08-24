// lib/cohereApi.js
export const getAiResponse = async ({ type, ph, tds, turbidity, temperature }) => {
  let prompt = "";

  switch (type) {
    case "prevention":
      prompt = `Water Quality Parameters:
pH: ${ph}, TDS: ${tds} ppm, Turbidity: ${turbidity} NTU, Temperature: ${temperature}°C.

Give me prevention recommendations to keep this water safe.`;
      break;
    case "filtration":
      prompt = `Water Quality Parameters:
pH: ${ph}, TDS: ${tds} ppm, Turbidity: ${turbidity} NTU, Temperature: ${temperature}°C.

Suggest the best filtration methods and systems for this water.`;
      break;
    case "cost":
      prompt = `Water Quality Parameters:
pH: ${ph}, TDS: ${tds} ppm, Turbidity: ${turbidity} NTU, Temperature: ${temperature}°C.

Estimate the cost breakdown for a purification system suitable for this water.`;
      break;
    default:
      throw new Error("Invalid type provided to getAiResponse");
  }

  try {
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer 6xr5q0MxmzkQMq8tswl7KCuR5PWj9LpFXYk8eEWm` 
      },
      body: JSON.stringify({
        model: "command-r-plus",
        prompt,
        max_tokens: 400,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.generations?.[0]?.text || "No AI response received.";
  } catch (error) {
    console.error("Error fetching AI advice:", error);
    throw new Error("Failed to fetch AI response");
  }
};
