import { BaseAgent } from '../core/BaseAgent';
import type { AgentTask, AgentResult } from '../core/BaseAgent';
import { agentManager } from '../core/AgentManager';

export class VanguardAgent extends BaseAgent {
  constructor() {
    super({
      id: 'vanguard',
      name: 'Vanguard',
      description: 'Future research agent',
      skills: ['research', 'trend-prediction'],
    });
  }

  async run(task: AgentTask): Promise<AgentResult> {
    // TODO: Implement real research logic. For now we just echo the task.
    return {
      success: true,
      data: {
        message: `Vanguard executed task of type ${task.type}`,
        receivedPayload: task.payload ?? null,
      },
    };
  }
}

// Immediately register a default instance so it is available system-wide.
agentManager.register(new VanguardAgent());