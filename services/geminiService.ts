
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const analyzeClusterHealth = async (clusterState: any) => {
  const ai = getAIClient();
  const prompt = `
    Perform a SOVEREIGN ANALYSIS of the following Raspberry Pi 5 Edge Cluster:
    ${JSON.stringify(clusterState, null, 2)}
    
    The user is running an offline-first, zero-cloud platform. Provide technical optimization recommendations focusing on:
    1. Federated Learning efficiency and client contribution balance.
    2. NVMe thermal throttling vs. Model Marketplace sync speeds.
    3. P2P Mesh network (WireGuard) stability.
    4. Hardware health (CPU/Temp) and energy consumption.
    
    Ensure suggestions are purely local (no cloud APIs). Keep response technical and use Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Unable to generate sovereign insights at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Analysis failed. Ensure your platform has external gateway access for this specific request or check API configuration.";
  }
};
