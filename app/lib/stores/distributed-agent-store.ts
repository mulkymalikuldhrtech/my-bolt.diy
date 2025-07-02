import { atom, computed, action, map } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';
import { z } from 'zod';

// Agent data schemas
const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['specialist', 'generalist', 'coordinator']),
  role: z.string(),
  capabilities: z.array(z.string()),
  status: z.enum(['active', 'idle', 'offline', 'migrating']),
  location: z.object({
    host: z.string(),
    platform: z.string(),
    region: z.string().optional(),
    lastSeen: z.date()
  }),
  configuration: z.object({
    cognitiveMode: z.enum(['creative', 'analytical', 'collaborative', 'autonomous']),
    learningRate: z.number().min(0).max(1),
    autonomyLevel: z.number().min(0).max(1),
    collaborationPreference: z.number().min(0).max(1)
  }),
  knowledge: z.object({
    domains: z.array(z.string()),
    skills: z.record(z.number()), // skill -> proficiency level
    experience: z.array(z.object({
      task: z.string(),
      outcome: z.string(),
      success: z.boolean(),
      timestamp: z.date()
    }))
  }),
  performance: z.object({
    tasksCompleted: z.number(),
    successRate: z.number(),
    averageResponseTime: z.number(),
    collaborationScore: z.number(),
    learningProgress: z.number()
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assignedAgents: z.array(z.string()),
  teamId: z.string().optional(),
  requiredCapabilities: z.array(z.string()),
  deadline: z.date().optional(),
  progress: z.number().min(0).max(100),
  results: z.array(z.object({
    agentId: z.string(),
    output: z.any(),
    timestamp: z.date(),
    quality: z.number().min(0).max(1)
  })),
  metadata: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date()
});

