/// <reference types="vite/client" />

export const PROMETHEUS_URL = import.meta.env.VITE_PROMETHEUS_URL || 'http://localhost:9090';
export const FLOWER_URL = import.meta.env.VITE_FLOWER_URL || 'http://localhost:8080';
export const LOG_WS_URL = import.meta.env.VITE_LOG_WS_URL || 'ws://localhost:8081/logs';

import { NodeStats, FederatedRound, ClientContribution } from '../types';

export async function fetchClusterMetrics(): Promise<NodeStats[]> {
  try {
    // Example Prometheus query for CPU usage
    const cpuRes = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=node_cpu_seconds_total`);
    const cpuData = await cpuRes.json();
    
    // Example Prometheus query for Memory usage
    const memRes = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=node_memory_MemAvailable_bytes`);
    const memData = await memRes.json();

    // Example Prometheus query for Temperature
    const tempRes = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=node_hwmon_temp_celsius`);
    const tempData = await tempRes.json();

    // In a real scenario, we would map the Prometheus vector results to our NodeStats array.
    // Here we parse the response assuming a standard node_exporter format.
    
    const nodes: NodeStats[] = [];
    
    // Assuming we have a list of instances from the Prometheus data
    if (cpuData.status === 'success' && cpuData.data.result) {
      cpuData.data.result.forEach((result: any, index: number) => {
        const instance = result.metric.instance || `pi-0${index + 1}`;
        
        // Find corresponding memory and temp data
        const memResult = memData.data?.result?.find((r: any) => r.metric.instance === instance);
        const tempResult = tempData.data?.result?.find((r: any) => r.metric.instance === instance);
        
        // Calculate RAM usage based on 16GB Pi 5
        const totalRamBytes = 16 * 1024 * 1024 * 1024;
        const availableRamBytes = memResult ? parseFloat(memResult.value[1]) : totalRamBytes;
        const memoryUsage = ((totalRamBytes - availableRamBytes) / totalRamBytes) * 100;

        nodes.push({
          id: instance,
          name: `Sovereign-Node-${instance}`,
          role: index === 0 ? 'Master' : 'Agent',
          status: 'Online',
          cpuUsage: parseFloat(result.value[1]) % 100, // Simplified CPU calculation
          memoryUsage: memoryUsage,
          temp: tempResult ? parseFloat(tempResult.value[1]) : 45,
          nvmeStatus: 'Healthy',
          uptime: 'Live',
          ip: instance.split(':')[0],
          meshIp: `10.99.0.${index + 1}`,
          encrypted: true
        });
      });
    }
    
    return nodes;
  } catch (error) {
    console.warn("Failed to fetch Prometheus metrics, falling back to mock data:", error);
    return [
      { id: 'pi-01', name: 'Sovereign-Node-01', role: 'Master', status: 'Online', cpuUsage: 42, memoryUsage: 68, temp: 45, nvmeStatus: 'Healthy', uptime: '14d 2h', ip: '192.168.1.101', meshIp: '10.99.0.1', encrypted: true },
      { id: 'pi-02', name: 'Sovereign-Node-02', role: 'Agent', status: 'Online', cpuUsage: 85, memoryUsage: 92, temp: 58, nvmeStatus: 'Healthy', uptime: '14d 2h', ip: '192.168.1.102', meshIp: '10.99.0.2', encrypted: true },
      { id: 'pi-03', name: 'Sovereign-Node-03', role: 'Agent', status: 'Online', cpuUsage: 12, memoryUsage: 45, temp: 41, nvmeStatus: 'Healthy', uptime: '14d 2h', ip: '192.168.1.103', meshIp: '10.99.0.3', encrypted: true },
      { id: 'pi-04', name: 'Sovereign-Node-04', role: 'Agent', status: 'Offline', cpuUsage: 0, memoryUsage: 0, temp: 0, nvmeStatus: 'Offline', uptime: '0d 0h', ip: '192.168.1.104', meshIp: '10.99.0.4', encrypted: true },
    ];
  }
}

export async function fetchFederatedRounds(): Promise<FederatedRound[]> {
  try {
    const res = await fetch(`${FLOWER_URL}/api/v1/rounds`);
    if (!res.ok) throw new Error('Failed to fetch rounds');
    const data = await res.json();
    return data.rounds.map((r: any) => ({
      round: r.round_id,
      accuracy: r.metrics.accuracy,
      loss: r.metrics.loss,
      clients: r.num_clients,
      timestamp: new Date(r.timestamp).toLocaleTimeString().slice(0, 5)
    }));
  } catch (error) {
    console.warn("Failed to fetch Federated Rounds, falling back to mock data:", error);
    return Array.from({ length: 10 }).map((_, i) => ({
      round: i + 1,
      accuracy: 0.85 + (i * 0.01),
      loss: 0.5 - (i * 0.02),
      clients: 3,
      timestamp: new Date(Date.now() - (10 - i) * 60000).toLocaleTimeString().slice(0, 5)
    }));
  }
}

export async function fetchFederatedClients(): Promise<ClientContribution[]> {
  try {
    const res = await fetch(`${FLOWER_URL}/api/v1/clients`);
    if (!res.ok) throw new Error('Failed to fetch clients');
    const data = await res.json();
    return data.clients.map((c: any) => ({
      nodeId: c.client_id,
      accuracy: c.local_accuracy,
      latency: `${c.latency_ms}ms`,
      samples: c.num_samples,
      status: c.status
    }));
  } catch (error) {
    console.warn("Failed to fetch Federated Clients, falling back to mock data:", error);
    return [
      { nodeId: 'pi-01', accuracy: 0.92, latency: '12ms', samples: 1024, status: 'Aggregating' },
      { nodeId: 'pi-02', accuracy: 0.89, latency: '15ms', samples: 2048, status: 'Local-Training' },
      { nodeId: 'pi-03', accuracy: 0.95, latency: '8ms', samples: 512, status: 'Idle' },
    ];
  }
}

export async function fetchInferenceStats(): Promise<any> {
  try {
    // Example ONNX Runtime / Triton inference endpoint
    const res = await fetch(`http://localhost:8000/v2/models/stats`);
    if (!res.ok) throw new Error('Failed to fetch inference stats');
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Failed to fetch Inference Stats, falling back to mock data:", error);
    return {
      throughput: 124.5,
      latency: 45.2,
      activeModels: 3
    };
  }
}

