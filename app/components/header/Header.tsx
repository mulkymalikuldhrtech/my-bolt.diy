import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { workbenchStore } from '~/lib/stores/workbench';
import { useState } from 'react';

export function Header() {
  const chat = useStore(chatStore);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showWorkbench = useStore(workbenchStore.showWorkbench);

  // Force sidebar open/close by dispatching custom event
  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    // Dispatch custom event to control sidebar
    window.dispatchEvent(new CustomEvent('toggleSidebar', { 
      detail: { open: newState } 
    }));
  };

  const toggleWorkbench = () => {
    workbenchStore.showWorkbench.set(!showWorkbench);
  };

  return (
    <header
      className={classNames('flex items-center px-2 sm:px-4 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      {/* Mobile/Touch-friendly menu button */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center w-10 h-10 mr-2 rounded-lg hover:bg-bolt-elements-background-depth-3 transition-colors lg:hidden text-bolt-elements-textPrimary"
        aria-label="Toggle menu"
      >
        <div className="i-ph:list text-xl" />
      </button>

      {/* Desktop sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex items-center justify-center w-8 h-8 mr-2 rounded-md hover:bg-bolt-elements-background-depth-3 transition-colors text-bolt-elements-textPrimary"
        aria-label="Toggle sidebar"
      >
        <div className="i-ph:sidebar-simple-duotone text-lg" />
      </button>

      {/* Logo */}
      <a href="/" className="text-2xl font-semibold text-accent flex items-center">
        <img src="/logo-light-styled.png" alt="logo" className="w-[90px] inline-block dark:hidden" />
        <img src="/logo-dark-styled.png" alt="logo" className="w-[90px] inline-block hidden dark:block" />
      </a>

      {/* Workbench toggle button - Always visible when chat started */}
      {chat.started && (
        <button
          onClick={toggleWorkbench}
          className={classNames(
            'ml-2 flex items-center justify-center w-8 h-8 rounded-md transition-colors',
            showWorkbench 
              ? 'bg-accent-500 text-white' 
              : 'hover:bg-bolt-elements-background-depth-3 text-bolt-elements-textPrimary'
          )}
          aria-label="Toggle workbench"
          title="Toggle Code Editor"
        >
          <div className="i-ph:code text-lg" />
        </button>
      )}

      {/* Chat description and actions */}
      {chat.started && (
        <>
          <span className="flex-1 px-2 sm:px-4 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="flex items-center gap-2">
                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        </>
      )}

      {/* Quick actions for non-started chat */}
      {!chat.started && (
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3 transition-colors text-bolt-elements-textPrimary"
            aria-label="Open menu"
          >
            <div className="i-ph:user-circle text-lg" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      )}
    </header>
  );
}
