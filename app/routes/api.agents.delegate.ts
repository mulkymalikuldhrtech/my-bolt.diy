import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { agentManager } from '../../agents/core/AgentManager';
import '../../agents/registry';

interface DelegateRequest {
  agentId: string;
  type: string;
  payload?: unknown;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const body: DelegateRequest = await request.json();
    const result = await agentManager.delegate(body.agentId, { type: body.type, payload: body.payload });
    return json(result);
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, { status: 400 });
  }
};