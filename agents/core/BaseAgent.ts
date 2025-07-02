export interface AgentTask {
  /**
   * A short identifier describing the kind of task the agent should perform.
   */
  type: string;
  /**
   * JSON-serialisable payload containing the task parameters.
   */
  payload?: unknown;
}

export interface AgentResult {
  /** Indicates whether the task was completed successfully */
  success: boolean;
  /** Optional data returned by the agent */
  data?: unknown;
  /** Optional error message when success is false */
  error?: string;
}

export interface AgentConfig {
  /** Stable identifier – MUST be unique per agent */
  id: string;
  /** Human-readable name */
  name: string;
  /** Short description of the agent purpose */
  description?: string;
  /** List of skills or capabilities the agent possesses */
  skills?: string[];
}

/**
 * Base class shared by every agent in the EX-Machina ecosystem.
 * Concrete agents should extend this class and implement the {@link run} method.
 */
export abstract class BaseAgent {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly skills: string[];

  protected constructor(config: AgentConfig) {
    if (!config.id) throw new Error('Agent id cannot be empty');
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.skills = config.skills ?? [];
  }

  /**
   * Main entry-point called by the orchestrator when delegating a task.
   * Implementations must be side-effect free where possible.
   */
  abstract run(task: AgentTask): Promise<AgentResult>;
}