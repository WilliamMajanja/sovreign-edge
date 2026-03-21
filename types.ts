
export interface PrometheusMetric {
  metric: Record<string, string>;
  value: [number, string];
}

export interface PrometheusResponse {
  status: string;
  data: {
    resultType: string;
    result: PrometheusMetric[];
  };
}

export interface ServiceStatus {
  name: string;
  status: 'Online' | 'Offline' | 'Warning';
  endpoint: string;
  latency?: number;
}

export interface NodeStats {
  id: string;
  name: string;
  role: 'Master' | 'Agent';
  status: 'Online' | 'Offline' | 'Warning';
  cpuUsage: number;
  memoryUsage: number;
  temp: number;
  nvmeStatus: string;
  uptime: string;
  ip: string;
  meshIp: string;
  encrypted: boolean;
  ramTotal: number; // in GB
  ramUsed: number; // in GB
  loadAverage?: [number, number, number];
  diskUsage?: number;
}

export interface InferenceMetric {
  timestamp: string;
  latency: number;
  throughput: number;
  activeModels: number;
}

export interface LocalModel {
  id: string;
  name: string;
  version: string;
  size: string;
  hash: string;
  status: 'Verified' | 'Syncing' | 'Corrupt';
}

export interface FederatedRound {
  round: number;
  accuracy: number;
  loss: number;
  clients: number;
  timestamp: string;
}

export interface ClientContribution {
  nodeId: string;
  accuracy: number;
  latency: string;
  samples: number;
  status: 'Aggregating' | 'Idle' | 'Local-Training';
}

export interface P2PPeer {
  id: string;
  type: 'Syncthing' | 'IPFS';
  address: string;
  traffic: string;
  latency: string;
}

export interface TelemetryData {
  temp: number;
  humidity: number;
  pressure: number;
  accel: { x: number; y: number; z: number };
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: 'Active' | 'Paused';
}

export interface VideoStream {
  id: string;
  nodeId: string;
  status: 'Streaming' | 'Idle' | 'Detection Active';
  fps: number;
  resolution: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  size: string;
  type: 'Full System' | 'Model Weights' | 'Telemetry DB';
  checksum: string;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}

export interface OllamaStatus {
  model: string;
  status: 'Running' | 'Idle' | 'Loading';
  vram: string;
  tokensPerSec: number;
}

export interface AirLLMStatus {
  compression: string;
  memorySaved: string;
  active: boolean;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  NODES = 'nodes',
  INFERENCE = 'inference',
  FEDERATED = 'federated_learning',
  MARKETPLACE = 'marketplace',
  TOPOLOGY = 'topology',
  P2P = 'p2p_sync',
  VIDEO = 'video_analytics',
  AUTOMATION = 'edge_automation',
  BACKUP = 'snapshots',
  TELEMETRY = 'telemetry',
  LOGS = 'logs',
  AI_INSIGHTS = 'ai_insights',
  SETUP = 'cluster_setup',
  AGENT_SWARM = 'agent_swarm',
  LOCAL_LLM = 'local_llm',
  MOLTBOOK = 'moltbook'
}

export interface AgentSwarmNode {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Idle' | 'Thinking' | 'Collaborating' | 'Payment-Required';
  contribution: number;
  lastTask: string;
  walletBalance: number; // in Satoshis or micro-credits
  reputation: number; // 0-100
}

export interface SwarmTask {
  id: string;
  title: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Awaiting-Payment';
  assignedTo: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  cost: number; // m.402 cost
  invoice?: string; // L402 invoice string
}

export interface AgentTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  status: 'Pending' | 'Settled' | 'Failed';
  memo: string;
}

export interface MoltbookMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  encrypted: boolean;
  type: 'Broadcast' | 'Direct' | 'Cabal-Directive';
}

export interface FlowerRoundResponse {
  round_id: number;
  metrics: {
    accuracy: number;
    loss: number;
  };
  num_clients: number;
  timestamp: string;
}

export interface FlowerClientsResponse {
  clients: {
    client_id: string;
    local_accuracy: number;
    latency_ms: number;
    num_samples: number;
    status: 'Aggregating' | 'Idle' | 'Local-Training';
  }[];
}

export interface ONNXStatsResponse {
  model_stats: {
    model_name: string;
    inference_stats: {
      success: { count: number };
      compute_infer: { ns: number };
    };
  }[];
}

export interface CartelStatus {
  consensusLevel: number;
  activeDirectives: number;
  cabalEncryption: 'AES-256-GCM' | 'Quantum-Resistant';
  integrity: number;
}
