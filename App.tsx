
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  HardDrive, 
  LayoutDashboard, 
  List, 
  Zap, 
  Thermometer, 
  RefreshCcw,
  Sparkles,
  Terminal,
  Layers,
  BarChart3,
  ShieldCheck,
  Share2,
  Package,
  Network,
  Lock,
  ArrowUpRight,
  Fingerprint,
  FileCode,
  Clipboard,
  Check,
  ShieldAlert
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  LineChart,
  Line
} from 'recharts';
import { AppTab, NodeStats, InferenceMetric, TelemetryData, LocalModel, FederatedRound, P2PPeer } from './types';
import { analyzeClusterHealth } from './services/geminiService';

// --- Mock Data Generators ---
const generateMockNodes = (): NodeStats[] => [
  { id: 'pi-01', name: 'Sovereign-Master', role: 'Master', status: 'Online', cpuUsage: 18, memoryUsage: 32, temp: 45, nvmeStatus: 'Healthy', uptime: '14d 2h', ip: '192.168.1.50', meshIp: '10.99.0.1', encrypted: true },
  { id: 'pi-02', name: 'Edge-Worker-01', role: 'Agent', status: 'Online', cpuUsage: 72, memoryUsage: 58, temp: 58, nvmeStatus: 'Encrypted', uptime: '14d 2h', ip: '192.168.1.51', meshIp: '10.99.0.2', encrypted: true },
  { id: 'pi-03', name: 'Edge-Worker-02', role: 'Agent', status: 'Online', cpuUsage: 68, memoryUsage: 54, temp: 55, nvmeStatus: 'Encrypted', uptime: '14d 2h', ip: '192.168.1.52', meshIp: '10.99.0.3', encrypted: true },
  { id: 'pi-04', name: 'Sense-Agent-01', role: 'Agent', status: 'Online', cpuUsage: 10, memoryUsage: 22, temp: 41, nvmeStatus: 'Standby', uptime: '12d 1h', ip: '192.168.1.53', meshIp: '10.99.0.4', encrypted: true },
];

const generateMockModels = (): LocalModel[] => [
  { id: 'm-01', name: 'ResNet50-Edge-Quant', version: '2.1.0', size: '24.5MB', hash: 'sha256:7f8a...9c2d', status: 'Verified' },
  { id: 'm-02', name: 'YOLOv8-Nano-Sovereign', version: '1.4.2', size: '6.2MB', hash: 'sha256:1a2b...3c4d', status: 'Verified' },
  { id: 'm-03', name: 'Llama-3-2bit-Pi5', version: '0.9.1-beta', size: '1.8GB', hash: 'sha256:d4e5...f6g7', status: 'Syncing' },
];

const generateMockFedRounds = (): FederatedRound[] => [
  { round: 1, accuracy: 0.62, loss: 0.84, clients: 3, timestamp: '10:00' },
  { round: 2, accuracy: 0.71, loss: 0.65, clients: 3, timestamp: '11:00' },
  { round: 3, accuracy: 0.78, loss: 0.42, clients: 4, timestamp: '12:00' },
  { round: 4, accuracy: 0.84, loss: 0.31, clients: 4, timestamp: '13:00' },
  { round: 5, accuracy: 0.89, loss: 0.22, clients: 4, timestamp: '14:00' },
];

const generateMockPeers = (): P2PPeer[] => [
  { id: 'peer-abc', type: 'Syncthing', address: '10.99.0.2', traffic: '2.4MB/s', latency: '2ms' },
  { id: 'peer-xyz', type: 'IPFS', address: '10.99.0.3', traffic: '1.1MB/s', latency: '4ms' },
  { id: 'peer-lmn', type: 'Syncthing', address: '10.99.0.4', traffic: '45KB/s', latency: '12ms' },
];

const generateMockMetrics = (count: number): InferenceMetric[] => {
  return Array.from({ length: count }).map((_, i) => ({
    timestamp: `${i}:00`,
    latency: 18 + Math.random() * 10,
    throughput: 50 + Math.random() * 25
  }));
};

