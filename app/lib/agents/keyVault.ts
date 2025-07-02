import { toast } from 'react-toastify';

interface KeyEntry {
  keys: string[];
  index: number;
}

class KeyVault {
  private store: Map<string, KeyEntry> = new Map();

  /**
   * Register an ordered list of API keys (public-free first, private later)
   */
  register(provider: string, keys: string[]) {
    if (keys.length === 0) return;
    this.store.set(provider, { keys, index: 0 });
  }

  /**
   * Get current key for a provider, or undefined if none.
   */
  get(provider: string): string | undefined {
    const entry = this.store.get(provider);
    return entry ? entry.keys[entry.index] : undefined;
  }

  /**
   * Rotate to next key (on failure). Returns new key or undefined.
   */
  rotate(provider: string): string | undefined {
    const entry = this.store.get(provider);
    if (!entry) return undefined;
    entry.index = (entry.index + 1) % entry.keys.length;
    const newKey = entry.keys[entry.index];
    toast.warn(`${provider} API key rotated`, { icon: '🔑' });
    return newKey;
  }
}

export const keyVault = new KeyVault();

// Initialise with public-free keys (safe placeholders – replace with real)
keyVault.register('OpenRouter', ['pk_123PUBLIC_EXAMPLE', process.env.OPEN_ROUTER_API_KEY ?? '']);
keyVault.register('OpenAI', ['sk-public-abc123example']);
keyVault.register('Anthropic', ['claude-public-key-example']);