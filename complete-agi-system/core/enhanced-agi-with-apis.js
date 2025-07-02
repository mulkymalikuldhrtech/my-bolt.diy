#!/usr/bin/env node

/**
 * 🧠 ENHANCED AGI SYSTEM WITH CAMEL AI & LLM7 INTEGRATION 🧠
 * 
 * Advanced Multi-Agent Intelligence System
 * - Camel AI Integration for enhanced collaboration
 * - LLM7 Support for advanced language models
 * - Public API keys support
 * - Autonomous agent operations
 * 
 * Made with ❤️ by Mulky Malikul Dhaher 🇮🇩
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// Load environment variables
require('dotenv').config();

class APIConfig {
    constructor() {
        this.camelAI = {
            apiKey: process.env.CAMEL_AI_API_KEY || 'demo_key',
            baseUrl: process.env.CAMEL_AI_BASE_URL || 'https://api.camel-ai.org/v1',
            enabled: false,
            models: ['gpt-4', 'gpt-3.5-turbo', 'claude-3']
        };
        
        this.llm7 = {
            apiKey: process.env.LLM7_API_KEY || 'demo_key',
            baseUrl: process.env.LLM7_BASE_URL || 'https://api.llm7.ai/v1',
            enabled: false,
            models: ['llm7-large', 'llm7-medium', 'llm7-fast']
        };
        
        this.settings = {
            timeout: parseInt(process.env.API_TIMEOUT) || 30000,
            maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
            temperature: parseFloat(process.env.DEFAULT_TEMPERATURE) || 0.7,
            maxTokens: parseInt(process.env.MAX_TOKENS) || 1000
        };
        
        this.fallback = {
            enabled: process.env.ENABLE_LOCAL_FALLBACK !== 'false',
            localModels: ['local-gpt', 'offline-llm']
        };
    }
}

class APIIntegration extends EventEmitter {
    constructor() {
        super();
        this.config = new APIConfig();
        this.stats = {
            camelAI: { requests: 0, success: 0, errors: 0 },
            llm7: { requests: 0, success: 0, errors: 0 },
            local: { requests: 0, success: 0, errors: 0 }
        };
        this.conversations = [];
    }

    async initialize() {
        console.log('🔗 Initializing Enhanced API Integration...');
        
        // Test connections
        await Promise.all([
            this.testCamelAI(),
            this.testLLM7()
        ]);
        
        this.setupFallbacks();
        
        console.log(`📊 API Status - Camel AI: ${this.config.camelAI.enabled ? '✅' : '❌'}, LLM7: ${this.config.llm7.enabled ? '✅' : '❌'}`);
        
        this.emit('initialized', {
            camelAI: this.config.camelAI.enabled,
            llm7: this.config.llm7.enabled,
            timestamp: new Date()
        });
    }

    async testCamelAI() {
        if (this.config.camelAI.apiKey === 'demo_key') {
            console.log('⚠️ Using demo Camel AI key - limited functionality');
            return;
        }

        try {
            const result = await this.makeAPIRequest(
                this.config.camelAI.baseUrl + '/models',
                'GET',
                null,
                {
                    'Authorization': `Bearer ${this.config.camelAI.apiKey}`,
                    'Content-Type': 'application/json'
                }
            );

            if (result.success) {
                this.config.camelAI.enabled = true;
                console.log('✅ Camel AI connected successfully');
                
                if (result.data && result.data.data) {
                    this.config.camelAI.models = result.data.data.map(m => m.id);
                }
                
                console.log(`📋 Camel AI models: ${this.config.camelAI.models.join(', ')}`);
            }
        } catch (error) {
            console.log(`❌ Camel AI connection failed: ${error.message}`);
        }
    }

    async testLLM7() {
        if (this.config.llm7.apiKey === 'demo_key') {
            console.log('⚠️ Using demo LLM7 key - limited functionality');
            return;
        }

        try {
            const result = await this.makeAPIRequest(
                this.config.llm7.baseUrl + '/models',
                'GET',
                null,
                {
                    'Authorization': `Bearer ${this.config.llm7.apiKey}`,
                    'Content-Type': 'application/json'
                }
            );

            if (result.success) {
                this.config.llm7.enabled = true;
                console.log('✅ LLM7 connected successfully');
                
                if (result.data && result.data.models) {
                    this.config.llm7.models = result.data.models;
                }
                
                console.log(`📋 LLM7 models: ${this.config.llm7.models.join(', ')}`);
            }
        } catch (error) {
            console.log(`❌ LLM7 connection failed: ${error.message}`);
        }
    }

    setupFallbacks() {
        if (!this.config.camelAI.enabled && !this.config.llm7.enabled) {
            console.log('🏠 Enabling local fallback processing');
            this.config.fallback.enabled = true;
        }
    }

    async generateResponse(prompt, options = {}) {
        const {
            preferredAPI = 'auto',
            model = null,
            temperature = this.config.settings.temperature,
            maxTokens = this.config.settings.maxTokens,
            agentName = 'AGI',
            capabilities = []
        } = options;

        let result = null;
        let apiUsed = null;

        try {
            // Select best API
            const selectedAPI = this.selectAPI(preferredAPI);
            
            if (selectedAPI === 'camelAI') {
                result = await this.useCamelAI(prompt, { model, temperature, maxTokens, agentName, capabilities });
                apiUsed = 'camelAI';
            } else if (selectedAPI === 'llm7') {
                result = await this.useLLM7(prompt, { model, temperature, maxTokens, agentName, capabilities });
                apiUsed = 'llm7';
            } else {
                result = await this.useLocalFallback(prompt, { agentName, capabilities });
                apiUsed = 'local';
            }

            // Store conversation
            this.conversations.push({
                prompt,
                response: result.content,
                apiUsed,
                model: result.model,
                timestamp: new Date(),
                options
            });

            return {
                success: true,
                response: result.content,
                apiUsed,
                model: result.model,
                usage: result.usage,
                timestamp: new Date()
            };

        } catch (error) {
            console.error(`❌ Response generation failed: ${error.message}`);
            
            // Try fallback if not already used
            if (apiUsed !== 'local') {
                try {
                    result = await this.useLocalFallback(prompt, { agentName, capabilities });
                    return {
                        success: true,
                        response: result.content,
                        apiUsed: 'local_fallback',
                        model: 'local',
                        fallbackReason: error.message,
                        timestamp: new Date()
                    };
                } catch (fallbackError) {
                    console.error(`❌ Local fallback failed: ${fallbackError.message}`);
                }
            }

            return {
                success: false,
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    selectAPI(preference) {
        if (preference === 'camel' && this.config.camelAI.enabled) {
            return 'camelAI';
        } else if (preference === 'llm7' && this.config.llm7.enabled) {
            return 'llm7';
        } else if (preference === 'auto') {
            if (this.config.camelAI.enabled) {
                return 'camelAI';
            } else if (this.config.llm7.enabled) {
                return 'llm7';
            } else {
                return 'local';
            }
        } else {
            return 'local';
        }
    }

    async useCamelAI(prompt, options) {
        this.stats.camelAI.requests++;

        const model = options.model || this.config.camelAI.models[0];
        const payload = {
            model,
            messages: [
                {
                    role: 'system',
                    content: `You are ${options.agentName}, an advanced AGI agent with capabilities: ${options.capabilities.join(', ')}. Provide intelligent, helpful, and creative responses.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: options.temperature,
            max_tokens: options.maxTokens
        };

        try {
            const result = await this.makeAPIRequest(
                this.config.camelAI.baseUrl + '/chat/completions',
                'POST',
                payload,
                {
                    'Authorization': `Bearer ${this.config.camelAI.apiKey}`,
                    'Content-Type': 'application/json'
                }
            );

            if (result.success) {
                this.stats.camelAI.success++;
                return {
                    content: result.data.choices[0].message.content,
                    model: model,
                    usage: result.data.usage,
                    provider: 'camelAI'
                };
            } else {
                throw new Error(`HTTP ${result.status}: ${result.data}`);
            }
        } catch (error) {
            this.stats.camelAI.errors++;
            throw new Error(`Camel AI request failed: ${error.message}`);
        }
    }

    async useLLM7(prompt, options) {
        this.stats.llm7.requests++;

        const model = options.model || this.config.llm7.models[0];
        const payload = {
            model,
            prompt: `Agent: ${options.agentName}\nCapabilities: ${options.capabilities.join(', ')}\nQuery: ${prompt}\nResponse:`,
            temperature: options.temperature,
            max_tokens: options.maxTokens,
            stream: false
        };

        try {
            const result = await this.makeAPIRequest(
                this.config.llm7.baseUrl + '/completions',
                'POST',
                payload,
                {
                    'Authorization': `Bearer ${this.config.llm7.apiKey}`,
                    'Content-Type': 'application/json'
                }
            );

            if (result.success) {
                this.stats.llm7.success++;
                return {
                    content: result.data.choices[0].text,
                    model: model,
                    usage: result.data.usage,
                    provider: 'llm7'
                };
            } else {
                throw new Error(`HTTP ${result.status}: ${result.data}`);
            }
        } catch (error) {
            this.stats.llm7.errors++;
            throw new Error(`LLM7 request failed: ${error.message}`);
        }
    }

    async useLocalFallback(prompt, options) {
        this.stats.local.requests++;

        try {
            const capabilities = options.capabilities || [];
            let response = `[${options.agentName}] Processing: ${prompt}\n\n`;

            // Enhanced local processing based on capabilities
            if (capabilities.includes('coding') || capabilities.includes('development')) {
                response += this.generateCodeResponse(prompt);
            } else if (capabilities.includes('design') || capabilities.includes('ui')) {
                response += this.generateDesignResponse(prompt);
            } else if (capabilities.includes('security') || capabilities.includes('auth')) {
                response += this.generateSecurityResponse(prompt);
            } else if (capabilities.includes('agent_creation') || capabilities.includes('management')) {
                response += this.generateAgentResponse(prompt);
            } else if (capabilities.includes('financial') || capabilities.includes('monetization')) {
                response += this.generateFinancialResponse(prompt);
            } else {
                response += this.generateGeneralResponse(prompt);
            }

            this.stats.local.success++;
            return {
                content: response,
                model: 'local-ai',
                usage: { tokens: response.length },
                provider: 'local'
            };
        } catch (error) {
            this.stats.local.errors++;
            throw new Error(`Local processing failed: ${error.message}`);
        }
    }

    generateCodeResponse(prompt) {
        return `🔧 Code Development Response:

I can assist with various coding tasks:

1. **Architecture Design**: Creating scalable system architectures
2. **Implementation**: Writing clean, efficient code
3. **Best Practices**: Following industry standards
4. **Testing**: Unit tests, integration tests, e2e tests
5. **Documentation**: Comprehensive code documentation

For this specific request, I would:
- Analyze requirements thoroughly
- Design optimal solution structure
- Implement with error handling
- Add comprehensive testing
- Provide deployment guidance

What specific coding challenge can I help you solve?`;
    }

    generateDesignResponse(prompt) {
        return `🎨 Design Response:

I can help with comprehensive design solutions:

1. **User Experience**: Intuitive and accessible interfaces
2. **Visual Design**: Modern, responsive layouts
3. **Design Systems**: Consistent component libraries
4. **Prototyping**: Interactive mockups and wireframes
5. **Accessibility**: WCAG compliant designs

Design Approach:
- User-centered design principles
- Mobile-first responsive design
- Performance-optimized interfaces
- Cross-platform compatibility
- Modern design trends integration

How can I help with your design project?`;
    }

    generateSecurityResponse(prompt) {
        return `🔒 Security Analysis:

Comprehensive security assessment and recommendations:

1. **Authentication**: Multi-factor authentication, OAuth, JWT
2. **Authorization**: Role-based access control (RBAC)
3. **Encryption**: AES-256, TLS/SSL, end-to-end encryption
4. **Vulnerability Assessment**: Security audits and penetration testing
5. **Compliance**: GDPR, SOC2, ISO 27001 standards

Security Framework:
- Zero-trust architecture
- Defense in depth strategy
- Continuous security monitoring
- Incident response planning
- Security awareness training

What security aspect would you like me to analyze?`;
    }

    generateAgentResponse(prompt) {
        return `🤖 Agent Creation & Management:

I can create and manage specialized AI agents:

1. **Agent Types**: Development, Design, Security, Finance, Research
2. **Capabilities**: Custom skills and knowledge domains
3. **Autonomy**: Self-directed task execution
4. **Collaboration**: Multi-agent coordination protocols
5. **Learning**: Continuous improvement and adaptation

Agent Creation Process:
- Requirement analysis
- Capability definition
- Architecture design
- Implementation and testing
- Deployment and monitoring

Available Agent Templates:
- Development teams (Frontend, Backend, DevOps)
- Creative teams (Design, Content, Marketing)
- Business teams (Strategy, Finance, Operations)

What type of agent would you like me to create?`;
    }

    generateFinancialResponse(prompt) {
        return `💰 Financial Intelligence:

Advanced financial analysis and optimization:

1. **Investment Strategy**: Portfolio optimization, risk assessment
2. **Market Analysis**: Trend analysis, predictive modeling
3. **Revenue Optimization**: Monetization strategies, pricing models
4. **Cost Management**: Expense optimization, budget planning
5. **Compliance**: Financial regulations, tax optimization

Financial Capabilities:
- Real-time market monitoring
- Automated trading strategies
- Risk management protocols
- Financial reporting and analytics
- ROI optimization

How can I assist with your financial objectives?`;
    }

    generateGeneralResponse(prompt) {
        return `🧠 General AI Assistant:

I'm here to help with a wide range of tasks:

1. **Problem Solving**: Analytical thinking and solution design
2. **Information Processing**: Data analysis and synthesis
3. **Task Planning**: Project management and execution
4. **Communication**: Clear and effective interaction
5. **Innovation**: Creative thinking and ideation

My Approach:
- Thorough analysis of your needs
- Creative and practical solutions
- Clear communication and explanation
- Continuous learning and improvement
- Reliable and consistent assistance

How can I help you achieve your goals today?`;
    }

    async makeAPIRequest(url, method, data, headers) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: method,
                headers: headers,
                timeout: this.config.settings.timeout
            };

            const protocol = urlObj.protocol === 'https:' ? https : http;
            const req = protocol.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(responseData);
                        resolve({
                            success: res.statusCode >= 200 && res.statusCode < 300,
                            status: res.statusCode,
                            data: parsedData
                        });
                    } catch (error) {
                        resolve({
                            success: false,
                            status: res.statusCode,
                            data: responseData
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    async createMultiAgentScenario(scenario, agents) {
        if (!this.config.camelAI.enabled) {
            console.log('⚠️ Multi-agent scenarios using local simulation');
            return this.simulateLocalScenario(scenario, agents);
        }

        console.log(`🎭 Creating Camel AI multi-agent scenario: ${scenario.title}`);

        const session = {
            id: Date.now().toString(),
            scenario,
            agents,
            messages: [],
            status: 'active',
            startTime: new Date()
        };

        try {
            for (let round = 0; round < (scenario.rounds || 3); round++) {
                console.log(`🔄 Round ${round + 1}/${scenario.rounds || 3}`);

                for (const agent of agents) {
                    const rolePrompt = `Multi-agent collaboration scenario: ${scenario.description}
Your role: ${agent.role}
Your capabilities: ${agent.capabilities?.join(', ') || 'general'}
Round: ${round + 1}
Previous messages: ${JSON.stringify(session.messages.slice(-3))}

Respond as ${agent.name} would in this scenario, focusing on your expertise and role.`;

                    const response = await this.generateResponse(rolePrompt, {
                        preferredAPI: 'camel',
                        agentName: agent.name,
                        capabilities: agent.capabilities || []
                    });

                    session.messages.push({
                        round: round + 1,
                        agent: agent.name,
                        role: agent.role,
                        content: response.response,
                        apiUsed: response.apiUsed,
                        timestamp: new Date()
                    });

                    console.log(`💬 ${agent.name}: ${response.response.substring(0, 100)}...`);
                }
            }

            session.status = 'completed';
            session.endTime = new Date();

            return session;

        } catch (error) {
            console.error(`❌ Multi-agent scenario failed: ${error.message}`);
            session.status = 'error';
            session.error = error.message;
            return session;
        }
    }

    simulateLocalScenario(scenario, agents) {
        console.log(`🤖 Simulating multi-agent scenario locally: ${scenario.title}`);

        const session = {
            id: Date.now().toString(),
            scenario,
            agents,
            messages: [],
            status: 'active',
            startTime: new Date()
        };

        const responses = [
            'I believe we should approach this challenge systematically...',
            'From my perspective, the key factors to consider are...',
            'Let me propose a solution that addresses the core requirements...',
            'Building on the previous ideas, I would suggest...',
            'I agree with the direction, and would like to add...'
        ];

        for (let round = 0; round < (scenario.rounds || 3); round++) {
            for (let i = 0; i < agents.length; i++) {
                const agent = agents[i];
                const response = `${responses[(round + i) % responses.length]} (Local simulation by ${agent.name})`;

                session.messages.push({
                    round: round + 1,
                    agent: agent.name,
                    role: agent.role,
                    content: response,
                    apiUsed: 'local_simulation',
                    timestamp: new Date()
                });
            }
        }

        session.status = 'completed';
        session.endTime = new Date();
        return session;
    }

    getStats() {
        return {
            apis: {
                camelAI: {
                    enabled: this.config.camelAI.enabled,
                    models: this.config.camelAI.models,
                    stats: this.stats.camelAI
                },
                llm7: {
                    enabled: this.config.llm7.enabled,
                    models: this.config.llm7.models,
                    stats: this.stats.llm7
                },
                local: {
                    stats: this.stats.local
                }
            },
            conversations: this.conversations.length,
            totalRequests: Object.values(this.stats).reduce((sum, api) => sum + api.requests, 0),
            totalSuccess: Object.values(this.stats).reduce((sum, api) => sum + api.success, 0),
            totalErrors: Object.values(this.stats).reduce((sum, api) => sum + api.errors, 0)
        };
    }
}

class EnhancedAGIAgent {
    constructor(config, apiIntegration) {
        this.config = config;
        this.apiIntegration = apiIntegration;
        this.status = 'initialized';
        this.tasksCompleted = 0;
        this.lastActivity = new Date();
        this.conversations = [];
        this.errors = [];
    }

    async initialize() {
        try {
            this.status = 'initializing';
            await this.setup();
            this.status = 'active';
            console.log(`✅ ${this.config.name}: Initialized successfully`);
            return true;
        } catch (error) {
            this.status = 'error';
            this.errors.push(error.message);
            console.log(`❌ ${this.config.name}: Initialization failed - ${error.message}`);
            return false;
        }
    }

    async setup() {
        // Override in subclasses
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    async executeTask(task) {
        try {
            this.lastActivity = new Date();

            const prompt = this.createTaskPrompt(task);
            const result = await this.apiIntegration.generateResponse(prompt, {
                preferredAPI: this.config.apiPreference,
                agentName: this.config.name,
                capabilities: this.config.capabilities
            });

            const processedResult = this.processTaskResult(task, result);

            this.tasksCompleted++;
            this.conversations.push({
                task,
                prompt,
                result,
                processed: processedResult,
                timestamp: new Date()
            });

            return {
                status: 'success',
                result: processedResult,
                apiUsed: result.apiUsed
            };

        } catch (error) {
            this.errors.push(error.message);
            console.error(`Task execution failed in ${this.config.name}: ${error.message}`);
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    createTaskPrompt(task) {
        return `Task: ${task.type || 'general'}
Description: ${task.description || 'No description provided'}
Context: ${JSON.stringify(task.context || {})}
Agent: ${this.config.name}
Capabilities: ${this.config.capabilities.join(', ')}

Please process this task and provide a detailed, actionable response.`;
    }

    processTaskResult(task, result) {
        return result.response;
    }
}

class EnhancedAGISystem extends EventEmitter {
    constructor() {
        super();
        this.apiIntegration = new APIIntegration();
        this.agents = new Map();
        this.multiAgentSessions = [];
        this.systemStartTime = new Date();
        this.webServer = null;
    }

    printBanner() {
        const banner = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                🧠 ENHANCED AGI SYSTEM WITH API INTEGRATION 🧠                ║
║                                                                              ║
║              🐪 Camel AI Integration | 🧠 LLM7 Support                      ║
║              🤖 Autonomous Multi-Agent Intelligence                          ║
║                                                                              ║
║         🌐 Public API Keys | 🔄 Auto-Schedule | 🚀 Self-Expanding          ║
║         📊 Real-time Sync | 🎯 Intelligent Selection                        ║
║                                                                              ║
║                Made with ❤️ by Mulky Malikul Dhaher 🇮🇩                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
        `;
        console.log(banner);
    }

    async initialize() {
        this.printBanner();

        console.log('🚀 Initializing Enhanced AGI System...');
        console.log('🔑 Checking API configuration...');

        // Check API keys
        const camelKey = process.env.CAMEL_AI_API_KEY || 'demo_key';
        const llm7Key = process.env.LLM7_API_KEY || 'demo_key';

        if (camelKey === 'demo_key') {
            console.log('⚠️ CAMEL_AI_API_KEY not set - using demo mode');
        } else {
            console.log('✅ Camel AI key configured');
        }

        if (llm7Key === 'demo_key') {
            console.log('⚠️ LLM7_API_KEY not set - using demo mode');
        } else {
            console.log('✅ LLM7 key configured');
        }

        // Initialize API integration
        await this.apiIntegration.initialize();

        // Initialize agents
        await this.initializeAgents();

        // Start web interface
        await this.startWebInterface();

        console.log('\n🎯 Enhanced AGI System ready for operations!');
        console.log('🔗 Configuration:');
        console.log('  Set CAMEL_AI_API_KEY for Camel AI integration');
        console.log('  Set LLM7_API_KEY for LLM7 integration');
        console.log(`  Web interface: http://localhost:${process.env.WEB_PORT || 3000}`);
    }

    async initializeAgents() {
        console.log('🤖 Initializing enhanced agents...');

        const agentConfigs = [
            { name: 'cybershell', type: 'dev_engine', capabilities: ['shell', 'automation'], apiPreference: 'auto' },
            { name: 'agent_maker', type: 'agent_creator', capabilities: ['agent_creation', 'management'], apiPreference: 'camel' },
            { name: 'ui_designer', type: 'designer', capabilities: ['ui_design', 'ux'], apiPreference: 'llm7' },
            { name: 'dev_engine', type: 'developer', capabilities: ['coding', 'nextjs', 'react'], apiPreference: 'auto' },
            { name: 'data_sync', type: 'data_manager', capabilities: ['sync', 'storage'], apiPreference: 'local' },
            { name: 'fullstack_dev', type: 'developer', capabilities: ['frontend', 'backend'], apiPreference: 'camel' },
            { name: 'commander_agi', type: 'commander', capabilities: ['coordination', 'leadership'], apiPreference: 'auto' },
            { name: 'quality_control', type: 'tester', capabilities: ['testing', 'quality'], apiPreference: 'llm7' },
            { name: 'bug_hunter', type: 'debugger', capabilities: ['debugging', 'fixing'], apiPreference: 'auto' },
            { name: 'money_maker', type: 'financial', capabilities: ['monetization', 'optimization'], apiPreference: 'camel' },
            { name: 'backup_colony', type: 'backup', capabilities: ['backup', 'recovery'], apiPreference: 'local' },
            { name: 'authentication', type: 'security', capabilities: ['auth', 'security'], apiPreference: 'llm7' },
            { name: 'knowledge_manager', type: 'knowledge', capabilities: ['learning', 'documentation'], apiPreference: 'auto' },
            { name: 'marketing', type: 'marketing', capabilities: ['promotion', 'growth'], apiPreference: 'camel' }
        ];

        for (const config of agentConfigs) {
            try {
                const agent = new EnhancedAGIAgent(config, this.apiIntegration);
                const success = await agent.initialize();
                
                if (success) {
                    this.agents.set(config.name, agent);
                    const apiIcon = config.apiPreference === 'camel' ? '🐪' : 
                                  config.apiPreference === 'llm7' ? '🧠' : '🏠';
                    console.log(`  ✅ ${config.name} ${apiIcon}`);
                } else {
                    console.log(`  ❌ ${config.name}: Initialization failed`);
                }
            } catch (error) {
                console.log(`  ❌ ${config.name}: ${error.message}`);
            }
        }
    }

    async runDemo() {
        console.log('\n🎭 Running enhanced multi-agent demonstration...');

        const scenario = {
            title: 'AI-Powered Application Development',
            description: 'Collaborate to design and implement a cutting-edge AI application with modern architecture',
            rounds: 3
        };

        const agents = [
            { name: 'Solution Architect', role: 'Technical Architecture', capabilities: ['architecture', 'system_design'] },
            { name: 'AI Engineer', role: 'AI/ML Development', capabilities: ['ai', 'machine_learning'] },
            { name: 'Frontend Developer', role: 'User Interface', capabilities: ['frontend', 'react', 'ui'] },
            { name: 'Backend Developer', role: 'Server Architecture', capabilities: ['backend', 'api', 'database'] },
            { name: 'DevOps Engineer', role: 'Infrastructure', capabilities: ['devops', 'deployment', 'monitoring'] }
        ];

        const session = await this.apiIntegration.createMultiAgentScenario(scenario, agents);
        this.multiAgentSessions.push(session);

        console.log(`\n✅ Multi-agent session completed: ${session.id}`);
        console.log(`📊 Messages exchanged: ${session.messages.length}`);
        console.log(`⏱️ Duration: ${(session.endTime - session.startTime) / 1000}s`);

        return session;
    }

    async startMainLoop() {
        console.log('\n🚀 Starting enhanced system operations...');

        // Run demo first
        await this.runDemo();

        let loopCount = 0;
        const maxLoops = process.env.NODE_ENV === 'production' ? Infinity : 15;

        while (loopCount < maxLoops) {
            try {
                // Execute autonomous tasks
                await this.executeAutonomousTasks();

                // System maintenance
                this.performMaintenance();

                // Show status every 5 loops
                if (loopCount % 5 === 0) {
                    this.showSystemStatus();
                }

                await new Promise(resolve => setTimeout(resolve, 3000));
                loopCount++;

            } catch (error) {
                console.error(`System loop error: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    async executeAutonomousTasks() {
        const activeAgents = Array.from(this.agents.values()).filter(agent => agent.status === 'active');
        
        if (activeAgents.length > 0) {
            const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
            
            const task = {
                type: 'autonomous_operation',
                description: `Autonomous task for ${randomAgent.config.name}`,
                timestamp: new Date(),
                context: { 
                    apiEnabled: true,
                    systemUptime: (new Date() - this.systemStartTime) / 1000
                }
            };

            const result = await randomAgent.executeTask(task);
            
            if (result.status === 'success') {
                console.log(`✅ ${randomAgent.config.name} completed task using ${result.apiUsed} API`);
            }
        }
    }

    performMaintenance() {
        // Clean up old conversations
        for (const agent of this.agents.values()) {
            if (agent.conversations.length > 50) {
                agent.conversations = agent.conversations.slice(-25);
            }
        }

        // Clean up old sessions
        if (this.multiAgentSessions.length > 20) {
            this.multiAgentSessions = this.multiAgentSessions.slice(-10);
        }
    }

    showSystemStatus() {
        const stats = this.apiIntegration.getStats();
        const activeAgents = Array.from(this.agents.values()).filter(agent => agent.status === 'active').length;
        const totalTasks = Array.from(this.agents.values()).reduce((sum, agent) => sum + agent.tasksCompleted, 0);

        console.log(`\n📊 Enhanced System Status:`);
        console.log(`  Active Agents: ${activeAgents}/${this.agents.size}`);
        console.log(`  Total Tasks: ${totalTasks}`);
        console.log(`  API Requests: ${stats.totalRequests} (Success: ${stats.totalSuccess}, Errors: ${stats.totalErrors})`);
        console.log(`  Camel AI: ${stats.apis.camelAI.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`  LLM7: ${stats.apis.llm7.enabled ? '✅ Enabled' : '❌ Disabled'}`);
        console.log(`  Multi-agent Sessions: ${this.multiAgentSessions.length}`);
        console.log(`  Uptime: ${Math.floor((new Date() - this.systemStartTime) / 1000)}s`);
    }

    async startWebInterface() {
        const port = process.env.WEB_PORT || 3000;
        
        this.webServer = http.createServer((req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');

            if (req.url === '/status') {
                const stats = this.apiIntegration.getStats();
                const systemStatus = {
                    timestamp: new Date(),
                    agents: {
                        total: this.agents.size,
                        active: Array.from(this.agents.values()).filter(agent => agent.status === 'active').length,
                        statuses: Object.fromEntries(Array.from(this.agents.entries()).map(([name, agent]) => [name, agent.status]))
                    },
                    apis: stats.apis,
                    sessions: this.multiAgentSessions.length,
                    uptime: (new Date() - this.systemStartTime) / 1000
                };
                
                res.end(JSON.stringify(systemStatus, null, 2));
            } else if (req.url === '/') {
                res.setHeader('Content-Type', 'text/html');
                res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Enhanced AGI System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        .header { text-align: center; color: #333; margin-bottom: 30px; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .status-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
        .status-card h3 { margin-top: 0; color: #333; }
        .api-status { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; }
        .enabled { background: #28a745; }
        .disabled { background: #dc3545; }
        .refresh-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        .refresh-btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 Enhanced AGI System</h1>
            <p>🐪 Camel AI & 🧠 LLM7 Integration</p>
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Status</button>
        </div>
        <div id="status-content">Loading...</div>
    </div>
    
    <script>
        fetch('/status')
            .then(response => response.json())
            .then(data => {
                document.getElementById('status-content').innerHTML = \`
                    <div class="status-grid">
                        <div class="status-card">
                            <h3>🤖 Agents</h3>
                            <p>Active: \${data.agents.active}/\${data.agents.total}</p>
                            <p>Uptime: \${Math.floor(data.uptime)}s</p>
                        </div>
                        <div class="status-card">
                            <h3>🔗 APIs</h3>
                            <p>Camel AI: <span class="api-status \${data.apis.camelAI.enabled ? 'enabled' : 'disabled'}">\${data.apis.camelAI.enabled ? 'Enabled' : 'Disabled'}</span></p>
                            <p>LLM7: <span class="api-status \${data.apis.llm7.enabled ? 'enabled' : 'disabled'}">\${data.apis.llm7.enabled ? 'Enabled' : 'Disabled'}</span></p>
                        </div>
                        <div class="status-card">
                            <h3>📊 Statistics</h3>
                            <p>Total Requests: \${data.apis.camelAI.stats.requests + data.apis.llm7.stats.requests + data.apis.local.stats.requests}</p>
                            <p>Multi-agent Sessions: \${data.sessions}</p>
                        </div>
                    </div>
                \`;
            })
            .catch(error => {
                document.getElementById('status-content').innerHTML = '<p>Error loading status</p>';
            });
    </script>
</body>
</html>
                `);
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        });

        this.webServer.listen(port, () => {
            console.log(`🌐 Web interface running at http://localhost:${port}`);
        });
    }

    async shutdown() {
        console.log('\n🛑 Shutting down Enhanced AGI System...');
        
        // Shutdown web server
        if (this.webServer) {
            this.webServer.close();
        }
        
        // Shutdown agents
        for (const agent of this.agents.values()) {
            agent.status = 'terminated';
        }
        
        console.log('✅ Enhanced AGI System shutdown complete');
    }
}

// Main execution
async function main() {
    const system = new EnhancedAGISystem();
    
    try {
        await system.initialize();
        await system.startMainLoop();
    } catch (error) {
        console.error(`System error: ${error.message}`);
        process.exit(1);
    }
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n👋 Received shutdown signal...');
        await system.shutdown();
        process.exit(0);
    });
}

// Export for module usage
module.exports = { EnhancedAGISystem, APIIntegration, EnhancedAGIAgent };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}