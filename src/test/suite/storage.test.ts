import * as assert from 'assert';
import { Storage } from '../../storage';
import type * as vscode from 'vscode';

function makeContext(initial: Record<string, unknown> = {}): vscode.ExtensionContext {
  const store: Record<string, unknown> = { ...initial };
  return {
    globalState: {
      get: <T>(key: string, defaultValue?: T): T =>
        (key in store ? store[key] : defaultValue) as T,
      update: (key: string, value: unknown) => {
        store[key] = value;
        return Promise.resolve();
      },
      keys: () => Object.keys(store),
      setKeysForSync: () => {},
    },
  } as unknown as vscode.ExtensionContext;
}

suite('Storage', () => {
  test('getAll returns empty object when no data', () => {
    const storage = new Storage(makeContext());
    assert.deepStrictEqual(storage.getAll(), {});
  });

  test('get returns undefined for unknown command', () => {
    const storage = new Storage(makeContext());
    assert.strictEqual(storage.get('some.command'), undefined);
  });

  test('incrementShortcut creates an entry with shortcutCount 1, totalCount 0', () => {
    const storage = new Storage(makeContext());
    const stat = storage.incrementShortcut('workbench.action.files.save', 'Ctrl+S');

    assert.strictEqual(stat.commandId, 'workbench.action.files.save');
    assert.strictEqual(stat.shortcutCount, 1);
    assert.strictEqual(stat.totalCount, 0);
    assert.strictEqual(stat.mouseCount, 0);
    assert.strictEqual(stat.shortcut, 'Ctrl+S');
  });

  test('incrementTotal creates an entry with totalCount 1, shortcutCount 0', () => {
    const storage = new Storage(makeContext());
    const stat = storage.incrementTotal('workbench.action.files.save');

    assert.strictEqual(stat.totalCount, 1);
    assert.strictEqual(stat.shortcutCount, 0);
    assert.strictEqual(stat.mouseCount, 1);
  });

  test('mouseCount = totalCount - shortcutCount', () => {
    const storage = new Storage(makeContext());
    storage.incrementShortcut('workbench.action.files.save', 'Ctrl+S');
    storage.incrementTotal('workbench.action.files.save');
    storage.incrementTotal('workbench.action.files.save');
    const stat = storage.get('workbench.action.files.save')!;

    assert.strictEqual(stat.shortcutCount, 1);
    assert.strictEqual(stat.totalCount, 2);
    assert.strictEqual(stat.mouseCount, 1);
  });

  test('mouseCount never goes below 0', () => {
    const storage = new Storage(makeContext());
    // More shortcut uses than total events (timing edge case)
    storage.incrementShortcut('cmd.a', 'Ctrl+A');
    storage.incrementShortcut('cmd.a', 'Ctrl+A');
    const stat = storage.get('cmd.a')!;

    assert.ok(stat.mouseCount >= 0);
  });

  test('incrementShortcut accumulates on repeated calls', () => {
    const storage = new Storage(makeContext());
    storage.incrementShortcut('cmd.a', 'Ctrl+A');
    storage.incrementShortcut('cmd.a', 'Ctrl+A');
    const stat = storage.incrementShortcut('cmd.a', 'Ctrl+A');

    assert.strictEqual(stat.shortcutCount, 3);
  });

  test('state persists across separate Storage instances sharing the same context', () => {
    const ctx = makeContext();
    const s1 = new Storage(ctx);
    s1.incrementTotal('editor.action.formatDocument');
    s1.incrementTotal('editor.action.formatDocument');

    const s2 = new Storage(ctx);
    const stat = s2.incrementTotal('editor.action.formatDocument');
    assert.strictEqual(stat.totalCount, 3);
  });

  test('reset clears all stored data', () => {
    const storage = new Storage(makeContext());
    storage.incrementShortcut('editor.action.formatDocument', 'Shift+Alt+F');
    storage.incrementTotal('workbench.action.files.save');

    storage.reset();
    assert.deepStrictEqual(storage.getAll(), {});
  });

  test('getTopN returns at most N items sorted by mouseCount descending', () => {
    const storage = new Storage(makeContext());

    storage.incrementTotal('cmd.b', 'Ctrl+B');  // mouse: 1
    storage.incrementTotal('cmd.b', 'Ctrl+B');  // mouse: 2
    storage.incrementTotal('cmd.c', 'Ctrl+C');  // mouse: 1
    storage.incrementTotal('cmd.c', 'Ctrl+C');  // mouse: 2
    storage.incrementTotal('cmd.c', 'Ctrl+C');  // mouse: 3

    const top2 = storage.getTopN(2);
    assert.strictEqual(top2.length, 2);
    assert.strictEqual(top2[0].commandId, 'cmd.c');
    assert.strictEqual(top2[1].commandId, 'cmd.b');
  });

  test('getTopN excludes entries with mouseCount 0', () => {
    const storage = new Storage(makeContext());
    storage.incrementShortcut('cmd.shortcutOnly', 'Ctrl+X');

    const top = storage.getTopN(10);
    assert.strictEqual(top.length, 0);
  });

  test('incrementShortcut updates lastSeen timestamp', () => {
    const before = Date.now();
    const storage = new Storage(makeContext());
    const stat = storage.incrementShortcut('cmd.a', 'Ctrl+A');
    const after = Date.now();

    assert.ok(stat.lastSeen >= before);
    assert.ok(stat.lastSeen <= after);
  });
});
