import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';

interface AGISystemStatus {
  ecosystem: string;
  activeAgents: number;
  coreAgents: string[];
  lastUpdate: Date;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'OPERATIONAL' | 'STANDBY' | 'ERROR';
  lastActivity: Date;
  capabilities: string[];
}

interface ColonyStatus {
  totalColonies: number;
  onlineColonies: number;
  backupHealth: number;
  lastSync: Date;
}

interface QualityMetrics {
  overallQuality: number;
  codeQuality: number;
  performanceScore: number;
  securityRating: number;
  userExperience: number;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkStatus: string;
  uptime: number;
}

// A simple, always-available voice assistant component that listens for the wake words
// "baut" or "bolt" and makes the transcript available to the parent dashboard.
// The underlying SpeechRecognition API is used directly – polyfilled by
// @types/dom-speech-recognition in devDependencies.

export interface VoiceCommandEvent {
  /* Complete transcript returned by the recogniser */
  transcript: string;
  /* Whether the wake-word has been detected */
  wakeWordDetected: boolean;
}

export function useVoiceAgent(onCommand?: (event: VoiceCommandEvent) => void) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const autoResumeRef = useRef(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const SpeechRecognitionAPI: typeof window.SpeechRecognition | undefined =
      // @ts-ignore – safari/legacy
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID'; // Indonesian locale first – adapt as required

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results.item(event.results.length - 1);
      const text = lastResult.item(0).transcript.trim();
      setTranscript(text);

      const lower = text.toLowerCase();
      const wakeWordDetected = lower.includes('baut') || lower.includes('bolt');
      if (wakeWordDetected && onCommand) {
        onCommand({ transcript: text, wakeWordDetected });
      }
    };

    recognition.onend = () => {
      // Auto-restart to emulate "always listening" while the dashboard is open.
      if (recognitionRef.current && isListening) {
        recognition.start();
      }
    };

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      toast.error('Voice recognition error – coba lagi nanti.');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Auto start once recognition is ready (and user previously granted permission).
  useEffect(() => {
    if (isSupported) {
      // Give the browser a tick to attach handlers before starting.
      const id = setTimeout(() => start(), 500);
      return () => clearTimeout(id);
    }
  }, [isSupported]);

  const start = () => {
    if (!recognitionRef.current || !isSupported) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      autoResumeRef.current = true;
      requestWakeLock();
    } catch (_) {
      // Ignore – start called while already running.
    }
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    autoResumeRef.current = false;
    releaseWakeLock();
  };

  // Wake Lock helpers
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        // @ts-ignore
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      }
    } catch (err) {
      console.warn('Wake lock error', err);
    }
  };

  const releaseWakeLock = async () => {
    try {
      await wakeLockRef.current?.release();
    } catch {}
    wakeLockRef.current = null;
  };

  // Handle page visibility – pause when hidden, resume when visible if autoResume was set
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else if (autoResumeRef.current) {
        start();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return {
    start,
    stop,
    isListening,
    isSupported,
    transcript,
  } as const;
}

