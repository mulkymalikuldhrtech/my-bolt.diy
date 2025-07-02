import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import AGIDashboard from '~/components/dashboard/AGIDashboard';

export const meta: MetaFunction = () => {
  return [
    { title: 'AGI Dashboard – Bolt' },
    { name: 'description', content: 'Realtime AGI system dashboard powered by Bolt' },
  ];
};

export const loader = () => json({});

export default function AGIDashboardRoute() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Use ClientOnly to ensure SpeechRecognition only runs on client */}
      <ClientOnly fallback={<div className="flex-1 flex items-center justify-center">Loading…</div>}>
        {() => <AGIDashboard />}
      </ClientOnly>
    </div>
  );
}