const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string(),
  members: z.array(z.object({
    agentId: z.string(),
    role: z.string(),
    joinedAt: z.date()
  })),
  leader: z.string().optional(),
  status: z.enum(['forming', 'active', 'paused', 'dissolved']),
  performance: z.object({
    efficiency: z.number(),
    collaboration: z.number(),
    success_rate: z.number()
  }),
  communication: z.object({
    channels: z.array(z.string()),
    lastActivity: z.date(),
    messageCount: z.number()
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

type Agent = z.infer<typeof AgentSchema>;
type Task = z.infer<typeof TaskSchema>;
type Team = z.infer<typeof TeamSchema>;

// Distributed storage configuration
const STORAGE_CONFIG = {
  localStoragePrefix: 'agi_agent_',
  syncEndpoints: [
    'ws://localhost:8080/sync',
    'https://api.agi-system.com/sync',
    'https://backup.agi-system.com/sync'
  ],
  backupInterval: 30000, // 30 seconds
  syncRetryAttempts: 3,
  offlineModeEnabled: true,
  compressionEnabled: true,
  encryptionEnabled: true
};

// Distributed data stores with local persistence
export const agentsStore = persistentMap<Record<string, Agent>>(
  `${STORAGE_CONFIG.localStoragePrefix}agents:`,
  {}
);

export const tasksStore = persistentMap<Record<string, Task>>(
  `${STORAGE_CONFIG.localStoragePrefix}tasks:`,
  {}
);

export const teamsStore = persistentMap<Record<string, Team>>(
  `${STORAGE_CONFIG.localStoragePrefix}teams:`,
  {}
);

export const promptLibraryStore = persistentMap<Record<string, any>>(
  `${STORAGE_CONFIG.localStoragePrefix}prompts:`,
  {}
);

export const knowledgeBaseStore = persistentMap<Record<string, any>>(
  `${STORAGE_CONFIG.localStoragePrefix}knowledge:`,
  {}
);

// Connection and sync status
export const connectionStatus = atom<{
  status: 'connected' | 'connecting' | 'offline' | 'error';
  connectedEndpoints: string[];
  lastSync: Date | null;
  syncInProgress: boolean;
  pendingChanges: number;
}>({
  status: 'offline',
  connectedEndpoints: [],
  lastSync: null,
  syncInProgress: false,
  pendingChanges: 0
});

// Current system info
export const systemInfo = atom<{
  nodeId: string;
  platform: string;
  host: string;
  region: string;
  capabilities: string[];
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
}>({
  nodeId: crypto.randomUUID(),
  platform: typeof window !== 'undefined' ? 'browser' : 'node',
  host: typeof window !== 'undefined' ? window.location.host : 'localhost',
  region: 'unknown',
  capabilities: ['data_storage', 'agent_hosting', 'task_processing'],
  resources: {
    cpu: 0,
    memory: 0,
    storage: 0
  }
});

// Distributed sync manager
class DistributedSyncManager {
  private connections: Map<string, WebSocket> = new Map();
  private syncQueue: Array<{ operation: string; data: any; timestamp: Date }> = [];
  private retryTimers: Map<string, NodeJS.Timeout> = new Map();
  private isOnline = navigator?.onLine ?? true;

  constructor() {
    this.initializeConnections();
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private async initializeConnections() {
    for (const endpoint of STORAGE_CONFIG.syncEndpoints) {
      try {
        await this.connectToEndpoint(endpoint);
      } catch (error) {
        console.warn(`Failed to connect to ${endpoint}:`, error);
      }
    }
  }

  private async connectToEndpoint(endpoint: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(endpoint);
      
      ws.onopen = () => {
        console.log(`Connected to sync endpoint: ${endpoint}`);
        this.connections.set(endpoint, ws);
        
        // Send identification and request sync
        ws.send(JSON.stringify({
          type: 'identify',
          nodeId: systemInfo.get().nodeId,
          platform: systemInfo.get().platform,
          capabilities: systemInfo.get().capabilities,
          timestamp: new Date().toISOString()
        }));

        this.updateConnectionStatus();
        resolve();
      };

      ws.onerror = (error) => {
        console.error(`Connection error to ${endpoint}:`, error);
        reject(error);
      };

      ws.onclose = () => {
        console.log(`Disconnected from ${endpoint}`);
        this.connections.delete(endpoint);
        this.updateConnectionStatus();
        this.scheduleReconnection(endpoint);
      };

      ws.onmessage = (event) => {
        this.handleIncomingSync(event.data, endpoint);
      };

      // Connection timeout
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  private scheduleReconnection(endpoint: string) {
    if (this.retryTimers.has(endpoint)) return;

    const timer = setTimeout(() => {
      this.retryTimers.delete(endpoint);
      this.connectToEndpoint(endpoint).catch(() => {
        // Exponential backoff for failed reconnections
        setTimeout(() => this.scheduleReconnection(endpoint), 5000);
      });
    }, 2000);

    this.retryTimers.set(endpoint, timer);
  }

  private handleIncomingSync(data: string, endpoint: string) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'sync_request':
          this.handleSyncRequest(message, endpoint);
          break;
        case 'sync_data':
          this.handleSyncData(message);
          break;
        case 'conflict_resolution':
          this.handleConflictResolution(message);
          break;
        case 'node_discovery':
          this.handleNodeDiscovery(message);
          break;
      }
    } catch (error) {
      console.error('Error handling sync message:', error);
    }
  }

  private async handleSyncRequest(message: any, endpoint: string) {
    const localData = {
      agents: agentsStore.get(),
      tasks: tasksStore.get(),
      teams: teamsStore.get(),
      prompts: promptLibraryStore.get(),
      knowledge: knowledgeBaseStore.get(),
      timestamp: new Date().toISOString(),
      nodeId: systemInfo.get().nodeId
    };

    const ws = this.connections.get(endpoint);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'sync_response',
        data: localData,
        requestId: message.requestId
      }));
    }
  }

  private async handleSyncData(message: any) {
    const { data, sourceNodeId, timestamp } = message;
    
    // Merge incoming data with local data using conflict resolution
    await this.mergeData('agents', data.agents, sourceNodeId, timestamp);
    await this.mergeData('tasks', data.tasks, sourceNodeId, timestamp);
    await this.mergeData('teams', data.teams, sourceNodeId, timestamp);
    await this.mergeData('prompts', data.prompts, sourceNodeId, timestamp);
    await this.mergeData('knowledge', data.knowledge, sourceNodeId, timestamp);

    connectionStatus.set({
      ...connectionStatus.get(),
      lastSync: new Date(timestamp),
      pendingChanges: Math.max(0, connectionStatus.get().pendingChanges - 1)
    });
  }

  private async mergeData(storeType: string, incomingData: any, sourceNodeId: string, timestamp: string) {
    const stores = {
      agents: agentsStore,
      tasks: tasksStore,
      teams: teamsStore,
      prompts: promptLibraryStore,
      knowledge: knowledgeBaseStore
    };

    const store = stores[storeType as keyof typeof stores];
    if (!store || !incomingData) return;

    const localData = store.get();
    const mergedData = { ...localData };

    for (const [id, remoteItem] of Object.entries(incomingData)) {
      const localItem = localData[id];
      
      if (!localItem) {
        // New item from remote
        mergedData[id] = remoteItem;
      } else {
        // Conflict resolution: use timestamp-based last-write-wins
        const localTimestamp = new Date(localItem.updatedAt || localItem.createdAt);
        const remoteTimestamp = new Date((remoteItem as any).updatedAt || (remoteItem as any).createdAt);
        
        if (remoteTimestamp > localTimestamp) {
          mergedData[id] = remoteItem;
        }
        // Keep local if it's newer or equal
      }
    }

    store.set(mergedData);
  }

  private handleConflictResolution(message: any) {
    // Advanced conflict resolution logic
    console.log('Handling conflict resolution:', message);
  }

  private handleNodeDiscovery(message: any) {
    console.log('Discovered node:', message.nodeInfo);
    // Update network topology
  }

  private setupEventListeners() {
    // Listen for store changes to trigger sync
    agentsStore.subscribe(() => this.queueSync('agents'));
    tasksStore.subscribe(() => this.queueSync('tasks'));
    teamsStore.subscribe(() => this.queueSync('teams'));
    promptLibraryStore.subscribe(() => this.queueSync('prompts'));
    knowledgeBaseStore.subscribe(() => this.queueSync('knowledge'));

    // Network status changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.initializeConnections();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.updateConnectionStatus();
      });
    }
  }

  private queueSync(storeType: string) {
    this.syncQueue.push({
      operation: `update_${storeType}`,
      data: this.getStoreData(storeType),
      timestamp: new Date()
    });

    connectionStatus.set({
      ...connectionStatus.get(),
      pendingChanges: connectionStatus.get().pendingChanges + 1
    });

    // Debounce sync
    this.debouncedSync();
  }

  private debouncedSync = this.debounce(() => {
    this.performSync();
  }, 1000);

  private async performSync() {
    if (!this.isOnline || this.connections.size === 0) return;

    connectionStatus.set({
      ...connectionStatus.get(),
      syncInProgress: true
    });

    const syncData = {
      type: 'sync_data',
      data: {
        agents: agentsStore.get(),
        tasks: tasksStore.get(),
        teams: teamsStore.get(),
        prompts: promptLibraryStore.get(),
        knowledge: knowledgeBaseStore.get()
      },
      nodeId: systemInfo.get().nodeId,
      timestamp: new Date().toISOString(),
      changes: this.syncQueue.splice(0) // Clear queue
    };

    const promises = Array.from(this.connections.values()).map(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        return new Promise<void>((resolve) => {
          ws.send(JSON.stringify(syncData));
          resolve();
        });
      }
      return Promise.resolve();
    });

    await Promise.allSettled(promises);

    connectionStatus.set({
      ...connectionStatus.get(),
      syncInProgress: false,
      lastSync: new Date(),
      pendingChanges: 0
    });
  }

  private getStoreData(storeType: string) {
    const stores = {
      agents: agentsStore,
      tasks: tasksStore,
      teams: teamsStore,
      prompts: promptLibraryStore,
      knowledge: knowledgeBaseStore
    };
    return stores[storeType as keyof typeof stores]?.get() || {};
  }

  private updateConnectionStatus() {
    const connectedEndpoints = Array.from(this.connections.keys()).filter(endpoint => {
      const ws = this.connections.get(endpoint);
      return ws && ws.readyState === WebSocket.OPEN;
    });

    let status: 'connected' | 'connecting' | 'offline' | 'error' = 'offline';
    if (connectedEndpoints.length > 0) {
      status = 'connected';
    } else if (this.connections.size > 0) {
      status = 'connecting';
    } else if (!this.isOnline) {
      status = 'offline';
    } else {
      status = 'error';
    }

    connectionStatus.set({
      ...connectionStatus.get(),
      status,
      connectedEndpoints
    });
  }

  private startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && this.connections.size > 0) {
        this.requestFullSync();
      }
    }, STORAGE_CONFIG.backupInterval);
  }

  private requestFullSync() {
    const syncRequest = {
      type: 'sync_request',
      nodeId: systemInfo.get().nodeId,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    };

    this.connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(syncRequest));
      }
    });
  }

  private debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Platform integration methods
  async integrateWithPlatform(platform: string, credentials: any) {
    const integrationEndpoint = `${platform}_integration`;
    // Platform-specific integration logic
    console.log(`Integrating with ${platform}:`, credentials);
  }

  async deployToRemotePlatform(agentId: string, targetPlatform: string) {
    const agent = agentsStore.get()[agentId];
    if (!agent) throw new Error('Agent not found');

    // Create deployment package
    const deploymentPackage = {
      agent,
      dependencies: this.getAgentDependencies(agent),
      configuration: this.getDeploymentConfig(targetPlatform),
      homeNodeInfo: systemInfo.get()
    };

    // Send to deployment service
    return this.sendDeploymentRequest(deploymentPackage, targetPlatform);
  }

  private getAgentDependencies(agent: Agent) {
    return {
      knowledge: this.getAgentKnowledge(agent.id),
      prompts: this.getAgentPrompts(agent.capabilities),
      tools: this.getAgentTools(agent.capabilities)
    };
  }

  private getAgentKnowledge(agentId: string) {
    const knowledge = knowledgeBaseStore.get();
    return Object.entries(knowledge).filter(([key, value]) => 
      key.includes(agentId) || (value as any).relevantAgents?.includes(agentId)
    );
  }

  private getAgentPrompts(capabilities: string[]) {
    const prompts = promptLibraryStore.get();
    return Object.entries(prompts).filter(([key, value]) =>
      capabilities.some(cap => key.includes(cap) || (value as any).capabilities?.includes(cap))
    );
  }

  private getAgentTools(capabilities: string[]) {
    // Return tools based on capabilities
    return capabilities.map(cap => ({
      name: cap,
      config: this.getToolConfig(cap)
    }));
  }

  private getToolConfig(capability: string) {
    const toolConfigs = {
      'code_generation': { runtime: 'node', timeout: 30000 },
      'data_analysis': { memory: '2GB', cpu: '1.0' },
      'image_processing': { gpu: true, memory: '4GB' },
      'text_processing': { nlp_models: ['spacy', 'transformers'] }
    };
    return toolConfigs[capability as keyof typeof toolConfigs] || {};
  }

  private getDeploymentConfig(platform: string) {
    const configs = {
      'aws': { region: 'us-east-1', instance: 't3.medium' },
      'gcp': { zone: 'us-central1-a', machine: 'e2-standard-2' },
      'azure': { location: 'East US', size: 'Standard_B2s' },
      'docker': { image: 'node:18-alpine', ports: [8080] },
      'kubernetes': { namespace: 'agi-agents', replicas: 1 }
    };
    return configs[platform as keyof typeof configs] || {};
  }

  private async sendDeploymentRequest(deploymentPackage: any, targetPlatform: string) {
    // This would integrate with actual deployment services
    console.log(`Deploying to ${targetPlatform}:`, deploymentPackage);
    
    // Simulate deployment process
    return {
      deploymentId: crypto.randomUUID(),
      status: 'pending',
      platform: targetPlatform,
      endpoint: `https://${targetPlatform}-agent-${Date.now()}.com`,
      estimatedTime: '5 minutes'
    };
  }
}

