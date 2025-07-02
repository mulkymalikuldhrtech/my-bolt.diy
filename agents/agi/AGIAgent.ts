import type { AgentTask, AgentResult, AgentConfig } from '../core/BaseAgent';
import { BaseAgent } from '../core/BaseAgent';

export interface AGIContext {
  self: Record<string, unknown>;
  memory: Map<string, unknown>; // simplistic memory model
}

export abstract class AGIAgent extends BaseAgent {
  protected context: AGIContext;

  constructor(config: AgentConfig) {
    super(config);
    this.context = { self: {}, memory: new Map() };
  }

  async run(task: AgentTask): Promise<AgentResult> {
    const perception = await this.perceive(task);
    const thought = await this.think(perception);
    return await this.act(thought);
  }

  protected abstract perceive(task: AgentTask): Promise<unknown>;
  protected abstract think(input: unknown): Promise<unknown>;
  protected abstract act(plan: unknown): Promise<AgentResult>;
}