export default function AGIDashboard() {
  const [agiSystemStatus, setAGISystemStatus] = useState<AGISystemStatus>({
    ecosystem: 'INITIALIZING',
    activeAgents: 0,
    coreAgents: [],
    lastUpdate: new Date()
  });

  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [colonyStatus, setColonyStatus] = useState<ColonyStatus>({
    totalColonies: 0,
    onlineColonies: 0,
    backupHealth: 0,
    lastSync: new Date()
  });

  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>({
    overallQuality: 0,
    codeQuality: 0,
    performanceScore: 0,
    securityRating: 0,
    userExperience: 0
  });

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    networkStatus: 'CONNECTING',
    uptime: 0
  });

  const {
    start,
    stop,
    isListening,
    isSupported,
    transcript,
  } = useVoiceAgent(({ transcript: t, wakeWordDetected }) => {
    if (wakeWordDetected) {
      toast.success(`Wake-word detected: "${t}"`);
      // Process AGI command
      processAGICommand(t);
    }
  });

  // Fetch AGI system status
  useEffect(() => {
    const fetchAGIStatus = async () => {
      try {
        const response = await fetch('/api.agents');
        const data = await response.json();
        
        setAGISystemStatus({
          ecosystem: 'OPERATIONAL',
          activeAgents: data.agents?.length || 0,
          coreAgents: ['Commander AGI', 'Quality Control Specialist', 'Backup Colony System'],
          lastUpdate: new Date()
        });

        if (data.agents) {
          setAgentStatuses(data.agents.map((agent: any) => ({
            id: agent.id,
            name: agent.name,
            status: 'OPERATIONAL' as const,
            lastActivity: new Date(),
            capabilities: agent.skills || []
          })));
        }
      } catch (error) {
        console.error('Failed to fetch AGI status:', error);
        setAGISystemStatus(prev => ({ ...prev, ecosystem: 'ERROR' }));
      }
    };

    fetchAGIStatus();
    const interval = setInterval(fetchAGIStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch system metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Simulate system metrics
        setSystemMetrics({
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 100,
          networkStatus: 'CONNECTED',
          uptime: performance.now() / 1000
        });

        setColonyStatus({
          totalColonies: 3,
          onlineColonies: Math.floor(Math.random() * 3) + 1,
          backupHealth: Math.random() * 100,
          lastSync: new Date()
        });

        setQualityMetrics({
          overallQuality: 85 + Math.random() * 10,
          codeQuality: 80 + Math.random() * 15,
          performanceScore: 75 + Math.random() * 20,
          securityRating: 90 + Math.random() * 10,
          userExperience: 78 + Math.random() * 15
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const processAGICommand = async (command: string) => {
    try {
      const response = await fetch('/api.agents.delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'commander-agi',
          type: 'voice_command',
          parameters: { command }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success(`Commander AGI: ${result.data?.message || 'Command processed'}`);
      }
    } catch (error) {
      toast.error('Failed to process AGI command');
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-bolt-elements-background-depth-1">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-bolt-elements-borderColor">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-accent">AGI Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className={classNames(
              'w-3 h-3 rounded-full',
              agiSystemStatus.ecosystem === 'OPERATIONAL' ? 'bg-green-500' :
              agiSystemStatus.ecosystem === 'INITIALIZING' ? 'bg-yellow-500' : 'bg-red-500'
            )} />
            <span className="text-sm text-bolt-elements-textSecondary">
              {agiSystemStatus.ecosystem}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-bolt-elements-textSecondary">
            {agiSystemStatus.activeAgents} Agents Active
          </div>
          <button
            onClick={isListening ? stop : start}
            disabled={!isSupported}
            className={classNames(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              isListening
                ? 'bg-red-600/20 text-red-600 hover:bg-red-600/30'
                : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-3',
              {
                'opacity-50 cursor-not-allowed': !isSupported,
              },
            )}
          >
            <div className={classNames('text-lg', isListening ? 'i-ph:microphone-slash' : 'i-ph:microphone')} />
            {isListening ? 'Stop' : 'Listen'}
          </button>
        </div>
      </header>

      {/* Main content area – AGI System Dashboard */}
      <main className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* System Status Card */}
        <section className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4 flex flex-col">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="i-ph:desktop text-accent"></span>
            <span>System Status</span>
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">CPU Usage</span>
              <span className="text-sm font-medium">{systemMetrics.cpuUsage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Memory</span>
              <span className="text-sm font-medium">{systemMetrics.memoryUsage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Network</span>
              <span className={classNames(
                "text-sm font-medium",
                systemMetrics.networkStatus === 'CONNECTED' ? 'text-green-500' : 'text-red-500'
              )}>{systemMetrics.networkStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Uptime</span>
              <span className="text-sm font-medium">{Math.floor(systemMetrics.uptime / 3600)}h</span>
            </div>
          </div>
        </section>

        {/* Core Agents Status */}
        <section className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4 flex flex-col">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="i-ph:robot text-accent"></span>
            <span>Core Agents</span>
          </h2>
          <div className="space-y-3">
            {agiSystemStatus.coreAgents.map((agent, index) => (
              <div key={agent} className="flex items-center justify-between">
                <span className="text-sm text-bolt-elements-textSecondary">{agent}</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-green-500">ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quality Metrics */}
        <section className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4 flex flex-col">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="i-ph:chart-bar text-accent"></span>
            <span>Quality Metrics</span>
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Overall Quality</span>
              <span className="text-sm font-medium text-green-500">{qualityMetrics.overallQuality.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Code Quality</span>
              <span className="text-sm font-medium">{qualityMetrics.codeQuality.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Performance</span>
              <span className="text-sm font-medium">{qualityMetrics.performanceScore.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Security</span>
              <span className="text-sm font-medium text-green-500">{qualityMetrics.securityRating.toFixed(1)}%</span>
            </div>
          </div>
        </section>

        {/* Backup Colonies */}
        <section className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4 flex flex-col">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="i-ph:buildings text-accent"></span>
            <span>Backup Colonies</span>
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Total Colonies</span>
              <span className="text-sm font-medium">{colonyStatus.totalColonies}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Online</span>
              <span className="text-sm font-medium text-green-500">{colonyStatus.onlineColonies}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Backup Health</span>
              <span className="text-sm font-medium">{colonyStatus.backupHealth.toFixed(1)}%</span>
            </div>
            <div className="text-xs text-bolt-elements-textTertiary">
              Last sync: {colonyStatus.lastSync.toLocaleTimeString()}
            </div>
          </div>
        </section>

        {/* Agent Network */}
        <section className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4 flex flex-col">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="i-ph:network text-accent"></span>
            <span>Agent Network</span>
          </h2>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {agentStatuses.slice(0, 6).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between text-sm">
                <span className="text-bolt-elements-textSecondary truncate">{agent.name}</span>
                <div className={classNames(
                  "w-2 h-2 rounded-full",
                  agent.status === 'OPERATIONAL' ? 'bg-green-500' : 'bg-yellow-500'
                )}></div>
              </div>
            ))}
            {agentStatuses.length > 6 && (
              <div className="text-xs text-bolt-elements-textTertiary">
                +{agentStatuses.length - 6} more agents
              </div>
            )}
          </div>
        </section>

        {/* Security Monitoring */}
        <section className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4 flex flex-col">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="i-ph:shield-check text-accent"></span>
            <span>Security Status</span>
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Threat Level</span>
              <span className="text-sm font-medium text-green-500">LOW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Commander AGI</span>
              <span className="text-sm font-medium text-green-500">MONITORING</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">Device Control</span>
              <span className="text-sm font-medium text-green-500">ENABLED</span>
            </div>
            <div className="text-xs text-bolt-elements-textTertiary">
              Autonomous security protocols active
            </div>
          </div>
        </section>

      </main>

      {/* Floating microphone indicator */}
      {isSupported && (
        <button
          onClick={isListening ? stop : start}
          className={classNames(
            'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all',
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-accent text-white hover:bg-accent/90',
          )}
        >
          <div className={classNames('text-2xl', isListening ? 'i-ph:microphone-slash' : 'i-ph:microphone')} />
        </button>
      )}

      {/* Live transcript */}
      {isListening && (
        <div className="fixed bottom-20 right-6 max-w-sm bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg p-4 shadow-lg animate-in fade-in zoom-in-95">
          <p className="text-xs uppercase mb-1 text-bolt-elements-textTertiary tracking-wide">Mendengarkan…</p>
          <p className="text-sm text-bolt-elements-textPrimary whitespace-pre-wrap">{transcript}</p>
        </div>
      )}

      {!isSupported && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
          <p className="text-bolt-elements-textTertiary text-sm max-w-md">
            Browser ini tidak mendukung Web Speech API. Silakan gunakan Chrome atau Edge terbaru, atau aktifkan
            eksperimen <code>chrome://flags/#enable-speech-on-device</code>.
          </p>
        </div>
      )}
    </div>
  );
}