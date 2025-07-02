import { json } from '@remix-run/cloudflare';
import type { LoaderFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { agentManager } from '../../agents/core/AgentManager';
import '../../agents/registry';

export const loader: LoaderFunction = async () => {
  const agents = agentManager.list().map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    skills: a.skills,
  }));
  return json({ agents });
};

type LoaderData = {
  agents: Array<{
    id: string;
    name: string;
    description?: string;
    skills: string[];
  }>;
};

export default function AgentsPage() {
  const { agents } = useLoaderData<LoaderData>();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <span className="i-ph:robot text-purple-600 h-6 w-6" />
        <span>Agent Manager</span>
      </h1>
      {agents.length === 0 ? (
        <p className="text-gray-500">No agents registered.</p>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left text-sm uppercase tracking-wider">
              <th className="p-2 border-b border-gray-200 dark:border-gray-700">ID</th>
              <th className="p-2 border-b border-gray-200 dark:border-gray-700">Name</th>
              <th className="p-2 border-b border-gray-200 dark:border-gray-700">Description</th>
              <th className="p-2 border-b border-gray-200 dark:border-gray-700">Skills</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="border-b border-gray-200 dark:border-gray-800">
                <td className="p-2 font-mono text-xs">{agent.id}</td>
                <td className="p-2 font-medium">{agent.name}</td>
                <td className="p-2 text-sm text-gray-700 dark:text-gray-300">
                  {agent.description ?? '—'}
                </td>
                <td className="p-2 text-sm">
                  {agent.skills.length > 0 ? agent.skills.join(', ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
        >
          <span className="i-ph:arrow-left h-4 w-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}