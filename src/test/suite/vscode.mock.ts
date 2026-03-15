/**
 * minimal vscode API mock for unit tests that run outside the extension host.
 * only the surfaces actually used by KeyNudge are implemented.
 */

export const workspace = {
  getConfiguration: (_section?: string) => ({
    get: <T>(key: string, defaultValue: T): T => {
      const defaults: Record<string, unknown> = {
        enabled: true,
        nudgeThreshold: 3,
        notificationStyle: 'statusBar',
        ignoredCommands: [],
      };
      return (key in defaults ? defaults[key] : defaultValue) as T;
    },
    update: () => Promise.resolve(),
  }),
};

export const window = {
  showInformationMessage: () => Promise.resolve(undefined),
  showWarningMessage: () => Promise.resolve(undefined),
  createStatusBarItem: () => ({
    text: '',
    tooltip: '',
    command: '',
    show: () => {},
    hide: () => {},
    dispose: () => {},
  }),
  registerTreeDataProvider: () => ({ dispose: () => {} }),
};

export const commands = {
  registerCommand: (_id: string, _handler: unknown) => ({ dispose: () => {} }),
  executeCommand: () => Promise.resolve(undefined),
  onDidExecuteCommand: (_handler: unknown) => ({ dispose: () => {} }),
};

export enum StatusBarAlignment {
  Left = 1,
  Right = 2,
}

export enum TreeItemCollapsibleState {
  None = 0,
  Collapsed = 1,
  Expanded = 2,
}

export class TreeItem {
  label: string;
  collapsibleState: TreeItemCollapsibleState;
  description?: string;
  tooltip?: unknown;
  iconPath?: unknown;
  contextValue?: string;

  constructor(label: string, state = TreeItemCollapsibleState.None) {
    this.label = label;
    this.collapsibleState = state;
  }
}

export class ThemeIcon {
  constructor(public id: string, public color?: unknown) {}
}

export class ThemeColor {
  constructor(public id: string) {}
}

export class MarkdownString {
  constructor(public value: string) {}
}

export class EventEmitter<T> {
  private listeners: Array<(e: T) => void> = [];
  event = (listener: (e: T) => void) => {
    this.listeners.push(listener);
    return { dispose: () => {} };
  };
  fire(e: T) {
    this.listeners.forEach((l) => l(e));
  }
  dispose() {}
}

export enum ConfigurationTarget {
  Global = 1,
  Workspace = 2,
  WorkspaceFolder = 3,
}
