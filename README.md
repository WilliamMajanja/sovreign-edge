# 🛡️ Sovereign Edge AI Platform

> **Own Your AI. Own Your Data. Own Your Future.**

The Sovereign Edge AI Platform is a production-grade, zero-cloud infrastructure stack designed to transform a cluster of Raspberry Pi 5 devices into a fully autonomous AI computation powerhouse. It enables enterprise-grade machine learning, federated learning, and sensor fusion locally—with **zero cloud dependency** and uncompromised privacy.

---

## 🚀 Key Features

- **Autonomous Inference**: Local execution of quantized models (ONNX/TFLite) optimized for the Pi 5's Broadcom BCM2712.
- **Federated Learning**: Collaborative model training across multiple nodes without raw data ever leaving the local mesh.
- **P2P Model Mesh**: Decentralized distribution and versioning of AI artifacts using Syncthing and IPFS protocols.
- **WireGuard Mesh Networking**: Every node is connected via an encrypted, peer-to-peer overlay network.
- **Sovereign AI Audit**: Deep infrastructure reasoning powered by Gemini 3 Flash to evaluate cluster stability and model drift.
- **NVMe-First Storage**: High-speed SSD optimization for rapid model cold-starts and large dataset handling.
- **Self-Healing Infrastructure**: Automated node recovery, health monitoring, and local log aggregation.

---

## 🔌 Hardware Requirements (Recommended)

To run the platform at production capacity, we recommend the following per node:

| Component | Specification |
| :--- | :--- |
| **SBC** | Raspberry Pi 5 (8GB or 16GB RAM) |
| **Storage** | M.2 NVMe SSD (256GB+) via NVMe HAT |
| **Cooling** | Active Cooler or high-performance passive case |
| **Power** | Official 27W USB-C Power Supply |
| **Sensors** | Sense HAT (Optional, for telemetry features) |
| **AI Accel** | Raspberry Pi AI HAT / Coral TPU (Optional) |

---

## 🛠️ Getting Started

### 1. Flash the OS
Install **Ubuntu 24.04 LTS (64-bit)** Server on your Pi 5. Ensure SSH is enabled.

### 2. Run the Sovereign Bootstrap
Execute the following command on your primary node to initialize the master control plane:

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/project-root/bootstrap.sh)"
```

*Note: You can also copy the script directly from the **Cluster Setup** tab in the management dashboard.*

---

## 📊 Technical Stack

- **Orchestration**: Lightweight `k3s` (Kubernetes)
- **Networking**: `WireGuard` P2P Mesh + `Calico` CNI
- **Storage**: `Longhorn` distributed block storage on NVMe
- **Inference**: `ONNX Runtime` + `Quantized Pipelines`
- **Learning**: `Flower` / `OpenFL` Federated Learning Frameworks
- **Observability**: `Prometheus` & `Grafana` (Local-only)
- **AI Reasoning**: `Gemini 3 Flash` (via @google/genai)

---

## 🛡️ The Sovereignty Manifesto

In an era of centralized cloud monopolies, the Sovereign Edge AI Platform stands for **Individual and Institutional Autonomy**:

1. **Privacy as Default**: No data escapes the local mesh unless explicitly configured.
2. **Zero Dependency**: The system operates indefinitely without an internet connection.
3. **Hardware Ownership**: No per-device licenses or recurring subscriptions.
4. **Verifiable Integrity**: Cryptographic signing of all AI models and platform artifacts.

---

## 📈 Dashboard & UI

The management dashboard provides real-time visualization of:
- **Mesh Health**: CPU, RAM, and Thermal metrics across all nodes.
- **Inference Volume**: Throughput and latency tracking for active engines.
- **Learning Rounds**: Progress of federated training sessions.
- **Local Logs**: Real-time event stream from the autonomous control plane.

---

## 📄 License

This project is licensed under the **Apache License 2.0** - see the LICENSE file for details. Built with ❤️ for the edge computing community.