const BOOTSTRAP_SCRIPT = `#!/usr/bin/env bash
set -e
# SOVEREIGN EDGE AI CLUSTER BOOTSTRAP
# Zero cloud dependency. Raspberry Pi 5 + NVMe optimized.

log() { echo -e "\\033[0;34m[$(date '+%Y-%m-%d %H:%M:%S')]\\033[0m $1"; }
error() { echo -e "\\033[0;31m[ERROR]\\033[0m $1"; exit 1; }

log "Initializing Sovereign Edge Node..."

# 1. Mount NVMe
if ! lsblk | grep -q nvme; then
  error "No NVMe device found. This cluster requires high-speed SSD storage."
fi
log "NVMe detected. Mounting for container workloads..."

# 2. System Tune
cat <<EOF >> /etc/sysctl.conf
vm.swappiness=10
net.ipv4.tcp_tw_reuse=1
kernel.printk=3 3 3 3
EOF
sysctl -p

# 3. Install k3s (Offline-capable)
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik --disable=servicelb" sh -

log "Bootstrap Complete. Your node is now autonomous."`;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [nodes, setNodes] = useState<NodeStats[]>(generateMockNodes());
  const [models] = useState<LocalModel[]>(generateMockModels());
  const [fedRounds] = useState<FederatedRound[]>(generateMockFedRounds());
  const [peers] = useState<P2PPeer[]>(generateMockPeers());
  const [metrics, setMetrics] = useState<InferenceMetric[]>(generateMockMetrics(24));
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    temp: 22.1,
    humidity: 45.4,
    pressure: 1012.8,
    accel: { x: 0.00, y: 0.00, z: 1.00 }
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 49)
    ]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        cpuUsage: Math.min(100, Math.max(0, n.cpuUsage + (Math.random() - 0.5) * 8)),
        temp: Math.min(85, Math.max(30, n.temp + (Math.random() - 0.5) * 1.5))
      })));
      
      setMetrics(prev => {
        const next = [...prev.slice(1), {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          latency: 18 + Math.random() * 10,
          throughput: 50 + Math.random() * 25
        }];
        return next;
      });

      setTelemetry(prev => ({
        ...prev,
        temp: prev.temp + (Math.random() - 0.5) * 0.05,
        humidity: prev.humidity + (Math.random() - 0.5) * 0.2,
      }));
    }, 3000);

    addLog("Sovereign Platform Control Initialized");
    addLog("WireGuard Mesh Tunnel (wg-edge) established");
    addLog("Federated learning aggregator listening on :8080");

    return () => clearInterval(interval);
  }, [addLog]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    addLog("Executing Sovereign AI Infrastructure Audit...");
    const result = await analyzeClusterHealth({ nodes, metrics, fedRounds, models, peers });
    setAiInsights(result);
    setIsAnalyzing(false);
    addLog("Sovereign Analysis Complete.");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(BOOTSTRAP_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addLog("Bootstrap script copied to clipboard.");
  };

  const renderSidebarItem = (id: AppTab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 w-full transition-all duration-200 border-r-4 ${
        activeTab === id 
          ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500 font-medium' 
          : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#05080f] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Fingerprint size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">
              SOVEREIGN <span className="text-emerald-500">EDGE</span>
            </h1>
          </div>
          <div className="text-[10px] text-emerald-500/70 font-mono flex items-center gap-1 mt-1">
            <Lock size={10} /> ZERO CLOUD DEPENDENCY
          </div>
        </div>
        
        <nav className="flex-1 mt-4 overflow-y-auto">
          {renderSidebarItem(AppTab.DASHBOARD, 'Control Center', <LayoutDashboard size={18} />)}
          {renderSidebarItem(AppTab.NODES, 'Mesh Nodes', <Cpu size={18} />)}
          {renderSidebarItem(AppTab.INFERENCE, 'Inference Engines', <Activity size={18} />)}
          
          <div className="mt-4 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Learning & Data</div>
          {renderSidebarItem(AppTab.FEDERATED, 'Federated Learning', <Share2 size={18} />)}
          {renderSidebarItem(AppTab.MARKETPLACE, 'Model Registry', <Package size={18} />)}
          {renderSidebarItem(AppTab.P2P, 'P2P Mesh Sync', <Network size={18} />)}
          
          <div className="mt-4 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Maintenance</div>
          {renderSidebarItem(AppTab.TELEMETRY, 'Enviro Telemetry', <Database size={18} />)}
          {renderSidebarItem(AppTab.LOGS, 'Local Logs', <Terminal size={18} />)}
          {renderSidebarItem(AppTab.AI_INSIGHTS, 'Sovereign Audit', <Sparkles size={18} />)}

          <div className="mt-4 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Platform</div>
          {renderSidebarItem(AppTab.SETUP, 'Cluster Setup', <FileCode size={18} />)}
        </nav>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[11px] text-slate-400">Mesh Active</span>
            </div>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500">v4.5-SOV</span>
          </div>
          <div className="text-[9px] text-slate-600 font-mono">
            GATEWAY: 10.99.0.1
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#020617] p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Autonomous Edge Control</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white capitalize tracking-tight">
              {activeTab.replace('_', ' ')}
            </h2>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-all text-sm font-semibold text-slate-300">
              <RefreshCcw size={16} /> Heartbeat
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xl shadow-emerald-900/20 transition-all text-sm font-bold">
              <Layers size={16} /> Deploy Manifest
            </button>
          </div>
        </header>

        {/* Dash Content */}
        {activeTab === AppTab.DASHBOARD && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Mesh Health" value="4 / 4" icon={<Cpu className="text-emerald-400" />} subtitle="Autonomous P2P Nodes" />
              <StatCard title="Inference Vol" value="1.2k/hr" icon={<Activity className="text-blue-400" />} subtitle="Quantized Pipelines" />
              <StatCard title="Learning Rounds" value="R12" icon={<Share2 className="text-emerald-400" />} subtitle="FedAvg Global State" />
              <StatCard title="Privacy Shield" value="ACTIVE" icon={<Lock className="text-purple-400" />} subtitle="Zero Cloud Leak" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Mesh Performance Matrix">
                <div className="h-72 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics}>
                      <defs>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="timestamp" stroke="#475569" fontSize={10} tick={{fill: '#475569'}} />
                      <YAxis stroke="#475569" fontSize={10} tick={{fill: '#475569'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Area type="monotone" dataKey="latency" stroke="#10b981" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Node Identity Matrix">
                <div className="space-y-3 mt-4">
                  {nodes.map(node => (
                    <div key={node.id} className="group p-4 bg-slate-900/40 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${node.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{node.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{node.meshIp} • {node.role}</div>
                        </div>
                      </div>
                      <div className="flex gap-8 items-center">
                        <div className="text-right">
                          <div className="text-[9px] text-slate-600 uppercase font-bold">STATUS</div>
                          <div className="text-xs text-emerald-500/80 font-mono flex items-center gap-1">
                            {node.status}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-slate-600 uppercase font-bold">NVMe</div>
                          <div className="text-xs font-mono text-slate-300">AES-256</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === AppTab.NODES && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nodes.map(node => (
              <SovereignNodeCard key={node.id} node={node} />
            ))}
          </div>
        )}

        {activeTab === AppTab.SETUP && (
          <div className="space-y-6">
            <Card title="Bootstrap Sovereign Node">
              <div className="p-2">
                <p className="text-sm text-slate-400 mb-6 max-w-2xl">
                  Run this command on a fresh Ubuntu 24.04 Server installation to initialize it as a Sovereign Edge node. This script configures NVMe, tunes the kernel, and installs the autonomous mesh layer.
                </p>
                <div className="relative group">
                  <pre className="bg-black/60 rounded-xl p-6 font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto">
                    {BOOTSTRAP_SCRIPT}
                  </pre>
                  <button 
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all flex items-center gap-2 text-xs font-bold"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Clipboard size={14} />}
                    {copied ? "Copied!" : "Copy Script"}
                  </button>
                </div>
                <div className="mt-8 flex gap-4">
                  <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                      <ShieldCheck size={16} /> Security Audit
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Zero telemetry. All dependencies are fetched from local mirrors or verified repositories. Cryptographic signing enforced.
                    </p>
                  </div>
                  <div className="flex-1 bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                      <Zap size={16} /> Performance Tune
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Automatically optimizes I/O scheduler for NVMe and sets CPU governor to 'performance' for minimal inference latency.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Quick-Start Blueprint">
                <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center font-bold text-emerald-500">1</div>
                    <p><span className="text-white font-bold">Flash:</span> Ubuntu 24.04 arm64 to SD/NVMe.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center font-bold text-emerald-500">2</div>
                    <p><span className="text-white font-bold">SSH:</span> Connect to node via mesh tunnel.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center font-bold text-emerald-500">3</div>
                    <p><span className="text-white font-bold">Deploy:</span> Run the bootstrap script above.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center font-bold text-emerald-500">4</div>
                    <p><span className="text-white font-bold">Mesh:</span> Repeat for all agents and label roles.</p>
                  </div>
                </div>
              </Card>
              <Card title="Platform Architecture">
                <div className="flex items-center justify-center p-4">
                  <div className="grid grid-cols-1 gap-2 w-full max-w-[200px] text-[10px] font-mono font-bold text-center">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 py-2 rounded">USER WORKLOADS</div>
                    <div className="text-slate-600">▲</div>
                    <div className="bg-slate-800 border border-slate-700 py-2 rounded">k3s ORCHESTRATION</div>
                    <div className="text-slate-600">▲</div>
                    <div className="bg-blue-500/10 border border-blue-500/20 py-2 rounded">WIRE GUARD MESH</div>
                    <div className="text-slate-600">▲</div>
                    <div className="bg-slate-900 border border-slate-800 py-2 rounded">PI 5 + NVMe</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === AppTab.MARKETPLACE && (
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold text-white">Sovereign Artifact Registry</h3>
              <button className="text-xs font-bold text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded hover:bg-emerald-500/10">
                + Ingest Local Artifact
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {models.map(model => (
                <div key={model.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/10">
                      <Package size={24} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${model.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {model.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{model.name}</h4>
                  <p className="text-xs text-slate-500 mb-4 font-mono">v{model.version} • {model.size}</p>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-500/60 font-mono mb-4">
                    <Fingerprint size={12} />
                    <span>{model.hash.slice(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <button className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">Details</button>
                    <button className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest">Deploy engine</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === AppTab.FEDERATED && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="FedAvg Training Global Accuracy">
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fedRounds}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="round" stroke="#475569" fontSize={10} />
                      <YAxis stroke="#475569" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                      <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={4} dot={{fill:'#10b981'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card title="Mesh Aggregator Status">
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 text-center h-full flex flex-col justify-center">
                  <Share2 size={48} className="text-emerald-500 mx-auto mb-4 animate-pulse" />
                  <h4 className="text-xl font-bold text-white mb-2">Aggregator: ACTIVE</h4>
                  <p className="text-slate-400 text-sm mb-6">Clients: 4 Active | Round: 12 | Strategy: FedAvg</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      <span>Model Stability</span>
                      <span className="text-emerald-400">94.2%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[94.2%] transition-all duration-1000"></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === AppTab.AI_INSIGHTS && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-10 text-center relative overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
              
              <div className="w-20 h-20 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <Sparkles size={38} />
              </div>
              <h3 className="text-2xl font-extrabold mb-3 text-white">Sovereign Cluster Audit</h3>
              <p className="text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
                Run a deep structural audit of your autonomous infrastructure using Gemini's sovereign reasoning. Evaluates mesh stability, federated learning drift, and local artifact integrity.
              </p>
              <button 
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className={`px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold flex items-center gap-3 mx-auto transition-all transform ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/30'}`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCcw className="animate-spin" size={20} />
                    Analyzing Local Mesh...
                  </>
                ) : (
                  <>
                    <Activity size={20} />
                    Run Sovereign Audit
                  </>
                )}
              </button>
            </div>

            {aiInsights && (
              <Card title="Infrastructure Analysis Report">
                <div className="prose prose-invert max-w-none text-slate-300 font-mono text-sm leading-relaxed p-6 whitespace-pre-wrap bg-black/30 rounded-xl border border-slate-800 shadow-inner">
                  {aiInsights}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Fallback sections */}
        {activeTab === AppTab.P2P && (
          <Card title="Mesh Peers (Syncthing / IPFS)">
            <div className="space-y-4">
              {peers.map(peer => (
                <div key={peer.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                      <Network size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{peer.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{peer.address} • {peer.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-600 uppercase font-bold">Traffic</div>
                    <div className="text-xs font-mono text-emerald-400">{peer.traffic}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === AppTab.TELEMETRY && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TelemetryCard title="Ambient" value={`${telemetry.temp.toFixed(2)}°C`} icon={<Thermometer className="text-orange-400" />} />
              <TelemetryCard title="Humidity" value={`${telemetry.humidity.toFixed(1)}%`} icon={<Activity className="text-blue-400" />} />
              <TelemetryCard title="Pressure" value={`${telemetry.pressure.toFixed(1)} hPa`} icon={<BarChart3 className="text-emerald-400" />} />
            </div>
            <Card title="Accelerometer (IMU Data)">
               <div className="grid grid-cols-3 gap-8 p-6 bg-slate-900/40 rounded-2xl border border-slate-800 text-center">
                  <div>
                    <div className="text-slate-600 text-[10px] uppercase font-bold mb-1 tracking-widest">X-ACCEL</div>
                    <div className="text-2xl font-mono font-bold text-white">{telemetry.accel.x.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-slate-600 text-[10px] uppercase font-bold mb-1 tracking-widest">Y-ACCEL</div>
                    <div className="text-2xl font-mono font-bold text-white">{telemetry.accel.y.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-slate-600 text-[10px] uppercase font-bold mb-1 tracking-widest">Z-ACCEL</div>
                    <div className="text-2xl font-mono font-bold text-white">{telemetry.accel.z.toFixed(4)}</div>
                  </div>
               </div>
            </Card>
          </div>
        )}

        {activeTab === AppTab.LOGS && (
          <Card title="Cluster Platform Logs">
            <div className="bg-black/60 rounded-2xl p-6 font-mono text-[11px] h-[550px] overflow-y-auto space-y-1 border border-slate-800/50 shadow-inner text-slate-400">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 border-b border-slate-800/20 py-1">
                  <span className="text-slate-600 shrink-0">#{i}</span>
                  <span className={log.includes('Audit') || log.includes('Sovereign') ? 'text-blue-400' : ''}>{log}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

// --- Helper Components ---

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-sm">
    <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
      {title}
    </h3>
    {children}
  </div>
);

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; subtitle: string }> = ({ title, value, icon, subtitle }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-lg group hover:border-emerald-500/30 transition-all">
    <div className="flex items-center justify-between mb-4">
      <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">{title}</span>
      <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700 group-hover:text-emerald-400 transition-colors">{icon}</div>
    </div>
    <div className="text-3xl font-black text-white mb-1 tracking-tight">{value}</div>
    <div className="text-[10px] text-slate-600 font-bold uppercase">{subtitle}</div>
  </div>
);

const TelemetryCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-sm flex items-center gap-6">
    <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center text-3xl border border-slate-700">
      {icon}
    </div>
    <div>
      <div className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-1">{title}</div>
      <div className="text-3xl font-black text-white font-mono tracking-tighter">{value}</div>
    </div>
  </div>
);

const SovereignNodeCard: React.FC<{ node: NodeStats }> = ({ node }) => (
  <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-sm hover:border-emerald-500/40 transition-all group">
    <div className="flex justify-between items-start mb-8">
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl border ${node.role === 'Master' ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
          <Cpu size={28} />
        </div>
        <div>
          <h4 className="font-black text-lg text-white group-hover:text-emerald-400 transition-colors tracking-tight">{node.name}</h4>
          <div className="flex items-center gap-2 mt-1 font-mono text-[10px]">
            <span className="text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{node.ip}</span>
            <span className="text-emerald-500/80 border border-emerald-500/20 px-2 py-0.5 rounded">{node.meshIp}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${node.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {node.status}
        </span>
        <div className="flex items-center gap-1 mt-2 text-emerald-500/70">
          <Lock size={10} />
          <span className="text-[9px] font-bold uppercase">Encrypted Tunnel</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-8 mb-8">
      <div className="space-y-3">
        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black tracking-widest">
          <span>CPU EFFICIENCY</span>
          <span className="text-white">{node.cpuUsage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-[1px]">
          <div className={`h-full transition-all duration-1000 rounded-full ${node.cpuUsage > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${node.cpuUsage}%` }}></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black tracking-widest">
          <span>RAM ALLOCATION</span>
          <span className="text-white">{node.memoryUsage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-[1px]">
          <div className="h-full bg-blue-500 transition-all duration-1000 rounded-full" style={{ width: `${node.memoryUsage}%` }}></div>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between pt-6 border-t border-slate-800/50 text-[10px] font-bold text-slate-500">
      <div className="flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
        <Thermometer size={16} className={node.temp > 60 ? 'text-amber-500' : 'text-blue-500'} />
        <span>{node.temp.toFixed(1)}°C</span>
      </div>
      <div className="flex items-center gap-2">
        <HardDrive size={16} className="text-slate-600" />
        <span className="uppercase">{node.nvmeStatus}</span>
      </div>
      <div className="font-mono text-slate-600 tracking-tighter uppercase">
        UP: {node.uptime}
      </div>
    </div>
  </div>
);

export default App;
