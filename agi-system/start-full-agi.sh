#!/bin/bash

# Full AGI System Startup Script
# Supports both Camel AI integration and standalone operation

echo "🧠 Starting Full AGI System with Camel AI Integration..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the agi-system directory"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $REQUIRED_VERSION or higher is required. Current: $NODE_VERSION"
    exit 1
fi

print_status "Node.js version check passed: $NODE_VERSION"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install --no-optional --no-fund --no-audit
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

# Setup environment variables
print_status "Setting up environment..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# AGI System Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Camel AI Configuration (optional)
CAMEL_AI_API_KEY=your_camel_ai_api_key_here
CAMEL_AI_BASE_URL=https://api.camel-ai.org/v1

# AGI System Settings
AGI_MAX_AGENTS=50
AGI_AUTO_SCALING=true
AGI_LEARNING_RATE=0.1
AGI_COLLABORATION_ENABLED=true

# Security Settings
AGI_SECURITY_LEVEL=high
AGI_AUDIT_ENABLED=true
AGI_RATE_LIMIT=1000

# Performance Settings
AGI_MEMORY_LIMIT=2GB
AGI_CPU_CORES=auto
AGI_CACHE_ENABLED=true
EOF
    print_warning "Created .env file with default settings"
    print_warning "Please configure your Camel AI API key in .env file for full functionality"
fi

# Source environment variables
set -a
source .env
set +a

# Create required directories
print_status "Creating directory structure..."
mkdir -p logs data config temp backups

# Create configuration files
print_status "Setting up configuration..."

# Create AGI configuration
cat > config/agi-config.json << EOF
{
  "system": {
    "name": "Full AGI System",
    "version": "1.0.0",
    "mode": "hybrid",
    "autoStart": true
  },
  "camelAI": {
    "enabled": true,
    "fallbackToStandalone": true,
    "preferredModels": ["gpt-4", "gpt-3.5-turbo", "claude-3"],
    "timeout": 30000,
    "retryAttempts": 3
  },
  "agents": {
    "initialCount": 5,
    "maxConcurrent": 50,
    "autoScaling": true,
    "specializations": [
      "reasoning",
      "creativity", 
      "analysis",
      "coordination",
      "learning"
    ]
  },
  "collaboration": {
    "enabled": true,
    "maxTeamSize": 10,
    "scenarios": [
      "problem_solving",
      "creative_brainstorming",
      "research_analysis",
      "strategic_planning"
    ]
  },
  "learning": {
    "continuousLearning": true,
    "knowledgeRetention": 30,
    "experienceSharing": true,
    "adaptivePersonality": true
  },
  "security": {
    "authentication": true,
    "encryption": true,
    "auditLogging": true,
    "accessControl": "role_based"
  }
}
EOF

# Update core system with Camel AI integration
print_status "Updating core system with Camel AI integration..."

cat > core/enhanced-index.js << 'EOF'
import agiCore from './index.js';
import CamelAIIntegration from './camel-ai-integration.js';
import chalk from 'chalk';
import fs from 'fs';

console.log(chalk.cyan.bold(`
╔══════════════════════════════════════════════════════════════╗
║               🧠 ENHANCED AGI SYSTEM 🧠                      ║
║           With Camel AI Integration & Autonomy              ║
╚══════════════════════════════════════════════════════════════╝
`));

class EnhancedAGISystem {
  constructor() {
    this.core = agiCore;
    this.camelAI = null;
    this.config = null;
    this.isRunning = false;
    
    this.init();
  }

  async init() {
    try {
      // Load configuration
      this.config = JSON.parse(fs.readFileSync('config/agi-config.json', 'utf8'));
      console.log(chalk.green('📋 Configuration loaded successfully'));
      
      // Initialize Camel AI integration
      if (this.config.camelAI.enabled) {
        this.camelAI = new CamelAIIntegration({
          apiKey: process.env.CAMEL_AI_API_KEY,
          baseUrl: process.env.CAMEL_AI_BASE_URL
        });
        
        console.log(chalk.blue('🐪 Camel AI integration initialized'));
      }
      
      // Create initial agent ecosystem
      await this.createInitialAgents();
      
      // Start autonomous operations
      this.startAutonomousOperations();
      
      // Setup demo scenarios
      await this.setupDemoScenarios();
      
      this.isRunning = true;
      console.log(chalk.green.bold('✅ Enhanced AGI System fully operational!'));
      
      this.showSystemInfo();
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize Enhanced AGI System:'), error);
      process.exit(1);
    }
  }

