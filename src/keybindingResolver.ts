import * as vscode from 'vscode';

/**
 * resolves the primary keyboard shortcut for a given VS Code command ID.
 *
 * VS Code does not expose a direct API for this, so we use the internal
 * keybinding service via executeCommand('_workbench.getDefaultKeybindings')
 * and cache the result for the session.
 */
export class KeybindingResolver {
  private cache: Map<string, string | null> = new Map();
  private initialized = false;

  async resolveShortcut(commandId: string): Promise<string | null> {
    if (!this.initialized) {
      await this.buildCache();
    }
    return this.cache.get(commandId) ?? null;
  }

  private async buildCache(): Promise<void> {
    try {
      // this internal command returns all default keybindings as JSON
      const raw = await vscode.commands.executeCommand<string>(
        '_workbench.getDefaultKeybindings'
      );

      if (!raw) {
        this.initialized = true;
        return;
      }

      const bindings: Array<{ command: string; keybinding: string }> = JSON.parse(raw);

      for (const binding of bindings) {
        if (!binding.command || this.cache.has(binding.command)) {
          continue;
        }
        // normalize: only store the first (primary) binding per command
        this.cache.set(binding.command, this.formatKeybinding(binding.keybinding));
      }
    } catch {
      // silently fail, internal API may change across VS Code versions
    }
    this.initialized = true;
  }

  private formatKeybinding(raw: string): string {
    if (!raw) return raw;
    return raw
      .replace(/\+/g, '+')
      .replace('ctrl', 'Ctrl')
      .replace('shift', 'Shift')
      .replace('alt', 'Alt')
      .replace('cmd', 'Cmd')
      .replace('meta', 'Meta');
  }

  clearCache(): void {
    this.cache.clear();
    this.initialized = false;
  }
}
