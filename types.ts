
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

export enum AppTab {
  DASHBOARD = 'dashboard',
  NODES = 'nodes',
  INFERENCE = 'inference',
  FEDERATED = 'federated_learning',
  MARKETPLACE = 'marketplace',
  P2P = 'p2p_sync',
  VIDEO = 'video_analytics',
  AUTOMATION = 'edge_automation',
  BACKUP = 'snapshots',
  TELEMETRY = 'telemetry',
  LOGS = 'logs',
  AI_INSIGHTS = 'ai_insights',
  SETUP = 'cluster_setup',
  OPENCLAW = 'openclaw'
}
