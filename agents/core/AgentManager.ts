import { BaseAgent } from './BaseAgent';
import type { AgentTask, AgentResult } from './BaseAgent';
import { agentEvents } from './events';

export class AgentManager {
  private readonly agents = new Map<string, BaseAgent>();

  register(agent: BaseAgent): void {
    if (this.agents.has(agent.id)) {
      console.warn(`[AgentManager] Agent with id "${agent.id}" already registered – skipping.`);
      return;
    }
    this.agents.set(agent.id, agent);
    agentEvents.emit('registered', { type: 'registered', id: agent.id, name: agent.name });
  }

  list(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  get(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  async delegate(agentId: string, task: AgentTask): Promise<AgentResult> {
    const agent = this.get(agentId);
    if (!agent) {
      return { success: false, error: `Agent \"${agentId}\" not found` };
    }

    try {
      return await agent.run(task);
    } catch (error: unknown) {
      console.error(`[AgentManager] Error executing task via agent ${agentId}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }
}

/**
 * Global singleton used across backend & frontend code.
 * Avoid creating multiple instances so that agent registry remains consistent.
 */
export const agentManager = new AgentManager();