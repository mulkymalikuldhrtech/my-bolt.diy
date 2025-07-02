import { json } from '@remix-run/cloudflare';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { agentManager } from '../../agents/core/AgentManager';
import '../../agents/registry';

export const loader = async (_args: LoaderFunctionArgs) => {
  const agents = agentManager.list().map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    skills: a.skills,
  }));

  return json({ agents });
};