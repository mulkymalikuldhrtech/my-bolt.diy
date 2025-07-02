import { BaseAgent } from '../core/BaseAgent';
import type { AgentTask, AgentResult } from '../core/BaseAgent';
import { agentManager } from '../core/AgentManager';
import * as os from 'os';

export class SysMonitorAgent extends BaseAgent {
  constructor() {
    super({
      id: 'sys-monitor',
      name: 'SystemMonitor',
      description: 'Monitors system metrics and basic security signals',
      skills: ['cpu-usage', 'memory-usage', 'threat-scan'],
    });
  }

  async run(task: AgentTask): Promise<AgentResult> {
    switch (task.type) {
      case 'metrics': {
        const load = os.loadavg()[0];
        const freeMem = os.freemem();
        const totalMem = os.totalmem();
        return {
          success: true,
          data: {
            cpuLoad1m: load,
            memFree: freeMem,
            memTotal: totalMem,
          },
        };
      }
      case 'security-scan': {
        // Placeholder: In real implementation, would interface with AV or logs
        return { success: true, data: { threatsFound: 0 } };
      }
      default:
        return { success: false, error: `Unknown task ${task.type}` };
    }
  }
}

agentManager.register(new SysMonitorAgent());