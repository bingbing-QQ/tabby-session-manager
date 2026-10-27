# Tabby Session Suite

[中文](README.md)

Session management, per-window SSH logging, eight themes and selectable forwarding diagnostics for Tabby. One Session Suite settings entry contains General, Logging and Appearance tabs with Chinese and English support.

## Features

- Sessions and folders, native creation and editing, favorites, independent recent-history cleanup and window switching.
- Independent logging for multiple same-name SSH windows: stop, resume, new file, view and open folder.
- Default and per-session log folders, folder tree, file counts, filename filtering and sorting.
- Eight themes, optional host and terminal synchronization, and restoration of original appearance.
- Forwarding checks for selected targets, imports, exports, backup, restore, bulk operations and undo.

New log names use date-time_session-name_short-ID.log and exclusive file creation prevents overwriting.

## Installation

Search session-manager in Tabby Settings → Plugins. Stable 4.1.0 is published on npm. Alternatively, quit Tabby and run this in the actual user plugin root opened from Settings:

~~~sh
npm install tabby-session-manager@4.1.0 --registry=https://registry.npmjs.org/ --ignore-scripts --no-audit --no-fund
~~~

For ZIP installation, package.json and dist/index.js must be directly under node_modules/tabby-session-manager. Back up and move any old same-name builtin copy outside scanned locations. Avoid enabling the former standalone logger simultaneously. Preserve configuration, credentials, mappings and logs. Restore original appearance before disabling, removing or rolling back. See docs/INSTALL.md.

## Validation

The maintainer reports passing native functional, bilingual, disable/enable, uninstall/reinstall, rollback/upgrade and npm candidate installation checks on Windows / Tabby 1.0.238. Twenty verification scripts and four browser fixture suites also pass. Runtime files match the tested 4.1.0-rc.1 candidate. One script checks Windows npm argument handling.

Other platforms and hosts are unverified. These checks are not exhaustive certification. The maintainer also reports successful discovery and installation of stable 4.1.0 through Tabby's native plugin catalog. See docs/COMPATIBILITY.md.

## Data behavior

Automatic logging is enabled by default on new installations; input recording is off. Logs are local plaintext and are not automatically deleted. Opt-in input recording may capture passwords or tokens. There is no built-in log upload or telemetry. Do not commit real configurations, logs, credentials or publication tokens. See PRIVACY.md.

## Build

~~~sh
node scripts/build.cjs
node scripts/verify.cjs
~~~

Tabby supplies Angular and host modules. The former plugin implementations are not runtime dependencies. Optional browser checks use development-only Playwright 1.62.1 and Windows Edge with npm run test:ui.

## License and provenance

Apache-2.0, maintained by Bingbing (bingbing-QQ), with applicable upstream and historical MIT notices retained. Prior implementation was inspected for compatibility; reimplementation is not a strict clean-room or legal-originality guarantee. See LICENSE, NOTICE, THIRD_PARTY_NOTICES.md and docs/REIMPLEMENTATION.md. This independent community plugin is not an official Tabby product.
