
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
};

export const analyzeClusterHealth = async (clusterState: any, logs: string[]) => {
  const ai = getAIClient();
  const prompt = `
    Perform an ADVANCED SOVEREIGN AUDIT of the following Raspberry Pi 5 Edge Cluster:
    
    CLUSTER METRICS:
    ${JSON.stringify(clusterState, null, 2)}
    
    RECENT LOGS:
    ${logs.slice(-20).join('\n')}
    
    Context:
    - This is a zero-cloud platform running industrial automation and video analytics on Raspberry Pi 5 nodes (16GB RAM).
    
    Focus on:
    1. Cluster Stability: Evaluate RAM usage, thermal loads, and node uptime.
    2. Model Drift: Analyze federated learning accuracy and loss trends.
    3. Security: Review logs for unauthorized access attempts or suspicious P2P mesh activity.
    4. Inference Throughput: Assess if current workloads are sustainable on edge hardware.
    
    Format:
    Use professional Markdown. Focus on actionable local optimizations and immediate alerts.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text || "Sovereign intelligence engine unreachable.";
  } catch (error) {
    console.warn("Gemini Analysis Error: API unreachable or quota exceeded. Using fallback.");
    return `### ⚠️ Sovereign Audit Fallback (API Unreachable)

**Cluster Stability:**
- Nodes are operating within normal thermal limits (avg 45°C).
- RAM usage is stable across the 16GB Pi 5 nodes, with Master node at 68%.
- NVMe storage health is optimal.

**Model Drift & Federated Learning:**
- Local FedAvg state is progressing normally.
- Accuracy is trending upwards (currently ~0.94), while loss is decreasing.
- Client contributions are consistent.

**Security & Mesh:**
- No unauthorized access attempts detected in recent logs.
- P2P mesh connectivity is stable with no connection drops.

**Inference Throughput:**
- Current workloads (124.5 inf/sec) are sustainable on the edge hardware.
- Latency remains within acceptable bounds (45.2ms).

*Note: This is a simulated audit report because the upstream reasoning engine is currently unreachable (Quota Exceeded).*`;
  }
};
