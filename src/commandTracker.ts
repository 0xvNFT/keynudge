import * as vscode from 'vscode';
import { Storage } from './storage';
import { Notifier } from './notifier';
import { TRACKED_COMMANDS, TrackedCommand, getTrackedCommand } from './trackedCommands';

/**
 * tracks command usage via two complementary mechanisms:
 *
 * 1. Keybinding interceptors, for each tracked command, KeyNudge registers a
 *    `keynudge.shortcut.<id>` command bound to the same shortcut key. When the
 *    shortcut is pressed, the interceptor increments the shortcut counter and
 *    then delegates to the original command.
 *
 * 2. VS Code event listeners, for commands that have observable side-effects
 *    (e.g. save triggers onDidSaveTextDocument), KeyNudge also tracks total
 *    invocations from the event. Mouse usage = total events - shortcut presses.
 */
export class CommandTracker implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly storage: Storage,
    private readonly notifier: Notifier,
    private readonly onStatsChanged: () => void
  ) {}

  start(): void {
    for (const cmd of TRACKED_COMMANDS) {
      this.registerInterceptor(cmd);
    }
    this.registerEventListeners();
  }

  /**
   * registers `keynudge.shortcut.<safeId>` as a command and binds it to the
   * keyboard shortcut declared in package.json contributions.
   * when fired, it increments the shortcut counter and runs the original.
   */
  private registerInterceptor(cmd: TrackedCommand): void {
    const interceptorId = `keynudge.shortcut.${this.safeId(cmd.commandId)}`;

    const disposable = vscode.commands.registerCommand(interceptorId, async () => {
      if (!this.isEnabled()) return;

      // execute first so the VS Code event (e.g. onDidSaveTextDocument) fires and
      // increments totalCount before we increment shortcutCount. This keeps
      // mouseCount = totalCount - shortcutCount = 0 for keyboard-triggered actions.
      await vscode.commands.executeCommand(cmd.commandId);
      this.recordShortcutUse(cmd);
    });

    this.disposables.push(disposable);
  }

  /**
   * listens to VS Code events to count total invocations (shortcut + mouse +
   * command palette), mouse count = total - shortcut.
   */
  private registerEventListeners(): void {
    this.disposables.push(
      vscode.workspace.onDidSaveTextDocument(() => {
        if (!this.isEnabled()) return;
        this.recordTotalUse('workbench.action.files.save');
      }),

      vscode.workspace.onDidCloseTextDocument(() => {
        if (!this.isEnabled()) return;
        this.recordTotalUse('workbench.action.closeActiveEditor');
      })
    );
  }

  private recordShortcutUse(cmd: TrackedCommand): void {
    this.storage.incrementShortcut(cmd.commandId, this.getShortcut(cmd));
    this.onStatsChanged();
    // no nudge here, shortcut use is correct behavior, only mouse use triggers nudges
  }

  private recordTotalUse(commandId: string): void {
    const cmd = getTrackedCommand(commandId);
    const shortcut = cmd ? this.getShortcut(cmd) : undefined;
    const stat = this.storage.incrementTotal(commandId, shortcut);
    this.onStatsChanged();
    this.maybeNudge(stat.mouseCount, stat);
  }

  private maybeNudge(
    relevantCount: number,
    stat: ReturnType<Storage['incrementTotal']>
  ): void {
    if (!stat.shortcut) return;

    const threshold = vscode.workspace
      .getConfiguration('keynudge')
      .get<number>('nudgeThreshold', 3);

    if (relevantCount >= threshold && relevantCount % threshold === 0) {
      this.notifier.notify(stat);
    }
  }

  private getShortcut(cmd: TrackedCommand): string {
    const isMac = process.platform === 'darwin';
    return isMac ? cmd.shortcutMac : cmd.shortcutWin;
  }

  private safeId(commandId: string): string {
    return commandId.replace(/\./g, '_');
  }

  private isEnabled(): boolean {
    return vscode.workspace
      .getConfiguration('keynudge')
      .get<boolean>('enabled', true);
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }
}