// Initialize the distributed sync manager
export const syncManager = new DistributedSyncManager();

// Agent management actions
export const agentActions = {
  createAgent: action(agentsStore, 'createAgent', (store, agentData: Partial<Agent>) => {
    const agent: Agent = {
      id: crypto.randomUUID(),
      name: agentData.name || 'Unnamed Agent',
      type: agentData.type || 'generalist',
      role: agentData.role || 'assistant',
      capabilities: agentData.capabilities || [],
      status: 'active',
      location: {
        host: systemInfo.get().host,
        platform: systemInfo.get().platform,
        region: systemInfo.get().region,
        lastSeen: new Date()
      },
      configuration: {
        cognitiveMode: 'adaptive',
        learningRate: 0.1,
        autonomyLevel: 0.5,
        collaborationPreference: 0.7,
        ...agentData.configuration
      },
      knowledge: {
        domains: [],
        skills: {},
        experience: [],
        ...agentData.knowledge
      },
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
        collaborationScore: 0,
        learningProgress: 0,
        ...agentData.performance
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const agents = store.get();
    store.set({ ...agents, [agent.id]: agent });
    return agent;
  }),

  updateAgent: action(agentsStore, 'updateAgent', (store, agentId: string, updates: Partial<Agent>) => {
    const agents = store.get();
    const agent = agents[agentId];
    if (!agent) return null;

    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date()
    };

    store.set({ ...agents, [agentId]: updatedAgent });
    return updatedAgent;
  }),

  deleteAgent: action(agentsStore, 'deleteAgent', (store, agentId: string) => {
    const agents = store.get();
    const { [agentId]: removed, ...remaining } = agents;
    store.set(remaining);
    return removed;
  }),

  deployAgent: async (agentId: string, targetPlatform: string) => {
    return await syncManager.deployToRemotePlatform(agentId, targetPlatform);
  }
};

