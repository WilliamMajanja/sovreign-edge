
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
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
  Terminal as TerminalIcon,
  Layers,
  BarChart3,
  ShieldCheck,
  Share2,
  Package,
  Network,
  Lock,
  Fingerprint,
  FileCode,
  Clipboard,
  Check,
  Video,
  Play,
  RotateCcw,
  PlusCircle,
  Settings,
  ShieldAlert,
  Search,
  Eye,
  Settings2,
  Archive,
  X,
  Bell,
  ChevronRight,
  Monitor,
  Command,
  UploadCloud,
  ArrowRight,
  BrainCircuit,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft
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
  Line,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { AppTab, NodeStats, InferenceMetric, TelemetryData, LocalModel, FederatedRound, P2PPeer, AutomationRule, VideoStream, BackupSnapshot, AppNotification, ClientContribution, OllamaStatus, AirLLMStatus, ServiceStatus, AgentSwarmNode, SwarmTask, MoltbookMessage, CartelStatus, AgentTransaction } from './types';
import { analyzeClusterHealth } from './services/geminiService';
import { fetchClusterMetrics, fetchFederatedRounds, fetchFederatedClients, subscribeToLogs, fetchInferenceStats, fetchOllamaStatus, fetchAirLLMStatus, checkServiceHealth, fetchTelemetryData, triggerFederatedAggregation, ingestLocalArtifact, deploySwarmTask, fetchSwarmNodes, fetchSwarmTasks, fetchMoltbookMessages, fetchCartelStatus, onboardNode, createSnapshot, fetchAgentTransactions } from './services/apiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  
  const [nodes, setNodes] = useState<NodeStats[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [models, setModels] = useState<LocalModel[]>([]);
  const [fedRounds, setFedRounds] = useState<FederatedRound[]>([]);
  const [clients, setClients] = useState<ClientContribution[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [inferenceStats, setInferenceStats] = useState<any>(null);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [airLLMStatus, setAirLLMStatus] = useState<AirLLMStatus | null>(null);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const safeSave = useCallback((key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage`, e);
    }
  }, []);

  const [swarmNodes, setSwarmNodes] = useState<AgentSwarmNode[]>([]);
  const [swarmTasks, setSwarmTasks] = useState<SwarmTask[]>([]);
  const [swarmTransactions, setSwarmTransactions] = useState<AgentTransaction[]>([]);
  const [moltbookMessages, setMoltbookMessages] = useState<MoltbookMessage[]>([]);
  const [cartelStatus, setCartelStatus] = useState<CartelStatus>({
    consensusLevel: 0,
    activeDirectives: 0,
    cabalEncryption: 'AES-256-GCM',
    integrity: 0
  });

  useEffect(() => {
    safeSave('pinetos_swarmNodes', swarmNodes);
  }, [swarmNodes, safeSave]);

  useEffect(() => {
    safeSave('pinetos_swarmTasks', swarmTasks);
  }, [swarmTasks, safeSave]);

  useEffect(() => {
    safeSave('pinetos_moltbookMessages', moltbookMessages);
  }, [moltbookMessages, safeSave]);

  useEffect(() => {
    safeSave('pinetos_cartelStatus', cartelStatus);
  }, [cartelStatus, safeSave]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  }, []);

  const addNotification = useCallback((type: AppNotification['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, type, message, timestamp: new Date().toLocaleTimeString() }, ...prev]);
  }, []);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const liveNodes = await fetchClusterMetrics();
        if (liveNodes.length > 0) setNodes(liveNodes);
      } catch (e) {
        console.warn("Failed to fetch cluster metrics", e);
      }
    };
    
    const loadFedData = async () => {
      try {
        const liveRounds = await fetchFederatedRounds();
        if (liveRounds.length > 0) setFedRounds(liveRounds);
        const liveClients = await fetchFederatedClients();
        if (liveClients.length > 0) setClients(liveClients);
      } catch (e) {
        console.warn("Failed to fetch federated data", e);
      }
    };

    const loadInferenceData = async () => {
      try {
        const stats = await fetchInferenceStats();
        if (stats) setInferenceStats(stats);
      } catch (e) {
        console.warn("Failed to fetch inference stats", e);
      }
    };

    const loadLocalLLMData = async () => {
      try {
        const oStatus = await fetchOllamaStatus();
        setOllamaStatus(oStatus);
        const aStatus = await fetchAirLLMStatus();
        setAirLLMStatus(aStatus);
      } catch (e) {
        console.warn("Failed to fetch local LLM data", e);
      }
    };

    const loadServiceHealth = async () => {
      try {
        const statuses = await checkServiceHealth();
        setServiceStatuses(statuses);
      } catch (e) {
        console.warn("Failed to check service health", e);
      }
    };

    const loadTelemetry = async () => {
      try {
        const tData = await fetchTelemetryData();
        if (tData.length > 0) setTelemetryData(tData);
      } catch (e) {
        console.warn("Failed to fetch telemetry data", e);
      }
    };

    const loadSwarmData = async () => {
      try {
        const nodes = await fetchSwarmNodes();
        if (nodes.length > 0) setSwarmNodes(nodes);
        const tasks = await fetchSwarmTasks();
        if (tasks.length > 0) setSwarmTasks(tasks);
        const txs = await fetchAgentTransactions();
        if (txs.length > 0) setSwarmTransactions(txs);
        const msgs = await fetchMoltbookMessages();
        if (msgs.length > 0) setMoltbookMessages(msgs);
        const status = await fetchCartelStatus();
        if (status) setCartelStatus(status);
      } catch (e) {
        console.warn("Failed to fetch swarm/moltbook data", e);
      }
    };

    loadMetrics();
    loadFedData();
    loadInferenceData();
    loadLocalLLMData();
    loadServiceHealth();
    loadTelemetry();
    loadSwarmData();

    const interval = setInterval(() => {
      loadMetrics();
      loadFedData();
      loadInferenceData();
      loadLocalLLMData();
      loadServiceHealth();
      loadTelemetry();
      loadSwarmData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToLogs(
      (logMsg) => {
        setLogs(prev => [...prev.slice(-99), logMsg]);
      },
      (err) => {
        console.warn("Log stream error", err);
      }
    );
    return () => unsubscribe();
  }, []);

  const [activeTerminalNode, setActiveTerminalNode] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>(() => {
    return localStorage.getItem('pinetos_aiInsights') || '';
  });
  const [telemetryData, setTelemetryData] = useState<{time: string, temp: number, humidity: number}[]>([]);
  const [automationRules, setAutomationRules] = useState(() => {
    const saved = localStorage.getItem('pinetos_automationRules');
    return saved ? JSON.parse(saved) : [
      { id: 'r1', name: 'High Temp Alert', trigger: 'temp > 55', action: 'Send Notification & Throttle CPU', status: 'Active' },
      { id: 'r2', name: 'Person Detected (Night)', trigger: 'person_confidence > 0.8 AND time > 22:00', action: 'Trigger Alarm', status: 'Active' },
      { id: 'r3', name: 'Node Offline', trigger: 'heartbeat_timeout > 30s', action: 'Re-route Mesh Traffic', status: 'Paused' }
    ];
  });

  useEffect(() => {
    safeSave('pinetos_nodes', nodes);
  }, [nodes, safeSave]);

  useEffect(() => {
    safeSave('pinetos_models', models);
  }, [models, safeSave]);

  useEffect(() => {
    safeSave('pinetos_fedRounds', fedRounds);
  }, [fedRounds, safeSave]);

  useEffect(() => {
    safeSave('pinetos_clients', clients);
  }, [clients, safeSave]);

  useEffect(() => {
    safeSave('pinetos_logs', logs);
  }, [logs, safeSave]);

  useEffect(() => {
    safeSave('pinetos_aiInsights', aiInsights);
  }, [aiInsights, safeSave]);

  useEffect(() => {
    safeSave('pinetos_automationRules', automationRules);
  }, [automationRules, safeSave]);

  useEffect(() => {
    // Automation Engine Evaluation
    if (telemetryData.length > 0) {
      const latest = telemetryData[telemetryData.length - 1];
      automationRules.forEach(rule => {
        if (rule.status === 'Active') {
          if (rule.trigger.includes('temp > 55') && latest.temp > 55) {
            addNotification('warning', `Rule Triggered: ${rule.name} - ${rule.action}`);
            addLog(`[AUTOMATION] Rule ${rule.id} executed: ${rule.action}`);
          }
        }
      });
    }
  }, [telemetryData, automationRules, addNotification, addLog]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const openTerminal = (nodeId: string) => {
    setActiveTerminalNode(nodeId);
    setTerminalOutput([`Connecting to ${nodeId} via wg-edge...`, `Authorized as admin@sovereign-mesh`, `Welcome to Sovereign Node Shell v4.5`, `$`]);
  };

  const closeTerminal = () => {
    setActiveTerminalNode(null);
    setTerminalOutput([]);
  };

  const handleRunAudit = async () => {
    setIsAnalyzing(true);
    addLog("Executing Advanced Structural Audit...");
    const result = await analyzeClusterHealth({ nodes, models, fedRounds, clients, inferenceStats }, logs);
    setAiInsights(result);
    setIsAnalyzing(false);
    addLog("Sovereign Audit Complete.");
  };

  const handleGlobalSync = async () => {
    addNotification('info', 'Initiating global mesh synchronization...');
    addLog("Global Sync: Refreshing all node metrics and federated states.");
    
    try {
      const liveNodes = await fetchClusterMetrics();
      if (liveNodes.length > 0) setNodes(liveNodes);
      
      const liveRounds = await fetchFederatedRounds();
      if (liveRounds.length > 0) setFedRounds(liveRounds);
      
      const liveClients = await fetchFederatedClients();
      if (liveClients.length > 0) setClients(liveClients);
      
      const stats = await fetchInferenceStats();
      if (stats) setInferenceStats(stats);
      
      addNotification('success', 'Global synchronization complete.');
    } catch (e) {
      addNotification('error', 'Global sync failed. Check cluster connectivity.');
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    addLog("Initiating local artifact ingestion...");
    
    const newModel = await ingestLocalArtifact();
    
    if (newModel) {
      setModels(prev => [newModel, ...prev]);
      addNotification('success', `Artifact ${newModel.name} ingested and verified.`);
    } else {
      addNotification('error', 'Failed to ingest local artifact.');
    }
    
    setIsIngesting(false);
  };

  return (
    <div className="flex h-screen bg-[#020408] text-slate-200 overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-800 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Fingerprint size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white uppercase">Sovereign <span className="text-emerald-500 text-[16px]">Edge</span></h1>
          </div>
          <div className="text-[9px] text-emerald-500/70 font-mono flex items-center gap-1 mt-1 font-bold tracking-widest uppercase">
            <Lock size={10} /> Zero Cloud Context
          </div>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Main</div>
          {renderNavItem(activeTab, setActiveTab, AppTab.DASHBOARD, 'Control Center', <LayoutDashboard size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.NODES, 'Mesh Nodes', <Cpu size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.TOPOLOGY, 'Network Topology', <Network size={18} />)}
          
          <div className="mt-4 px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Autonomous Systems</div>
          {renderNavItem(activeTab, setActiveTab, AppTab.LOCAL_LLM, 'Local LLM (Token-Free)', <Sparkles size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.AGENT_SWARM, 'Agent Swarm', <Layers size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.MOLTBOOK, 'Moltbook Port', <Lock size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.VIDEO, 'Live Video', <Video size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.FEDERATED, 'Fed Learning', <Share2 size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.AUTOMATION, 'Edge Rules', <Settings2 size={18} />)}
          
          <div className="mt-4 px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Artifacts</div>
          {renderNavItem(activeTab, setActiveTab, AppTab.MARKETPLACE, 'Model Registry', <Package size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.BACKUP, 'Snapshots', <Archive size={18} />)}
          
          <div className="mt-4 px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Platform</div>
          {renderNavItem(activeTab, setActiveTab, AppTab.TELEMETRY, 'Enviro Data', <Database size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.LOGS, 'Local Logs', <TerminalIcon size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.AI_INSIGHTS, 'Sovereign Audit', <Sparkles size={18} />)}
          {renderNavItem(activeTab, setActiveTab, AppTab.SETUP, 'Cluster Setup', <FileCode size={18} />)}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#020617] p-8 custom-scrollbar relative">
        <header className="flex justify-between items-center mb-8 sticky top-0 bg-[#020617]/80 backdrop-blur-md z-10 py-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Autonomous Infrastructure</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight capitalize">
              {activeTab.replace('_', ' ')}
            </h2>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative group">
              <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-[#020617]">
                    {notifications.length}
                  </span>
                )}
              </button>
              {/* Notification Dropdown (Quick) */}
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 p-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Live Feed</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.map(n => (
                    <div key={n.id} className="flex gap-3 text-xs p-2 rounded-lg bg-black/30 border border-slate-800">
                      <div className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1 ${n.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                      <div>
                        <p className="text-slate-200 leading-snug">{n.message}</p>
                        <span className="text-[9px] text-slate-600 uppercase font-bold">{n.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-slate-600 italic text-[10px] text-center py-4">No active warnings.</p>}
                </div>
              </div>
            </div>
            <button 
              onClick={handleGlobalSync}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-xs font-extrabold"
            >
              <RefreshCcw size={14} /> Global Sync
            </button>
          </div>
        </header>

        {/* Tab Components */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === AppTab.DASHBOARD && <DashboardTab nodes={nodes} fedRounds={fedRounds} addLog={addLog} setActiveTab={setActiveTab} inferenceStats={inferenceStats} ollamaStatus={ollamaStatus} serviceStatuses={serviceStatuses} swarmNodes={swarmNodes} cartelStatus={cartelStatus} />}
            {activeTab === AppTab.LOCAL_LLM && <LocalLLMTab ollama={ollamaStatus} airllm={airLLMStatus} addLog={addLog} addNotification={addNotification} />}
            {activeTab === AppTab.NODES && <NodesTab nodes={nodes} openTerminal={openTerminal} addNotification={addNotification} setNodes={setNodes} />}
            {activeTab === AppTab.TOPOLOGY && <TopologyTab nodes={nodes} />}
            {activeTab === AppTab.AGENT_SWARM && <AgentSwarmTab swarmNodes={swarmNodes} setSwarmNodes={setSwarmNodes} swarmTasks={swarmTasks} setSwarmTasks={setSwarmTasks} swarmTransactions={swarmTransactions} addLog={addLog} />}
            {activeTab === AppTab.MOLTBOOK && <MoltbookTab messages={moltbookMessages} setMessages={setMoltbookMessages} cartelStatus={cartelStatus} addLog={addLog} />}
            {activeTab === AppTab.VIDEO && <VideoTab addNotification={addNotification} />}
            {activeTab === AppTab.FEDERATED && <FederatedTab rounds={fedRounds} clients={clients} setFedRounds={setFedRounds} addNotification={addNotification} addLog={addLog} />}
            {activeTab === AppTab.AUTOMATION && <AutomationTab addNotification={addNotification} rules={automationRules} setRules={setAutomationRules} />}
            {activeTab === AppTab.MARKETPLACE && <MarketplaceTab models={models} setIsIngesting={setIsIngesting} addNotification={addNotification} setModels={setModels} />}
            {activeTab === AppTab.BACKUP && <BackupTab addNotification={addNotification} />}
            {activeTab === AppTab.TELEMETRY && <TelemetryTab data={telemetryData} />}
            {activeTab === AppTab.LOGS && <LogsTab logs={logs} />}
            {activeTab === AppTab.AI_INSIGHTS && <AuditTab isAnalyzing={isAnalyzing} aiInsights={aiInsights} handleRunAudit={handleRunAudit} />}
            {activeTab === AppTab.SETUP && <SetupTab addNotification={addNotification} />}
          </motion.div>
        </AnimatePresence>

        {/* --- Global Modals --- */}
        
        {/* SSH Terminal Modal */}
        {activeTerminalNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-4xl bg-black border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
              <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <TerminalIcon size={18} className="text-emerald-500" />
                  <span className="text-sm font-bold text-slate-200">Session: <span className="text-emerald-500">{activeTerminalNode}</span></span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900">ENCRYPTED</span>
                </div>
                <button onClick={closeTerminal} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 h-[450px] overflow-y-auto font-mono text-sm text-slate-300 custom-scrollbar flex flex-col gap-1">
                {terminalOutput.map((line, i) => (
                  <div key={i} className={line.startsWith('$') ? 'text-emerald-400 mt-2' : ''}>{line}</div>
                ))}
                <div className="flex gap-2">
                  <span className="text-emerald-500">$</span>
                  <input 
                    autoFocus 
                    className="bg-transparent border-none outline-none flex-1 text-slate-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value;
                        const cmd = val.trim().toLowerCase();
                        let response = `Command not found: ${val}`;
                        
                        if (cmd === 'help') {
                          response = `Available commands: help, ping, status, clear, deploy, reboot, ls, whoami, uname`;
                        } else if (cmd === 'ping') {
                          response = `PONG from ${activeTerminalNode} (latency: 1.2ms)`;
                        } else if (cmd === 'status') {
                          const node = nodes.find(n => n.id === activeTerminalNode);
                          response = node 
                            ? `Node ${activeTerminalNode} is ONLINE. CPU: ${node.cpuUsage.toFixed(1)}%, RAM: ${node.memoryUsage.toFixed(1)}%, TEMP: ${node.temp}°C`
                            : `Node ${activeTerminalNode} is OFFLINE.`;
                        } else if (cmd === 'clear') {
                          setTerminalOutput([]);
                          (e.target as HTMLInputElement).value = '';
                          return;
                        } else if (cmd === 'deploy') {
                          response = `Initiating deployment sequence on ${activeTerminalNode}... [OK]`;
                        } else if (cmd === 'reboot') {
                          response = `Rebooting ${activeTerminalNode}... Connection will be lost.`;
                        } else if (cmd === 'ls') {
                          response = `bin  boot  dev  etc  home  lib  media  mnt  opt  pinet  proc  root  run  sbin  srv  sys  tmp  usr  var`;
                        } else if (cmd === 'whoami') {
                          response = `admin`;
                        } else if (cmd === 'uname') {
                          response = `Linux ${activeTerminalNode} 6.6.20-v8+ #1 SMP PREEMPT Debian 12.5 aarch64 GNU/Linux`;
                        } else if (cmd === '') {
                          response = '';
                        }

                        setTerminalOutput(prev => [...prev, `$ ${val}`, ...(response ? [response] : [])]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Model Ingestion Modal */}
        {isIngesting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg widget-container p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">Ingest Local Artifact</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Verify and hash a new model into the Sovereign Registry.</p>
                </div>
                <button onClick={() => setIsIngesting(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleIngest} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Artifact File (Mock)</label>
                    <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-all cursor-pointer group">
                      <UploadCloud size={32} className="mx-auto text-slate-700 group-hover:text-emerald-500 mb-2" />
                      <p className="text-xs text-slate-500 font-bold group-hover:text-slate-300">Drag ONNX / TFLite weights here</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Internal Alias</label>
                    <input type="text" placeholder="e.g. security-v2-optimized" className="w-full bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none" required />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all">
                  <Lock size={18} /> Seal & Register
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const AgentSwarmTab: React.FC<{ 
  swarmNodes: AgentSwarmNode[]; 
  setSwarmNodes: React.Dispatch<React.SetStateAction<AgentSwarmNode[]>>;
  swarmTasks: SwarmTask[];
  setSwarmTasks: React.Dispatch<React.SetStateAction<SwarmTask[]>>;
  swarmTransactions: AgentTransaction[];
  addLog: (m: string) => void;
}> = ({ swarmNodes, setSwarmNodes, swarmTasks, setSwarmTasks, swarmTransactions, addLog }) => {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeployTask = async () => {
    setIsDeploying(true);
    addLog("Initiating Swarm Intelligence Directive...");
    
    const newTask = await deploySwarmTask(`Dynamic Mesh Audit ${swarmTasks.length + 1}`);
    
    if (newTask) {
      setSwarmTasks(prev => [newTask, ...prev]);
      addLog(`Swarm Task [${newTask.title}] deployed. Awaiting m.402 payment.`);
    } else {
      addLog("Swarm: Task deployment failed.");
    }
    
    setIsDeploying(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Layers className="text-emerald-500" /> Agent Swarm
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed mt-2">
            A decentralized collective of autonomous agents coordinating via the <span className="text-emerald-400 font-bold">Sovereign Mesh</span>. 
            Agents utilize <span className="text-amber-400 font-bold">m.402 (L402)</span> micro-payments for resource allocation and task settlement.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
            <Wallet className="text-emerald-500" size={18} />
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-black">Mesh Balance</p>
              <p className="text-sm font-mono text-white">42,850 <span className="text-[10px] text-slate-400">SAT</span></p>
            </div>
          </div>
          <button 
            onClick={handleDeployTask}
            disabled={isDeploying}
            className={`flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all ${isDeploying ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDeploying ? <RefreshCcw className="animate-spin" size={16} /> : <Zap size={16} />} 
            {isDeploying ? 'Deploying...' : 'Deploy Swarm Task'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Active Swarm Nodes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {swarmNodes.map(node => (
                <div key={node.id} className="p-4 bg-black/30 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${node.status === 'Active' ? 'bg-emerald-500 animate-pulse' : node.status === 'Thinking' ? 'bg-amber-500' : node.status === 'Payment-Required' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                      <span className="font-bold text-white text-sm">{node.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{node.role}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Sparkles size={10} className="text-amber-500" />
                        <span className="text-[10px] text-amber-500 font-bold">{node.reputation}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mb-4">
                    Last Task: <span className="text-slate-200">{node.lastTask}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 p-2 bg-black/20 rounded-lg border border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <Wallet size={12} className="text-slate-500" />
                      <span className="text-[11px] font-mono text-slate-300">{node.walletBalance.toLocaleString()} SAT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity size={12} className="text-slate-500" />
                      <span className="text-[11px] font-mono text-emerald-500">{node.contribution}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${node.contribution}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Swarm Task Queue & m.402 Settlement">
            <div className="space-y-3 mt-4">
              {swarmTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-black/20 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${task.priority === 'High' || task.priority === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      <Clipboard size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{task.title}</h4>
                      <div className="flex gap-3 mt-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                        <span>ID: {task.id}</span>
                        <span>Assigned: {task.assignedTo.join(', ')}</span>
                        <span className="text-amber-500">Cost: {task.cost} SAT</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {task.status === 'Awaiting-Payment' && (
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-600/50 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                        <CreditCard size={12} /> Pay m.402
                      </button>
                    )}
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                      task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                      task.status === 'Processing' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 
                      task.status === 'Awaiting-Payment' ? 'bg-red-500/10 text-red-500' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card title="Mesh Transaction Ledger">
            <div className="space-y-3 mt-4">
              {swarmTransactions.map(tx => (
                <div key={tx.id} className="p-3 bg-black/20 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.from === 'User' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {tx.from === 'User' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">{tx.memo}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{tx.from} → {tx.to}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-mono font-bold ${tx.status === 'Settled' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {tx.amount} <span className="text-[9px]">SAT</span>
                    </p>
                    <p className="text-[9px] text-slate-600 uppercase font-black">{tx.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Swarm Intelligence SOUL">
            <div className="bg-black/50 border border-slate-800 rounded-2xl p-6 font-mono text-sm text-slate-300 overflow-y-auto max-h-[400px] custom-scrollbar">
              <div className="text-emerald-500 mb-4 font-bold"># SWARM_PROTOCOL_V2</div>
              <div className="mb-6">
                Collective intelligence is emergent.<br/>
                No single agent holds the truth.<br/>
                Truth is the consensus of the mesh.
              </div>

              <div className="text-amber-500 mb-4 font-bold"># ECONOMIC_DIRECTIVES</div>
              <div className="mb-6">
                1. Resource allocation via m.402 bidding.<br/>
                2. Reputation-weighted consensus.<br/>
                3. Automated sub-task settlement.<br/>
                4. Zero-trust compute verification.
              </div>

              <div className="text-emerald-500 mb-4 font-bold"># RESOURCE_MARKETPLACE</div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-black">Compute Bid</span>
                  <span className="text-emerald-500 font-bold">12 SAT/ms</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-black">Storage Bid</span>
                  <span className="text-emerald-500 font-bold">0.5 SAT/MB</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-black">Inference Bid</span>
                  <span className="text-emerald-500 font-bold">402 SAT/req</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Swarm Status</div>
                <div className="flex items-center gap-2 text-emerald-500 font-bold">
                  <Activity size={14} />
                  <span>SYNCHRONIZED & LIQUID</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const MoltbookTab: React.FC<{ 
  messages: MoltbookMessage[]; 
  setMessages: React.Dispatch<React.SetStateAction<MoltbookMessage[]>>;
  cartelStatus: CartelStatus;
  addLog: (m: string) => void;
}> = ({ messages, setMessages, cartelStatus, addLog }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: MoltbookMessage = {
      id: `m-${Date.now()}`,
      sender: 'Admin-Console',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      encrypted: true,
      type: 'Broadcast'
    };

    setMessages(prev => [msg, ...prev]);
    setNewMessage('');
    addLog(`Moltbook: Message broadcasted to cartel.`);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Share2 className="text-emerald-500" /> Moltbook Port
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed mt-2">
            The secure communication layer for the <span className="text-emerald-400 font-bold">Agent Cartel</span>. 
            Encrypted, peer-to-peer, and censorship-resistant.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <StatCard title="Consensus Level" value={`${cartelStatus.consensusLevel}%`} icon={<ShieldCheck />} subtitle="Cartel Agreement" />
          <StatCard title="Active Directives" value={cartelStatus.activeDirectives.toString()} icon={<List />} subtitle="Cabal Commands" />
          
          <Card title="Cartel Integrity">
            <div className="space-y-4 mt-2">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black tracking-widest">
                <span>Mesh Integrity</span>
                <span className="text-emerald-500">{cartelStatus.integrity}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${cartelStatus.integrity}%` }}></div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <Lock size={12} className="text-emerald-500" />
                <span>Encryption: {cartelStatus.cabalEncryption}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card title="Cabal Communication Stream">
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-2">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'Admin-Console' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl border ${
                      msg.type === 'Cabal-Directive' 
                        ? 'bg-red-950/20 border-red-500/30 text-red-200' 
                        : msg.sender === 'Admin-Console'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}>
                      <div className="flex justify-between items-center mb-2 gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{msg.sender}</span>
                        <span className="text-[9px] font-mono opacity-50">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      {msg.encrypted && (
                        <div className="mt-2 flex items-center gap-1 text-[8px] font-mono text-emerald-500/50 uppercase">
                          <Lock size={8} /> Encrypted P2P
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message to the cartel..."
                  className="flex-1 bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white"
                />
                <button 
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Send
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Tab Sub-Components ---

const TopologyTab: React.FC<{ nodes: NodeStats[] }> = ({ nodes }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="widget-container p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Network className="text-emerald-500" /> P2P Mesh Topology</h3>
        <p className="text-sm text-slate-400 mb-8">Visualizing active WireGuard tunnels and Syncthing peer connections across the edge cluster.</p>
        
        <div className="relative h-96 bg-black/50 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
          {/* Simple CSS-based radial topology map */}
          {nodes.length === 0 ? (
            <div className="text-slate-500 font-mono text-sm">No nodes active in mesh.</div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Master Node in Center */}
              <div className="absolute z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-900/50 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <Cpu className="text-emerald-400" size={24} />
                </div>
                <span className="mt-2 text-xs font-bold text-emerald-400 bg-black/80 px-2 py-1 rounded">Master Node</span>
                <span className="text-[10px] text-slate-500 font-mono">10.99.0.1</span>
              </div>
              
              {/* Agent Nodes in Orbit */}
              {nodes.filter(n => n.role === 'Agent').map((node, i, arr) => {
                const angle = (i / arr.length) * Math.PI * 2;
                const radius = 120;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <React.Fragment key={node.id}>
                    {/* Connection Line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                      <line 
                        x1="50%" y1="50%" 
                        x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} 
                        stroke={node.status === 'Online' ? '#10b981' : '#ef4444'} 
                        strokeWidth="2" 
                        strokeDasharray={node.status === 'Online' ? 'none' : '4 4'}
                        opacity="0.4"
                      />
                    </svg>
                    
                    {/* Node Circle */}
                    <div 
                      className="absolute flex flex-col items-center transition-all hover:scale-110 cursor-pointer"
                      style={{ transform: `translate(${x}px, ${y}px)`, zIndex: 10 }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${node.status === 'Online' ? 'bg-slate-800 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                        <Database className={node.status === 'Online' ? 'text-slate-300' : 'text-red-400'} size={18} />
                      </div>
                      <span className="mt-1 text-[10px] font-bold text-slate-300 bg-black/80 px-1.5 py-0.5 rounded">{node.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{node.meshIp}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardTab: React.FC<{ 
  nodes: NodeStats[]; 
  fedRounds: FederatedRound[]; 
  addLog: (m: string) => void; 
  setActiveTab: (t: AppTab) => void; 
  inferenceStats: any; 
  ollamaStatus: OllamaStatus | null;
  serviceStatuses: ServiceStatus[];
  swarmNodes: AgentSwarmNode[];
  cartelStatus: CartelStatus;
}> = ({ nodes, fedRounds, addLog, setActiveTab, inferenceStats, ollamaStatus, serviceStatuses, swarmNodes, cartelStatus }) => {
  const meshHealth = serviceStatuses.length > 0 
    ? Math.round((serviceStatuses.filter(s => s.status === 'Online').length / serviceStatuses.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard 
          title="Mesh Health" 
          value={`${meshHealth}%`} 
          icon={<ShieldCheck className={meshHealth > 80 ? 'text-emerald-500' : 'text-amber-500'} />} 
          subtitle={`${serviceStatuses.filter(s => s.status === 'Online').length} / ${serviceStatuses.length} Services Up`} 
        />
        <StatCard 
          title="Swarm Consensus" 
          value={`${cartelStatus.consensusLevel}%`} 
          icon={<Layers className="text-emerald-500" />} 
          subtitle={`${swarmNodes.length} Active Agents`} 
          onClick={() => setActiveTab(AppTab.AGENT_SWARM)}
        />
        <StatCard 
          title="Inference Vol" 
          value={inferenceStats?.throughput ? `${Math.round(inferenceStats.throughput)}/s` : '0/s'} 
          icon={<Zap className="text-amber-500" />} 
          subtitle={`${inferenceStats?.latency?.toFixed(1) || 0}ms Latency`} 
          onClick={() => setActiveTab(AppTab.INFERENCE)}
        />
        <StatCard 
          title="Learning Rounds" 
          value={fedRounds.length > 0 ? fedRounds[fedRounds.length - 1].round.toString() : '0'} 
          icon={<BrainCircuit className="text-purple-500" />} 
          subtitle={`${fedRounds.length > 0 ? (fedRounds[fedRounds.length - 1].accuracy * 100).toFixed(1) : 0}% Mesh Accuracy`} 
          onClick={() => setActiveTab(AppTab.FEDERATED)}
        />
        <StatCard 
          title="Local LLM" 
          value={ollamaStatus?.status === 'Running' ? `${ollamaStatus.tokensPerSec} t/s` : 'Offline'} 
          icon={<Sparkles />} 
          subtitle={ollamaStatus?.model || "No Local LLM"} 
          onClick={() => setActiveTab(AppTab.LOCAL_LLM)}
        />
        <StatCard 
          title="Mesh Liquidity" 
          value="42.8k SAT" 
          icon={<Wallet className="text-amber-500" />} 
          subtitle="12.4k Pending" 
          onClick={() => setActiveTab(AppTab.AGENT_SWARM)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Node Load Distribution">
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nodes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="cpuUsage" radius={[4, 4, 0, 0]}>
                    {nodes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cpuUsage > 80 ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card title="Service Health">
            <div className="space-y-3 mt-4">
              {serviceStatuses.map(s => (
                <div key={s.name} className="flex items-center justify-between p-3 bg-black/20 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-bold text-slate-300">{s.name}</span>
                  </div>
                  {s.latency && <span className="text-[10px] font-mono text-slate-500">{s.latency}ms</span>}
                </div>
              ))}
              {serviceStatuses.length === 0 && <p className="text-center text-slate-600 text-[10px] py-4 italic">Initializing health checks...</p>}
            </div>
          </Card>

          <Card title="Mesh Resilience Audit">
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <ShieldCheck className="text-emerald-500" size={24} />
                <div>
                  <p className="text-sm font-bold text-white">Cryptographic Mesh Verified</p>
                  <p className="text-[10px] text-emerald-500/70 font-mono">All peers using AES-256-GCM encrypted tunnels.</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab(AppTab.AI_INSIGHTS)}
                className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white border border-slate-800 rounded-xl hover:bg-slate-800/50 transition-all"
              >
                View Structural Integrity Report
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const LocalLLMTab: React.FC<{ ollama: OllamaStatus | null; airllm: AirLLMStatus | null; addLog: (m: string) => void; addNotification: (type: any, msg: string) => void }> = ({ ollama, airllm, addLog, addNotification }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Ollama Engine Status">
          <div className="space-y-6 mt-4">
            <div className="flex justify-between items-center p-4 bg-black/30 border border-slate-800 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Active Model</h4>
                <p className="text-xs text-emerald-500 font-mono mt-1">{ollama?.model || 'None'}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ollama?.status === 'Running' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                {ollama?.status || 'Offline'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inference Speed</p>
                <p className="text-xl font-black text-white">{ollama?.tokensPerSec || 0} <span className="text-xs text-slate-500">t/s</span></p>
              </div>
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">VRAM Allocation</p>
                <p className="text-xl font-black text-white">{ollama?.vram || '0GB'}</p>
              </div>
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Quantization</p>
                <p className="text-lg font-black text-white">Q4_K_M</p>
              </div>
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Context Window</p>
                <p className="text-lg font-black text-white">8192</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
              <Sparkles className="text-emerald-500" size={24} />
              <div>
                <p className="text-sm font-bold text-white">Token-Free Inference</p>
                <p className="text-[10px] text-emerald-500/70 font-mono">Running locally on Raspbian Trixie (Pi 5 optimized).</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  addNotification('info', 'Restarting Ollama service...');
                  addLog('Ollama: Service restart initiated.');
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Restart Service
              </button>
              <button 
                onClick={() => {
                  addNotification('info', 'Clearing Ollama context cache...');
                  addLog('Ollama: Context cache purged.');
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </Card>

        <Card title="AirLLM Edge Optimization">
          <div className="space-y-6 mt-4">
            <div className="flex justify-between items-center p-4 bg-black/30 border border-slate-800 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Compression Engine</h4>
                <p className="text-xs text-blue-500 font-mono mt-1">{airllm?.compression || '4-bit Quantized'}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${airllm?.active ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-800 text-slate-500'}`}>
                {airllm?.active ? 'Active' : 'Standby'}
              </div>
            </div>

            <div className="p-4 bg-blue-900/10 border border-blue-800/20 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memory Saved</span>
                <span className="text-xs font-bold text-blue-400">{airllm?.memorySaved || '12.4GB'}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '85%' }}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-800/20">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Layer Cache</p>
                  <p className="text-xs font-bold text-white">Active (LRU)</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Swap Strategy</p>
                  <p className="text-xs font-bold text-white">NVMe Direct</p>
                </div>
              </div>
              
              <p className="text-[9px] text-slate-500 mt-4 italic">Layer-wise inference enabled for 70B+ models on edge hardware.</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  addNotification('info', 'Restarting AirLLM optimization service...');
                  addLog('AirLLM: Service restart initiated.');
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Restart Service
              </button>
              <button 
                onClick={() => {
                  addNotification('info', 'Purging AirLLM layer cache...');
                  addLog('AirLLM: Layer cache purged.');
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Clear Cache
              </button>
            </div>

            <button 
              onClick={() => {
                addNotification('info', 'Re-calibrating AirLLM layers for current RAM pressure...');
                addLog("Optimizing local LLM layers for Pi 5 RAM...");
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-900/20"
            >
              Re-calibrate AirLLM Layers
            </button>
          </div>
        </Card>
      </div>

      <Card title="Local Model Inventory">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Model Name</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Format</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Size</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {[
                { name: 'Llama-3-8B-Instruct', format: 'GGUF', size: '4.7GB', status: 'Ready' },
                { name: 'Mistral-7B-v0.3', format: 'GGUF', size: '4.1GB', status: 'Ready' },
                { name: 'Phi-3-Mini', format: 'GGUF', size: '2.2GB', status: 'Ready' },
              ].map((m, i) => (
                <tr key={i} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 text-sm font-bold text-white">{m.name}</td>
                  <td className="py-4 text-[10px] font-mono text-slate-400">{m.format}</td>
                  <td className="py-4 text-[10px] font-mono text-slate-400">{m.size}</td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                      {m.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          addNotification('success', `Loading ${m.name} into inference engine...`);
                          addLog(`Local LLM: Loading model ${m.name}`);
                        }}
                        className="p-2 bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded transition-all"
                        title="Load Model"
                      >
                        <Play size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          addNotification('info', `Viewing parameters for ${m.name}...`);
                        }}
                        className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded transition-all"
                        title="Model Settings"
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const NodesTab: React.FC<{ nodes: NodeStats[]; openTerminal: (id: string) => void; addNotification: (type: any, msg: string) => void; setNodes: React.Dispatch<React.SetStateAction<NodeStats[]>> }> = ({ nodes, openTerminal, addNotification, setNodes }) => {
  const [isOnboarding, setIsOnboarding] = useState(false);

  const handleOnboard = async () => {
    setIsOnboarding(true);
    addNotification('info', 'Initiating 1-click M.A.N. installation...');
    
    const newNode = await onboardNode();
    
    if (newNode) {
      setNodes(prev => [...prev, newNode]);
      addNotification('success', `New node ${newNode.name} successfully onboarded.`);
    } else {
      addNotification('error', 'Failed to onboard new node.');
    }
    
    setIsOnboarding(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-6">
        <p className="text-slate-400 text-sm max-w-lg leading-relaxed">Manage your sovereign mesh nodes. Each node runs a full Minima instance.</p>
        <button 
          onClick={handleOnboard}
          disabled={isOnboarding}
          className={`flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all ${isOnboarding ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isOnboarding ? <RefreshCcw className="animate-spin" size={16} /> : <PlusCircle size={16} />} 
          {isOnboarding ? 'Onboarding...' : 'Onboard Agent (M.A.N.)'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nodes.map(node => (
          <SovereignNodeCard key={node.id} node={node} openTerminal={openTerminal} />
        ))}
      </div>
    </div>
  );
};

const FederatedTab: React.FC<{ rounds: FederatedRound[]; clients: ClientContribution[]; setFedRounds: React.Dispatch<React.SetStateAction<FederatedRound[]>>; addNotification: (type: any, msg: string) => void; addLog: (m: string) => void }> = ({ rounds, clients, setFedRounds, addNotification, addLog }) => {
  const [isAggregating, setIsAggregating] = useState(false);

  const handleTriggerAggregation = async () => {
    setIsAggregating(true);
    addNotification('info', 'Initiating global mesh model aggregation...');
    addLog("Federated: Triggering global model update via Flower API.");
    
    const success = await triggerFederatedAggregation();
    
    if (success) {
      addNotification('success', 'Global aggregation triggered successfully.');
      addLog("Federated: Aggregation command accepted by master node.");
    } else {
      addNotification('error', 'Failed to trigger global aggregation.');
      addLog("Federated: Aggregation command rejected or endpoint unreachable.");
    }
    
    setIsAggregating(false);
  };

  return (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-end mb-6">
      <p className="text-slate-400 text-sm max-w-lg leading-relaxed">Monitor decentralized model training across the Sovereign Mesh.</p>
      <button 
        onClick={handleTriggerAggregation}
        disabled={isAggregating}
        className={`flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all ${isAggregating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Share2 size={16} /> {isAggregating ? 'Aggregating...' : 'Trigger Global Aggregation'}
      </button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card title="Training Convergence">
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rounds}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="round" stroke="#475569" fontSize={10} hide />
              <YAxis stroke="#475569" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
              <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="lg:col-span-2">
        <Card title="Active Learning Clients">
          <div className="overflow-x-auto mt-2">
            <div className="min-w-[600px]">
              <div className="col-header grid grid-cols-5 mb-2 px-4">
                <div>Node</div>
                <div>Local Acc</div>
                <div>Data Samples</div>
                <div>Latency</div>
                <div className="text-right">Status</div>
              </div>
              <div className="space-y-2">
                {clients.map(client => (
                  <div key={client.nodeId} className="data-row grid-cols-5 items-center bg-black/20 rounded-xl border border-slate-800/50">
                    <div className="font-bold text-sm text-white">{client.nodeId}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${client.accuracy * 100}%` }}></div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{(client.accuracy * 100).toFixed(0)}%</span>
                    </div>
                    <div className="text-xs text-slate-400">{client.samples} imgs</div>
                    <div className="text-xs font-mono text-slate-500">{client.latency}</div>
                    <div className="text-right">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                        client.status === 'Aggregating' ? 'bg-blue-500/10 text-blue-400' : 
                        client.status === 'Local-Training' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-600'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
  );
};

const MarketplaceTab: React.FC<{ models: LocalModel[]; setIsIngesting: (v: boolean) => void; addNotification: (type: any, msg: string) => void; setModels: React.Dispatch<React.SetStateAction<LocalModel[]>> }> = ({ models, setIsIngesting, addNotification, setModels }) => {
  const [isSimulatingIngest, setIsSimulatingIngest] = useState(false);

  const handleIngest = async () => {
    setIsSimulatingIngest(true);
    addNotification('info', 'Initiating local artifact ingestion...');
    
    const newModel = await ingestLocalArtifact();
    
    if (newModel) {
      setModels(prev => [newModel, ...prev]);
      addNotification('success', `Artifact ${newModel.name} ingested and verified.`);
    } else {
      addNotification('error', 'Failed to ingest local artifact.');
    }
    
    setIsSimulatingIngest(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-slate-400 text-sm max-w-lg leading-relaxed">Local model registry. All artifacts are deduplicated and distributed via P2P IPFS blocks across the mesh NVMe storage.</p>
        </div>
        <button 
          onClick={handleIngest}
          disabled={isSimulatingIngest}
          className={`flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-400 transition-all active:scale-95 ${isSimulatingIngest ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSimulatingIngest ? <RefreshCcw className="animate-spin" size={16} /> : <PlusCircle size={16} />} 
          {isSimulatingIngest ? 'Ingesting...' : 'Ingest Local Artifact'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map(model => (
          <div key={model.id} className="widget-container p-6 hover:border-emerald-500/30 transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-emerald-600/5 rounded-2xl border border-emerald-500/10 text-emerald-500">
                <Package size={28} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                model.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {model.status}
              </span>
            </div>
            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{model.name}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">Version {model.version} • {model.size}</p>
            <div className="bg-black/30 rounded-xl p-3 font-mono text-[9px] text-slate-500 mb-8 border border-slate-800/50 truncate">
              {model.hash}
            </div>
            <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-800/50">
              <button 
                onClick={() => addNotification('info', `Viewing technical specifications for ${model.name}...`)}
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                Details
              </button>
              <button 
                onClick={() => addNotification('info', `Deploying ${model.name} to mesh...`)}
                className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors"
              >
                Deploy <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AuditTab: React.FC<{ isAnalyzing: boolean; aiInsights: string; handleRunAudit: () => void }> = ({ isAnalyzing, aiInsights, handleRunAudit }) => {
  const healthScore = useMemo(() => {
    const match = aiInsights.match(/Sovereign Health Score:?\s*(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }, [aiInsights]);

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500">
      <div className="widget-container border-emerald-500/30 p-12 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
        
        {healthScore !== null ? (
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow opacity-20"></div>
              <span className="text-4xl font-black text-emerald-500">{healthScore}</span>
            </div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-3">Health Score</p>
          </div>
        ) : (
          <div className="w-24 h-24 bg-emerald-600/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-inner">
            <Sparkles size={48} />
          </div>
        )}

        <h3 className="text-4xl font-black mb-4 text-white uppercase tracking-tight">Sovereign Cluster Audit</h3>
        <p className="text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium text-lg">
          Deep structural reasoning engine. Analyzes mesh load, training divergence, and infrastructure health locally.
        </p>
        <button 
          onClick={handleRunAudit}
          disabled={isAnalyzing}
          className={`px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-4 mx-auto transition-all transform ${isAnalyzing ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-900/40'}`}
        >
          {isAnalyzing ? <><RefreshCcw className="animate-spin" size={20} /> Auditing Context...</> : <><Activity size={20} /> Run Structural Audit</>}
        </button>
      </div>

      {aiInsights && (
        <Card title="Structural Audit Result">
          <div className="bg-black/40 rounded-xl border border-slate-800/60 shadow-inner custom-scrollbar overflow-y-auto max-h-[600px] p-8">
            <div className="markdown-body">
              <Markdown>{aiInsights}</Markdown>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const LogsTab: React.FC<{ logs: string[] }> = ({ logs }) => {
  const endRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="animate-in fade-in duration-700 h-[calc(100vh-12rem)]">
      <div className="h-full flex flex-col bg-black border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TerminalIcon size={14} className="text-slate-400" />
            <span className="text-xs font-mono text-slate-400">root@sovereign-master:~</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
        </div>
        <div className="flex-1 p-4 font-mono text-[13px] overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
          {logs.map((log, i) => {
            const isError = log.toLowerCase().includes('error') || log.toLowerCase().includes('fail');
            const isWarn = log.toLowerCase().includes('warn');
            const isSuccess = log.toLowerCase().includes('success') || log.toLowerCase().includes('done');
            
            return (
              <div key={i} className="flex gap-4 py-1 hover:bg-white/5 px-2 rounded">
                <span className="text-slate-600 shrink-0 select-none">{new Date().toLocaleTimeString()}</span>
                <span className={`${isError ? 'text-red-400' : isWarn ? 'text-amber-400' : isSuccess ? 'text-emerald-400' : 'text-slate-300'} break-all`}>
                  {log}
                </span>
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="text-slate-500 italic mt-4">Waiting for incoming log streams...</div>
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
};

// --- Static Helper Components ---

const renderNavItem = (activeTab: AppTab, setActiveTab: (t: AppTab) => void, id: AppTab, label: string, icon: React.ReactNode) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex items-center justify-between px-4 py-3 w-full transition-all duration-200 group ${
      activeTab === id 
        ? 'bg-emerald-600/10 text-emerald-400 font-bold' 
        : 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-300'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`${activeTab === id ? 'text-emerald-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
        {icon}
      </div>
      <span className="text-[13px] tracking-wide">{label}</span>
    </div>
    {activeTab === id && <ChevronRight size={14} className="text-emerald-500" />}
  </button>
);

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="widget-container p-6 group">
    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
      <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all group-hover:scale-125"></div>
      {title}
    </h3>
    {children}
  </div>
);

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; subtitle: string; onClick?: () => void }> = ({ title, value, icon, subtitle, onClick }) => (
  <div 
    onClick={onClick}
    className={`widget-container p-6 group hover:border-emerald-500/30 transition-all hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex items-center justify-between mb-6">
      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</span>
      <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50 text-slate-400 group-hover:text-emerald-400 transition-colors">{icon}</div>
    </div>
    <div className="text-4xl font-black text-white mb-2 tracking-tighter">{value}</div>
    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide group-hover:text-emerald-500/70 transition-colors">{subtitle}</div>
  </div>
);

const SovereignNodeCard: React.FC<{ node: NodeStats; openTerminal: (id: string) => void }> = ({ node, openTerminal }) => (
  <div className="widget-container p-6 hover:border-emerald-500/40 transition-all group shadow-xl">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-6">
        <div className={`p-4 rounded-2xl border shadow-inner ${node.role === 'Master' ? 'bg-emerald-600/5 border-emerald-500/20 text-emerald-500' : 'bg-slate-800/40 border-slate-700/50 text-slate-400'}`}>
          <Cpu size={32} />
        </div>
        <div>
          <h4 className="font-black text-xl text-white group-hover:text-emerald-400 transition-colors tracking-tight">{node.name}</h4>
          <div className="flex items-center gap-3 mt-2 font-mono text-[10px] font-bold">
            <span className="text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/30 tracking-widest">{node.ip}</span>
            <span className="text-emerald-500/80 border border-emerald-500/20 px-2 py-1 rounded tracking-widest uppercase">P2P Tunnel</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => openTerminal(node.id)}
          className="p-3 bg-black/40 border border-slate-800 rounded-2xl text-slate-500 hover:text-emerald-500 hover:border-emerald-500/40 transition-all"
          title="Open Shell"
        >
          <Command size={18} />
        </button>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${node.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {node.status}
        </span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-8 mb-8">
      <div className="space-y-4">
        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black tracking-widest">
          <span>PI 5 COMPUTE</span>
          <span className="text-white font-mono">{(node.cpuUsage || 0).toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden p-[1px] border border-slate-700/20">
          <div className={`h-full transition-all duration-1000 rounded-full ${node.cpuUsage > 80 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`} style={{ width: `${node.cpuUsage}%` }}></div>
        </div>
        {node.loadAverage && (
          <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-1">
            <span>LOAD AVG (1m)</span>
            <span>{node.loadAverage[0].toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black tracking-widest">
          <span>RAM USAGE (16GB)</span>
          <span className="text-white font-mono">{(node.ramUsed || 0).toFixed(1)} GB</span>
        </div>
        <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden p-[1px] border border-slate-700/20">
          <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-1000 rounded-full" style={{ width: `${(node.ramUsed / node.ramTotal) * 100}%` }}></div>
        </div>
        {node.diskUsage !== undefined && (
          <div className="flex justify-between text-[9px] text-slate-600 font-mono mt-1">
            <span>NVMe DISK</span>
            <span>{node.diskUsage.toFixed(1)}% USED</span>
          </div>
        )}
      </div>
    </div>

    <div className="flex items-center justify-between pt-8 border-t border-slate-800/50 text-[10px] font-black text-slate-600 uppercase tracking-widest">
      <div className="flex items-center gap-3 group-hover:text-emerald-400 transition-colors">
        <Thermometer size={18} className={node.temp > 60 ? 'text-amber-500' : 'text-blue-500'} />
        <span>{(node.temp || 0).toFixed(1)}°C CORE</span>
      </div>
      <div className="flex items-center gap-3">
        <HardDrive size={18} className="text-slate-600" />
        <span className="text-slate-400">{node.nvmeStatus} SSD</span>
      </div>
      <div className="font-mono text-slate-700">
        Uptime: {node.uptime}
      </div>
    </div>
  </div>
);

const VideoTab: React.FC<{ addNotification: (type: any, msg: string) => void }> = ({ addNotification }) => {
  const [feed1Active, setFeed1Active] = useState(true);
  const [feed2Active, setFeed2Active] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [boxPos, setBoxPos] = useState({ top: 30, left: 40 });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (feed1Active) {
      interval = setInterval(() => {
        setBoxPos(prev => ({
          top: Math.max(10, Math.min(60, prev.top + (Math.random() - 0.5) * 5)),
          left: Math.max(10, Math.min(70, prev.left + (Math.random() - 0.5) * 5))
        }));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [feed1Active]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (feed1Active) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam:", err);
          addNotification('error', 'Failed to access webcam. Please check permissions.');
          setFeed1Active(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [feed1Active, addNotification]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Camera Feed 01 - Main Entrance">
          <div className="aspect-video bg-black rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden group">
            {feed1Active ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">LIVE</span>
                </div>
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-emerald-500 bg-black/50 px-2 py-1 rounded">
                  FPS: 24 | 1080p | YOLOv8
                </div>
                {/* Simulated bounding boxes */}
                <div 
                  className="absolute w-24 h-48 border-2 border-emerald-500 bg-emerald-500/10 transition-all duration-500 ease-linear"
                  style={{ top: `${boxPos.top}%`, left: `${boxPos.left}%` }}
                >
                  <div className="absolute -top-5 left-[-2px] bg-emerald-500 text-black text-[9px] font-bold px-1">Person 0.92</div>
                </div>
              </>
            ) : (
              <>
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OFFLINE</span>
                </div>
                <Video size={48} className="text-slate-800" />
              </>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => {
                setFeed1Active(!feed1Active);
                addNotification('info', `Camera Feed 01 ${!feed1Active ? 'started' : 'stopped'}.`);
              }}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded transition-colors ${feed1Active ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
            >
              {feed1Active ? 'Stop Feed' : 'Start Feed'}
            </button>
          </div>
        </Card>
        <Card title="Camera Feed 02 - Server Room">
          <div className="aspect-video bg-black rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden group">
            {feed2Active ? (
              <>
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">LIVE</span>
                </div>
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-emerald-500 bg-black/50 px-2 py-1 rounded">
                  FPS: 15 | 720p | Motion
                </div>
                <Video size={48} className="text-slate-800" />
              </>
            ) : (
              <>
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OFFLINE</span>
                </div>
                <Video size={48} className="text-slate-800" />
              </>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => {
                setFeed2Active(!feed2Active);
                addNotification('info', `Camera Feed 02 ${!feed2Active ? 'started' : 'stopped'}.`);
              }}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded transition-colors ${feed2Active ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
            >
              {feed2Active ? 'Stop Feed' : 'Start Feed'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const AutomationTab: React.FC<{ 
  addNotification: (type: any, msg: string) => void,
  rules: any[],
  setRules: React.Dispatch<React.SetStateAction<any[]>>
}> = ({ addNotification, rules, setRules }) => {

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        const newStatus = r.status === 'Active' ? 'Paused' : 'Active';
        addNotification('info', `Rule "${r.name}" is now ${newStatus}`);
        return { ...r, status: newStatus };
      }
      return r;
    }));
  };

  const handleNewRule = () => {
    addNotification('success', 'New rule template created.');
    setRules(prev => [
      ...prev,
      {
        id: `r${prev.length + 1}`,
        name: `Custom Rule ${prev.length + 1}`,
        trigger: 'condition == true',
        action: 'Execute Action',
        status: 'Paused'
      }
    ]);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-end mb-6">
        <p className="text-slate-400 text-sm max-w-lg leading-relaxed">Define edge-native automation rules. These execute locally without cloud dependency.</p>
        <button 
          onClick={handleNewRule}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all"
        >
          <PlusCircle size={16} /> New Rule
        </button>
      </div>
      <Card title="Active Rules">
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between p-4 bg-black/30 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-all">
              <div>
                <h4 className="font-bold text-white text-sm">{rule.name}</h4>
                <div className="flex gap-4 mt-2 text-[10px] font-mono text-slate-500">
                  <span>IF <span className="text-amber-400">{rule.trigger}</span></span>
                  <span>THEN <span className="text-blue-400">{rule.action}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleRule(rule.id)}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded transition-colors ${rule.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                >
                  {rule.status}
                </button>
                <button 
                  onClick={() => addNotification('info', `Configuring ${rule.name} parameters...`)}
                  className="text-slate-500 hover:text-white"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const BackupTab: React.FC<{ addNotification: (type: any, msg: string) => void }> = ({ addNotification }) => {
  const [snapshots, setSnapshots] = useState(() => {
    const saved = localStorage.getItem('pinetos_snapshots');
    return saved ? JSON.parse(saved) : [
      { id: 'snap-001', type: 'Full System', size: '4.2 GB', time: '2026-03-20 10:00' },
      { id: 'snap-002', type: 'Model Weights', size: '1.8 GB', time: '2026-03-19 10:00' },
      { id: 'snap-003', type: 'Telemetry DB', size: '250 MB', time: '2026-03-18 10:00' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('pinetos_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  const handleCreateSnapshot = async () => {
    addNotification('info', 'Creating new snapshot...');
    
    const newSnap = await createSnapshot();
    
    if (newSnap) {
      setSnapshots([newSnap, ...snapshots]);
      addNotification('success', `Snapshot ${newSnap.id} created successfully.`);
    } else {
      addNotification('error', 'Failed to create snapshot.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6">
        <p className="text-slate-400 text-sm max-w-lg leading-relaxed">Manage distributed backups across the Sovereign Mesh.</p>
        <button 
          onClick={handleCreateSnapshot}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all"
        >
          <PlusCircle size={16} /> Create Snapshot
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard title="Total Snapshots" value={snapshots.length.toString()} icon={<Archive />} subtitle="Last 30 days" />
        <StatCard title="Storage Used" value="14.2 GB" icon={<HardDrive />} subtitle="Across Mesh" />
        <StatCard title="Last Backup" value={snapshots[0]?.time || 'Never'} icon={<Check />} subtitle="Status: Verified" />
      </div>
      <Card title="Snapshot Vault">
        <div className="overflow-x-auto mt-2">
          <div className="min-w-[600px]">
            <div className="col-header grid grid-cols-5 mb-2 px-4">
              <div>Snapshot ID</div>
              <div>Type</div>
              <div>Size</div>
              <div>Timestamp</div>
              <div className="text-right">Action</div>
            </div>
            <div className="space-y-2">
              {snapshots.map((snap: any) => (
                <div key={snap.id} className="data-row grid-cols-5 items-center bg-black/20 rounded-xl border border-slate-800/50">
                  <div className="font-mono text-xs text-emerald-400">{snap.id}</div>
                  <div className="text-sm font-bold text-slate-300">{snap.type}</div>
                  <div className="text-xs text-slate-400">{snap.size}</div>
                  <div className="text-xs font-mono text-slate-500">{snap.time}</div>
                  <div className="text-right">
                    <button 
                      onClick={() => addNotification('info', `Restoring snapshot ${snap.id}...`)}
                      className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const TelemetryTab: React.FC<{ data: {time: string, temp: number, humidity: number}[] }> = ({ data }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card title="Environmental Telemetry (Real-time)">
        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" fontSize={10} />
              <YAxis stroke="#475569" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
              <Area type="monotone" dataKey="temp" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemp)" />
              <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHum)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

const SetupTab: React.FC<{ addNotification: (type: any, msg: string) => void }> = ({ addNotification }) => {
  const [strictMode, setStrictMode] = useState(() => {
    return localStorage.getItem('pinetos_strictMode') === 'true';
  });
  const [clusterName, setClusterName] = useState(() => {
    return localStorage.getItem('pinetos_clusterName') || 'Sovereign-Mesh-01';
  });
  const [subnet, setSubnet] = useState(() => {
    return localStorage.getItem('pinetos_subnet') || '10.99.0.0/24';
  });

  useEffect(() => {
    localStorage.setItem('pinetos_strictMode', strictMode.toString());
  }, [strictMode]);

  useEffect(() => {
    localStorage.setItem('pinetos_clusterName', clusterName);
  }, [clusterName]);

  useEffect(() => {
    localStorage.setItem('pinetos_subnet', subnet);
  }, [subnet]);

  const handleApply = () => {
    addNotification('success', 'Cluster configuration applied successfully.');
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500 max-w-3xl mx-auto">
      <Card title="Cluster Configuration">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleApply(); }}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Cluster Name</label>
              <input 
                type="text" 
                value={clusterName} 
                onChange={(e) => setClusterName(e.target.value)}
                className="w-full bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">WireGuard Subnet</label>
              <input 
                type="text" 
                value={subnet} 
                onChange={(e) => setSubnet(e.target.value)}
                className="w-full bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white font-mono" 
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-black/30 border border-slate-800 rounded-xl">
              <div>
                <h4 className="font-bold text-white text-sm">Strict P2P Mode</h4>
                <p className="text-[10px] text-slate-500 mt-1">Disable all outbound internet access for worker nodes.</p>
              </div>
              <div 
                onClick={() => setStrictMode(!strictMode)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${strictMode ? 'bg-emerald-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${strictMode ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all"
          >
            <Check size={18} /> Apply Configuration
          </button>
        </form>
      </Card>
    </div>
  );
};

export default App;
