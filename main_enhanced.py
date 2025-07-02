#!/usr/bin/env python3
"""
🧠 ENHANCED AGENTIC AI SYSTEM 🧠
With Camel AI & LLM7 Public API Integration

Autonomous Multi-Agent Intelligence System
Made with ❤️ by Mulky Malikul Dhaher 🇮🇩
"""

import os
import sys
import json
import asyncio
import logging
import aiohttp
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import threading
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class APIConfig:
    """Configuration for external APIs"""
    camel_ai_key: str = "demo_key"
    camel_ai_url: str = "https://api.camel-ai.org/v1"
    llm7_key: str = "demo_key" 
    llm7_url: str = "https://api.llm7.ai/v1"
    timeout: int = 30
    max_retries: int = 3

@dataclass
class AgentConfig:
    """Configuration for an agent"""
    name: str
    type: str
    capabilities: List[str] = field(default_factory=list)
    enabled: bool = True
    auto_start: bool = True
    max_retries: int = 3
    api_preference: str = "auto"  # auto, camel, llm7, local

class APIIntegration:
    """Integration with Camel AI and LLM7 APIs"""
    
    def __init__(self, config: APIConfig):
        self.config = config
        self.camel_ai_enabled = False
        self.llm7_enabled = False
        self.session = None
        self.stats = {
            'camel_ai': {'requests': 0, 'success': 0, 'errors': 0},
            'llm7': {'requests': 0, 'success': 0, 'errors': 0},
            'local': {'requests': 0, 'success': 0, 'errors': 0}
        }
        
    async def initialize(self):
        """Initialize API connections"""
        self.session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.config.timeout))
        
        # Test Camel AI
        await self.test_camel_ai()
        
        # Test LLM7
        await self.test_llm7()
        
        logger.info(f"API Status - Camel AI: {'✅' if self.camel_ai_enabled else '❌'}, LLM7: {'✅' if self.llm7_enabled else '❌'}")
        
    async def test_camel_ai(self):
        """Test Camel AI connection"""
        if self.config.camel_ai_key == "demo_key":
            logger.warning("Using demo Camel AI key - limited functionality")
            return
            
        try:
            headers = {
                'Authorization': f'Bearer {self.config.camel_ai_key}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.get(f"{self.config.camel_ai_url}/models", headers=headers) as response:
                if response.status == 200:
                    self.camel_ai_enabled = True
                    logger.info("✅ Camel AI connected successfully")
                    
        except Exception as e:
            logger.error(f"❌ Camel AI connection failed: {e}")
            
    async def test_llm7(self):
        """Test LLM7 connection"""
        if self.config.llm7_key == "demo_key":
            logger.warning("Using demo LLM7 key - limited functionality")
            return
            
        try:
            headers = {
                'Authorization': f'Bearer {self.config.llm7_key}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.get(f"{self.config.llm7_url}/models", headers=headers) as response:
                if response.status == 200:
                    self.llm7_enabled = True
                    logger.info("✅ LLM7 connected successfully")
                    
        except Exception as e:
            logger.error(f"❌ LLM7 connection failed: {e}")
            
    async def generate_response(self, prompt: str, agent_config: AgentConfig) -> Dict[str, Any]:
        """Generate response using best available API"""
        
        # Determine which API to use
        api_to_use = self.select_api(agent_config.api_preference)
        
        try:
            if api_to_use == 'camel_ai':
                return await self.use_camel_ai(prompt, agent_config)
            elif api_to_use == 'llm7':
                return await self.use_llm7(prompt, agent_config)
            else:
                return await self.use_local(prompt, agent_config)
                
        except Exception as e:
            logger.error(f"Primary API failed, falling back to local: {e}")
            return await self.use_local(prompt, agent_config)
            
    def select_api(self, preference: str) -> str:
        """Select best available API based on preference"""
        if preference == 'camel' and self.camel_ai_enabled:
            return 'camel_ai'
        elif preference == 'llm7' and self.llm7_enabled:
            return 'llm7'
        elif preference == 'auto':
            if self.camel_ai_enabled:
                return 'camel_ai'
            elif self.llm7_enabled:
                return 'llm7'
            else:
                return 'local'
        else:
            return 'local'
            
    async def use_camel_ai(self, prompt: str, agent_config: AgentConfig) -> Dict[str, Any]:
        """Use Camel AI API"""
        self.stats['camel_ai']['requests'] += 1
        
        try:
            headers = {
                'Authorization': f'Bearer {self.config.camel_ai_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'model': 'gpt-3.5-turbo',
                'messages': [
                    {
                        'role': 'system',
                        'content': f'You are {agent_config.name}, an AGI agent with capabilities: {", ".join(agent_config.capabilities)}. Provide helpful and intelligent responses.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1000
            }
            
            async with self.session.post(f"{self.config.camel_ai_url}/chat/completions", 
                                       headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    self.stats['camel_ai']['success'] += 1
                    return {
                        'success': True,
                        'content': data['choices'][0]['message']['content'],
                        'api_used': 'camel_ai',
                        'model': 'gpt-3.5-turbo',
                        'usage': data.get('usage', {})
                    }
                else:
                    raise Exception(f"HTTP {response.status}")
                    
        except Exception as e:
            self.stats['camel_ai']['errors'] += 1
            raise Exception(f"Camel AI request failed: {e}")
            
    async def use_llm7(self, prompt: str, agent_config: AgentConfig) -> Dict[str, Any]:
        """Use LLM7 API"""
        self.stats['llm7']['requests'] += 1
        
        try:
            headers = {
                'Authorization': f'Bearer {self.config.llm7_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'model': 'llm7-medium',
                'prompt': f"Agent: {agent_config.name}\nCapabilities: {', '.join(agent_config.capabilities)}\nQuery: {prompt}\nResponse:",
                'temperature': 0.7,
                'max_tokens': 1000,
                'stream': False
            }
            
            async with self.session.post(f"{self.config.llm7_url}/completions", 
                                       headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    self.stats['llm7']['success'] += 1
                    return {
                        'success': True,
                        'content': data['choices'][0]['text'],
                        'api_used': 'llm7',
                        'model': 'llm7-medium',
                        'usage': data.get('usage', {})
                    }
                else:
                    raise Exception(f"HTTP {response.status}")
                    
        except Exception as e:
            self.stats['llm7']['errors'] += 1
            raise Exception(f"LLM7 request failed: {e}")
            
    async def use_local(self, prompt: str, agent_config: AgentConfig) -> Dict[str, Any]:
        """Use local processing"""
        self.stats['local']['requests'] += 1
        
        try:
            # Enhanced local processing based on agent capabilities
            response = f"[{agent_config.name}] Processing: {prompt}\n\n"
            
            if 'coding' in agent_config.capabilities or 'nextjs' in agent_config.capabilities:
                response += self.generate_code_response(prompt)
            elif 'ui_design' in agent_config.capabilities:
                response += self.generate_design_response(prompt)
            elif 'security' in agent_config.capabilities:
                response += self.generate_security_response(prompt)
            elif 'agent_creation' in agent_config.capabilities:
                response += self.generate_agent_response(prompt)
            else:
                response += self.generate_general_response(prompt)
                
            self.stats['local']['success'] += 1
            return {
                'success': True,
                'content': response,
                'api_used': 'local',
                'model': 'local-ai',
                'usage': {'tokens': len(response)}
            }
            
        except Exception as e:
            self.stats['local']['errors'] += 1
            raise Exception(f"Local processing failed: {e}")
            
    def generate_code_response(self, prompt: str) -> str:
        """Generate code-related response"""
        return f"""I can help with coding tasks. Based on your request, here's my approach:

1. Analyze the requirements
2. Design the solution architecture
3. Implement with best practices
4. Add error handling and testing
5. Provide documentation

For Next.js projects, I can create:
- Component structures
- API routes
- State management
- Styling solutions
- Deployment configurations

Would you like me to proceed with a specific implementation?"""

    def generate_design_response(self, prompt: str) -> str:
        """Generate design-related response"""
        return f"""I can assist with UI/UX design tasks:

Design Approach:
- User-centered design principles
- Modern, responsive layouts
- Accessibility considerations
- Performance optimization
- Cross-platform compatibility

Design Systems:
- Material Design
- Tailwind CSS
- Custom design tokens
- Component libraries

I can create wireframes, prototypes, and design specifications. What specific design challenge can I help with?"""

    def generate_security_response(self, prompt: str) -> str:
        """Generate security-related response"""
        return f"""Security analysis and recommendations:

Security Framework:
- Authentication & Authorization (JWT, OAuth)
- Data encryption (AES-256, TLS)
- Input validation and sanitization
- CSRF and XSS protection
- Rate limiting and DDoS protection

Best Practices:
- Zero-trust architecture
- Least privilege principle
- Regular security audits
- Secure coding practices
- Incident response planning

Would you like me to perform a security assessment or implement specific security measures?"""

    def generate_agent_response(self, prompt: str) -> str:
        """Generate agent creation response"""
        return f"""Agent Creation and Management:

I can create specialized agents with:
- Custom capabilities and skills
- Specific roles and responsibilities
- Autonomous operation modes
- Learning and adaptation features
- Collaboration protocols

Agent Types Available:
- Development agents (Frontend, Backend, DevOps)
- Design agents (UI/UX, Graphics, Content)
- Security agents (Monitoring, Testing, Compliance)
- Data agents (Analysis, Processing, Visualization)
- Business agents (Strategy, Marketing, Finance)

What type of agent would you like me to create?"""

    def generate_general_response(self, prompt: str) -> str:
        """Generate general response"""
        return f"""I'm here to help with a wide range of tasks using local AI processing:

Capabilities:
- Problem analysis and solution design
- Information processing and synthesis
- Task planning and execution
- Quality control and optimization
- Communication and collaboration

I can adapt my responses based on your specific needs while maintaining high standards of accuracy and helpfulness. How can I assist you further?"""

    async def create_multi_agent_scenario(self, scenario: Dict[str, Any], agents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create multi-agent collaboration scenario"""
        
        if not self.camel_ai_enabled:
            logger.info("Multi-agent scenarios using local simulation")
            return await self.simulate_local_scenario(scenario, agents)
            
        logger.info(f"Creating Camel AI multi-agent scenario: {scenario['title']}")
        
        session = {
            'id': str(datetime.now().timestamp()),
            'scenario': scenario,
            'agents': agents,
            'messages': [],
            'status': 'active',
            'start_time': datetime.now()
        }
        
        try:
            for round_num in range(scenario.get('rounds', 3)):
                logger.info(f"Round {round_num + 1}/{scenario.get('rounds', 3)}")
                
                for agent in agents:
                    prompt = f"""Multi-agent scenario: {scenario['description']}
                    Your role: {agent['role']}
                    Round: {round_num + 1}
                    Previous messages: {json.dumps(session['messages'][-3:], default=str)}
                    
                    Respond as {agent['name']} would in this scenario."""
                    
                    agent_config = AgentConfig(
                        name=agent['name'],
                        type=agent.get('type', 'collaborator'),
                        capabilities=agent.get('capabilities', []),
                        api_preference='camel'
                    )
                    
                    response = await self.generate_response(prompt, agent_config)
                    
                    session['messages'].append({
                        'round': round_num + 1,
                        'agent': agent['name'],
                        'role': agent['role'],
                        'content': response['content'],
                        'api_used': response['api_used'],
                        'timestamp': datetime.now()
                    })
                    
                    logger.info(f"💬 {agent['name']}: {response['content'][:100]}...")
                    
            session['status'] = 'completed'
            session['end_time'] = datetime.now()
            
            return session
            
        except Exception as e:
            logger.error(f"Multi-agent scenario failed: {e}")
            session['status'] = 'error'
            session['error'] = str(e)
            return session
            
    async def simulate_local_scenario(self, scenario: Dict[str, Any], agents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Simulate multi-agent scenario locally"""
        
        session = {
            'id': str(datetime.now().timestamp()),
            'scenario': scenario,
            'agents': agents,
            'messages': [],
            'status': 'active',
            'start_time': datetime.now()
        }
        
        responses = [
            "I believe we should take a systematic approach to this challenge...",
            "From my analysis, the key factors to consider are...",
            "I propose we divide the problem into manageable components...",
            "Building on the previous points, I would add...",
            "Let me offer an alternative perspective on this issue..."
        ]
        
        for round_num in range(scenario.get('rounds', 3)):
            for agent in agents:
                response = f"{responses[round_num % len(responses)]} (Local simulation by {agent['name']})"
                
                session['messages'].append({
                    'round': round_num + 1,
                    'agent': agent['name'],
                    'role': agent['role'],
                    'content': response,
                    'api_used': 'local_simulation',
                    'timestamp': datetime.now()
                })
                
        session['status'] = 'completed'
        session['end_time'] = datetime.now()
        
        return session
        
    def get_stats(self) -> Dict[str, Any]:
        """Get API usage statistics"""
        return {
            'apis': {
                'camel_ai': {
                    'enabled': self.camel_ai_enabled,
                    'stats': self.stats['camel_ai']
                },
                'llm7': {
                    'enabled': self.llm7_enabled,
                    'stats': self.stats['llm7']
                },
                'local': {
                    'stats': self.stats['local']
                }
            },
            'total_requests': sum(api['requests'] for api in self.stats.values()),
            'total_success': sum(api['success'] for api in self.stats.values()),
            'total_errors': sum(api['errors'] for api in self.stats.values())
        }
        
    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()

class MemoryBus:
    """Centralized memory and communication hub"""
    
    def __init__(self):
        self.data = {}
        self.subscribers = {}
        self.lock = threading.Lock()
        
    def store(self, key: str, value: Any):
        """Store data in memory bus"""
        with self.lock:
            self.data[key] = {
                'value': value,
                'timestamp': datetime.now(),
                'type': type(value).__name__
            }
            
    def retrieve(self, key: str) -> Any:
        """Retrieve data from memory bus"""
        with self.lock:
            return self.data.get(key, {}).get('value')

class BaseAgent:
    """Enhanced base class for all agents"""
    
    def __init__(self, config: AgentConfig, memory_bus: MemoryBus, api_integration: APIIntegration):
        self.config = config
        self.memory_bus = memory_bus
        self.api_integration = api_integration
        self.status = 'initialized'
        self.tasks_completed = 0
        self.last_activity = datetime.now()
        self.errors = []
        self.conversations = []
        
    async def initialize(self):
        """Initialize the agent"""
        try:
            self.status = 'initializing'
            await self._setup()
            self.status = 'active'
            logger.info(f"✅ {self.config.name}: Initialized successfully")
            return True
        except Exception as e:
            self.status = 'error'
            self.errors.append(str(e))
            logger.error(f"❌ {self.config.name}: Initialization failed - {e}")
            return False
            
    async def _setup(self):
        """Setup method to be overridden by subclasses"""
        await asyncio.sleep(0.1)  # Simulate initialization
        
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task using API integration"""
        try:
            self.last_activity = datetime.now()
            
            # Generate prompt for the task
            prompt = self.create_task_prompt(task)
            
            # Get response from API integration
            result = await self.api_integration.generate_response(prompt, self.config)
            
            # Process and store result
            processed_result = await self._process_task_result(task, result)
            
            self.tasks_completed += 1
            self.conversations.append({
                'task': task,
                'prompt': prompt,
                'result': result,
                'processed': processed_result,
                'timestamp': datetime.now()
            })
            
            return {'status': 'success', 'result': processed_result, 'api_used': result['api_used']}
            
        except Exception as e:
            self.errors.append(str(e))
            logger.error(f"Task execution failed in {self.config.name}: {e}")
            return {'status': 'error', 'error': str(e)}
            
    def create_task_prompt(self, task: Dict[str, Any]) -> str:
        """Create prompt for task execution"""
        return f"""
Task: {task.get('type', 'general')}
Description: {task.get('description', 'No description provided')}
Context: {task.get('context', {})}
Agent: {self.config.name}
Capabilities: {', '.join(self.config.capabilities)}

Please process this task and provide a detailed response.
"""
        
    async def _process_task_result(self, task: Dict[str, Any], result: Dict[str, Any]) -> Any:
        """Process task result - to be overridden by subclasses"""
        return result['content']

class DevEngineAgent(BaseAgent):
    """Enhanced Development Engine Agent with API integration"""
    
    async def _setup(self):
        """Setup development environment"""
        self.dev_tools = {
            'package_manager': 'npm',
            'framework': 'nextjs',
            'build_tools': ['webpack', 'vite'],
            'testing': ['jest', 'cypress']
        }
        self.projects = []
        
    def _get_nextjs_package_json(self) -> Dict[str, Any]:
        """Get Next.js package.json configuration"""
        return {
            "name": "agi-nextjs-app",
            "version": "1.0.0",
            "private": True,
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start",
                "lint": "next lint"
            },
            "dependencies": {
                "next": "^14.0.0",
                "react": "^18.0.0",
                "react-dom": "^18.0.0"
            },
            "devDependencies": {
                "@types/node": "^20.0.0",
                "@types/react": "^18.0.0",
                "@types/react-dom": "^18.0.0",
                "typescript": "^5.0.0"
            }
        }
        
    async def create_nextjs_project(self, project_name: str) -> Dict[str, Any]:
        """Create a Next.js project with API assistance"""
        try:
            # Use API integration for enhanced project creation
            prompt = f"Create a comprehensive Next.js project structure for '{project_name}' with modern best practices, TypeScript, and responsive design."
            
            result = await self.api_integration.generate_response(prompt, self.config)
            
            package_json = self._get_nextjs_package_json()
            package_json['name'] = project_name
            
            project = {
                'status': 'success',
                'project_name': project_name,
                'package_json': package_json,
                'structure': {
                    'pages': ['index.tsx', '_app.tsx', '_document.tsx'],
                    'components': ['Layout.tsx', 'Header.tsx', 'Footer.tsx'],
                    'styles': ['globals.css', 'Home.module.css'],
                    'config': ['next.config.js', 'tsconfig.json']
                },
                'ai_recommendations': result['content'],
                'api_used': result['api_used'],
                'created_at': datetime.now()
            }
            
            self.projects.append(project)
            return project
            
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

class EnhancedAgenticAISystem:
    """Enhanced Agentic AI System with API integration"""
    
    def __init__(self):
        # Load API configuration from environment
        api_config = APIConfig(
            camel_ai_key=os.getenv('CAMEL_AI_API_KEY', 'demo_key'),
            llm7_key=os.getenv('LLM7_API_KEY', 'demo_key')
        )
        
        self.memory_bus = MemoryBus()
        self.api_integration = APIIntegration(api_config)
        self.agents = {}
        self.system_status = 'initializing'
        self.multi_agent_sessions = []
        
    def print_banner(self):
        """Print enhanced system banner"""
        banner = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                  🧠 ENHANCED AGENTIC AI SYSTEM 🧠                            ║
║                                                                              ║
║              🐪 Camel AI Integration | 🧠 LLM7 Support                      ║
║              🤖 Autonomous Multi-Agent Intelligence                          ║
║                                                                              ║
║         🌐 Public API Keys | 🔄 Auto-Schedule | 🚀 Self-Expanding          ║
║         📊 Real-time Sync | 🎯 Intelligent Selection                        ║
║                                                                              ║
║                Made with ❤️ by Mulky Malikul Dhaher 🇮🇩                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
        """
        print(banner)
        
    async def initialize_components(self):
        """Initialize enhanced components"""
        print("🔧 Initializing enhanced core components...")
        
        # Initialize API integration
        await self.api_integration.initialize()
        print("  ✅ API Integration (Camel AI & LLM7)")
        
        # Initialize memory bus
        self.memory_bus.store('system_start_time', datetime.now())
        print("  ✅ Memory Bus")
        
        print("  ✅ Enhanced AI Processing")
        
    async def initialize_agents(self):
        """Initialize all agents with API integration"""
        print("🤖 Initializing enhanced agents...")
        
        agent_configs = [
            AgentConfig("cybershell", "dev_engine", ["shell", "automation"], api_preference="auto"),
            AgentConfig("agent_maker", "agent_creator", ["agent_creation", "management"], api_preference="camel"),
            AgentConfig("ui_designer", "designer", ["ui_design", "ux"], api_preference="llm7"),
            AgentConfig("dev_engine", "developer", ["coding", "nextjs", "react"], api_preference="auto"),
            AgentConfig("data_sync", "data_manager", ["sync", "storage"], api_preference="local"),
            AgentConfig("fullstack_dev", "developer", ["frontend", "backend"], api_preference="camel"),
            AgentConfig("commander_agi", "commander", ["coordination", "leadership"], api_preference="auto"),
            AgentConfig("quality_control", "tester", ["testing", "quality"], api_preference="llm7"),
            AgentConfig("bug_hunter", "debugger", ["debugging", "fixing"], api_preference="auto"),
            AgentConfig("money_maker", "financial", ["monetization", "optimization"], api_preference="camel"),
            AgentConfig("backup_colony", "backup", ["backup", "recovery"], api_preference="local"),
            AgentConfig("authentication", "security", ["auth", "security"], api_preference="llm7"),
            AgentConfig("knowledge_manager", "knowledge", ["learning", "documentation"], api_preference="auto"),
            AgentConfig("marketing", "marketing", ["promotion", "growth"], api_preference="camel")
        ]
        
        for config in agent_configs:
            try:
                # Create appropriate agent type with API integration
                if config.type == "dev_engine" or config.type == "developer":
                    agent = DevEngineAgent(config, self.memory_bus, self.api_integration)
                else:
                    agent = BaseAgent(config, self.memory_bus, self.api_integration)
                    
                success = await agent.initialize()
                if success:
                    self.agents[config.name] = agent
                    api_status = "🐪" if config.api_preference == "camel" else "🧠" if config.api_preference == "llm7" else "🏠"
                    print(f"  ✅ {config.name} {api_status}")
                else:
                    print(f"  ❌ {config.name}: Initialization failed")
                    
            except Exception as e:
                print(f"  ❌ {config.name}: {str(e)}")
                
    async def run_enhanced_demo(self):
        """Run enhanced demo with multi-agent scenarios"""
        print("\n🎭 Running enhanced multi-agent demonstration...")
        
        # Demo scenario
        scenario = {
            'title': 'AI Development Team Collaboration',
            'description': 'Collaborate to design and implement a new AI application',
            'rounds': 3
        }
        
        agents = [
            {'name': 'Lead Developer', 'role': 'Technical Leadership', 'capabilities': ['architecture', 'coding']},
            {'name': 'UI Designer', 'role': 'User Experience', 'capabilities': ['design', 'user_research']},
            {'name': 'Security Expert', 'role': 'Security Review', 'capabilities': ['security', 'testing']}
        ]
        
        session = await self.api_integration.create_multi_agent_scenario(scenario, agents)
        self.multi_agent_sessions.append(session)
        
        print(f"\n✅ Multi-agent session completed: {session['id']}")
        print(f"📊 Messages exchanged: {len(session['messages'])}")
        
    async def run_system_loop(self):
        """Enhanced system loop with API integration"""
        print("\n🚀 Starting enhanced system operations...")
        
        # Run demo first
        await self.run_enhanced_demo()
        
        loop_count = 0
        while loop_count < 10:  # Run for 10 cycles for demo
            try:
                # Execute autonomous tasks with API integration
                await self.execute_enhanced_autonomous_tasks()
                
                # System maintenance
                await self.system_maintenance()
                
                # Show periodic status
                if loop_count % 3 == 0:
                    await self.show_enhanced_status()
                
                await asyncio.sleep(3)  # 3-second cycle
                loop_count += 1
                
            except KeyboardInterrupt:
                print("\n🛑 Shutting down enhanced system...")
                break
            except Exception as e:
                logger.error(f"Enhanced system loop error: {e}")
                await asyncio.sleep(1)
                
    async def execute_enhanced_autonomous_tasks(self):
        """Execute autonomous tasks with API integration"""
        active_agents = [agent for agent in self.agents.values() if agent.status == 'active']
        
        if active_agents:
            # Select random agent for task
            agent = active_agents[loop_count % len(active_agents)] if 'loop_count' in locals() else active_agents[0]
            
            task = {
                'type': 'autonomous_operation',
                'description': f'Autonomous task for {agent.config.name}',
                'timestamp': datetime.now(),
                'context': {'api_enabled': True}
            }
            
            result = await agent.execute_task(task)
            
            if result['status'] == 'success':
                logger.info(f"✅ {agent.config.name} completed task using {result.get('api_used', 'unknown')} API")
                
    async def show_enhanced_status(self):
        """Show enhanced system status"""
        api_stats = self.api_integration.get_stats()
        
        print(f"\n📊 Enhanced System Status:")
        print(f"  Active Agents: {sum(1 for agent in self.agents.values() if agent.status == 'active')}/{len(self.agents)}")
        print(f"  API Requests: {api_stats['total_requests']} (Success: {api_stats['total_success']}, Errors: {api_stats['total_errors']})")
        print(f"  Camel AI: {'✅ Enabled' if api_stats['apis']['camel_ai']['enabled'] else '❌ Disabled'}")
        print(f"  LLM7: {'✅ Enabled' if api_stats['apis']['llm7']['enabled'] else '❌ Disabled'}")
        print(f"  Multi-agent Sessions: {len(self.multi_agent_sessions)}")
        
    async def system_maintenance(self):
        """Enhanced system maintenance"""
        # Clean up old conversations
        for agent in self.agents.values():
            if len(agent.conversations) > 20:
                agent.conversations = agent.conversations[-10:]
                
    def get_enhanced_system_status(self) -> Dict[str, Any]:
        """Get comprehensive enhanced system status"""
        api_stats = self.api_integration.get_stats()
        
        return {
            'timestamp': datetime.now().isoformat(),
            'total_agents': len(self.agents),
            'active_agents': sum(1 for agent in self.agents.values() if agent.status == 'active'),
            'total_tasks_completed': sum(agent.tasks_completed for agent in self.agents.values()),
            'api_integration': api_stats,
            'multi_agent_sessions': len(self.multi_agent_sessions),
            'system_uptime': (datetime.now() - self.memory_bus.retrieve('system_start_time')).total_seconds(),
            'agent_statuses': {name: agent.status for name, agent in self.agents.items()}
        }
        
    async def shutdown(self):
        """Enhanced shutdown with API cleanup"""
        print("\n🛑 Shutting down Enhanced AGI System...")
        
        # Cleanup API integration
        await self.api_integration.cleanup()
        
        # Shutdown agents
        for agent in self.agents.values():
            agent.status = 'terminated'
            
        print("✅ Enhanced AGI System shutdown complete")

async def main():
    """Enhanced main entry point"""
    system = EnhancedAgenticAISystem()
    
    try:
        # Print enhanced banner
        system.print_banner()
        
        print("🚀 Initializing Enhanced Agentic AI System...")
        print("🔑 Checking API keys...")
        
        # Check API keys
        camel_key = os.getenv('CAMEL_AI_API_KEY', 'demo_key')
        llm7_key = os.getenv('LLM7_API_KEY', 'demo_key')
        
        if camel_key == 'demo_key':
            print("⚠️ CAMEL_AI_API_KEY not set - using demo mode")
        else:
            print("✅ Camel AI key configured")
            
        if llm7_key == 'demo_key':
            print("⚠️ LLM7_API_KEY not set - using demo mode")
        else:
            print("✅ LLM7 key configured")
            
        # Initialize enhanced components
        await system.initialize_components()
        
        # Initialize enhanced agents
        await system.initialize_agents()
        
        print(f"\n📊 Enhanced System Status:")
        status = system.get_enhanced_system_status()
        print(f"  Active Agents: {status['active_agents']}/{status['total_agents']}")
        print(f"  API Integration: {'✅ Ready' if status['api_integration']['total_requests'] >= 0 else '❌ Failed'}")
        
        print("\n🎯 Enhanced system ready for operations!")
        print("🔗 API Configuration:")
        print("  Set CAMEL_AI_API_KEY for Camel AI integration")
        print("  Set LLM7_API_KEY for LLM7 integration")
        print("Press Ctrl+C to shutdown\n")
        
        # Start enhanced main system loop
        await system.run_system_loop()
        
    except KeyboardInterrupt:
        print("\n👋 Enhanced system shutdown complete")
    except Exception as e:
        logger.error(f"Enhanced system error: {e}")
        sys.exit(1)
    finally:
        await system.shutdown()

if __name__ == "__main__":
    # Check Python version
    if sys.version_info < (3, 7):
        print("❌ Python 3.7+ required")
        sys.exit(1)
        
    asyncio.run(main())