// Task management actions
export const taskActions = {
  createTask: action(tasksStore, 'createTask', (store, taskData: Partial<Task>) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: 'pending',
      priority: taskData.priority || 'medium',
      assignedAgents: taskData.assignedAgents || [],
      teamId: taskData.teamId,
      requiredCapabilities: taskData.requiredCapabilities || [],
      deadline: taskData.deadline,
      progress: 0,
      results: [],
      metadata: taskData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const tasks = store.get();
    store.set({ ...tasks, [task.id]: task });
    return task;
  }),

  updateTask: action(tasksStore, 'updateTask', (store, taskId: string, updates: Partial<Task>) => {
    const tasks = store.get();
    const task = tasks[taskId];
    if (!task) return null;

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date()
    };

    store.set({ ...tasks, [taskId]: updatedTask });
    return updatedTask;
  }),

  assignTask: action(tasksStore, 'assignTask', (store, taskId: string, agentIds: string[]) => {
    const tasks = store.get();
    const task = tasks[taskId];
    if (!task) return null;

    const updatedTask = {
      ...task,
      assignedAgents: [...new Set([...task.assignedAgents, ...agentIds])],
      status: 'in_progress' as const,
      updatedAt: new Date()
    };

    store.set({ ...tasks, [taskId]: updatedTask });
    return updatedTask;
  })
};

