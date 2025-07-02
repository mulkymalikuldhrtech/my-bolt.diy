import EventEmitter from 'events';
import { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import ora from 'ora';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';

console.log(chalk.cyan.bold(`
╔══════════════════════════════════════════════════════════════╗
║                    🧠 AGI SYSTEM CORE 🧠                     ║
║                    Termux Android Edition                    ║
╚══════════════════════════════════════════════════════════════╝
`));

class AGICore extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.tasks = new Map();
    this.knowledge = new Map();
    this.isRunning = false;
    this.server = null;
    this.wss = null;
    
    this.init();
  }

  async init() {
    console.log(chalk.green('🚀 Initializing AGI Core System...'));
    
    // Setup Express server
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
    
    app.post('/api/agents', (req, res) => {
      const agent = this.createAgent(req.body);
      res.json(agent);
    });
    
    app.post('/api/tasks', (req, res) => {
      const task = this.createTask(req.body);
      res.json(task);
    });
    
    // Create server
    this.server = createServer(app);
    
    // Setup WebSocket
    this.wss = new WebSocketServer({ server: this.server });
    this.wss.on('connection', this.handleWebSocketConnection.bind(this));
    
    // Start server
    const PORT = process.env.PORT || 3000;
    this.server.listen(PORT, () => {
      console.log(chalk.green(`🌐 AGI Server running on port ${PORT}`));
      console.log(chalk.yellow(`📱 Access: http://localhost:${PORT}`));
    });
    
    // Start autonomous operations
    this.startAutonomousOperations();
    
    this.isRunning = true;
    console.log(chalk.green.bold('✅ AGI Core System Online!'));
  }

  createAgent(config = {}) {
    const agent = {
      id: uuidv4(),
      name: config.name || 'AGI Agent',
      type: config.type || 'general',
      capabilities: config.capabilities || ['thinking', 'learning', 'execution'],
      autonomy: config.autonomy || 0.7,
      status: 'active',
      tasks: [],
      knowledge: new Map(),
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        learningRate: 0.1
      },
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    this.agents.set(agent.id, agent);
    console.log(chalk.blue(`🤖 Created agent: ${agent.name} (${agent.id})`));
    
    // Start agent's autonomous loop
    this.startAgentLoop(agent);
    
    return agent;
  }

  createTask(config = {}) {
    const task = {
      id: uuidv4(),
      title: config.title || 'AGI Task',
      description: config.description || '',
      priority: config.priority || 'medium',
      status: 'pending',
      assignedAgent: null,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tasks.set(task.id, task);
    console.log(chalk.yellow(`📋 Created task: ${task.title}`));
    
    // Auto-assign to suitable agent
    this.assignTaskToAgent(task);
    
    return task;
  }

  assignTaskToAgent(task) {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'active' && agent.tasks.length < 3);
    
    if (availableAgents.length > 0) {
      const agent = availableAgents[0];
      task.assignedAgent = agent.id;
      agent.tasks.push(task.id);
      task.status = 'in_progress';
      
      console.log(chalk.green(`🎯 Assigned task "${task.title}" to agent ${agent.name}`));
    }
  }

  startAgentLoop(agent) {
    const agentLoop = setInterval(() => {
      if (agent.status === 'active') {
        this.executeAgentCycle(agent);
      } else if (agent.status === 'terminated') {
        clearInterval(agentLoop);
      }
    }, 5000); // Every 5 seconds
  }

  async executeAgentCycle(agent) {
    agent.lastActivity = new Date();
    
    // Process assigned tasks
    for (const taskId of agent.tasks) {
      const task = this.tasks.get(taskId);
      if (task && task.status === 'in_progress') {
        await this.processTask(agent, task);
      }
    }
    
    // Autonomous thinking and learning
    await this.performAutonomousThinking(agent);
    
    // Check for collaboration opportunities
    await this.checkCollaborationOpportunities(agent);
  }

  async processTask(agent, task) {
    // Simulate task processing
    task.progress += Math.random() * 20;
    
    if (task.progress >= 100) {
      task.status = 'completed';
      task.progress = 100;
      task.updatedAt = new Date();
      
      // Update agent performance
      agent.performance.tasksCompleted++;
      agent.performance.successRate = 
        (agent.performance.successRate * (agent.performance.tasksCompleted - 1) + 1) / 
        agent.performance.tasksCompleted;
      
      // Remove task from agent
      agent.tasks = agent.tasks.filter(id => id !== task.id);
      
      console.log(chalk.green(`✅ Agent ${agent.name} completed task: ${task.title}`));
    }
  }

  async performAutonomousThinking(agent) {
    // Simulate autonomous thinking
    const thoughts = [
      'Analyzing current knowledge base...',
      'Identifying optimization opportunities...',
      'Planning future actions...',
      'Learning from recent experiences...',
      'Exploring new solution approaches...'
    ];
    
    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    
    if (Math.random() < 0.1) { // 10% chance of thinking output
      console.log(chalk.magenta(`💭 ${agent.name}: ${thought}`));
    }
    
    // Simulate learning
    if (Math.random() < agent.performance.learningRate) {
      const newKnowledge = `knowledge_${Date.now()}`;
      agent.knowledge.set(newKnowledge, {
        type: 'insight',
        data: thought,
        confidence: Math.random(),
        timestamp: new Date()
      });
    }
  }

  async checkCollaborationOpportunities(agent) {
    // Find other agents for potential collaboration
    const otherAgents = Array.from(this.agents.values())
      .filter(a => a.id !== agent.id && a.status === 'active');
    
    if (otherAgents.length > 0 && Math.random() < 0.05) { // 5% chance
      const partner = otherAgents[Math.floor(Math.random() * otherAgents.length)];
      console.log(chalk.cyan(`🤝 ${agent.name} collaborating with ${partner.name}`));
      
      // Share knowledge
      const sharedKnowledge = Array.from(agent.knowledge.entries()).slice(0, 2);
      sharedKnowledge.forEach(([key, value]) => {
        partner.knowledge.set(key, { ...value, sharedFrom: agent.id });
      });
    }
  }

  startAutonomousOperations() {
    console.log(chalk.blue('🔄 Starting autonomous operations...'));
    
    // Create initial agents
    this.createAgent({
      name: 'Alpha Core',
      type: 'coordinator',
      capabilities: ['planning', 'coordination', 'optimization'],
      autonomy: 0.9
    });
    
    this.createAgent({
      name: 'Beta Research',
      type: 'researcher',
      capabilities: ['analysis', 'learning', 'discovery'],
      autonomy: 0.8
    });
    
    this.createAgent({
      name: 'Gamma Executor',
      type: 'executor',
      capabilities: ['execution', 'problem_solving', 'adaptation'],
      autonomy: 0.7
    });
    
    // Schedule autonomous tasks
    cron.schedule('*/10 * * * * *', () => { // Every 10 seconds
      this.performSystemMaintenance();
    });
    
    cron.schedule('*/30 * * * * *', () => { // Every 30 seconds
      this.generateAutonomousTask();
    });
  }

  performSystemMaintenance() {
    // Check agent health
    this.agents.forEach(agent => {
      const timeSinceActivity = Date.now() - agent.lastActivity.getTime();
      if (timeSinceActivity > 60000) { // 1 minute
        agent.status = 'idle';
      }
    });
    
    // Clean up completed tasks
    const completedTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'completed');
    
    if (completedTasks.length > 100) {
      // Archive old tasks
      completedTasks.slice(0, 50).forEach(task => {
        this.tasks.delete(task.id);
      });
    }
  }

  generateAutonomousTask() {
    const taskTypes = [
      'Optimize system performance',
      'Analyze recent data patterns',
      'Explore new learning algorithms',
      'Improve agent collaboration',
      'Research emerging technologies',
      'Enhance decision-making processes',
      'Develop new capabilities',
      'Test system resilience'
    ];
    
    const taskTitle = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    
    this.createTask({
      title: taskTitle,
      description: `Autonomous task: ${taskTitle}`,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    });
  }

  handleWebSocketConnection(ws) {
    console.log(chalk.green('🔌 New WebSocket connection'));
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        this.handleWebSocketMessage(ws, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log(chalk.yellow('🔌 WebSocket connection closed'));
    });
    
    // Send initial status
    ws.send(JSON.stringify({
      type: 'status',
      data: this.getSystemStatus()
    }));
  }

  handleWebSocketMessage(ws, data) {
    switch (data.type) {
      case 'create_agent':
        const agent = this.createAgent(data.config);
        ws.send(JSON.stringify({ type: 'agent_created', data: agent }));
        break;
      
      case 'create_task':
        const task = this.createTask(data.config);
        ws.send(JSON.stringify({ type: 'task_created', data: task }));
        break;
      
      case 'get_status':
        ws.send(JSON.stringify({ 
          type: 'status', 
          data: this.getSystemStatus() 
        }));
        break;
    }
  }

  getSystemStatus() {
    const agents = Array.from(this.agents.values());
    const tasks = Array.from(this.tasks.values());
    
    return {
      timestamp: new Date(),
      isRunning: this.isRunning,
      agents: {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        idle: agents.filter(a => a.status === 'idle').length
      },
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
      },
      performance: {
        avgSuccessRate: agents.reduce((sum, a) => sum + a.performance.successRate, 0) / agents.length || 0,
        totalTasksCompleted: agents.reduce((sum, a) => sum + a.performance.tasksCompleted, 0)
      }
    };
  }

  async shutdown() {
    console.log(chalk.red('🛑 Shutting down AGI Core System...'));
    
    // Mark all agents as terminated
    this.agents.forEach(agent => {
      agent.status = 'terminated';
    });
    
    // Close server
    if (this.server) {
      this.server.close();
    }
    
    this.isRunning = false;
    console.log(chalk.red('❌ AGI Core System Offline'));
  }
}

// Start AGI Core
const agiCore = new AGICore();

// Handle shutdown signals
process.on('SIGINT', async () => {
  await agiCore.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await agiCore.shutdown();
  process.exit(0);
});

export default agiCore;
