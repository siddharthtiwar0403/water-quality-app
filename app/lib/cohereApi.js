// lib/cohereApi.js
export const getAiResponse = async ({ type, ph, tds, turbidity, temperature }) => {
  let prompt = "";

  switch (type) {
    case "prevention":
      prompt = `Water Quality:
pH ${ph}, TDS ${tds} ppm, Turbidity ${turbidity} NTU, Temp ${temperature}°C.
Give 3-5 short, point-wise prevention tips (use bullet points).`;
      break;

    case "filtration":
      prompt = `Water Quality:
pH ${ph}, TDS ${tds} ppm, Turbidity ${turbidity} NTU, Temp ${temperature}°C.
Suggest 3-5 suitable filtration methods as concise bullet points.`;
      break;

     case "cost":
      prompt = `Water Quality:
pH ${ph}, TDS ${tds} ppm, Turbidity ${turbidity} NTU, Temp ${temperature}°C.
Provide a point-wise cost breakdown for a suitable purification system.
⚡ Show all costs in Indian Rupees (₹) with approximate values. Keep it short.`;
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
        max_tokens: 300, // reduced since you only want concise bullets
        temperature: 0.5 // lower temp for more focused, structured answers
      })
    });

    const data = await response.json();
    return data.generations?.[0]?.text?.trim() || "No AI response received.";
  } catch (error) {
    console.error("Error fetching AI advice:", error);
    throw new Error("Failed to fetch AI response");
  }
};
