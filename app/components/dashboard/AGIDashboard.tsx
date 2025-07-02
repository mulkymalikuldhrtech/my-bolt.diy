import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';

// A simple, always-available voice assistant component that listens for the wake words
// "baut" or "bolt" and makes the transcript available to the parent dashboard.
// The underlying SpeechRecognition API is used directly – polyfilled by
// @types/dom-speech-recognition in devDependencies.

export interface VoiceCommandEvent {
  /* Complete transcript returned by the recogniser */
  transcript: string;
  /* Whether the wake-word has been detected */
  wakeWordDetected: boolean;
}

export function useVoiceAgent(onCommand?: (event: VoiceCommandEvent) => void) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const autoResumeRef = useRef(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const SpeechRecognitionAPI: typeof window.SpeechRecognition | undefined =
      // @ts-ignore – safari/legacy
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID'; // Indonesian locale first – adapt as required

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results.item(event.results.length - 1);
      const text = lastResult.item(0).transcript.trim();
      setTranscript(text);

      const lower = text.toLowerCase();
      const wakeWordDetected = lower.includes('baut') || lower.includes('bolt');
      if (wakeWordDetected && onCommand) {
        onCommand({ transcript: text, wakeWordDetected });
      }
    };

    recognition.onend = () => {
      // Auto-restart to emulate "always listening" while the dashboard is open.
      if (recognitionRef.current && isListening) {
        recognition.start();
      }
    };

    recognition.onerror = (e: any) => {
      console.error('Speech recognition error', e);
      toast.error('Voice recognition error – coba lagi nanti.');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Auto start once recognition is ready (and user previously granted permission).
  useEffect(() => {
    if (isSupported) {
      // Give the browser a tick to attach handlers before starting.
      const id = setTimeout(() => start(), 500);
      return () => clearTimeout(id);
    }
  }, [isSupported]);

  const start = () => {
    if (!recognitionRef.current || !isSupported) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      autoResumeRef.current = true;
      requestWakeLock();
    } catch (_) {
      // Ignore – start called while already running.
    }
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    autoResumeRef.current = false;
    releaseWakeLock();
  };

  // Wake Lock helpers
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        // @ts-ignore
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      }
    } catch (err) {
      console.warn('Wake lock error', err);
    }
  };

  const releaseWakeLock = async () => {
    try {
      await wakeLockRef.current?.release();
    } catch {}
    wakeLockRef.current = null;
  };

  // Handle page visibility – pause when hidden, resume when visible if autoResume was set
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else if (autoResumeRef.current) {
        start();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return {
    start,
    stop,
    isListening,
    isSupported,
    transcript,
  } as const;
}

export default function AGIDashboard() {
  const {
    start,
    stop,
    isListening,
    isSupported,
    transcript,
  } = useVoiceAgent(({ transcript: t, wakeWordDetected }) => {
    if (wakeWordDetected) {
      toast.success(`Wake-word detected: "${t}"`);
      // Here you could route the command to AGI core or open chat input.
    }
  });

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-bolt-elements-background-depth-1">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-bolt-elements-borderColor">
        <h1 className="text-2xl font-semibold text-accent">AGI Dashboard</h1>
        <button
          onClick={isListening ? stop : start}
          disabled={!isSupported}
          className={classNames(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            isListening
              ? 'bg-red-600/20 text-red-600 hover:bg-red-600/30'
              : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-3',
            {
              'opacity-50 cursor-not-allowed': !isSupported,
            },
          )}
        >
          <div className={classNames('text-lg', isListening ? 'i-ph:microphone-slash' : 'i-ph:microphone')} />
          {isListening ? 'Stop' : 'Listen'}
        </button>
      </header>

      {/* Main content area – replace with real widgets */}
      <main className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        {['Knowledge', 'Tasks', 'Systems', 'Memory', 'Analytics', 'Logs'].map((title) => (
          <section
            key={title}
            className="rounded-xl border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-4 flex flex-col"
          >
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs font-normal text-bolt-elements-textTertiary">(coming soon)</span>
            </h2>
            <div className="flex-1 flex items-center justify-center text-bolt-elements-textTertiary text-sm">
              Content placeholder
            </div>
          </section>
        ))}
      </main>

      {/* Floating microphone indicator */}
      {isSupported && (
        <button
          onClick={isListening ? stop : start}
          className={classNames(
            'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all',
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-accent text-white hover:bg-accent/90',
          )}
        >
          <div className={classNames('text-2xl', isListening ? 'i-ph:microphone-slash' : 'i-ph:microphone')} />
        </button>
      )}

      {/* Live transcript */}
      {isListening && (
        <div className="fixed bottom-20 right-6 max-w-sm bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-lg p-4 shadow-lg animate-in fade-in zoom-in-95">
          <p className="text-xs uppercase mb-1 text-bolt-elements-textTertiary tracking-wide">Mendengarkan…</p>
          <p className="text-sm text-bolt-elements-textPrimary whitespace-pre-wrap">{transcript}</p>
        </div>
      )}

      {!isSupported && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
          <p className="text-bolt-elements-textTertiary text-sm max-w-md">
            Browser ini tidak mendukung Web Speech API. Silakan gunakan Chrome atau Edge terbaru, atau aktifkan
            eksperimen <code>chrome://flags/#enable-speech-on-device</code>.
          </p>
        </div>
      )}
    </div>
  );
}