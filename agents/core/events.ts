type Listener<T = unknown> = (payload: T) => void;

export interface AgentRegisteredEvent {
  type: 'registered';
  id: string;
  name: string;
}

export type AgentSystemEvent = AgentRegisteredEvent;

class SimpleEmitter {
  private map = new Map<string, Listener[]>();

  on<T extends AgentSystemEvent['type']>(event: T, listener: Listener<Extract<AgentSystemEvent, { type: T }>>) {
    const arr = this.map.get(event) ?? [];
    arr.push(listener as Listener);
    this.map.set(event, arr);
  }

  emit(event: AgentSystemEvent['type'], payload: AgentSystemEvent) {
    const arr = this.map.get(event);
    if (!arr) return;
    arr.forEach((l) => l(payload));
  }
}

export const agentEvents = new SimpleEmitter();