import { EventEmitter } from 'events';

export interface AgentRegisteredEvent {
  type: 'registered';
  id: string;
  name: string;
}

export type AgentSystemEvent = AgentRegisteredEvent;

export const agentEvents = new EventEmitter();