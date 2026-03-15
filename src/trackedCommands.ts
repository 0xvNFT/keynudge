export interface TrackedCommand {
  commandId: string;
  label: string;
  shortcutWin: string;
  shortcutMac: string;
  /** Matching VS Code event type for correlation (if available) */
  eventType?: 'save' | 'saveAll' | 'format' | 'close' | 'open';
}

/**
 * curated list of the most commonly used VS Code commands.
 * for each entry, KeyNudge registers a keybinding interceptor so it can
 * count how many times the user pressed the shortcut versus triggering the action another way (menu, command palette, mouse click).
 */
export const TRACKED_COMMANDS: TrackedCommand[] = [
  // --- file ---
  {
    commandId: 'workbench.action.files.save',
    label: 'Save File',
    shortcutWin: 'Ctrl+S',
    shortcutMac: 'Cmd+S',
    eventType: 'save',
  },
  {
    commandId: 'workbench.action.files.saveAll',
    label: 'Save All Files',
    shortcutWin: 'Ctrl+K S',
    shortcutMac: 'Cmd+Option+S',
    eventType: 'saveAll',
  },
  {
    commandId: 'workbench.action.closeActiveEditor',
    label: 'Close Editor',
    shortcutWin: 'Ctrl+W',
    shortcutMac: 'Cmd+W',
    eventType: 'close',
  },
  {
    commandId: 'workbench.action.quickOpen',
    label: 'Quick Open (Go to File)',
    shortcutWin: 'Ctrl+P',
    shortcutMac: 'Cmd+P',
  },
  // --- edit ---
  {
    commandId: 'undo',
    label: 'Undo',
    shortcutWin: 'Ctrl+Z',
    shortcutMac: 'Cmd+Z',
  },
  {
    commandId: 'redo',
    label: 'Redo',
    shortcutWin: 'Ctrl+Y',
    shortcutMac: 'Cmd+Shift+Z',
  },
  {
    commandId: 'editor.action.copyLinesDownAction',
    label: 'Copy Line Down',
    shortcutWin: 'Shift+Alt+Down',
    shortcutMac: 'Shift+Option+Down',
  },
  {
    commandId: 'editor.action.deleteLinesAction',
    label: 'Delete Line',
    shortcutWin: 'Ctrl+Shift+K',
    shortcutMac: 'Cmd+Shift+K',
  },
  {
    commandId: 'editor.action.addCommentLine',
    label: 'Toggle Line Comment',
    shortcutWin: 'Ctrl+/',
    shortcutMac: 'Cmd+/',
  },
  {
    commandId: 'editor.action.formatDocument',
    label: 'Format Document',
    shortcutWin: 'Shift+Alt+F',
    shortcutMac: 'Shift+Option+F',
    eventType: 'format',
  },
  // --- navigation ---
  {
    commandId: 'workbench.action.showCommands',
    label: 'Command Palette',
    shortcutWin: 'Ctrl+Shift+P',
    shortcutMac: 'Cmd+Shift+P',
  },
  {
    commandId: 'workbench.action.gotoLine',
    label: 'Go to Line',
    shortcutWin: 'Ctrl+G',
    shortcutMac: 'Ctrl+G',
  },
  {
    commandId: 'workbench.action.navigateBack',
    label: 'Navigate Back',
    shortcutWin: 'Alt+Left',
    shortcutMac: 'Ctrl+-',
  },
  {
    commandId: 'workbench.action.navigateForward',
    label: 'Navigate Forward',
    shortcutWin: 'Alt+Right',
    shortcutMac: 'Ctrl+Shift+-',
  },
  {
    commandId: 'editor.action.goToDeclaration',
    label: 'Go to Definition',
    shortcutWin: 'F12',
    shortcutMac: 'F12',
  },
  {
    commandId: 'editor.action.referenceSearch.trigger',
    label: 'Find All References',
    shortcutWin: 'Shift+F12',
    shortcutMac: 'Shift+F12',
  },
  {
    commandId: 'workbench.action.findInFiles',
    label: 'Find in Files',
    shortcutWin: 'Ctrl+Shift+F',
    shortcutMac: 'Cmd+Shift+F',
  },
  // --- view ---
  {
    commandId: 'workbench.action.toggleSidebarVisibility',
    label: 'Toggle Sidebar',
    shortcutWin: 'Ctrl+B',
    shortcutMac: 'Cmd+B',
  },
  {
    commandId: 'workbench.action.togglePanel',
    label: 'Toggle Terminal Panel',
    shortcutWin: 'Ctrl+J',
    shortcutMac: 'Cmd+J',
  },
  {
    commandId: 'workbench.action.terminal.toggleTerminal',
    label: 'Toggle Terminal',
    shortcutWin: 'Ctrl+`',
    shortcutMac: 'Ctrl+`',
  },
  // --- refactor ---
  {
    commandId: 'editor.action.rename',
    label: 'Rename Symbol',
    shortcutWin: 'F2',
    shortcutMac: 'F2',
  },
  {
    commandId: 'editor.action.quickFix',
    label: 'Quick Fix',
    shortcutWin: 'Ctrl+.',
    shortcutMac: 'Cmd+.',
  },
  // --- multi-cursor ---
  {
    commandId: 'editor.action.selectHighlights',
    label: 'Select All Occurrences',
    shortcutWin: 'Ctrl+Shift+L',
    shortcutMac: 'Cmd+Shift+L',
  },
  {
    commandId: 'editor.action.addSelectionToNextFindMatch',
    label: 'Add Next Occurrence to Selection',
    shortcutWin: 'Ctrl+D',
    shortcutMac: 'Cmd+D',
  },
];

export function getTrackedCommand(commandId: string): TrackedCommand | undefined {
  return TRACKED_COMMANDS.find((c) => c.commandId === commandId);
}
