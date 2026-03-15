# KeyNudge

**Stop reaching for the mouse. Build keyboard muscle memory, automatically.**

KeyNudge watches which VS Code commands you use without their keyboard shortcuts and reminds you gently. The more you skip the shortcut, the louder the nudge. Over time, your hands learn to stay on the keyboard.

---

## How it works

KeyNudge uses two complementary signals:

- **Shortcut interceptors**, when you press a keyboard shortcut, KeyNudge counts it
- **VS Code event listeners**, when the same action happens any other way (menu, toolbar, mouse), KeyNudge counts that too

`Mouse uses = Total uses − Shortcut uses`

Once your mouse-click count hits the configured threshold, a reminder appears. The **Hit List** sidebar always shows your top offenders ranked by mouse usage.

---

## Features

- **Automatic reminders**, nudged the moment you exceed the threshold for a tracked command
- **Hit List sidebar**, ranked list of commands you use most without shortcuts, with flame/warning icons by severity
- **Mac + Windows aware**, shows the correct shortcut for your platform automatically
- **Configurable threshold**, set how many mouse uses before a nudge fires (default: 3)
- **Status bar or notification**, choose where reminders appear
- **Ignore list**, exclude commands you don't want tracked
- **Persistent stats**, data survives restarts via VS Code's global state

---

## Tracked shortcuts

KeyNudge tracks 24 of the most impactful VS Code shortcuts out of the box:

| Action | Windows | Mac |
|---|---|---|
| Save File | `Ctrl+S` | `Cmd+S` |
| Save All | `Ctrl+K S` | `Cmd+Option+S` |
| Close Editor | `Ctrl+W` | `Cmd+W` |
| Quick Open | `Ctrl+P` | `Cmd+P` |
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Format Document | `Shift+Alt+F` | `Shift+Option+F` |
| Go to Definition | `F12` | `F12` |
| Rename Symbol | `F2` | `F2` |
| Quick Fix | `Ctrl+.` | `Cmd+.` |
| Find in Files | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Toggle Terminal | `` Ctrl+` `` | `` Ctrl+` `` |
| Toggle Sidebar | `Ctrl+B` | `Cmd+B` |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Y` | `Cmd+Z` / `Cmd+Shift+Z` |
| Delete Line | `Ctrl+Shift+K` | `Cmd+Shift+K` |
| Toggle Comment | `Ctrl+/` | `Cmd+/` |
| Select All Occurrences | `Ctrl+Shift+L` | `Cmd+Shift+L` |
| Add Next Occurrence | `Ctrl+D` | `Cmd+D` |
| Navigate Back / Forward | `Alt+Left` / `Alt+Right` | `Ctrl+-` / `Ctrl+Shift+-` |
| Go to Line | `Ctrl+G` | `Ctrl+G` |
| Copy Line Down | `Shift+Alt+Down` | `Shift+Option+Down` |
| Find All References | `Shift+F12` | `Shift+F12` |

---

## Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `keynudge.enabled` | boolean | `true` | Enable or disable all nudges |
| `keynudge.nudgeThreshold` | number | `3` | Mouse uses before first nudge |
| `keynudge.notificationStyle` | string | `statusBar` | `statusBar`, `notification`, or `both` |
| `keynudge.ignoredCommands` | array | `[]` | Command IDs to never nudge about |

---

## Commands

Open the Command Palette (`Ctrl+Shift+P`) and search for:

- **KeyNudge: Show Hit List**, open the shortcut usage sidebar
- **KeyNudge: Reset Statistics**, clear all tracked data
- **KeyNudge: Toggle Enable/Disable**, quickly pause or resume nudging

---

## Sidebar Hit List

The KeyNudge activity bar panel shows your top 25 commands by mouse usage:

- 🔥 **Flame** icon, used 10+ times without shortcut (high priority)
- ⚠️ **Warning** icon, used 5–9 times without shortcut
- ℹ️ **Info** icon, used 1–4 times without shortcut

Hover any item to see full stats: total uses, shortcut uses, and mouse uses.

---

## Privacy

KeyNudge stores only **command IDs and usage counts** in VS Code's local global state. No data leaves your machine. No telemetry, no network requests.

---

## Author

Built by **[0xvNFT](https://github.com/0xvNFT)**

- GitHub: [@0xvNFT](https://github.com/0xvNFT)
- Email: [0xvnft@gmail.com](mailto:0xvnft@gmail.com)

If KeyNudge saves you time, consider leaving a ⭐ on the repo, it helps others find it.

---

## License

MIT — see [LICENSE](./LICENSE)
