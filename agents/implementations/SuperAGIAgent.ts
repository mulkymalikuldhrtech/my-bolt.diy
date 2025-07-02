import { AGIAgent } from '../agi/AGIAgent';
import type { AgentTask, AgentResult, AgentConfig } from '../core/BaseAgent';
import { agentManager } from '../core/AgentManager';
import { BaseAgent } from '../core/BaseAgent';

/**
 * SuperAGIAgent – a high-level autonomous agent that can improve the ecosystem, create new agents and delegate work.
 * NOTE: Initial implementation is a stub that demonstrates self-improvement & agent-creation workflow.
 */
export class SuperAGIAgent extends AGIAgent {
  constructor() {
    const cfg: AgentConfig = {
      id: 'super',
      name: 'Super AGI',
      description: 'Autonomous orchestrator that can extend and evolve the Bolt.AGI ecosystem',
      skills: ['planning', 'delegation', 'agent-creation', 'system-improvement'],
    };
    super(cfg);
  }

  /* =====================================================
     Perceive-Think-Act cycle – naive PoC implementation
     ===================================================== */
  protected async perceive(task: AgentTask): Promise<AgentTask> {
    // In a real scenario this could enrich the task with additional context.
    return task;
  }

  protected async think(task: AgentTask): Promise<AgentTask> {
    // Decide what to do based on task type. For PoC we just forward.
    return task;
  }

  protected async act(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'create-agent':
        return this.createAgent(task.payload as Partial<AgentConfig>);
      case 'ping':
        return { success: true, data: 'pong from Super AGI' };
      default:
        return { success: false, error: `Unknown task type: ${task.type}` };
    }
  }

  /**
   * Dynamically create and register a very simple agent at runtime.
   */
  private async createAgent(payload: Partial<AgentConfig> = {}): Promise<AgentResult> {
    if (!payload.id || !payload.name) {
      return { success: false, error: 'Missing id or name for new agent' };
    }

    class DynamicAgent extends BaseAgent {
      async run(t: AgentTask): Promise<AgentResult> {
        return { success: true, data: `DynamicAgent(${this.id}) executed task ${t.type}` };
      }
    }

    try {
      const newAgent = new DynamicAgent({
        id: payload.id,
        name: payload.name,
        description: payload.description ?? 'Dynamically created agent',
        skills: payload.skills ?? [],
      });
      agentManager.register(newAgent);
      return { success: true, data: `Agent ${payload.id} registered` };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }
}

// Auto-register on import
agentManager.register(new SuperAGIAgent());