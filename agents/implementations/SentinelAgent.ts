import { BaseAgent } from '../core/BaseAgent';
import type { AgentTask, AgentResult } from '../core/BaseAgent';
import { agentManager } from '../core/AgentManager';

export class SentinelAgent extends BaseAgent {
  constructor() {
    super({
      id: 'sentinel',
      name: 'Sentinel',
      description: 'Threat forecasting & security agent',
      skills: ['threat-analysis', 'security-monitoring', 'alerting'],
    });
  }

  async run(task: AgentTask): Promise<AgentResult> {
    if (task.type === 'risk-assessment') {
      // naive pseudo algorithm: random risk score
      const score = Math.random();
      return { success: true, data: { score } };
    }
    return { success: true, data: { message: `Sentinel received task ${task.type}` } };
  }
}

agentManager.register(new SentinelAgent());