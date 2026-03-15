import * as assert from 'assert';
import { CommandTracker } from '../../commandTracker';
import { Storage } from '../../storage';
import { Notifier } from '../../notifier';
import { TRACKED_COMMANDS } from '../../trackedCommands';
import type * as vscode from 'vscode';

// workbench.action.files.save is in TRACKED_COMMANDS so the tracker resolves its shortcut automatically
const SAVE_CMD = 'workbench.action.files.save';

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

function fakeNotifier(): Notifier & { calls: unknown[] } {
  const calls: unknown[] = [];
  const n = new Notifier();
  n.notify = (stat) => calls.push(stat);
  return Object.assign(n, { calls });
}

type RecordTotalFn = (id: string) => void;
type RecordShortcutFn = (cmd: (typeof TRACKED_COMMANDS)[number]) => void;

function getRecordTotal(tracker: CommandTracker): RecordTotalFn {
  return (tracker as unknown as { recordTotalUse: RecordTotalFn }).recordTotalUse.bind(tracker);
}

function getRecordShortcut(tracker: CommandTracker): RecordShortcutFn {
  return (tracker as unknown as { recordShortcutUse: RecordShortcutFn }).recordShortcutUse.bind(tracker);
}

suite('CommandTracker', () => {
  test('recordTotal fires onChange', () => {
    const storage = new Storage(makeContext());
    const notifier = fakeNotifier();
    let changes = 0;

    const tracker = new CommandTracker(storage, notifier, () => changes++);
    getRecordTotal(tracker)(SAVE_CMD);

    assert.strictEqual(changes, 1);
  });

  test('recordShortcutUse fires onChange', () => {
    const storage = new Storage(makeContext());
    const notifier = fakeNotifier();
    let changes = 0;

    const tracker = new CommandTracker(storage, notifier, () => changes++);
    const saveTracked = TRACKED_COMMANDS.find((c) => c.commandId === SAVE_CMD)!;
    getRecordShortcut(tracker)(saveTracked);

    assert.strictEqual(changes, 1);
  });

  test('no nudge below threshold for mouse usage', () => {
    const storage = new Storage(makeContext());
    const notifier = fakeNotifier();
    const tracker = new CommandTracker(storage, notifier, () => {});
    const recordTotal = getRecordTotal(tracker);

    recordTotal(SAVE_CMD);
    recordTotal(SAVE_CMD);

    assert.strictEqual(notifier.calls.length, 0);
  });

  test('nudges exactly at threshold (default: 3) mouse uses', () => {
    const storage = new Storage(makeContext());
    const notifier = fakeNotifier();
    const tracker = new CommandTracker(storage, notifier, () => {});
    const recordTotal = getRecordTotal(tracker);

    // 3 total invocations, 0 shortcut presses → mouseCount reaches 3
    recordTotal(SAVE_CMD);
    recordTotal(SAVE_CMD);
    recordTotal(SAVE_CMD);

    assert.strictEqual(notifier.calls.length, 1);
  });

  test('nudges again at each subsequent multiple of threshold', () => {
    const storage = new Storage(makeContext());
    const notifier = fakeNotifier();
    const tracker = new CommandTracker(storage, notifier, () => {});
    const recordTotal = getRecordTotal(tracker);

    for (let i = 0; i < 6; i++) {
      recordTotal(SAVE_CMD);
    }

    assert.strictEqual(notifier.calls.length, 2); // at mouseCount=3 and mouseCount=6
  });

  test('shortcut press reduces mouseCount — nudge fires later', () => {
    const storage = new Storage(makeContext());
    const notifier = fakeNotifier();
    const tracker = new CommandTracker(storage, notifier, () => {});
    const recordTotal = getRecordTotal(tracker);
    const recordShortcut = getRecordShortcut(tracker);
    const saveTracked = TRACKED_COMMANDS.find((c) => c.commandId === SAVE_CMD)!;

    // 1 shortcut press (increments shortcutCount) + 3 total = mouseCount = 2
    recordShortcut(saveTracked);
    recordTotal(SAVE_CMD);
    recordTotal(SAVE_CMD);
    recordTotal(SAVE_CMD); // totalCount=3, shortcutCount=1 → mouseCount=2

    assert.strictEqual(notifier.calls.length, 0); // mouseCount=2 < threshold=3
  });

  test('no nudge when command is not in TRACKED_COMMANDS (no shortcut known)', () => {
    const storage = new Storage(makeContext());
    const notifier = fakeNotifier();
    const tracker = new CommandTracker(storage, notifier, () => {});
    const recordTotal = getRecordTotal(tracker);

    for (let i = 0; i < 10; i++) {
      recordTotal('some.unknown.untracked.command');
    }

    assert.strictEqual(notifier.calls.length, 0);
  });

  test('tracks multiple commands independently', () => {
    const storage = new Storage(makeContext());
    const notifier = fakeNotifier();
    const tracker = new CommandTracker(storage, notifier, () => {});
    const recordTotal = getRecordTotal(tracker);

    // cmd.a and cmd.b are not in TRACKED_COMMANDS → no shortcut → no nudge
    // but mouseCount is still tracked
    recordTotal('cmd.a');
    recordTotal('cmd.a');
    recordTotal('cmd.b');

    assert.strictEqual(storage.get('cmd.a')?.mouseCount, 2);
    assert.strictEqual(storage.get('cmd.b')?.mouseCount, 1);
    assert.strictEqual(notifier.calls.length, 0);
  });

  test('dispose cleans up without error', () => {
    const storage = new Storage(makeContext());
    const notifier = fakeNotifier();
    const tracker = new CommandTracker(storage, notifier, () => {});

    assert.doesNotThrow(() => tracker.dispose());
  });
});