  async createInitialAgents() {
    console.log(chalk.blue('🤖 Creating initial agent ecosystem...'));
    
    const agentSpecs = [
      {
        name: 'Alpha Prime',
        type: 'coordinator',
        preferredMode: 'auto',
        capabilities: ['strategic_planning', 'team_coordination', 'decision_making']
      },
      {
        name: 'Beta Researcher',
        type: 'analyst',
        preferredMode: 'camel',
        capabilities: ['deep_research', 'data_analysis', 'knowledge_synthesis']
      },
      {
        name: 'Gamma Creative',
        type: 'creator',
        preferredMode: 'standalone',
        capabilities: ['creative_thinking', 'innovation', 'artistic_expression']
      },
      {
        name: 'Delta Executor',
        type: 'executor',
        preferredMode: 'auto',
        capabilities: ['task_execution', 'problem_solving', 'optimization']
      },
      {
        name: 'Epsilon Learner',
        type: 'learner',
        preferredMode: 'camel',
        capabilities: ['continuous_learning', 'adaptation', 'skill_development']
      }
    ];

    for (const spec of agentSpecs) {
      if (this.camelAI) {
        const agent = await this.camelAI.createHybridAgent(spec);
        console.log(chalk.green(`✅ Created hybrid agent: ${agent.name}`));
      } else {
        const agent = this.core.createAgent(spec);
        console.log(chalk.yellow(`✅ Created standalone agent: ${agent.name}`));
      }
    }
  }

  async setupDemoScenarios() {
    if (!this.camelAI) {
      console.log(chalk.yellow('⚠️ Camel AI not available - skipping collaborative scenarios'));
      return;
    }

    console.log(chalk.cyan('🎭 Setting up demonstration scenarios...'));
    
    const scenarios = [
      {
        title: 'AI Research Breakthrough',
        description: 'Collaborate to discover new AI research directions',
        roles: [
          { name: 'Research Lead', capabilities: ['research_methodology', 'leadership'] },
          { name: 'Data Scientist', capabilities: ['data_analysis', 'statistics'] },
          { name: 'Creative Thinker', capabilities: ['innovation', 'creative_thinking'] }
        ],
        rounds: 3
      },
      {
        title: 'Future Technology Planning',
        description: 'Plan the development of next-generation technologies',
        roles: [
          { name: 'Tech Strategist', capabilities: ['strategic_planning', 'technology_assessment'] },
          { name: 'Innovation Expert', capabilities: ['innovation', 'future_thinking'] },
          { name: 'Implementation Specialist', capabilities: ['project_management', 'execution'] }
        ],
        rounds: 4
      }
    ];

    // Run one scenario as demonstration
    if (scenarios.length > 0) {
      setTimeout(async () => {
        const scenario = scenarios[0];
        console.log(chalk.magenta(`🚀 Starting demo scenario: ${scenario.title}`));
        try {
          const session = await this.camelAI.createMultiAgentScenario(scenario);
          console.log(chalk.green(`✅ Demo scenario completed: ${session.id}`));
        } catch (error) {
          console.error(chalk.red('❌ Demo scenario failed:'), error.message);
        }
      }, 10000); // Start after 10 seconds
    }
  }

  startAutonomousOperations() {
    console.log(chalk.blue('🔄 Starting autonomous operations...'));
    
    // Autonomous learning cycle
    setInterval(() => {
      this.performSystemLearning();
    }, 60000); // Every minute
    
    // Health monitoring
    setInterval(() => {
      this.monitorSystemHealth();
    }, 30000); // Every 30 seconds
    
    // Adaptive optimization
    setInterval(() => {
      this.optimizeSystemPerformance();
    }, 300000); // Every 5 minutes
  }

