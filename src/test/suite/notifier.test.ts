import * as assert from 'assert';
import { Notifier } from '../../notifier';
import { CommandStat } from '../../storage';

function makeStat(overrides: Partial<CommandStat> = {}): CommandStat {
  return {
    commandId: 'workbench.action.files.save',
    totalCount: 5,
    shortcutCount: 2,
    mouseCount: 3,
    shortcut: 'Ctrl+S',
    lastSeen: Date.now(),
    ...overrides,
  };
}

suite('Notifier', () => {
  test('notify does nothing when stat has no shortcut', () => {
    const notifier = new Notifier();
    assert.doesNotThrow(() => notifier.notify(makeStat({ shortcut: null })));
    notifier.dispose();
  });

  test('notify does not throw for valid stat', () => {
    const notifier = new Notifier();
    assert.doesNotThrow(() => notifier.notify(makeStat()));
    notifier.dispose();
  });

  test('dispose can be called multiple times without throwing', () => {
    const notifier = new Notifier();
    assert.doesNotThrow(() => {
      notifier.dispose();
      notifier.dispose();
    });
  });

  test('notify accepts workbench command IDs', () => {
    const notifier = new Notifier();
    const stat = makeStat({ commandId: 'workbench.action.files.saveAll', shortcut: 'Ctrl+K S' });
    assert.doesNotThrow(() => notifier.notify(stat));
    notifier.dispose();
  });

  test('notify accepts editor command IDs', () => {
    const notifier = new Notifier();
    const stat = makeStat({
      commandId: 'editor.action.formatDocument',
      shortcut: 'Shift+Alt+F',
      mouseCount: 10,
    });
    assert.doesNotThrow(() => notifier.notify(stat));
    notifier.dispose();
  });

  test('notify handles high mouseCount values without error', () => {
    const notifier = new Notifier();
    assert.doesNotThrow(() =>
      notifier.notify(makeStat({ mouseCount: 999, shortcut: 'Ctrl+Z' }))
    );
    notifier.dispose();
  });
});
