import * as vscode from 'vscode';

export interface CommandStat {
  commandId: string;
  /** total times the command was invoked (shortcut + mouse + palette) */
  totalCount: number;
  /** times the user pressed the keyboard shortcut specifically */
  shortcutCount: number;
  /** totalCount - shortcutCount */
  mouseCount: number;
  shortcut: string | null;
  lastSeen: number;
}

const STORAGE_KEY = 'keynudge.stats';

export class Storage {
  constructor(private readonly context: vscode.ExtensionContext) {}

  getAll(): Record<string, CommandStat> {
    return this.context.globalState.get<Record<string, CommandStat>>(STORAGE_KEY, {});
  }

  get(commandId: string): CommandStat | undefined {
    return this.getAll()[commandId];
  }

  /** Called when the keyboard shortcut was pressed. */
  incrementShortcut(commandId: string, shortcut: string): CommandStat {
    return this.upsert(commandId, shortcut, { shortcutDelta: 1, totalDelta: 0 });
  }

  /**
   * called when a VS Code event fires (total invocation, source unknown).
   * pass `shortcut` when the caller knows it (e.g. from TRACKED_COMMANDS).
   */
  incrementTotal(commandId: string, shortcut?: string): CommandStat {
    const existing = this.get(commandId);
    return this.upsert(commandId, shortcut ?? existing?.shortcut ?? null, {
      shortcutDelta: 0,
      totalDelta: 1,
    });
  }

  reset(): void {
    this.context.globalState.update(STORAGE_KEY, {});
  }

  /** returns the top N commands ranked by mouse usage (most nudge-worthy). */
  getTopN(n: number): CommandStat[] {
    const all = this.getAll();
    return Object.values(all)
      .filter((s) => s.shortcut !== null && s.mouseCount > 0)
      .sort((a, b) => b.mouseCount - a.mouseCount)
      .slice(0, n);
  }

  private upsert(
    commandId: string,
    shortcut: string | null,
    delta: { shortcutDelta: number; totalDelta: number }
  ): CommandStat {
    const all = this.getAll();
    const existing = all[commandId];

    const shortcutCount = (existing?.shortcutCount ?? 0) + delta.shortcutDelta;
    const totalCount = (existing?.totalCount ?? 0) + delta.totalDelta;

    const updated: CommandStat = {
      commandId,
      shortcutCount,
      totalCount,
      mouseCount: Math.max(0, totalCount - shortcutCount),
      shortcut,
      lastSeen: Date.now(),
    };

    all[commandId] = updated;
    this.context.globalState.update(STORAGE_KEY, all);
    return updated;
  }
}
