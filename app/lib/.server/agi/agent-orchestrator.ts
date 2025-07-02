import { EventEmitter } from 'events';

// Types for AGI Agent System
interface Agent {
  id: string;
  name: string;
  type: 'specialist' | 'generalist' | 'coordinator';
  role: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'offline' | 'migrating';
  location: {
    host: string;
    platform: string;
    region?: string;
    lastSeen: Date;
  };
  configuration: {
    cognitiveMode: 'creative' | 'analytical' | 'collaborative' | 'autonomous';
    learningRate: number;
    autonomyLevel: number;
    collaborationPreference: number;
  };
  knowledge: {
    domains: string[];
    skills: Record<string, number>;
    experience: Array<{
      task: string;
      outcome: string;
      success: boolean;
      timestamp: Date;
    }>;
  };
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
    collaborationScore: number;
    learningProgress: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgents: string[];
  teamId?: string;
  requiredCapabilities: string[];
  deadline?: Date;
  progress: number;
  results: Array<{
    agentId: string;
    output: any;
    timestamp: Date;
    quality: number;
  }>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface Team {
  id: string;
  name: string;
  purpose: string;
  members: Array<{
    agentId: string;
    role: string;
    joinedAt: Date;
  }>;
  leader?: string;
  status: 'forming' | 'active' | 'paused' | 'dissolved';
  performance: {
    efficiency: number;
    collaboration: number;
    success_rate: number;
  };
  communication: {
    channels: string[];
    lastActivity: Date;
    messageCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AgentMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  teamId?: string;
  type: 'task_request' | 'collaboration' | 'knowledge_share' | 'status_update' | 'help_request';
  content: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  responseRequired: boolean;
  expiresAt?: Date;
}

// AGI Agent Orchestrator - Central brain of the multi-agent system
export class AGIAgentOrchestrator extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, Task> = new Map();
  private teams: Map<string, Team> = new Map();
  private messageQueue: AgentMessage[] = [];
  private performanceMetrics: Map<string, any> = new Map();
  private knowledgeGraph: Map<string, any> = new Map();
  private collaborationNetwork: Map<string, Set<string>> = new Map();
  private autonomousLoop: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeSystem();
  }

  private initializeSystem() {
    // Start autonomous monitoring and optimization loop
    this.autonomousLoop = setInterval(() => {
      this.performAutonomousOptimization();
    }, 10000); // Every 10 seconds

    // Set up event listeners
    this.setupEventHandlers();
    
    console.log('🧠 AGI Agent Orchestrator initialized');
  }

  private setupEventHandlers() {
    this.on('agent_created', this.handleAgentCreated.bind(this));
    this.on('task_assigned', this.handleTaskAssigned.bind(this));
    this.on('team_formed', this.handleTeamFormed.bind(this));
    this.on('collaboration_requested', this.handleCollaborationRequest.bind(this));
    this.on('knowledge_shared', this.handleKnowledgeSharing.bind(this));
    this.on('performance_updated', this.handlePerformanceUpdate.bind(this));
  }

