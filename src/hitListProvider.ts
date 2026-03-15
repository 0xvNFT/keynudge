import * as vscode from 'vscode';
import { Storage, CommandStat } from './storage';

export class HitListItem extends vscode.TreeItem {
  constructor(public readonly stat: CommandStat) {
    super(HitListItem.buildLabel(stat), vscode.TreeItemCollapsibleState.None);

    this.description = stat.shortcut ?? 'No shortcut';
    this.tooltip = new vscode.MarkdownString(
      `**Command:** \`${stat.commandId}\`\n\n` +
        `**Shortcut:** \`${stat.shortcut ?? 'None'}\`\n\n` +
        `**Used without shortcut:** ${stat.mouseCount}×\n\n` +
        `**Used with shortcut:** ${stat.shortcutCount}×`
    );
    this.iconPath = new vscode.ThemeIcon(
      stat.mouseCount >= 10 ? 'flame' : stat.mouseCount >= 5 ? 'warning' : 'info',
      stat.mouseCount >= 10
        ? new vscode.ThemeColor('charts.red')
        : stat.mouseCount >= 5
        ? new vscode.ThemeColor('charts.yellow')
        : undefined
    );
    this.contextValue = 'hitListItem';
  }

  private static buildLabel(stat: CommandStat): string {
    const label = stat.commandId
      .replace(/^workbench\.action\./, '')
      .replace(/^editor\.action\./, '')
      .split('.')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' › ');
    return `${stat.mouseCount}×  ${label}`;
  }
}

export class HitListProvider
  implements vscode.TreeDataProvider<HitListItem>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<HitListItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private static readonly MAX_ITEMS = 25;

  constructor(private readonly storage: Storage) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: HitListItem): vscode.TreeItem {
    return element;
  }

  getChildren(): HitListItem[] {
    const top = this.storage.getTopN(HitListProvider.MAX_ITEMS);

    if (top.length === 0) {
      const empty = new vscode.TreeItem('No data yet — keep working!');
      empty.iconPath = new vscode.ThemeIcon('sparkle');
      return [empty as HitListItem];
    }

    return top.map((stat) => new HitListItem(stat));
  }
}