export function subscribeToLogs(onMessage: (log: string) => void, onError: (err: any) => void): () => void {
  try {
    const ws = new WebSocket(LOG_WS_URL);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(`[${data.level}] ${data.service}: ${data.message}`);
      } catch (e) {
        onMessage(event.data);
      }
    };

    ws.onerror = (error) => {
      console.warn("WebSocket log stream error, falling back to mock logs:", error);
      // Fallback to mock logs
      const interval = setInterval(() => {
        const services = ['k3s', 'flower', 'onnx', 'mesh'];
        const levels = ['INFO', 'WARN', 'DEBUG'];
        const service = services[Math.floor(Math.random() * services.length)];
        const level = levels[Math.floor(Math.random() * levels.length)];
        onMessage(`[${level}] ${service}: Simulated log entry at ${new Date().toISOString()}`);
      }, 2000);
      
      // Override the close function to clear the interval
      ws.close = () => clearInterval(interval);
    };

    return () => {
      ws.close();
    };
  } catch (e) {
    console.warn("Failed to connect to WebSocket, falling back to mock logs:", e);
    const interval = setInterval(() => {
      const services = ['k3s', 'flower', 'onnx', 'mesh'];
      const levels = ['INFO', 'WARN', 'DEBUG'];
      const service = services[Math.floor(Math.random() * services.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      onMessage(`[${level}] ${service}: Simulated log entry at ${new Date().toISOString()}`);
    }, 2000);
    return () => clearInterval(interval);
  }
}
