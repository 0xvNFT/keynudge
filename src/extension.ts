import * as vscode from 'vscode';
import { Storage } from './storage';
import { Notifier } from './notifier';
import { CommandTracker } from './commandTracker';
import { HitListProvider } from './hitListProvider';

export function activate(context: vscode.ExtensionContext): void {
  const storage = new Storage(context);
  const notifier = new Notifier();
  const hitListProvider = new HitListProvider(storage);

  const tracker = new CommandTracker(storage, notifier, () => {
    hitListProvider.refresh();
  });

  tracker.start();

  const treeView = vscode.window.registerTreeDataProvider(
    'keynudge.hitList',
    hitListProvider
  );

  const resetCmd = vscode.commands.registerCommand('keynudge.resetStats', () => {
    vscode.window
      .showWarningMessage(
        'KeyNudge: Reset all statistics? This cannot be undone.',
        { modal: true },
        'Reset'
      )
      .then((choice) => {
        if (choice === 'Reset') {
          storage.reset();
          hitListProvider.refresh();
          vscode.window.showInformationMessage('KeyNudge: Statistics reset.');
        }
      });
  });

  const toggleCmd = vscode.commands.registerCommand('keynudge.toggleEnabled', () => {
    const config = vscode.workspace.getConfiguration('keynudge');
    const current = config.get<boolean>('enabled', true);
    config.update('enabled', !current, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(
      `KeyNudge: ${!current ? 'Enabled' : 'Disabled'}.`
    );
  });

  const showHitListCmd = vscode.commands.registerCommand('keynudge.showHitList', () => {
    vscode.commands.executeCommand('keynudge.hitList.focus');
  });

  context.subscriptions.push(
    tracker,
    treeView,
    resetCmd,
    toggleCmd,
    showHitListCmd,
    notifier
  );
}

export function deactivate(): void {
  // cleanup is handled via context.subscriptions
}
