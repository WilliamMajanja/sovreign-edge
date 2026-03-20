
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const analyzeClusterHealth = async (clusterState: any) => {
  const ai = getAIClient();
  const prompt = `
    Perform an ADVANCED SOVEREIGN AUDIT of the following Raspberry Pi 5 Edge Cluster:
    ${JSON.stringify(clusterState, null, 2)}
    
    Context:
    - This is a zero-cloud platform running industrial automation and video analytics.
    
    Focus on:
    1. Video Pipeline Impact: Evaluate FPS stability vs thermal loads on the Agents.
    2. Automation Safety: Are there conflicting rules in the Edge Automation engine?
    3. Storage Resilience: Assess the frequency and integrity of Snapshot Vault backups.
    4. Mesh Load: Determine if P2P sync is impacting inference latency during model updates.
    
    Format:
    Use professional Markdown. Focus on actionable local optimizations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Sovereign intelligence engine unreachable.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Analysis failed. Ensure the gateway node has temporary upstream access for this specific transaction.";
  }
};
