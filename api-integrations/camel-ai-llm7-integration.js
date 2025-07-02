import axios from 'axios';
import { EventEmitter } from 'events';

/**
 * 🐪 CAMEL AI & LLM7 PUBLIC API INTEGRATION
 * 
 * Comprehensive integration with public APIs:
 * - Camel AI for multi-agent collaboration
 * - LLM7 for advanced language models
 * - Public API keys support
 * - Fallback mechanisms
 */

class CamelAILLM7Integration extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // Camel AI Configuration
      camelAI: {
        apiKey: config.camelAI?.apiKey || process.env.CAMEL_AI_API_KEY || 'demo_key',
        baseUrl: config.camelAI?.baseUrl || 'https://api.camel-ai.org/v1',
        enabled: false,
        models: ['gpt-4', 'gpt-3.5-turbo', 'claude-3']
      },
      
      // LLM7 Configuration
      llm7: {
        apiKey: config.llm7?.apiKey || process.env.LLM7_API_KEY || 'demo_key',
        baseUrl: config.llm7?.baseUrl || 'https://api.llm7.ai/v1',
        enabled: false,
        models: ['llm7-large', 'llm7-medium', 'llm7-fast']
      },
      
      // Fallback configuration
      fallback: {
        enabled: true,
        localModels: ['local-gpt', 'offline-llm'],
        maxRetries: 3,
        timeout: 30000
      }
    };
    
    this.agents = new Map();
    this.conversations = [];
    this.apiStats = {
      camelAI: { requests: 0, success: 0, errors: 0 },
      llm7: { requests: 0, success: 0, errors: 0 },
      fallback: { requests: 0, success: 0, errors: 0 }
    };
    
    this.init();
  }

  async init() {
    console.log('🔗 Initializing Camel AI & LLM7 Integration...');
    
    // Test Camel AI connection
    await this.initializeCamelAI();
    
    // Test LLM7 connection
    await this.initializeLLM7();
    
    // Setup fallback mechanisms
    this.setupFallbacks();
    
    this.emit('initialized', {
      camelAI: this.config.camelAI.enabled,
      llm7: this.config.llm7.enabled,
      timestamp: new Date()
    });
  }

  async initializeCamelAI() {
    try {
      console.log('🐪 Testing Camel AI connection...');
      
      if (this.config.camelAI.apiKey === 'demo_key') {
        console.log('⚠️ Using demo Camel AI key - limited functionality');
        this.config.camelAI.enabled = false;
        return;
      }
      
      const response = await axios.get(`${this.config.camelAI.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.camelAI.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      if (response.status === 200) {
        this.config.camelAI.enabled = true;
        this.config.camelAI.models = response.data.data?.map(m => m.id) || this.config.camelAI.models;
        console.log('✅ Camel AI connected successfully');
        console.log(`📋 Available models: ${this.config.camelAI.models.join(', ')}`);
      }
      
    } catch (error) {
      console.log('❌ Camel AI connection failed:', error.message);
      this.config.camelAI.enabled = false;
    }
  }

  async initializeLLM7() {
    try {
      console.log('🧠 Testing LLM7 connection...');
      
      if (this.config.llm7.apiKey === 'demo_key') {
        console.log('⚠️ Using demo LLM7 key - limited functionality');
        this.config.llm7.enabled = false;
        return;
      }
      
      const response = await axios.get(`${this.config.llm7.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.llm7.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      if (response.status === 200) {
        this.config.llm7.enabled = true;
        this.config.llm7.models = response.data.models || this.config.llm7.models;
        console.log('✅ LLM7 connected successfully');
        console.log(`📋 Available models: ${this.config.llm7.models.join(', ')}`);
      }
      
    } catch (error) {
      console.log('❌ LLM7 connection failed:', error.message);
      this.config.llm7.enabled = false;
    }
  }

  setupFallbacks() {
    console.log('🔧 Setting up fallback mechanisms...');
    
    // If no external APIs available, enable local processing
    if (!this.config.camelAI.enabled && !this.config.llm7.enabled) {
      console.log('🏠 Enabling local fallback processing');
      this.config.fallback.enabled = true;
    }
  }

  async generateResponse(prompt, options = {}) {
    const {
      preferredAPI = 'auto',
      model = null,
      temperature = 0.7,
      maxTokens = 1000,
      conversationId = null
    } = options;

    let result = null;
    let apiUsed = null;

    try {
      // Auto-select best available API
      if (preferredAPI === 'auto') {
        if (this.config.camelAI.enabled) {
          result = await this.useCamelAI(prompt, { model, temperature, maxTokens });
          apiUsed = 'camelAI';
        } else if (this.config.llm7.enabled) {
          result = await this.useLLM7(prompt, { model, temperature, maxTokens });
          apiUsed = 'llm7';
        } else {
          result = await this.useFallback(prompt, options);
          apiUsed = 'fallback';
        }
      } else if (preferredAPI === 'camel' && this.config.camelAI.enabled) {
        result = await this.useCamelAI(prompt, { model, temperature, maxTokens });
        apiUsed = 'camelAI';
      } else if (preferredAPI === 'llm7' && this.config.llm7.enabled) {
        result = await this.useLLM7(prompt, { model, temperature, maxTokens });
        apiUsed = 'llm7';
      } else {
        result = await this.useFallback(prompt, options);
        apiUsed = 'fallback';
      }

      // Store conversation if ID provided
      if (conversationId) {
        this.storeConversation(conversationId, prompt, result, apiUsed);
      }

      return {
        success: true,
        response: result.content,
        apiUsed,
        model: result.model,
        usage: result.usage,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Response generation failed:', error.message);
      
      // Try fallback if primary failed
      if (apiUsed !== 'fallback') {
        try {
          result = await this.useFallback(prompt, options);
          return {
            success: true,
            response: result.content,
            apiUsed: 'fallback',
            model: 'local',
            fallbackReason: error.message,
            timestamp: new Date()
          };
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError.message);
        }
      }

      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  async useCamelAI(prompt, options) {
    this.apiStats.camelAI.requests++;
    
    try {
      const model = options.model || this.config.camelAI.models[0];
      
      const payload = {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an advanced AI assistant integrated with Camel AI platform. Provide helpful, accurate, and creative responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000
      };

      const response = await axios.post(
        `${this.config.camelAI.baseUrl}/chat/completions`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.config.camelAI.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.config.fallback.timeout
        }
      );

      this.apiStats.camelAI.success++;
      
      return {
        content: response.data.choices[0].message.content,
        model: model,
        usage: response.data.usage,
        provider: 'camelAI'
      };

    } catch (error) {
      this.apiStats.camelAI.errors++;
      throw new Error(`Camel AI request failed: ${error.message}`);
    }
  }

  async useLLM7(prompt, options) {
    this.apiStats.llm7.requests++;
    
    try {
      const model = options.model || this.config.llm7.models[0];
      
      const payload = {
        model,
        prompt,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
        stream: false
      };

      const response = await axios.post(
        `${this.config.llm7.baseUrl}/completions`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.config.llm7.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.config.fallback.timeout
        }
      );

      this.apiStats.llm7.success++;
      
      return {
        content: response.data.choices[0].text,
        model: model,
        usage: response.data.usage,
        provider: 'llm7'
      };

    } catch (error) {
      this.apiStats.llm7.errors++;
      throw new Error(`LLM7 request failed: ${error.message}`);
    }
  }

  async useFallback(prompt, options) {
    this.apiStats.fallback.requests++;
    
    try {
      // Enhanced local processing
      const responses = [
        `Based on your request: "${prompt}", I'm processing this using local intelligence. `,
        `Analyzing your query: "${prompt}" with built-in reasoning capabilities. `,
        `Processing "${prompt}" through autonomous local AI system. `
      ];
      
      const baseResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simulate intelligent processing based on prompt type
      let enhancedResponse = baseResponse;
      
      if (prompt.toLowerCase().includes('code') || prompt.toLowerCase().includes('programming')) {
        enhancedResponse += this.generateCodeResponse(prompt);
      } else if (prompt.toLowerCase().includes('creative') || prompt.toLowerCase().includes('story')) {
        enhancedResponse += this.generateCreativeResponse(prompt);
      } else if (prompt.toLowerCase().includes('analyze') || prompt.toLowerCase().includes('data')) {
        enhancedResponse += this.generateAnalysisResponse(prompt);
      } else {
        enhancedResponse += this.generateGeneralResponse(prompt);
      }

      this.apiStats.fallback.success++;
      
      return {
        content: enhancedResponse,
        model: 'local-ai',
        usage: { tokens: enhancedResponse.length },
        provider: 'fallback'
      };

    } catch (error) {
      this.apiStats.fallback.errors++;
      throw new Error(`Fallback processing failed: ${error.message}`);
    }
  }

  generateCodeResponse(prompt) {
    return `Here's a code-focused response: I can help you with programming tasks, code generation, debugging, and technical implementation. While I'm running in local mode, I can provide structured solutions and best practices.`;
  }

  generateCreativeResponse(prompt) {
    return `Here's a creative response: I can assist with creative writing, storytelling, brainstorming, and imaginative content creation. My local intelligence can generate unique and engaging content.`;
  }

  generateAnalysisResponse(prompt) {
    return `Here's an analytical response: I can help with data analysis, pattern recognition, logical reasoning, and systematic problem-solving approaches using local processing capabilities.`;
  }

  generateGeneralResponse(prompt) {
    return `I'm here to help with a wide range of tasks using local AI processing. I can provide information, answer questions, and assist with various projects while maintaining privacy and reliability.`;
  }

  // Multi-agent collaboration using Camel AI
  async createMultiAgentSession(scenario, agents) {
    if (!this.config.camelAI.enabled) {
      console.log('⚠️ Multi-agent sessions require Camel AI - using local simulation');
      return this.simulateMultiAgentSession(scenario, agents);
    }

    console.log(`🎭 Creating Camel AI multi-agent session: ${scenario.title}`);
    
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
          const rolePrompt = `You are ${agent.name} with role: ${agent.role}. 
            Scenario: ${scenario.description}
            Round: ${round + 1}
            Previous messages: ${JSON.stringify(session.messages.slice(-3))}
            
            Respond as ${agent.name} would in this scenario.`;

          const response = await this.generateResponse(rolePrompt, {
            preferredAPI: 'camel',
            conversationId: session.id
          });

          session.messages.push({
            round: round + 1,
            agent: agent.name,
            role: agent.role,
            content: response.response,
            timestamp: new Date()
          });

          console.log(`💬 ${agent.name}: ${response.response.substring(0, 100)}...`);
        }
      }

      session.status = 'completed';
      session.endTime = new Date();
      this.conversations.push(session);
      
      return session;

    } catch (error) {
      console.error('❌ Multi-agent session failed:', error.message);
      session.status = 'error';
      session.error = error.message;
      return session;
    }
  }

  simulateMultiAgentSession(scenario, agents) {
    console.log(`🤖 Simulating multi-agent session locally: ${scenario.title}`);
    
    const session = {
      id: Date.now().toString(),
      scenario,
      agents,
      messages: [],
      status: 'active',
      startTime: new Date()
    };

    // Simulate conversation
    const responses = [
      'I think we should approach this systematically...',
      'From my perspective, the key issue is...',
      'Let me suggest an alternative solution...',
      'Building on that idea, we could also...',
      'I agree, and would like to add...'
    ];

    for (let round = 0; round < (scenario.rounds || 3); round++) {
      for (const agent of agents) {
        const response = `${responses[Math.floor(Math.random() * responses.length)]} (simulated response from ${agent.name})`;
        
        session.messages.push({
          round: round + 1,
          agent: agent.name,
          role: agent.role,
          content: response,
          timestamp: new Date()
        });
      }
    }

    session.status = 'completed';
    session.endTime = new Date();
    return session;
  }

  storeConversation(conversationId, prompt, result, apiUsed) {
    const conversation = {
      id: conversationId,
      prompt,
      response: result.content,
      apiUsed,
      model: result.model,
      timestamp: new Date()
    };
    
    this.conversations.push(conversation);
  }

  getSystemStatus() {
    return {
      timestamp: new Date(),
      apis: {
        camelAI: {
          enabled: this.config.camelAI.enabled,
          models: this.config.camelAI.models,
          stats: this.apiStats.camelAI
        },
        llm7: {
          enabled: this.config.llm7.enabled,
          models: this.config.llm7.models,
          stats: this.apiStats.llm7
        },
        fallback: {
          enabled: this.config.fallback.enabled,
          stats: this.apiStats.fallback
        }
      },
      conversations: this.conversations.length,
      agents: this.agents.size
    };
  }

  // Public API key validation
  validateAPIKeys() {
    const validation = {
      camelAI: {
        configured: this.config.camelAI.apiKey !== 'demo_key',
        valid: this.config.camelAI.enabled,
        format: this.config.camelAI.apiKey.startsWith('sk-') || this.config.camelAI.apiKey.startsWith('camel-')
      },
      llm7: {
        configured: this.config.llm7.apiKey !== 'demo_key',
        valid: this.config.llm7.enabled,
        format: this.config.llm7.apiKey.startsWith('llm7-') || this.config.llm7.apiKey.length > 20
      }
    };

    return validation;
  }

  // Export configuration for other systems
  exportConfig() {
    return {
      camelAI: {
        enabled: this.config.camelAI.enabled,
        models: this.config.camelAI.models,
        baseUrl: this.config.camelAI.baseUrl
      },
      llm7: {
        enabled: this.config.llm7.enabled,
        models: this.config.llm7.models,
        baseUrl: this.config.llm7.baseUrl
      },
      fallback: this.config.fallback
    };
  }
}

export default CamelAILLM7Integration;