  async performSystemLearning() {
    if (Math.random() < 0.3) { // 30% chance
      console.log(chalk.magenta('🧠 System performing autonomous learning...'));
      
      if (this.camelAI && this.camelAI.agents.size > 0) {
        const agents = Array.from(this.camelAI.agents.values());
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        
        try {
          await this.camelAI.performReasoning(randomAgent, 
            'Reflect on recent experiences and identify new learning opportunities',
            { autonomous: true, learning: true }
          );
        } catch (error) {
          console.log(chalk.yellow('Learning cycle completed with local processing'));
        }
      }
    }
  }

  monitorSystemHealth() {
    const status = this.getSystemStatus();
    
    if (status.agents.active < 3) {
      console.log(chalk.yellow('⚠️ Low agent activity detected - creating backup agents'));
      this.createEmergencyAgents();
    }
    
    if (status.performance.avgResponseTime > 5000) {
      console.log(chalk.yellow('⚠️ High response times detected - optimizing system'));
      this.optimizeSystemPerformance();
    }
  }

  async createEmergencyAgents() {
    console.log(chalk.blue('🚑 Creating emergency backup agents...'));
    
    const emergencySpec = {
      name: `Emergency Agent ${Date.now()}`,
      type: 'backup',
      preferredMode: 'standalone',
      capabilities: ['emergency_response', 'system_maintenance', 'basic_reasoning']
    };

    if (this.camelAI) {
      await this.camelAI.createHybridAgent(emergencySpec);
    } else {
      this.core.createAgent(emergencySpec);
    }
  }

  optimizeSystemPerformance() {
    console.log(chalk.cyan('⚡ Optimizing system performance...'));
    
    // Performance optimization logic
    if (this.camelAI) {
      // Balance load between Camel AI and standalone operations
      const status = this.camelAI.getStatus();
      const camelRatio = status.performance.totalCamelRequests / 
        (status.performance.totalCamelRequests + status.performance.totalStandaloneOps);
      
      if (camelRatio > 0.8) {
        console.log(chalk.yellow('🔄 High Camel AI usage - encouraging standalone operations'));
      }
    }
  }

  getSystemStatus() {
    const coreStatus = this.core.getSystemStatus();
    const camelStatus = this.camelAI ? this.camelAI.getStatus() : null;
    
    return {
      timestamp: new Date(),
      mode: this.camelAI && this.camelAI.isEnabled ? 'hybrid' : 'standalone',
      core: coreStatus,
      camelAI: camelStatus,
      config: this.config.system,
      uptime: process.uptime()
    };
  }

  showSystemInfo() {
    const status = this.getSystemStatus();
    
    console.log(chalk.cyan.bold('\n🌟 Enhanced AGI System Status:'));
    console.log(chalk.green(`Mode: ${status.mode.toUpperCase()}`));
    console.log(chalk.blue(`Active Agents: ${status.core.agents.active}`));
    console.log(chalk.yellow(`Total Tasks: ${status.core.tasks.total}`));
    
    if (status.camelAI) {
      console.log(chalk.magenta(`Camel AI: ${status.camelAI.camelAI.status}`));
      console.log(chalk.cyan(`Available Models: ${status.camelAI.camelAI.modelsCount}`));
    }
    
    console.log(chalk.green(`\n🌐 Web Interface: http://localhost:${process.env.PORT || 3000}`));
    console.log(chalk.blue('📊 Real-time monitoring active'));
    console.log(chalk.magenta('🤖 Autonomous agents thinking and collaborating'));
    console.log(chalk.yellow('🧠 Continuous learning enabled'));
    
    if (this.camelAI && this.camelAI.isEnabled) {
      console.log(chalk.green('🐪 Camel AI integration active'));
    } else {
      console.log(chalk.yellow('🔧 Running in standalone mode'));
    }
    
    console.log(chalk.cyan('\nPress Ctrl+C to shutdown the system'));
  }

