# Theme tab strip — local test build

Uses Tabby 1.0.238's native `tab-header` and `current-tab-indicator` structure.
No tab DOM, tab ordering or event handlers are replaced. Profile color bars,
progress bars, activity indicators and per-profile icon colors are retained.
The owned host stylesheet is enabled by the existing interface theme sync option;
disabling sync or unloading the plugin removes these styles.

Reviewed contracts:
- https://github.com/Eugeny/tabby/blob/v1.0.238/tabby-core/src/components/tabHeader.component.scss
- https://github.com/Eugeny/tabby/blob/v1.0.238/tabby-core/src/components/tabHeader.component.pug
- https://github.com/Eugeny/tabby/blob/v1.0.238/tabby-core/src/components/appRoot.component.scss

All eight themes style inactive, hovered and active tabs separately. The active
tab has a theme-specific fill, stronger border; the current-tab underline is hidden.
Horizontal and vertical strips keep native sizing and dragging behavior. A
rendered fixture checks selection, compact windows, many tabs and removal of the
owned stylesheet; actual Tabby acceptance remains pending.

Tab number/title separator borders and pseudo-elements are suppressed while
interface theme sync is enabled. Saved names and tab title text are not rewritten.
