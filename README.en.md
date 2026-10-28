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

Search session-manager in Tabby Settings → Plugins. Version 4.1.1 is prepared for publication; 4.1.0 is already published. Alternatively, quit Tabby and run this in the actual user plugin root opened from Settings:

~~~sh
npm install tabby-session-manager@4.1.1 --registry=https://registry.npmjs.org/ --ignore-scripts --no-audit --no-fund
~~~

For ZIP installation, package.json and dist/index.js must be directly under node_modules/tabby-session-manager. Back up and move any old same-name builtin copy outside scanned locations. Avoid enabling the former standalone logger simultaneously. Preserve configuration, credentials, mappings and logs. Restore original appearance before disabling, removing or rolling back. See docs/INSTALL.md.

## 4.1.1 changes

Metadata-only asynchronous log listing avoids automatically reading old log headers. Filename matching and all-directory browsing keep historical files reachable. Explicitly viewing an online-only file may download it. Window rows default to collapsed, sidebar font size supports 11–22 px, and all eight tab strips use fill/border highlighting without a current-tab underline or title separator.

## Validation

The maintainer reports successful local testing of 4.1.1-local.4 on Windows / Tabby 1.0.238 and requested this release. Runtime files match that candidate except for the build-version banner. Regression checks and five browser fixture suites distinguish automated evidence from maintainer-reported native and OneDrive acceptance. Version 4.1.1 has not been published at preparation time. Other platforms and hosts are unverified. See docs/COMPATIBILITY.md.

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
