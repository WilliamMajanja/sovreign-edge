# 🛡️ Sovereign Edge AI Platform

<div align="center">
  <img src="https://picsum.photos/seed/sovereign/1200/400" alt="Sovereign Edge Banner" width="100%" style="border-radius: 24px; margin-bottom: 20px;" referrerPolicy="no-referrer" />

  [![License](https://img.shields.io/badge/License-Apache%202.0-emerald.svg?style=for-the-badge)](LICENSE)
  [![Platform](https://img.shields.io/badge/Platform-Raspberry%20Pi%205-red.svg?style=for-the-badge)](https://www.raspberrypi.com/products/raspberry-pi-5/)
  [![Stack](https://img.shields.io/badge/Stack-TypeScript%20%2F%20Vite%20%2F%20Tailwind-blue.svg?style=for-the-badge)](https://vitejs.dev/)
  [![Security](https://img.shields.io/badge/Security-Zero%20Cloud-black.svg?style=for-the-badge)](SECURITY.md)
</div>

---

### 🌐 **Own Your AI. Own Your Data. Own Your Future.**

The **Sovereign Edge AI Platform** is a production-grade, zero-cloud infrastructure stack designed to transform a cluster of **Raspberry Pi 5** devices into a fully autonomous AI computation powerhouse. Optimized for **Raspbian Trixie (Debian 12)**, it enables enterprise-grade machine learning, federated learning, and **Token-Free Local LLM** execution—with **zero cloud dependency** and uncompromised privacy.

---

## 🚀 Core Capabilities

| Feature | Description |
| :--- | :--- |
| **Autonomous Inference** | Local execution of quantized models (ONNX/TFLite) optimized for the Pi 5's Broadcom BCM2712. |
| **Local LLM (Token-Free)** | Native integration with **Ollama** and **AirLLM** for running 7B to 70B+ parameter models locally. |
| **Agent Swarm (m.402)** | Decentralized collective of autonomous agents using **L402 (m.402)** micro-payments for resource allocation. |
| **Federated Learning** | Collaborative model training across multiple nodes without raw data ever leaving the local mesh. |
| **P2P Model Mesh** | Decentralized distribution and versioning of AI artifacts using Syncthing and IPFS protocols. |
| **Moltbook Port** | Secure, encrypted P2P communication layer for the Agent Cartel and Cabal directives. |
| **Sovereign AI Audit** | Deep infrastructure reasoning powered by **Gemini 3 Flash** to evaluate cluster stability. |
| **Economic Settlement** | Real-time Mesh Transaction Ledger for automated agent-to-agent resource bidding. |

---

## 🔌 Hardware Requirements (Production Grade)

To run the platform at production capacity, we recommend the following per node:

- **SBC**: Raspberry Pi 5 (**16GB RAM preferred**)
- **OS**: **Raspbian Trixie (64-bit)**
- **Storage**: M.2 NVMe SSD (512GB+) via NVMe HAT
- **Cooling**: Active Cooler or high-performance passive case
- **Power**: Official 27W USB-C Power Supply
- **AI Accel**: Raspberry Pi AI HAT / Coral TPU (Optional)

---

## 🛠️ Quick Start (Local Dashboard Evaluation)

The dashboard is designed for easy local evaluation. Follow these steps to run the control plane on your development machine:

### 1. Installation
```bash
git clone https://github.com/project-root/sovereign-edge-ai.git
cd sovereign-edge-ai
npm install
```

### 2. Environment Setup
Create a `.env` file with your Gemini API Key for the Sovereign Audit features:
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Development Mode
```bash
npm run dev
```
The dashboard will launch at `http://localhost:3000`. It includes **calibrated mock data** that simulates a live Raspberry Pi 5 cluster, Ollama inference, and Federated Learning rounds.

---

## 📊 Technical Architecture

- **Orchestration**: Lightweight `k3s` (Kubernetes)
- **Local LLM**: `Ollama` (GGUF) + `AirLLM` (Layer-wise optimization)
- **Agent Economy**: `m.402` (L402) Lightning-based micro-payments
- **Networking**: `WireGuard` P2P Mesh + `Calico` CNI
- **Storage**: `Longhorn` distributed block storage on NVMe
- **Inference**: `ONNX Runtime` + `Quantized Pipelines`
- **Learning**: `Flower` / `OpenFL` Federated Learning Frameworks
- **Observability**: `Prometheus` & `Grafana` (Local-only)
- **AI Reasoning**: `Gemini 3 Flash` (via @google/genai)
- **Swarm Protocol**: Reputation-weighted consensus (PoS)

---

## 🛡️ The Sovereignty Manifesto

In an era of centralized cloud monopolies, we stand for **Individual and Institutional Autonomy**:

1. **Privacy as Default**: No data escapes the local mesh unless explicitly configured.
2. **Zero Dependency**: The system operates indefinitely without an internet connection.
3. **Hardware Ownership**: No per-device licenses or recurring subscriptions.
4. **Verifiable Integrity**: Cryptographic signing of all AI models and platform artifacts.

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ❤️ for the edge computing community.
</div>
