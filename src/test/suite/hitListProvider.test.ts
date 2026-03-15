import * as assert from 'assert';
import { HitListProvider, HitListItem } from '../../hitListProvider';
import { Storage } from '../../storage';
import type * as vscode from 'vscode';

function makeContext(): vscode.ExtensionContext {
  const store: Record<string, unknown> = {};
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

suite('HitListProvider', () => {
  test('getChildren returns a placeholder when storage is empty', () => {
    const storage = new Storage(makeContext());
    const provider = new HitListProvider(storage);
    const children = provider.getChildren();

    assert.strictEqual(children.length, 1);
    assert.ok((children[0] as vscode.TreeItem).label?.toString().includes('No data'));
  });

  test('getChildren returns placeholder when only shortcut usage exists (mouseCount = 0)', () => {
    const storage = new Storage(makeContext());
    storage.incrementShortcut('workbench.action.files.save', 'Ctrl+S');

    const provider = new HitListProvider(storage);
    const children = provider.getChildren();

    // no mouse usage → nothing to nudge about
    assert.strictEqual(children.length, 1);
    assert.ok((children[0] as vscode.TreeItem).label?.toString().includes('No data'));
  });

  test('getChildren returns HitListItems when mouse usage exists', () => {
    const storage = new Storage(makeContext());
    storage.incrementTotal('workbench.action.files.save', 'Ctrl+S');
    storage.incrementTotal('workbench.action.files.save', 'Ctrl+S');

    const provider = new HitListProvider(storage);
    const children = provider.getChildren();

    assert.strictEqual(children.length, 1);
    assert.ok(children[0] instanceof HitListItem);
  });

  test('getChildren sorts by mouseCount descending', () => {
    const storage = new Storage(makeContext());

    storage.incrementTotal('cmd.b', 'Ctrl+B');  // mouse: 1
    storage.incrementTotal('cmd.c', 'Ctrl+C');
    storage.incrementTotal('cmd.c', 'Ctrl+C');
    storage.incrementTotal('cmd.c', 'Ctrl+C');  // mouse: 3
    storage.incrementTotal('cmd.a', 'Ctrl+A');
    storage.incrementTotal('cmd.a', 'Ctrl+A');  // mouse: 2

    const provider = new HitListProvider(storage);
    const children = provider.getChildren() as HitListItem[];

    assert.strictEqual(children[0].stat.commandId, 'cmd.c');
    assert.strictEqual(children[1].stat.commandId, 'cmd.a');
    assert.strictEqual(children[2].stat.commandId, 'cmd.b');
  });

  test('getChildren caps at 25 items', () => {
    const storage = new Storage(makeContext());

    for (let i = 0; i < 30; i++) {
      storage.incrementTotal(`cmd.${i}`, `Ctrl+${i}`);
    }

    const provider = new HitListProvider(storage);
    const children = provider.getChildren();
    assert.ok(children.length <= 25);
  });

  test('HitListItem label includes mouseCount', () => {
    const storage = new Storage(makeContext());
    // Two total invocations with no shortcut presses → mouseCount = 2
    storage.incrementTotal('workbench.action.files.save', 'Ctrl+S');
    storage.incrementTotal('workbench.action.files.save', 'Ctrl+S');

    const provider = new HitListProvider(storage);
    const [item] = provider.getChildren() as HitListItem[];

    const label = item.label as string;
    assert.ok(label.includes('2×'), `Expected mouseCount in label, got: ${label}`);
    assert.strictEqual(item.description, 'Ctrl+S');
  });

  test('getTreeItem returns the same element unchanged', () => {
    const storage = new Storage(makeContext());
    storage.incrementTotal('cmd.x', 'Ctrl+X');

    const provider = new HitListProvider(storage);
    const [item] = provider.getChildren() as HitListItem[];

    assert.strictEqual(provider.getTreeItem(item), item);
  });

  test('refresh fires onDidChangeTreeData event', (done) => {
    const storage = new Storage(makeContext());
    const provider = new HitListProvider(storage);

    provider.onDidChangeTreeData(() => done());
    provider.refresh();
  });
});
