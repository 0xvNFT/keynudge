import * as vscode from 'vscode';
import { CommandStat } from './storage';

type NotificationStyle = 'statusBar' | 'notification' | 'both';

export class Notifier {
  private statusBarItem: vscode.StatusBarItem;
  private statusBarTimer: NodeJS.Timeout | undefined;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
  }

  notify(stat: CommandStat): void {
    if (!stat.shortcut) return;

    const style = this.getStyle();
    const message = this.buildMessage(stat);

    if (style === 'statusBar' || style === 'both') {
      this.showStatusBar(message, stat.shortcut);
    }

    if (style === 'notification' || style === 'both') {
      this.showNotification(stat);
    }
  }

  private buildMessage(stat: CommandStat): string {
    const label = this.commandLabel(stat.commandId);
    return `$(keyboard) ${label}: Use ${stat.shortcut} (×${stat.mouseCount} without shortcut)`;
  }

  private showStatusBar(message: string, shortcut: string): void {
    if (this.statusBarTimer) {
      clearTimeout(this.statusBarTimer);
    }

    this.statusBarItem.text = message;
    this.statusBarItem.tooltip = `KeyNudge: Press ${shortcut} next time!`;
    this.statusBarItem.command = 'keynudge.showHitList';
    this.statusBarItem.show();

    this.statusBarTimer = setTimeout(() => {
      this.statusBarItem.hide();
    }, 5000);
  }

  private showNotification(stat: CommandStat): void {
    const label = this.commandLabel(stat.commandId);
    vscode.window
      .showInformationMessage(
        `KeyNudge: Use ${stat.shortcut} for "${label}" (used ${stat.mouseCount}× without shortcut)`,
        'Got it',
        'Show Hit List'
      )
      .then((choice) => {
        if (choice === 'Show Hit List') {
          vscode.commands.executeCommand('keynudge.showHitList');
        }
      });
  }

  private commandLabel(commandId: string): string {
    // convert workbench.action.files.save → Files: Save
    return commandId
      .replace(/^workbench\.action\./, '')
      .replace(/^editor\.action\./, '')
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(': ');
  }

  private getStyle(): NotificationStyle {
    return vscode.workspace
      .getConfiguration('keynudge')
      .get<NotificationStyle>('notificationStyle', 'statusBar');
  }

  dispose(): void {
    if (this.statusBarTimer) {
      clearTimeout(this.statusBarTimer);
    }
    this.statusBarItem.dispose();
  }
}
