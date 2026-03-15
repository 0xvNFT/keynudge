# Changelog

All notable changes to KeyNudge are documented here.

## [0.1.1] - 2026-03-15

### Security
- Upgraded devDependencies to resolve serialize-javascript CVE and minimatch ReDoS vulnerabilities
- Added npm override for serialize-javascript >= 7.0.3

## [0.1.0] - 2026-03-15

### Added
- Initial release
- Shortcut interceptors for 24 most-used VS Code commands
- Hit List sidebar panel showing top commands by mouse usage
- Status bar and notification reminder styles
- Configurable nudge threshold (default: 3 mouse uses)
- Mac and Windows shortcut awareness
- Persistent usage statistics via VS Code global state
- Commands: Show Hit List, Reset Statistics, Toggle Enable/Disable
- Per-command ignore list setting
