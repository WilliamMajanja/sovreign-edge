
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
}

export interface InferenceMetric {
  timestamp: string;
  latency: number;
  throughput: number;
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

export enum AppTab {
  DASHBOARD = 'dashboard',
  NODES = 'nodes',
  INFERENCE = 'inference',
  FEDERATED = 'federated_learning',
  MARKETPLACE = 'marketplace',
  P2P = 'p2p_sync',
  TELEMETRY = 'telemetry',
  LOGS = 'logs',
  AI_INSIGHTS = 'ai_insights',
  SETUP = 'cluster_setup'
}