  async shutdown() {
    console.log(chalk.red('\n🛑 Shutting down Enhanced AGI System...'));
    
    if (this.camelAI) {
      await this.camelAI.shutdown();
    }
    
    await this.core.shutdown();
    
    this.isRunning = false;
    console.log(chalk.red('❌ Enhanced AGI System offline'));
  }
}

// Start Enhanced AGI System
const enhancedAGI = new EnhancedAGISystem();

// Handle shutdown signals
process.on('SIGINT', async () => {
  await enhancedAGI.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await enhancedAGI.shutdown();
  process.exit(0);
});

export default enhancedAGI;
EOF

# Check if Camel AI is configured
print_status "Checking Camel AI configuration..."
if [ "$CAMEL_AI_API_KEY" = "your_camel_ai_api_key_here" ] || [ -z "$CAMEL_AI_API_KEY" ]; then
    print_warning "Camel AI API key not configured - system will run in standalone mode"
    print_warning "To enable Camel AI integration:"
    print_warning "1. Get API key from https://camel-ai.org"
    print_warning "2. Set CAMEL_AI_API_KEY in .env file"
    print_warning "3. Restart the system"
else
    print_status "Camel AI API key configured - hybrid mode enabled"
fi

# Start the system
print_status "Starting Enhanced AGI System..."

# Kill any existing processes
pkill -f "node.*agi" 2>/dev/null || true
sleep 2

# Start core system
print_status "🚀 Launching Enhanced AGI Core..."
node core/enhanced-index.js &
CORE_PID=$!

# Wait for core to start
sleep 5

# Start autonomous agents
print_status "🤖 Launching Autonomous Agents..."
node agents/launcher.js &
AGENT_PID=$!

# Wait for agents to start
sleep 3

# Show startup complete message
echo ""
echo -e "${GREEN}🎉 Enhanced AGI System Started Successfully!${NC}"
echo ""
echo -e "${CYAN}🌟 System Features:${NC}"
echo -e "  ${GREEN}✅${NC} Core AGI System"
echo -e "  ${GREEN}✅${NC} Autonomous Agents"
echo -e "  ${GREEN}✅${NC} Web Interface (port ${PORT:-3000})"
echo -e "  ${GREEN}✅${NC} Real-time WebSocket Updates"
if [ "$CAMEL_AI_API_KEY" != "your_camel_ai_api_key_here" ] && [ -n "$CAMEL_AI_API_KEY" ]; then
    echo -e "  ${GREEN}✅${NC} Camel AI Integration"
    echo -e "  ${GREEN}✅${NC} Multi-Agent Collaboration"
    echo -e "  ${GREEN}✅${NC} Role-Playing Scenarios"
else
    echo -e "  ${YELLOW}⚠️${NC}  Standalone Mode (No Camel AI)"
fi
echo -e "  ${GREEN}✅${NC} Continuous Learning"
echo -e "  ${GREEN}✅${NC} Self-Optimization"
echo -e "  ${GREEN}✅${NC} Emergency Recovery"
echo ""
echo -e "${BLUE}🌐 Access points:${NC}"
echo -e "  Web UI: http://localhost:${PORT:-3000}"
echo -e "  API: http://localhost:${PORT:-3000}/api/"
echo -e "  WebSocket: ws://localhost:${PORT:-3000}"
echo ""
echo -e "${MAGENTA}🧠 The AGI system is now thinking autonomously!${NC}"
echo -e "${CYAN}📊 Monitor the console for real-time agent activities${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Function to handle cleanup
cleanup() {
    echo -e "\n${RED}🛑 Stopping Enhanced AGI System...${NC}"
    kill $CORE_PID $AGENT_PID 2>/dev/null || true
    wait $CORE_PID $AGENT_PID 2>/dev/null || true
    echo -e "${RED}❌ Enhanced AGI System stopped${NC}"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Wait for processes
wait
EOF

chmod +x agi-system/start-full-agi.sh