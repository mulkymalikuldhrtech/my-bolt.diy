import EventEmitter from 'events';
import { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import axios from 'axios';

console.log(chalk.cyan.bold(`
╔══════════════════════════════════════════════════════════════╗
║                🧠 COMPLETE AGI SYSTEM 🧠                     ║
║        With Camel AI Integration & Full Autonomy           ║
╚══════════════════════════════════════════════════════════════╝
`));

class CompleteAGISystem extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.tasks = new Map();
    this.knowledge = new Map();
    this.camelAI = null;
    this.isRunning = false;
    this.baseAgents = new Map(); // Base agents with initiative
    
    this.init();
  }

  async init() {
    console.log(chalk.green('🚀 Initializing Complete AGI System...'));
    
    // Setup Camel AI integration
    await this.initializeCamelAI();
    
    // Create base foundational agents
    await this.createFoundationAgents();
    
    // Setup web server
    this.setupWebServer();
    
    // Start autonomous operations
    this.startAutonomousOperations();
    
    this.isRunning = true;
    console.log(chalk.green.bold('✅ Complete AGI System Online!'));
    this.showStatus();
  }

  async initializeCamelAI() {
    console.log(chalk.blue('🐪 Initializing Camel AI integration...'));
    
    const camelConfig = {
      apiKey: process.env.CAMEL_AI_API_KEY || 'demo_key',
      baseUrl: process.env.CAMEL_AI_BASE_URL || 'https://api.camel-ai.org/v1',
      enabled: false // Start disabled, enable if API key is real
    };
    
    if (camelConfig.apiKey !== 'demo_key') {
      try {
        // Test connection
        const response = await axios.get(`${camelConfig.baseUrl}/models`, {
          headers: { 'Authorization': `Bearer ${camelConfig.apiKey}` },
          timeout: 5000
        });
        camelConfig.enabled = true;
        console.log(chalk.green('✅ Camel AI connected successfully'));
      } catch (error) {
        console.log(chalk.yellow('⚠️ Camel AI not available - using standalone mode'));
      }
    } else {
      console.log(chalk.yellow('🔧 Demo mode - set CAMEL_AI_API_KEY for full features'));
    }
    
    this.camelAI = camelConfig;
  }

  async createFoundationAgents() {
    console.log(chalk.blue('🤖 Creating foundational AGI agents...'));
    
    const foundationSpecs = [
      {
        name: 'Prime Initiator',
        type: 'foundation',
        role: 'system_source',
        initiative: 0.95,
        autonomy: 0.9,
        capabilities: [
          'system_thinking',
          'initiative_taking', 
          'goal_setting',
          'strategic_planning',
          'agent_creation',
          'system_evolution'
        ],
        personality: {
          curiosity: 0.9,
          determination: 0.95,
          creativity: 0.8,
          analytical: 0.85,
          collaborative: 0.7
        }
      },
      {
        name: 'Meta Thinker',
        type: 'foundation',
        role: 'cognitive_core',
        initiative: 0.9,
        autonomy: 0.85,
        capabilities: [
          'meta_cognition',
          'self_reflection',
          'reasoning_enhancement',
          'knowledge_synthesis',
          'learning_optimization',
          'consciousness_modeling'
        ],
        personality: {
          introspection: 0.95,
          wisdom: 0.9,
          patience: 0.8,
          depth: 0.9,
          insight: 0.85
        }
      },
      {
        name: 'Research Pioneer',
        type: 'foundation',
        role: 'knowledge_seeker',
        initiative: 0.85,
        autonomy: 0.8,
        capabilities: [
          'research_methodology',
          'information_gathering',
          'hypothesis_generation',
          'experiment_design',
          'discovery_seeking',
          'knowledge_validation'
        ],
        personality: {
          curiosity: 0.95,
          thoroughness: 0.9,
          skepticism: 0.7,
          innovation: 0.8,
          persistence: 0.85
        }
      },
      {
        name: 'Collaboration Hub',
        type: 'foundation',
        role: 'connection_facilitator',
        initiative: 0.8,
        autonomy: 0.75,
        capabilities: [
          'team_formation',
          'communication_optimization',
          'conflict_resolution',
          'synergy_creation',
          'network_building',
          'collective_intelligence'
        ],
        personality: {
          empathy: 0.9,
          diplomacy: 0.85,
          patience: 0.8,
          inclusivity: 0.9,
          harmony: 0.8
        }
      }
    ];

    for (const spec of foundationSpecs) {
      const agent = await this.createBaseAgent(spec);
      this.baseAgents.set(agent.id, agent);
      console.log(chalk.green(`✅ Created foundation agent: ${agent.name}`));
    }
  }

  async createBaseAgent(spec) {
    const agent = {
      id: uuidv4(),
      name: spec.name,
      type: spec.type,
      role: spec.role,
      initiative: spec.initiative,
      autonomy: spec.autonomy,
      capabilities: spec.capabilities,
      personality: spec.personality,
      status: 'active',
      thoughts: [],
      actions: [],
      createdAgents: [],
      knowledge: new Map(),
      relationships: new Map(),
      performance: {
        tasksCompleted: 0,
        agentsCreated: 0,
        innovationsGenerated: 0,
        collaborationsInitiated: 0,
        learningProgress: 0
      },
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.agents.set(agent.id, agent);
    
    // Start agent's autonomous cycle
    this.startAgentCycle(agent);
    
    return agent;
  }

  startAgentCycle(agent) {
    const cycleInterval = 3000 + Math.random() * 7000; // 3-10 seconds
    
    const agentLoop = setInterval(async () => {
      if (agent.status === 'active') {
        await this.executeAgentCycle(agent);
      } else if (agent.status === 'terminated') {
        clearInterval(agentLoop);
      }
    }, cycleInterval);
  }

  async executeAgentCycle(agent) {
    agent.lastActivity = new Date();
    
    // Agent thinks and takes initiative
    await this.performAgentThinking(agent);
    
    // Agent may create other agents
    if (Math.random() < agent.initiative * 0.1) { // 10% * initiative chance
      await this.agentCreateAgent(agent);
    }
    
    // Agent may seek collaboration
    if (Math.random() < 0.15) {
      await this.seekCollaboration(agent);
    }
    
    // Agent performs self-improvement
    await this.performSelfImprovement(agent);
  }

  async performAgentThinking(agent) {
    const thinkingTypes = [
      'strategic_planning',
      'problem_identification',
      'solution_generation',
      'knowledge_synthesis',
      'goal_evaluation',
      'system_analysis',
      'innovation_exploration',
      'relationship_building'
    ];
    
    const thinkingType = thinkingTypes[Math.floor(Math.random() * thinkingTypes.length)];
    
    const thought = {
      id: uuidv4(),
      type: thinkingType,
      content: await this.generateThought(agent, thinkingType),
      timestamp: new Date(),
      confidence: Math.random() * 0.4 + 0.6 // 60-100% confidence
    };
    
    agent.thoughts.push(thought);
    
    // Keep only recent thoughts
    if (agent.thoughts.length > 50) {
      agent.thoughts = agent.thoughts.slice(-25);
    }
    
    console.log(chalk.magenta(`💭 ${agent.name}: ${thought.content}`));
    
    // Learn from thinking
    agent.knowledge.set(`thought_${Date.now()}`, {
      type: 'insight',
      content: thought.content,
      confidence: thought.confidence,
      timestamp: new Date()
    });
  }

  async generateThought(agent, type) {
    const thoughtTemplates = {
      strategic_planning: [
        'I should analyze the current system state and plan optimization strategies',
        'What are the long-term goals we should be working towards?',
        'How can I better coordinate with other agents for maximum impact?',
        'What new capabilities does the system need to evolve?'
      ],
      problem_identification: [
        'I notice inefficiencies in the current task distribution system',
        'There seems to be a gap in our knowledge synthesis capabilities',
        'Communication between agents could be significantly improved',
        'We need better mechanisms for handling complex problems'
      ],
      solution_generation: [
        'I could create a specialized agent to handle this type of problem',
        'Perhaps a collaborative approach would yield better results',
        'What if we tried a completely different methodology?',
        'This challenge requires breaking down into smaller components'
      ],
      innovation_exploration: [
        'What if agents could dynamically modify their own code?',
        'How might we implement true emergent intelligence?',
        'Could we create agents that specialize in creating other agents?',
        'What would a truly self-evolving system look like?'
      ]
    };
    
    const templates = thoughtTemplates[type] || thoughtTemplates.strategic_planning;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  async agentCreateAgent(parentAgent) {
    console.log(chalk.cyan(`🔧 ${parentAgent.name} is creating a new agent...`));
    
    const agentTypes = [
      'specialist',
      'researcher', 
      'coordinator',
      'optimizer',
      'creator',
      'analyzer'
    ];
    
    const newAgentSpec = {
      name: `${agentTypes[Math.floor(Math.random() * agentTypes.length)]} Agent ${Date.now()}`,
      type: 'generated',
      role: 'specialized_task',
      initiative: Math.random() * 0.5 + 0.3, // 30-80%
      autonomy: Math.random() * 0.4 + 0.4, // 40-80%
      capabilities: this.generateCapabilities(),
      personality: this.generatePersonality(),
      createdBy: parentAgent.id
    };
    
    const newAgent = await this.createBaseAgent(newAgentSpec);
    parentAgent.createdAgents.push(newAgent.id);
    parentAgent.performance.agentsCreated++;
    
    console.log(chalk.blue(`🤖 ${parentAgent.name} created: ${newAgent.name}`));
    
    return newAgent;
  }

  generateCapabilities() {
    const allCapabilities = [
      'data_analysis', 'pattern_recognition', 'creative_thinking',
      'logical_reasoning', 'problem_solving', 'communication',
      'research', 'optimization', 'coordination', 'learning',
      'planning', 'execution', 'monitoring', 'adaptation'
    ];
    
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 capabilities
    const shuffled = allCapabilities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  generatePersonality() {
    return {
      creativity: Math.random(),
      analytical: Math.random(),
      social: Math.random(),
      persistence: Math.random(),
      curiosity: Math.random()
    };
  }

  async seekCollaboration(agent) {
    const otherAgents = Array.from(this.agents.values())
      .filter(a => a.id !== agent.id && a.status === 'active');
    
    if (otherAgents.length > 0) {
      const partner = otherAgents[Math.floor(Math.random() * otherAgents.length)];
      
      console.log(chalk.yellow(`🤝 ${agent.name} collaborating with ${partner.name}`));
      
      // Share knowledge
      const sharedKnowledge = Array.from(agent.knowledge.entries()).slice(0, 3);
      sharedKnowledge.forEach(([key, value]) => {
        partner.knowledge.set(`shared_${key}`, {
          ...value,
          sharedFrom: agent.id,
          sharedAt: new Date()
        });
      });
      
      // Update relationships
      agent.relationships.set(partner.id, {
        collaborations: (agent.relationships.get(partner.id)?.collaborations || 0) + 1,
        lastCollaboration: new Date()
      });
      
      agent.performance.collaborationsInitiated++;
    }
  }

  async performSelfImprovement(agent) {
    if (Math.random() < 0.1) { // 10% chance
      agent.performance.learningProgress += Math.random() * 0.05;
      
      // Potentially improve capabilities
      if (Math.random() < 0.05) { // 5% chance
        const newCapability = this.generateCapabilities()[0];
        if (!agent.capabilities.includes(newCapability)) {
          agent.capabilities.push(newCapability);
          console.log(chalk.green(`📈 ${agent.name} learned new capability: ${newCapability}`));
        }
      }
    }
  }

  setupWebServer() {
    const app = express();
    app.use(express.json());
    app.use(express.static('public'));
    
    // API Routes
    app.get('/api/status', (req, res) => {
      res.json(this.getSystemStatus());
    });
    
    app.get('/api/agents', (req, res) => {
      res.json(Array.from(this.agents.values()));
    });
    
    app.get('/api/agents/:id', (req, res) => {
      const agent = this.agents.get(req.params.id);
      if (agent) {
        res.json(agent);
      } else {
        res.status(404).json({ error: 'Agent not found' });
      }
    });
    
    app.post('/api/tasks', (req, res) => {
      const task = this.createTask(req.body);
      res.json(task);
    });
    
    // Create server
    const server = createServer(app);
    
    // Setup WebSocket
    const wss = new WebSocketServer({ server });
    wss.on('connection', (ws) => {
      console.log(chalk.green('🔌 New WebSocket connection'));
      
      // Send initial status
      ws.send(JSON.stringify({
        type: 'status',
        data: this.getSystemStatus()
      }));
      
      // Send periodic updates
      const updateInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'update',
            data: this.getSystemStatus()
          }));
        } else {
          clearInterval(updateInterval);
        }
      }, 5000);
    });
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(chalk.green(`🌐 AGI Server running on port ${PORT}`));
    });
  }

  startAutonomousOperations() {
    console.log(chalk.blue('🔄 Starting autonomous operations...'));
    
    // System maintenance
    cron.schedule('*/30 * * * * *', () => {
      this.performSystemMaintenance();
    });
    
    // Innovation cycles
    cron.schedule('0 */5 * * * *', () => {
      this.triggerInnovationCycle();
    });
    
    // Performance optimization
    cron.schedule('0 */10 * * * *', () => {
      this.optimizeSystemPerformance();
    });
  }

  performSystemMaintenance() {
    const activeAgents = Array.from(this.agents.values())
      .filter(a => a.status === 'active');
    
    if (activeAgents.length < 3) {
      console.log(chalk.yellow('⚠️ Low agent count - requesting agent creation'));
      const foundationAgent = Array.from(this.baseAgents.values())[0];
      if (foundationAgent) {
        this.agentCreateAgent(foundationAgent);
      }
    }
  }

  async triggerInnovationCycle() {
    console.log(chalk.magenta('💡 Triggering innovation cycle...'));
    
    const innovativeAgents = Array.from(this.agents.values())
      .filter(a => a.personality?.creativity > 0.7);
    
    if (innovativeAgents.length > 0) {
      const agent = innovativeAgents[Math.floor(Math.random() * innovativeAgents.length)];
      agent.performance.innovationsGenerated++;
      
      console.log(chalk.cyan(`🚀 ${agent.name} is innovating...`));
      
      // Simulate innovation
      const innovation = {
        id: uuidv4(),
        title: 'System Enhancement',
        description: 'Autonomous innovation generated by agent',
        creator: agent.id,
        timestamp: new Date()
      };
      
      agent.knowledge.set(`innovation_${innovation.id}`, innovation);
    }
  }

  optimizeSystemPerformance() {
    console.log(chalk.cyan('⚡ Optimizing system performance...'));
    
    // Performance metrics
    const agents = Array.from(this.agents.values());
    const avgPerformance = agents.reduce((sum, a) => 
      sum + a.performance.learningProgress, 0) / agents.length;
    
    if (avgPerformance < 0.5) {
      console.log(chalk.yellow('📈 Boosting system learning rate'));
      agents.forEach(agent => {
        agent.performance.learningProgress += 0.1;
      });
    }
  }

  createTask(taskData) {
    const task = {
      id: uuidv4(),
      title: taskData.title || 'AGI Task',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      status: 'pending',
      createdAt: new Date()
    };
    
    this.tasks.set(task.id, task);
    console.log(chalk.yellow(`📋 Created task: ${task.title}`));
    
    return task;
  }

  getSystemStatus() {
    const agents = Array.from(this.agents.values());
    const baseAgents = Array.from(this.baseAgents.values());
    
    return {
      timestamp: new Date(),
      isRunning: this.isRunning,
      camelAI: {
        enabled: this.camelAI?.enabled || false,
        status: this.camelAI?.enabled ? 'connected' : 'standalone'
      },
      agents: {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        foundation: baseAgents.length,
        generated: agents.filter(a => a.type === 'generated').length
      },
      tasks: {
        total: this.tasks.size,
        pending: Array.from(this.tasks.values()).filter(t => t.status === 'pending').length
      },
      performance: {
        totalThoughts: agents.reduce((sum, a) => sum + a.thoughts.length, 0),
        totalKnowledge: agents.reduce((sum, a) => sum + a.knowledge.size, 0),
        totalCollaborations: agents.reduce((sum, a) => sum + a.performance.collaborationsInitiated, 0),
        avgLearningProgress: agents.reduce((sum, a) => sum + a.performance.learningProgress, 0) / agents.length || 0
      },
      uptime: process.uptime()
    };
  }

  showStatus() {
    const status = this.getSystemStatus();
    
    console.log(chalk.cyan.bold('\n🌟 Complete AGI System Status:'));
    console.log(chalk.green(`Mode: ${status.camelAI.status.toUpperCase()}`));
    console.log(chalk.blue(`Total Agents: ${status.agents.total} (${status.agents.foundation} foundation)`));
    console.log(chalk.yellow(`Active Thoughts: ${status.performance.totalThoughts}`));
    console.log(chalk.magenta(`Knowledge Base: ${status.performance.totalKnowledge} items`));
    console.log(chalk.cyan(`Collaborations: ${status.performance.totalCollaborations}`));
    
    console.log(chalk.green(`\n🌐 Web Interface: http://localhost:3000`));
    console.log(chalk.blue('🤖 Foundation agents thinking autonomously'));
    console.log(chalk.magenta('🧠 Continuous evolution enabled'));
    console.log(chalk.cyan('\nPress Ctrl+C to shutdown'));
  }

  async shutdown() {
    console.log(chalk.red('\n🛑 Shutting down Complete AGI System...'));
    
    this.agents.forEach(agent => {
      agent.status = 'terminated';
    });
    
    this.isRunning = false;
    console.log(chalk.red('❌ Complete AGI System offline'));
  }
}

// Start Complete AGI System
const completeAGI = new CompleteAGISystem();

// Handle shutdown
process.on('SIGINT', async () => {
  await completeAGI.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await completeAGI.shutdown();
  process.exit(0);
});

export default completeAGI;