// Team management actions
export const teamActions = {
  createTeam: action(teamsStore, 'createTeam', (store, teamData: Partial<Team>) => {
    const team: Team = {
      id: crypto.randomUUID(),
      name: teamData.name || 'Unnamed Team',
      purpose: teamData.purpose || '',
      members: teamData.members || [],
      leader: teamData.leader,
      status: 'forming',
      performance: {
        efficiency: 0,
        collaboration: 0,
        success_rate: 0,
        ...teamData.performance
      },
      communication: {
        channels: [],
        lastActivity: new Date(),
        messageCount: 0,
        ...teamData.communication
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const teams = store.get();
    store.set({ ...teams, [team.id]: team });
    return team;
  }),

  addTeamMember: action(teamsStore, 'addTeamMember', (store, teamId: string, agentId: string, role: string) => {
    const teams = store.get();
    const team = teams[teamId];
    if (!team) return null;

    const updatedTeam = {
      ...team,
      members: [
        ...team.members,
        { agentId, role, joinedAt: new Date() }
      ],
      status: team.members.length === 0 ? 'active' as const : team.status,
      updatedAt: new Date()
    };

    store.set({ ...teams, [teamId]: updatedTeam });
    return updatedTeam;
  })
};

// Computed values for dashboard
export const agentStatistics = computed([agentsStore], (agents) => {
  const agentList = Object.values(agents);
  return {
    total: agentList.length,
    active: agentList.filter(a => a.status === 'active').length,
    specialist: agentList.filter(a => a.type === 'specialist').length,
    generalist: agentList.filter(a => a.type === 'generalist').length,
    coordinator: agentList.filter(a => a.type === 'coordinator').length,
    averagePerformance: agentList.reduce((sum, a) => sum + a.performance.successRate, 0) / agentList.length || 0
  };
});

export const taskStatistics = computed([tasksStore], (tasks) => {
  const taskList = Object.values(tasks);
  return {
    total: taskList.length,
    pending: taskList.filter(t => t.status === 'pending').length,
    inProgress: taskList.filter(t => t.status === 'in_progress').length,
    completed: taskList.filter(t => t.status === 'completed').length,
    failed: taskList.filter(t => t.status === 'failed').length
  };
});

export const teamStatistics = computed([teamsStore], (teams) => {
  const teamList = Object.values(teams);
  return {
    total: teamList.length,
    active: teamList.filter(t => t.status === 'active').length,
    forming: teamList.filter(t => t.status === 'forming').length,
    dissolved: teamList.filter(t => t.status === 'dissolved').length,
    averageSize: teamList.reduce((sum, t) => sum + t.members.length, 0) / teamList.length || 0
  };
});

// Export all stores and actions
export {
  type Agent,
  type Task,
  type Team,
  AgentSchema,
  TaskSchema,
  TeamSchema
};