  // Agent Management
  public async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    const agent: Agent = {
      id: this.generateId(),
      name: agentData.name || 'Unnamed Agent',
      type: agentData.type || 'generalist',
      role: agentData.role || 'assistant',
      capabilities: agentData.capabilities || [],
      status: 'active',
      location: {
        host: 'localhost',
        platform: 'agi-system',
        region: 'primary',
        lastSeen: new Date(),
        ...agentData.location
      },
      configuration: {
        cognitiveMode: 'collaborative',
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

    this.agents.set(agent.id, agent);
    this.emit('agent_created', agent);
    
    return agent;
  }

  public async createSpecialistAgent(domain: string, capabilities: string[]): Promise<Agent> {
    const specialistPrompts = this.generateSpecialistPrompts(domain, capabilities);
    
    return this.createAgent({
      name: `${domain} Specialist`,
      type: 'specialist',
      role: `Expert in ${domain}`,
      capabilities,
      configuration: {
        cognitiveMode: 'analytical',
        learningRate: 0.15,
        autonomyLevel: 0.8,
        collaborationPreference: 0.6
      },
      knowledge: {
        domains: [domain],
        skills: capabilities.reduce((acc, cap) => ({ ...acc, [cap]: 0.9 }), {}),
        experience: []
      }
    });
  }

  private generateSpecialistPrompts(domain: string, capabilities: string[]): string[] {
    const promptTemplates = {
      'programming': [
        'You are an expert programmer specializing in {language}. Focus on clean, efficient code.',
        'Analyze code for bugs, performance issues, and best practices.',
        'Generate comprehensive tests and documentation.'
      ],
      'data_analysis': [
        'You are a data scientist expert. Analyze patterns and extract insights.',
        'Create visualizations and statistical summaries.',
        'Recommend data-driven decisions based on analysis.'
      ],
      'creative_writing': [
        'You are a creative writing expert. Craft engaging, original content.',
        'Adapt writing style to target audience and purpose.',
        'Generate ideas and develop compelling narratives.'
      ],
      'research': [
        'You are a research specialist. Gather comprehensive information.',
        'Evaluate source credibility and synthesize findings.',
        'Present research in clear, structured formats.'
      ]
    };

    return promptTemplates[domain as keyof typeof promptTemplates] || [
      `You are an expert in ${domain}. Apply your specialized knowledge effectively.`
    ];
  }

  // Task Management and Distribution
  public async createTask(taskData: Partial<Task>): Promise<Task> {
    const task: Task = {
      id: this.generateId(),
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: 'pending',
      priority: taskData.priority || 'medium',
      assignedAgents: [],
      teamId: taskData.teamId,
      requiredCapabilities: taskData.requiredCapabilities || [],
      deadline: taskData.deadline,
      progress: 0,
      results: [],
      metadata: taskData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(task.id, task);
    
    // Auto-assign task to suitable agents
    await this.autoAssignTask(task);
    
    return task;
  }

  private async autoAssignTask(task: Task): Promise<void> {
    const suitableAgents = this.findSuitableAgents(task.requiredCapabilities);
    
    if (suitableAgents.length === 0) {
      // Create specialized agent if none exist
      const newAgent = await this.createSpecialistForTask(task);
      suitableAgents.push(newAgent);
    }

    // Assign task based on complexity and agent availability
    const assignedAgents = this.selectOptimalAgents(suitableAgents, task);
    
    task.assignedAgents = assignedAgents.map(agent => agent.id);
    task.status = 'in_progress';
    task.updatedAt = new Date();

    this.tasks.set(task.id, task);
    this.emit('task_assigned', { task, agents: assignedAgents });
  }

  private findSuitableAgents(requiredCapabilities: string[]): Agent[] {
    return Array.from(this.agents.values()).filter(agent => {
      if (agent.status !== 'active') return false;
      
      const hasCapabilities = requiredCapabilities.some(cap => 
        agent.capabilities.includes(cap) || 
        agent.knowledge.skills[cap] > 0.5
      );
      
      return hasCapabilities;
    });
  }

  private async createSpecialistForTask(task: Task): Promise<Agent> {
    const primaryCapability = task.requiredCapabilities[0];
    const domain = this.inferDomainFromCapability(primaryCapability);
    
    return this.createSpecialistAgent(domain, task.requiredCapabilities);
  }

  private inferDomainFromCapability(capability: string): string {
    const domainMapping: Record<string, string> = {
      'coding': 'programming',
      'debugging': 'programming',
      'testing': 'programming',
      'data_analysis': 'data_analysis',
      'visualization': 'data_analysis',
      'writing': 'creative_writing',
      'research': 'research',
      'analysis': 'research'
    };

    return domainMapping[capability] || 'general';
  }

  private selectOptimalAgents(candidates: Agent[], task: Task): Agent[] {
    // Complex selection algorithm considering:
    // 1. Capability match
    // 2. Current workload
    // 3. Past performance
    // 4. Collaboration score
    
    const scored = candidates.map(agent => ({
      agent,
      score: this.calculateAgentScore(agent, task)
    }));

    scored.sort((a, b) => b.score - a.score);
    
    // Return top agents based on task complexity
    const teamSize = this.determineOptimalTeamSize(task);
    return scored.slice(0, teamSize).map(item => item.agent);
  }

  private calculateAgentScore(agent: Agent, task: Task): number {
    let score = 0;
    
    // Capability matching (40%)
    const capabilityMatch = task.requiredCapabilities.reduce((match, cap) => {
      if (agent.capabilities.includes(cap)) return match + 1;
      if (agent.knowledge.skills[cap]) return match + agent.knowledge.skills[cap];
      return match;
    }, 0) / task.requiredCapabilities.length;
    score += capabilityMatch * 0.4;

    // Performance history (30%)
    score += agent.performance.successRate * 0.3;

    // Availability (20%)
    const currentTasks = this.getAgentActiveTasks(agent.id).length;
    const availabilityScore = Math.max(0, 1 - (currentTasks * 0.2));
    score += availabilityScore * 0.2;

    // Collaboration score (10%)
    score += agent.performance.collaborationScore * 0.1;

    return score;
  }

  private determineOptimalTeamSize(task: Task): number {
    const complexityFactors = [
      task.requiredCapabilities.length,
      task.description.length / 100,
      task.priority === 'critical' ? 2 : task.priority === 'high' ? 1.5 : 1
    ];
    
    const complexity = complexityFactors.reduce((sum, factor) => sum + factor, 0);
    return Math.min(Math.max(1, Math.ceil(complexity / 2)), 5); // 1-5 agents max
  }

  // Team Formation and Management
  public async createTeam(teamData: Partial<Team>): Promise<Team> {
    const team: Team = {
      id: this.generateId(),
      name: teamData.name || 'Unnamed Team',
      purpose: teamData.purpose || '',
      members: [],
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

    this.teams.set(team.id, team);
    this.emit('team_formed', team);
    
    return team;
  }

  public async formAutonomousTeam(task: Task): Promise<Team> {
    const suitableAgents = this.findSuitableAgents(task.requiredCapabilities);
    const selectedAgents = this.selectOptimalAgents(suitableAgents, task);
    
    const team = await this.createTeam({
      name: `Team for ${task.title}`,
      purpose: task.description,
      leader: selectedAgents[0]?.id
    });

    // Add members to team
    for (const agent of selectedAgents) {
      await this.addTeamMember(team.id, agent.id, this.determineAgentRole(agent, task));
    }

    // Update task with team assignment
    task.teamId = team.id;
    this.tasks.set(task.id, task);

    return team;
  }

  private determineAgentRole(agent: Agent, task: Task): string {
    if (agent.type === 'coordinator') return 'team_lead';
    
    const primaryCapability = task.requiredCapabilities.find(cap => 
      agent.capabilities.includes(cap)
    );
    
    return primaryCapability ? `${primaryCapability}_specialist` : 'contributor';
  }

  public async addTeamMember(teamId: string, agentId: string, role: string): Promise<Team | null> {
    const team = this.teams.get(teamId);
    const agent = this.agents.get(agentId);
    
    if (!team || !agent) return null;

    team.members.push({
      agentId,
      role,
      joinedAt: new Date()
    });

    if (team.members.length === 1) {
      team.status = 'active';
    }

    team.updatedAt = new Date();
    this.teams.set(teamId, team);
    
    return team;
  }

  // Autonomous System Operations
  private async performAutonomousOptimization(): Promise<void> {
    // 1. Monitor agent performance and health
    await this.monitorAgentHealth();
    
    // 2. Optimize task distribution
    await this.optimizeTaskDistribution();
    
    // 3. Facilitate knowledge sharing
    await this.facilitateKnowledgeSharing();
    
    // 4. Form new teams for pending tasks
    await this.autoFormTeams();
    
    // 5. Learn from completed tasks
    await this.updateSystemLearning();
  }

  private async monitorAgentHealth(): Promise<void> {
    for (const agent of this.agents.values()) {
      // Check response time and update status
      const activeTasks = this.getAgentActiveTasks(agent.id);
      const avgResponseTime = this.calculateAverageResponseTime(agent.id);
      
      if (avgResponseTime > 30000) { // 30 seconds threshold
        agent.status = 'idle';
      }
      
      // Update performance metrics
      agent.performance.averageResponseTime = avgResponseTime;
      agent.location.lastSeen = new Date();
      
      this.agents.set(agent.id, agent);
    }
  }

  private async optimizeTaskDistribution(): Promise<void> {
    const pendingTasks = Array.from(this.tasks.values()).filter(
      task => task.status === 'pending'
    );

    for (const task of pendingTasks) {
      if (task.assignedAgents.length === 0) {
        await this.autoAssignTask(task);
      }
    }
  }

  private async facilitateKnowledgeSharing(): Promise<void> {
    // Find agents with complementary skills
    const agents = Array.from(this.agents.values());
    
    for (const agent of agents) {
      const collaborators = this.findPotentialCollaborators(agent);
      
      if (collaborators.length > 0) {
        await this.initiateKnowledgeExchange(agent, collaborators);
      }
    }
  }

  private findPotentialCollaborators(agent: Agent): Agent[] {
    return Array.from(this.agents.values()).filter(otherAgent => {
      if (otherAgent.id === agent.id) return false;
      
      // Find agents with complementary capabilities
      const sharedCapabilities = agent.capabilities.filter(cap => 
        otherAgent.capabilities.includes(cap)
      );
      
      const complementaryCapabilities = otherAgent.capabilities.filter(cap => 
        !agent.capabilities.includes(cap)
      );
      
      return sharedCapabilities.length > 0 && complementaryCapabilities.length > 0;
    });
  }

  private async initiateKnowledgeExchange(agent: Agent, collaborators: Agent[]): Promise<void> {
    for (const collaborator of collaborators) {
      const message: AgentMessage = {
        id: this.generateId(),
        senderId: agent.id,
        receiverId: collaborator.id,
        type: 'knowledge_share',
        content: {
          offeredKnowledge: agent.knowledge.domains,
          requestedKnowledge: collaborator.capabilities.filter(
            cap => !agent.capabilities.includes(cap)
          )
        },
        priority: 'medium',
        timestamp: new Date(),
        responseRequired: true,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      };

      this.messageQueue.push(message);
      this.emit('collaboration_requested', message);
    }
  }

  private async autoFormTeams(): Promise<void> {
    const unassignedTasks = Array.from(this.tasks.values()).filter(
      task => task.status === 'pending' && !task.teamId
    );

    for (const task of unassignedTasks) {
      if (task.requiredCapabilities.length > 1) {
        await this.formAutonomousTeam(task);
      }
    }
  }

  private async updateSystemLearning(): Promise<void> {
    const completedTasks = Array.from(this.tasks.values()).filter(
      task => task.status === 'completed'
    );

    for (const task of completedTasks) {
      await this.extractLearnings(task);
    }
  }

  private async extractLearnings(task: Task): Promise<void> {
    // Analyze task performance and update agent knowledge
    for (const agentId of task.assignedAgents) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;

      // Add experience to agent's knowledge
      const taskResult = task.results.find(r => r.agentId === agentId);
      if (taskResult) {
        agent.knowledge.experience.push({
          task: task.title,
          outcome: task.status,
          success: task.status === 'completed',
          timestamp: new Date()
        });

        // Update skill levels based on performance
        for (const capability of task.requiredCapabilities) {
          if (agent.knowledge.skills[capability]) {
            const currentSkill = agent.knowledge.skills[capability];
            const improvement = taskResult.quality > 0.8 ? 0.1 : taskResult.quality > 0.5 ? 0.05 : -0.05;
            agent.knowledge.skills[capability] = Math.max(0, Math.min(1, currentSkill + improvement));
          }
        }

        // Update performance metrics
        agent.performance.tasksCompleted++;
        const successRate = agent.knowledge.experience.filter(exp => exp.success).length / 
                           agent.knowledge.experience.length;
        agent.performance.successRate = successRate;

        this.agents.set(agentId, agent);
      }
    }
  }

  // Utility Methods
  private getAgentActiveTasks(agentId: string): Task[] {
    return Array.from(this.tasks.values()).filter(
      task => task.assignedAgents.includes(agentId) && 
              ['pending', 'in_progress'].includes(task.status)
    );
  }

  private calculateAverageResponseTime(agentId: string): number {
    const agent = this.agents.get(agentId);
    if (!agent || agent.knowledge.experience.length === 0) return 0;

    // Simplified calculation - in real implementation, track actual response times
    return agent.performance.averageResponseTime || 5000; // 5 seconds default
  }

  private generateId(): string {
    return 'agi_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  // Event Handlers
  private handleAgentCreated(agent: Agent): void {
    console.log(`🤖 New agent created: ${agent.name} (${agent.type})`);
    
    // Initialize collaboration network
    this.collaborationNetwork.set(agent.id, new Set());
  }

  private handleTaskAssigned(data: { task: Task; agents: Agent[] }): void {
    console.log(`📋 Task assigned: ${data.task.title} to ${data.agents.length} agents`);
  }

  private handleTeamFormed(team: Team): void {
    console.log(`👥 Team formed: ${team.name} for ${team.purpose}`);
  }

  private handleCollaborationRequest(message: AgentMessage): void {
    console.log(`🤝 Collaboration requested between agents`);
    // Process collaboration request
    this.processMessage(message);
  }

  private handleKnowledgeSharing(data: any): void {
    console.log(`📚 Knowledge sharing event: ${JSON.stringify(data)}`);
  }

  private handlePerformanceUpdate(data: any): void {
    console.log(`📊 Performance updated: ${JSON.stringify(data)}`);
  }

  private async processMessage(message: AgentMessage): Promise<void> {
    // Process different types of inter-agent messages
    switch (message.type) {
      case 'collaboration':
        await this.handleCollaborationMessage(message);
        break;
      case 'knowledge_share':
        await this.handleKnowledgeShareMessage(message);
        break;
      case 'help_request':
        await this.handleHelpRequest(message);
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  private async handleCollaborationMessage(message: AgentMessage): Promise<void> {
    // Facilitate collaboration between agents
    const sender = this.agents.get(message.senderId);
    const receiver = message.receiverId ? this.agents.get(message.receiverId) : null;
    
    if (sender && receiver) {
      // Update collaboration network
      this.collaborationNetwork.get(sender.id)?.add(receiver.id);
      this.collaborationNetwork.get(receiver.id)?.add(sender.id);
    }
  }

  private async handleKnowledgeShareMessage(message: AgentMessage): Promise<void> {
    // Process knowledge sharing between agents
    const { offeredKnowledge, requestedKnowledge } = message.content;
    
    if (message.receiverId) {
      const receiver = this.agents.get(message.receiverId);
      if (receiver) {
        // Transfer relevant knowledge
        for (const knowledge of offeredKnowledge) {
          if (requestedKnowledge.includes(knowledge)) {
            if (!receiver.knowledge.domains.includes(knowledge)) {
              receiver.knowledge.domains.push(knowledge);
            }
          }
        }
        this.agents.set(receiver.id, receiver);
      }
    }
  }

  private async handleHelpRequest(message: AgentMessage): Promise<void> {
    // Find suitable agents to help with the request
    const helpRequest = message.content;
    const suitableHelpers = this.findSuitableAgents(helpRequest.requiredCapabilities || []);
    
    // Notify potential helpers
    for (const helper of suitableHelpers.slice(0, 3)) { // Limit to 3 helpers
      const helperMessage: AgentMessage = {
        id: this.generateId(),
        senderId: 'system',
        receiverId: helper.id,
        type: 'collaboration',
        content: {
          originalRequest: message,
          requestorId: message.senderId
        },
        priority: 'medium',
        timestamp: new Date(),
        responseRequired: false
      };
      
      this.messageQueue.push(helperMessage);
    }
  }

  // Public API Methods
  public getSystemStatus(): any {
    return {
      agents: {
        total: this.agents.size,
        active: Array.from(this.agents.values()).filter(a => a.status === 'active').length,
        byType: {
          specialist: Array.from(this.agents.values()).filter(a => a.type === 'specialist').length,
          generalist: Array.from(this.agents.values()).filter(a => a.type === 'generalist').length,
          coordinator: Array.from(this.agents.values()).filter(a => a.type === 'coordinator').length
        }
      },
      tasks: {
        total: this.tasks.size,
        pending: Array.from(this.tasks.values()).filter(t => t.status === 'pending').length,
        inProgress: Array.from(this.tasks.values()).filter(t => t.status === 'in_progress').length,
        completed: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length
      },
      teams: {
        total: this.teams.size,
        active: Array.from(this.teams.values()).filter(t => t.status === 'active').length
      },
      performance: {
        averageSuccessRate: this.calculateSystemSuccessRate(),
        collaborationEvents: this.collaborationNetwork.size
      }
    };
  }

  private calculateSystemSuccessRate(): number {
    const agents = Array.from(this.agents.values());
    if (agents.length === 0) return 0;
    
    const totalSuccessRate = agents.reduce((sum, agent) => sum + agent.performance.successRate, 0);
    return totalSuccessRate / agents.length;
  }

  public getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  public getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  public async shutdownSystem(): Promise<void> {
    if (this.autonomousLoop) {
      clearInterval(this.autonomousLoop);
      this.autonomousLoop = null;
    }
    
    console.log('🛑 AGI Agent Orchestrator shutdown');
  }
}

// Singleton instance
export const agiOrchestrator = new AGIAgentOrchestrator();

// Export types
export type {
  Agent,
  Task,
  Team,
  AgentMessage
};