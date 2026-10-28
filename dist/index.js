/* Tabby Session Suite 4.1.1: replacement implementation; see src and docs/REIMPLEMENTATION.md. */
'use strict';
const core=require('tabby-core'),coreAngular=require('@angular/core'),common=require('@angular/common');
const loggerModule=require('./logging'),suiteI18n=require('./i18n'),forwardCheckUI=require('./forward-check-ui');
const {installSharedCredentialGuard}=require('./credential-guard'),{SessionHostThemeSync}=require('./host-theme');
const optional=name=>{try{return require(name);}catch{return null;}};const ngb=optional('@ng-bootstrap/ng-bootstrap'),tabbySettings=optional('tabby-settings'),tabbySSH=optional('tabby-ssh');
const suiteSettingsController=require('./settings-controller');
const ROOT_ID='tabby-session-manager-root',STYLE_ID='tabby-session-manager-style';
const CONFIG_KEY = 'sessionManager';
const HOTKEY_ID = 'toggle-session-manager';
const SESSION_STYLES=":root {--tsm2-width:280px;}\n#tabby-session-manager-root {position:fixed;z-index:99990;inset:40px auto 0 0;width:var(--tsm2-width);font:var(--tsm2-font-size,13px)/1.4 system-ui,'Microsoft YaHei',sans-serif;color:var(--sk-light,#f3f4f6);text-shadow:none;}\n#tabby-session-manager-root[hidden],.tsm2-recent-actions[hidden] {display:none!important;}\n#tabby-session-manager-root *,.tsm2-overlay *,.tsm2-menu * {box-sizing:border-box;}\n#tabby-session-manager-root .tsm2-panel {height:100%;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--sk-edge,#ffffff26);border-left:0;border-radius:0 28px 28px 0;background:var(--sk-scene,#20242c);box-shadow:var(--sk-depth,0 16px 48px #0005);}\n#tabby-session-manager-root[data-dock=autohide][data-open=false] .tsm2-panel {transform:translateX(-100%);}\n#tabby-session-manager-root[data-dock=autohide][data-open=false] {pointer-events:none;}\n#tabby-session-manager-root .tsm2-show {position:absolute;left:0;top:40%;pointer-events:auto;padding:16px 5px;border:1px solid var(--sk-edge);background:var(--sk-ink);color:var(--sk-light);border-radius:0 10px 10px 0;}\n.tsm2-header {display:flex;align-items:center;gap:8px;min-height:52px;padding:10px;border-bottom:1px solid var(--sk-edge);background:var(--ui-fill,#ffffff08);}\n.tsm2-title {flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:1.154em;white-space:nowrap;}\n.tsm2-icon {border:0;color:inherit;background:transparent;cursor:pointer;padding:3px;min-width:22px;font:inherit;font-size:19px;border-radius:6px;}\n.tsm2-icon svg,.tsm2-view-button svg {display:block;width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}\n.tsm2-search-wrap {padding:12px 8px;border-bottom:1px solid var(--sk-edge);}\n.tsm2-search {display:block;width:100%;min-width:0;padding:10px 12px;border-radius:20px;border:1px solid var(--sk-edge);background:var(--ui-input,#ffffff0e);color:var(--sk-light);font:inherit;}\n.tsm2-search::placeholder {color:var(--sk-muted);opacity:1;}\n.tsm2-feature-bar {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));padding:5px 8px 10px;border-bottom:1px solid var(--sk-edge);gap:6px;}\n.tsm2-view-button {display:flex;justify-content:center;padding:9px;color:var(--sk-muted);background:transparent;border:1px solid transparent;border-radius:13px;cursor:pointer;}\n.tsm2-view-button.selected {background:var(--ui-selected,#ffffff14);border-color:var(--sk-edge);color:var(--sk-gold);}\n.tsm2-undo-bar {padding:5px 8px;}\n.tsm2-tree {overflow:auto;flex:1;min-height:70px;padding:6px 0;}\n.tsm2-folder,.tsm2-profile {display:flex;align-items:center;gap:6px;height:var(--tsm2-row-height,30px);min-height:var(--tsm2-row-height,30px);padding-right:5px;cursor:pointer;border:1px solid transparent;border-radius:10px;margin:0 5px;}\n.tsm2-folder-name,.tsm2-profile-name {flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}\n.tsm2-folder-count,.tsm2-type,.tsm2-connection-badge {font-size:calc(var(--tsm2-font-size,13px) * .80);color:var(--sk-muted);white-space:nowrap;}\n.tsm2-profile.active,.tsm2-profile:hover,.tsm2-folder:hover {background:var(--ui-selected,#ffffff14);}\n.tsm2-profile.active {box-shadow:inset 2px 0 var(--sk-gold);}\n.tsm2-dot {flex:none;width:7px;height:7px;border-radius:50%;}\n.tsm2-empty {padding:35px 12px;text-align:center;color:var(--sk-muted);}\n.tsm2-current-log {flex:0 1 auto;min-height:34px;max-height:min(224px,30vh);display:flex;flex-direction:column;overflow:hidden;border-top:1px solid var(--sk-edge);background:var(--ui-fill,#ffffff06);}\n.tsm2-info-toggle {display:flex;align-items:center;gap:6px;min-height:34px;flex:none;width:100%;padding:6px 10px;border:0;background:transparent;color:var(--sk-light);font:600 .923em system-ui;text-align:left;cursor:pointer;}\n.tsm2-info-recording {margin-left:auto;color:var(--ui-success,#b2ceb8);font-size:calc(var(--tsm2-font-size,13px) * .80);}\n.tsm2-info-body {overflow:auto;min-height:0;padding:0 8px 8px;}\n.tsm2-info-body[hidden] {display:none;}\n.tsm2-details-row {display:grid;grid-template-columns:65px minmax(0,1fr);border-bottom:1px solid var(--sk-edge);font-size:calc(var(--tsm2-font-size,13px) * .923);}\n.tsm2-details-key {color:var(--sk-muted);padding:3px 4px;}\n.tsm2-details-value {padding:3px 4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}\n.tsm2-log-action-grid {display:flex;flex-wrap:wrap;gap:4px;padding:5px 8px;}\n.tsm2-log-action-grid button {flex:1;min-width:44px;padding:4px;font-size:calc(var(--tsm2-font-size,13px) * .85);}\n.tsm2-window-row {height:var(--tsm2-window-height,62px);margin:0 5px;padding:5px 9px;border:1px solid transparent;border-radius:12px;}\n.tsm2-window-row.active {border-color:var(--sk-edge);background:var(--ui-selected);}\n.tsm2-window-top,.tsm2-window-bottom {display:flex;justify-content:space-between;align-items:center;gap:4px;font-size:calc(var(--tsm2-font-size,13px) * .85);}\n.tsm2-window-name,.tsm2-window-link {background:transparent;color:var(--sk-gold);border:0;font:inherit;cursor:pointer;}\n.tsm2-window-address,.tsm2-window-state,.tsm2-current-log-file {color:var(--sk-muted);font-size:calc(var(--tsm2-font-size,13px) * .85);overflow-wrap:anywhere;}\n.tsm2-window-bottom>span:first-child {min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}\n.tsm2-window-address {white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n.tsm2-window-actions {white-space:nowrap;flex:none;display:flex;gap:5px;}\n.tsm2-resize {position:absolute;right:-3px;top:0;bottom:0;width:7px;cursor:ew-resize;}\nbody.tsm2-pinned tab-body,body.tsm2-pinned start-page.content-tab,body.tsm2-pinned terminal-tab:not(tab-body terminal-tab),body.tsm2-pinned .tab-body:not(tab-body .tab-body) {margin-left:var(--tsm2-width)!important;width:calc(100% - var(--tsm2-width))!important;}\nbody.tsm2-pinned :is(.modal,ngb-modal-window) {z-index:100040!important;}\nbody.tsm2-pinned :is(.modal-backdrop,ngb-modal-backdrop) {z-index:100030!important;}\n.tsm2-overlay {position:fixed;z-index:100010;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;background:#030712b8;color:var(--sk-light);font:13px/1.5 system-ui,'Microsoft YaHei',sans-serif;}\n.tsm2-dialog {display:flex;flex-direction:column;width:560px;max-width:96vw;max-height:90vh;overflow:auto;background:var(--sk-scene,var(--sk-ink,#17202d));border:1px solid var(--sk-edge);border-radius:20px;box-shadow:0 20px 60px #0007;}\n.tsm2-dialog-header {padding:14px 16px;font-size:16px;font-weight:650;border-bottom:1px solid var(--sk-edge);background:var(--ui-fill);}\n.tsm2-dialog-body {display:grid;gap:12px;padding:16px;overflow:auto;min-height:0;}\n.tsm2-dialog-footer {display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:10px 16px;border-top:1px solid var(--sk-edge);}\n.tsm2-field {display:grid;gap:5px;min-width:0;}\n.tsm2-field input,.tsm2-field select,.tsm2-field textarea,.tsm2-dialog-body>input,.tsm2-forward-controls select {padding:8px 10px;min-width:0;max-width:100%;color:var(--sk-light);background:var(--ui-input,#ffffff0a);border:1px solid var(--sk-edge);border-radius:12px;font:inherit;color-scheme:var(--ui-scheme,dark);}\n.tsm2-field input[type=checkbox] {width:16px;height:16px;accent-color:var(--sk-gold);}\n.tsm2-primary,.tsm2-secondary,.tsm2-danger {padding:7px 12px;border:1px solid var(--sk-edge);border-radius:12px;color:var(--sk-light);background:var(--ui-fill,#ffffff0c);cursor:pointer;font:inherit;overflow-wrap:anywhere;}\n.tsm2-primary {color:var(--sk-gold);border-color:var(--sk-gold);background:rgba(var(--sk-accent-rgb),.12);}\n.tsm2-danger,.danger {color:var(--ui-danger,#ffc5c9);}\n.tsm2-danger {border-color:#b14f5a;background:#b14f5a20;}\n.tsm2-overlay button:disabled,#tabby-session-manager-root button:disabled {opacity:.5;cursor:default;}\n.tsm2-error,.tsm2-status.error {color:var(--ui-danger,#ffc5c9);}\n.tsm2-help,.tsm2-current-log-status {color:var(--sk-muted);font-size:calc(var(--tsm2-font-size,13px) * .923);white-space:pre-line;}\n.tsm2-dialog p {white-space:pre-line;overflow-wrap:anywhere;margin:0;}\n.tsm2-menu {position:fixed;z-index:100020;min-width:220px;max-width:calc(100vw - 8px);max-height:calc(100vh - 8px);overflow:auto;display:grid;padding:6px;background:var(--sk-scene,var(--sk-ink,#17202d));color:var(--sk-light);border:1px solid var(--sk-edge);border-radius:14px;box-shadow:0 15px 35px #0007;font:13px system-ui;}\n.tsm2-menu-item {display:block;padding:9px 12px;text-align:left;color:inherit;background:transparent;border:0;border-radius:8px;font:inherit;cursor:pointer;}\n.tsm2-menu-item:hover {background:var(--ui-selected);}\n.tsm2-theme-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}\n.tsm2-theme-choice {display:grid;text-align:left;gap:6px;min-height:95px;padding:16px;}\n.tsm2-theme-choice small {font-size:calc(var(--tsm2-font-size,13px) * .85);}\n.tsm2-theme-dialog,.tsm2-wide-dialog {width:760px;}\n.tsm2-theme-sync-toggle {display:flex;align-items:center;gap:8px;}\n.tsm2-forward-dialog {width:960px;}\n.tsm2-forward-detail-dialog {width:600px;}\n.tsm2-forward-controls,.tsm2-list-controls {display:flex;align-items:center;flex-wrap:wrap;gap:8px;}\n.tsm2-forward-controls label {display:grid;gap:5px;}\n.tsm2-forward-targets {max-height:150px;overflow:auto;}\n.tsm2-forward-target {display:flex;gap:8px;padding:6px 0;}\n.tsm2-forward-output {max-height:340px;overflow:auto;}\n.tsm2-forward-table {border-collapse:collapse;width:100%;font-size:calc(var(--tsm2-font-size,13px) * .923);color:inherit;}\n.tsm2-forward-table td,.tsm2-forward-table th {border-bottom:1px solid var(--sk-edge);padding:8px;text-align:left;overflow-wrap:anywhere;}\n.tsm2-forward-edit-row {display:grid;grid-template-columns:1fr 1fr 70px 1fr 70px 24px;gap:4px;margin:7px 0;}\n.tsm2-forward-edit-row input,.tsm2-forward-edit-row select {width:100%;min-width:0;color:var(--sk-light);background:var(--ui-input);border:1px solid var(--sk-edge);padding:6px;}\n.tsm2-check-list {max-height:340px;overflow:auto;border:1px solid var(--sk-edge);padding:6px;border-radius:12px;}\n.tsm2-check-item,.tsm2-import-row {display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--sk-edge);padding:8px;overflow-wrap:anywhere;}\n.tsm2-check-text {display:grid;gap:3px;}\n.tsm2-check-text small {color:var(--sk-muted);}\n:is(#tabby-session-manager-root,.tsm2-overlay,.tsm2-menu) :is(button,input,select,span,p,label,small,strong) {text-shadow:none!important;}\n:is(#tabby-session-manager-root,.tsm2-overlay,.tsm2-menu)[data-tsm-theme=liquidGlass] .tsm2-dialog,:is(#tabby-session-manager-root,.tsm2-overlay,.tsm2-menu)[data-tsm-theme=liquidGlass].tsm2-menu {border-color:#d5e9ff75;box-shadow:inset 0 1px 2px #ffffff66,0 18px 48px #0005;border-radius:22px;}\n#tabby-session-manager-root[data-tsm-theme=liquidGlass] .tsm2-panel {border-color:#d5e9ff75;box-shadow:inset -1px 0 2px #c8fcff55,0 18px 48px #0005;}\n#tabby-session-manager-root[data-tsm-theme=liquidGlass] :is(.tsm2-search,.tsm2-view-button.selected,.tsm2-profile.active,.tsm2-window-row.active) {border:1px solid #d5e7ff65;box-shadow:inset 0 1px 2px #ffffff66,inset 0 -1px #9afff63d;}\n#tabby-session-manager-root[data-tsm-theme=modernGradient] .tsm2-panel {border-right-color:#43e9ff67;border-radius:12px 0 0 0;}\n#tabby-session-manager-root[data-tsm-theme=modernGradient] .tsm2-view-button.selected {border-color:#e858ff80;box-shadow:inset 0 -2px #4ff4ff,0 0 17px #c232ff24;}\n#tabby-session-manager-root[data-tsm-theme=modernGradient] .tsm2-profile.active {box-shadow:inset 3px 0 #51f5ff;border-right:2px solid #ff51bd;border-radius:5px;}\n:is(#tabby-session-manager-root,.tsm2-overlay,.tsm2-menu)[data-tsm-theme=modernGradient] :is(input,select,.tsm2-dialog) {border-radius:7px;border-color:#c153ff70;}\n.tsm2-overlay[data-tsm-theme=modernGradient] .tsm2-dialog,.tsm2-menu[data-tsm-theme=modernGradient] {border-left:2px solid #50f3ff99;box-shadow:0 0 32px #ab2af922,0 18px 48px #0005;}\n#tabby-session-manager-root[data-tsm-theme=playfulNeo] .tsm2-panel {border:3px solid #111;border-left:0;border-radius:0;box-shadow:4px 0 #ff666b;}\n:is(#tabby-session-manager-root,.tsm2-overlay,.tsm2-menu)[data-tsm-theme=playfulNeo] :is(.tsm2-dialog,.tsm2-primary,.tsm2-secondary,.tsm2-search) {border:2px solid #111;border-radius:0;box-shadow:3px 3px #111;}\n:is(#tabby-session-manager-root,.tsm2-overlay,.tsm2-menu)[data-tsm-theme=playfulNeo] :is(.tsm2-primary,.tsm2-secondary,.tsm2-view-button.selected) {background:#ffe66b;color:#111;}\n:is(#tabby-session-manager-root,.tsm2-overlay,.tsm2-menu) option {background:var(--sk-ink);color:var(--sk-light);}\n@media(max-width:700px) {.tsm2-theme-grid{grid-template-columns:1fr}.tsm2-forward-edit-row{grid-template-columns:1fr 1fr 60px}.tsm2-overlay{padding:8px}}\n@media(prefers-reduced-motion:reduce) {#tabby-session-manager-root *,.tsm2-overlay *,.tsm2-menu *{transition:none!important;animation:none!important;}}\n\n.tsm2-status[data-kind=error] {color:var(--ui-danger,#ffc5c9);}\n";
class SessionConfigProvider extends core.ConfigProvider {
  constructor() {super();this.defaults={sessionManager:{favoriteIds:[],recentConnections:[],confirmProfileIds:[],importEncoding:'auto',sidebarWidth:280,sidebarFontSize:13,sidebarVisible:true,dockMode:'pinned',collapsedList:[],appearanceMode:'layered',accentMode:'theme',colorPreset:'slate',themePreset:'nocturneGlass',language: 'auto',sessionInfoExpanded:false,syncHostTheme:true,syncTerminalTheme:false,terminalThemeBackup:null,panelColor:'slate',textColor:'light'},hotkeys:{[HOTKEY_ID]:['Ctrl-Alt-S']}};}
}
SessionConfigProvider.ɵfac=()=>new SessionConfigProvider();
SessionConfigProvider.ɵprov=coreAngular.ɵɵdefineInjectable({token:SessionConfigProvider,factory:SessionConfigProvider.ɵfac,providedIn:'root'});
class SessionManagerService {
  t(text) {return typeof suiteI18n!=='undefined'?suiteI18n.t(text,this.config):text;}

  async setLanguage(language) {
    if(!['auto','zh-CN','en-US'].includes(language))throw Error('Unsupported language');
    const state=this.getStateStore();if(!state)throw Error(this.t('Tabby 配置尚未就绪，请稍后重试。'));
    const previous=state.language;state.language=language;
    try{await this.config.save();}catch(error){state.language=previous;throw error;}
    this.runInZone(()=>{this.closeContextMenu();document.querySelectorAll('.tsm2-overlay').forEach(overlay=>overlay.remove());this.render();if(typeof window!=='undefined')window.dispatchEvent(new Event('tabby-session-suite-language-changed'));});
  }

  getThemePalettes() { return {"graphiteGlass":{"label":"石墨月光","note":"原炭灰玻璃底 · 加强文字对比","a":"#17191e","b":"#252930","glow":"166,177,194","accent":"#dbe9f9","fg":"#f3f4f6","muted":"#dce1e8"},"obsidianChampagne":{"label":"曜石香槟","note":"近黑中性底 · 柔和香槟金","a":"#151619","b":"#151619","accent":"#d9bd89","fg":"#f4f3ef","muted":"#c8c5bd","edge":"#38393f","fill":"#ffffff09"},"warmFrost":{"label":"暖霜石墨","note":"微黄奶霜底 · 深黑字","a":"#f1eddf","b":"#f1eddf","accent":"#59492d","fg":"#171714","muted":"#414037","edge":"#d0c8b4","fill":"#fffdf344","light":true},"nocturneGlass":{"label":"夜航玻璃","note":"深墨大底 · 局部玻璃受光","a":"#0b1322","b":"#0b1322","accent":"#e4b863","fg":"#f0f2f6","muted":"#a6afbf","edge":"#ffffff26","fill":"#ffffff0b","scene":"radial-gradient(ellipse at 100% 22%,rgba(124,156,196,.075),transparent 35%),radial-gradient(ellipse at 0% 85%,rgba(228,184,99,.025),transparent 30%),#0b1322"},"ghibliSky":{"label":"吉卜力晴空","note":"天空蓝 · 奶油与薄荷","a":"#8bcfe4","b":"#9ad7e6","accent":"#1d493c","fg":"#142c29","muted":"#29413e","edge":"#73b5b6","fill":"#f9f4df75","input":"#f8f5e8d9","light":true,"scene":"radial-gradient(ellipse at 0% 0%,#d3f1f5 0,transparent 35%),linear-gradient(170deg,#8bcfe4,#9ad7e6)"},"playfulNeo":{"label":"俏皮野兽派","note":"青绿 · 亮黄 · 珊瑚红与硬阴影","a":"#4ecdc4","b":"#4ecdc4","accent":"#111111","fg":"#111111","muted":"#24312f","edge":"#111111","fill":"#ffffff","input":"#ffffff","light":true},"liquidGlass":{"label":"流动玻璃","note":"通透叠层 · 青紫折射与柔亮边缘","a":"#252b3b","b":"#24343d","fg":"#f4f2ff","muted":"#e3dfef","accent":"#a3eeea","edge":"#d5e9ff75","fill":"#ffffff0d","input":"linear-gradient(120deg,#ffffff22,#c3bfff0d,#aeffff16)","selected":"linear-gradient(130deg,#ffffff1c,#b8beff0e 45%,#a9ffeb18)","scene":"radial-gradient(ellipse at -25% 15%,#a879e95c,transparent 58%),radial-gradient(ellipse at 140% 75%,#5ae2da52,transparent 60%),linear-gradient(145deg,#36374b,#242d3b)"},"modernGradient":{"label":"现代渐变","note":"赛博朋克 · 电紫、霓虹青与玫红","a":"#100c20","b":"#1d0f29","fg":"#f4f2ff","muted":"#ccc5df","accent":"#5df6ff","edge":"#c153ff50","fill":"#ffffff08","input":"#140f27","selected":"linear-gradient(100deg,#a626f860,#e91ba538,#00edff20)","scene":"radial-gradient(ellipse at 0% 5%,#7922c94a,transparent 65%),radial-gradient(ellipse at 100% 100%,#ff1fa92b,transparent 55%),linear-gradient(155deg,#1a102c,#0b0c20)"}}; }

  applyThemeToSurface(surface) {
    const p = this.getThemePalettes()[this.themePreset] || this.getThemePalettes().nocturneGlass;
    surface.dataset.tsmTheme = this.themePreset;
    surface.dataset.modernTheme = String(this.themePreset !== 'graphiteGlass');
    for (const [key,value] of Object.entries({'--sk-ink':p.a,'--sk-accent-rgb':p.accent.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16)).join(','),'--sk-gold':p.accent,'--sk-scene':'radial-gradient(ellipse at 90% 0%,rgba('+p.glow+',.25),transparent 58%),linear-gradient(155deg,'+p.a+','+p.b+')','--theme-bg-1':p.a,'--tsm2-accent':p.accent,'--tsm2-fg':'#e8edf5','--tsm2-muted':'#aab8ca'})) surface.style.setProperty(key,value);
    const customKeys=['--sk-light','--sk-muted','--sk-edge','--sk-depth','--ui-scheme','--ui-fill','--ui-input','--ui-selected','--ui-highlight','--ui-danger','--ui-success'];
    customKeys.forEach(key=>surface.style.removeProperty(key));
    if(this.themePreset === 'graphiteGlass') { for(const [key,value] of Object.entries({'--sk-light':p.fg,'--sk-muted':p.muted,'--tsm2-fg':p.fg,'--tsm2-muted':p.muted})) surface.style.setProperty(key,value); return; }
    const values={'--sk-scene':p.scene||p.a,'--sk-light':p.fg,'--sk-muted':p.muted,'--sk-edge':p.edge,'--tsm2-fg':p.fg,'--tsm2-muted':p.muted,'--sk-depth':p.light?'0 12px 32px #00000018':'0 18px 48px #03071255,inset 0 1px 0 #ffffff26','--ui-scheme':p.light?'light':'dark','--ui-fill':p.fill,'--ui-input':p.input||p.fill,'--ui-selected':p.selected||(p.light?'#ffffffb0':'#ffffff14'),'--ui-highlight':p.light?'#ffffff99':'#ffffff20','--ui-danger':p.light?'#9b2535':'#ffc5c9','--ui-success':p.light?'#19442d':'#b2ceb8'};
    Object.entries(values).forEach(([key,value])=>surface.style.setProperty(key,value));
  }

  showForwardCheckDialog() { return forwardCheckUI.show(this); }

  async openSingleProfile(profile, request) {
    if (!profile) return null;
    const live = this.profileById(profile.id);
    if (!live) throw new Error(this.t('此会话已被删除，请刷新列表。'));
    profile = this.clone(live);
    const expected = this.fingerprint(profile) + this.connectionTargetKey(profile);
    const options = profile.options || {};
    if (!(options.host || options.target || options.device) && /待补充主机/.test(String(profile.description || ''))) {
      const error = new Error(this.t('此会话尚未填写主机/IP，请先编辑会话。')); if (request && request.throwOnFailure) throw error; this.notify(error.message, 'info'); return null;
    }
    if (!(request && request.confirmed) && this.productionRequired(profile) && !await this.confirm(this.t('生产会话连接确认'), this.connectionSummary(profile) + this.t('\n请确认目标环境及登录用户。'), this.t('确认连接'))) return null;
    if (this.fingerprint(this.profileById(profile.id)) + this.connectionTargetKey(this.profileById(profile.id)) !== expected) throw new Error(this.t('确认期间会话发生变化，请重新连接。'));
    this.activeProfileId = String(profile.id); this.render();
    try {
      const opened = await this.runInZone(async () => {
        if (this.profilesService && typeof this.profilesService.openNewTabForProfile === 'function') {
          const tab = await this.profilesService.openNewTabForProfile(profile);
          if (!tab) throw new Error(this.t('宿主未能打开此协议的终端窗口。'));
          return tab;
        }
        if (this.profilesService && typeof this.profilesService.launchProfile === 'function') { await this.profilesService.launchProfile(profile); return null; }
        throw new Error(this.t('当前 Tabby 版本未提供打开 Profile 的公开服务。'));
      });
      await this.rememberOpened(profile); this.refreshConnections(false);
      if (this.dockMode === 'autohide') this.closeDrawer();
      return opened;
    } catch (error) { this.log(this.t('打开会话失败'), error); if (request && request.throwOnFailure) throw error; this.notify(this.t('无法打开此会话，请检查 Profile 配置或 Tabby 插件兼容性。'), 'error'); return null; }
  }

  deferMenuAction(action, delay) {
    const context = this.currentMenu; if (!context) return;
    if (!context.timers) context.timers = new Set();
    const timer = setTimeout(() => { context.timers.delete(timer); if (this.currentMenu === context) action(); }, delay);
    context.timers.add(timer);
  }

  closeSubmenusFrom(level) {
    if (!this.currentMenu) return;
    this.currentMenu.elements = this.currentMenu.elements.filter(menu => {
      if (Number(menu.dataset.menuLevel || 0) < level) return true;
      if (menu._anchor) { menu._anchor._submenuWanted = false; menu._anchor.setAttribute('aria-expanded', 'false'); }
      if (menu._hoverAnchor) menu._hoverAnchor._submenuWanted = false;
      menu.remove(); return false;
    });
  }

  queueSubmenuClose(anchor) {
    this.deferMenuAction(() => {
      if (!anchor._submenuWanted || anchor._pointerInside) return;
      const level = Number(anchor.closest('.tsm2-menu')?.dataset.menuLevel || 0) + 1;
      const children = this.currentMenu.elements.filter(menu => Number(menu.dataset.menuLevel || 0) >= level);
      if (children.some(menu => menu._pointerInside)) return;
      anchor._submenuWanted = false; this.closeSubmenusFrom(level);
    }, 180);
  }

  forwardingListenersConflict(a, b) {
    if ((a.type === 'Remote') !== (b.type === 'Remote') || a.port !== b.port) return false;
    const host = value => String(value || '127.0.0.1').toLowerCase().replace(/^\[|\]$/g, '');
    const left = host(a.host), right = host(b.host);
    return left === right || ['*', '0.0.0.0', '::'].includes(left) || ['*', '0.0.0.0', '::'].includes(right);
  }

  profileName(profile) { return typeof suiteI18n !== 'undefined' && suiteI18n.profileName ? suiteI18n.profileName(profile, this.config) : String(profile && profile.name || ''); }

  safeBackupOptions(type, options) {
    const result = {};
    const keys = type === 'serial'
      ? ['port', 'baudrate', 'databits', 'stopbits', 'parity', 'rtscts', 'xon', 'xoff', 'xany', 'slowSend']
      : type === 'local' ? ['cwd', 'shellType', 'pauseAfterExit']
      : ['host', 'target', 'port', 'user', 'username', 'auth'];
    keys.forEach(key => { const value = (options || {})[key]; if (['string', 'number', 'boolean'].includes(typeof value) && (typeof value !== 'number' || Number.isFinite(value))) result[key] = typeof value === 'string' ? value.slice(0, 4096) : value; });
    return result;
  }

  canonicalGroupPath(value) {
    return this.safeImportText(value, 4096).split(/[\\/]/).map(part => this.safeImportText(part, 256)).filter(Boolean).join('/');
  }

  async ensureBackupGroups(groups, addedGroups) {
    const resolved = new Map();
    const pending = groups.slice();
    while (pending.length) {
      let progressed = false;
      for (let index = 0; index < pending.length;) {
        const source = pending[index];
        if (source.parentSourceId && !resolved.has(source.parentSourceId)) { index++; continue; }
        const parent = resolved.get(source.parentSourceId) || '';
        let group = (this.config.store.groups || []).find(item => item.name === source.name && String(item.parentGroupId || item.parentId || '') === parent && !Array.from(resolved.values()).includes(item.id));
        if (!group) {
          group = { id: this.makeId('group:import'), name: source.name, parentGroupId: parent || undefined };
          addedGroups.push(group.id);
          if (this.profilesService && typeof this.profilesService.newProfileGroup === 'function') await this.profilesService.newProfileGroup(group, { genId: false });
          else { if (!Array.isArray(this.config.store.groups)) this.config.store.groups = []; this.config.store.groups.push(group); }
        }
        resolved.set(source.sourceId, group.id); pending.splice(index, 1); progressed = true;
      }
      if (!progressed) throw new Error(this.t('备份目录存在循环或缺失父目录，未完成恢复。'));
    }
    return { resolved };
  }

  buildBackupImportPlan(data) {
    if (!data || ![1, 2].includes(data.schemaVersion) || data.format !== 'tabby-session-manager-backup' || !Array.isArray(data.profiles) || !Array.isArray(data.groups)) throw new Error(this.t('不支持的备份格式。'));
    if (data.profiles.length > 5000 || data.groups.length > 5000) throw new Error(this.t('单次最多恢复 5000 个会话及 5000 个目录。'));
    const groups = data.groups.map(group => {
      if (!group || !group.sourceId || !group.name) throw new Error(this.t('备份目录信息不完整。'));
      return { sourceId: String(group.sourceId), name: this.safeImportText(group.name, 256), parentSourceId: String(group.parentSourceId || '') };
    });
    const byId = new Map(groups.map(group => [group.sourceId, group]));
    if (byId.size !== groups.length) throw new Error(this.t('备份目录 ID 重复。'));
    const visited = new Set();
    for (const group of groups) {
      let current = group; const chain = new Set();
      while (current && !visited.has(current.sourceId)) {
        if (chain.has(current.sourceId)) throw new Error(this.t('备份目录存在循环。'));
        chain.add(current.sourceId);
        if (current.parentSourceId && !byId.has(current.parentSourceId)) throw new Error(this.t('备份目录缺失父目录。'));
        current = byId.get(current.parentSourceId);
      }
      chain.forEach(id => visited.add(id));
    }
    const plan = { sourceLabel: this.t('会话管理器安全备份'), entries: [], conflicts: [], invalid: [], groupPaths: groups.map(group => group.name), backupGroups: groups };
    const keys = new Set(this.profiles.map(profile => this.profileIdentityKey(profile)));
    data.profiles.forEach((raw, index) => {
      if (!raw || !raw.name || !['ssh', 'telnet', 'local', 'serial'].includes(raw.type)) { plan.invalid.push({ index: index + 1, message: this.t('名称为空或协议不受支持。') }); return; }
      const options = this.safeBackupOptions(raw.type, raw.options);
      const profile = { name: this.safeImportText(raw.name, 256), type: raw.type, color: this.validColor(raw.color), description: this.safeImportText(raw.description, 2000), host: options.host || options.target || '', port: options.port, username: options.user || options.username || '', groupRef: String(raw.groupRef || ''), groupPath: byId.has(String(raw.groupRef || '')) ? '' : this.canonicalGroupPath(raw.groupPath), backupOptions: options, favorite: raw.favorite === true, confirmBeforeConnect: raw.confirmBeforeConnect === true };
      if (['ssh', 'telnet'].includes(raw.type) && !profile.host) profile.pendingHost = true;
      const key = this.profileIdentityKey(profile), conflict = keys.has(key); keys.add(key);
      const entry = { index: index + 1, profile, conflict }; plan.entries.push(entry); if (conflict) plan.conflicts.push(entry);
    });
    return plan;
  }

  featureState() {
    return this.getStateStore() || {};
  }

  liveProfiles() { return this.config && this.config.store && Array.isArray(this.config.store.profiles) ? this.config.store.profiles : this.profiles || []; }

  liveGroups() { return this.config && this.config.store && Array.isArray(this.config.store.groups) ? this.config.store.groups : this.groups || []; }

  profileById(id) { return this.liveProfiles().find(profile => String(profile.id) === String(id)); }

  isFavorite(id) { return (this.featureState().favoriteIds || []).includes(String(id)); }

  async saveFeatureState() {
    if (this.config && typeof this.config.save === 'function') await this.config.save();
  }

  async toggleFavorite(profile) {
    const state = this.featureState();
    const ids = new Set((state.favoriteIds || []).map(String));
    if (ids.has(String(profile.id))) ids.delete(String(profile.id)); else ids.add(String(profile.id));
    state.favoriteIds = Array.from(ids);
    await this.saveFeatureState(); this.treeModel = null; this.render();
  }

  async updateRecentConnections(transform) {
    // History actions must never call profile deletion or credential cleanup.
    if (this.recentCleanupInProgress) return false;
    this.recentCleanupInProgress = true;
    const state = this.featureState(), previous = state.recentConnections || [];
    const next = transform(previous);
    state.recentConnections = next;
    try { await this.saveFeatureState(); }
    catch (error) {
      // Preserve connections recorded while persistence was pending.
      const current = state.recentConnections;
      if (current === next) state.recentConnections = previous;
      else {
        const ids = new Set((current || []).map(item => String(item.id)));
        state.recentConnections = (current || []).concat(previous.filter(item => !ids.has(String(item.id)))).slice(0, 30);
      }
      throw error;
    } finally { this.recentCleanupInProgress = false; }
    this.treeModel = null; this.render(); return true;
  }

  async removeRecentConnection(profileId) {
    return this.updateRecentConnections(items => items.filter(item => item && String(item.id) !== String(profileId)));
  }

  async clearRecentConnections() {
    if (!(this.featureState().recentConnections || []).length) return false;
    if (!await this.confirm(this.t('清空最近连接'), this.t('仅清空最近连接记录，保留全部会话、设置和已打开窗口。'), this.t('清空'))) return false;
    return this.updateRecentConnections(() => []);
  }

  async rememberOpened(profile) {
    if (!profile || !profile.id) return;
    const state = this.featureState();
    state.recentConnections = [{ id: String(profile.id), at: new Date().toISOString() }].concat((state.recentConnections || []).filter(item => item && item.id !== String(profile.id))).slice(0, 30);
    try { await this.saveFeatureState(); } catch (error) { this.log(this.t('保存最近打开记录失败'), error); }
  }

  renderFeatureBar(panel) {
    const bar = document.createElement('div'); bar.className = 'tsm2-feature-bar';
    [
      ['all', this.t('全部'), ['M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z']],
      ['favorites', this.t('收藏'), ['m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z']],
      ['recent', this.t('最近'), ['M3 11a9 9 0 1 1 2.6 7.4 M3 4v7h7 M12 7v5l3 2']],
      ['opened', this.t('已开窗口'), ['M8 7V3h13v13h-4 M3 8h13v13H3z']]
    ].forEach(([value, label, paths]) => {
      const button = this.createSvgButton(paths, label, () => { this.viewMode = value; const recentActions = this.getRoot().querySelector('.tsm2-recent-actions'); if (recentActions) recentActions.hidden = value !== 'recent'; this.refreshSearchTree(); this.getRoot().querySelectorAll('.tsm2-feature-bar button').forEach(item => { const selected = item.dataset.view === value; item.classList.toggle('selected', selected); item.setAttribute('aria-pressed', String(selected)); }); });
      button.className = 'tsm2-view-button' + ((this.viewMode || 'all') === value ? ' selected' : '');
      button.setAttribute('aria-pressed', String((this.viewMode || 'all') === value));
      button.firstElementChild.setAttribute('aria-hidden', 'true');
      button.firstElementChild.setAttribute('focusable', 'false');
      button.dataset.view = value; bar.appendChild(button);
    });
    panel.appendChild(bar);
    const recentActions = document.createElement('div'); recentActions.className = 'tsm2-undo-bar tsm2-recent-actions';
    recentActions.hidden = this.viewMode !== 'recent';
    const clearRecent = this.createButton(this.t('清空最近连接'), this.t('仅清空记录，保留全部会话'), () => this.clearRecentConnections(), 'tsm2-secondary');
    clearRecent.disabled = !(this.featureState().recentConnections || []).length;
    recentActions.appendChild(clearRecent); panel.appendChild(recentActions);
    this.pruneUndo();
    if (this.undoStack && this.undoStack.length) {
      const undo = document.createElement('div'); undo.className = 'tsm2-undo-bar';
      undo.appendChild(this.createButton(this.t('撤销最近删除'), this.t('十分钟内可撤销；退出 Tabby 后失效'), () => this.undoLastDeletion(), 'tsm2-secondary'));
      panel.appendChild(undo);
    }
  }

  filteredFeatureProfiles() {
    let profiles = (this.profiles || []).slice();
    const state = this.featureState(), view = this.viewMode || 'all';
    if (view === 'favorites') profiles = profiles.filter(profile => this.isFavorite(profile.id));
    if (view === 'opened') profiles = profiles.filter(profile => (this.connectionMap && this.connectionMap.get(String(profile.id)) || []).length);
    if (view === 'recent') {
      const ids = (state.recentConnections || []).map(item => item.id);
      profiles = profiles.filter(profile => ids.includes(String(profile.id))).sort((a, b) => ids.indexOf(String(a.id)) - ids.indexOf(String(b.id)));
    }
    return profiles.filter(profile => !this.searchQuery.trim() || this.profileMatches(profile));
  }

  getOpenTabs() {
    if (!this.appService || !Array.isArray(this.appService.tabs)) return [];
    const result = [], seen = new Set();
    for (const top of this.appService.tabs) {
      const tabs = typeof top.getAllTabs === 'function' ? top.getAllTabs() : [top];
      for (const tab of tabs) if (tab && !seen.has(tab)) { seen.add(tab); result.push({ tab, top }); }
    }
    return result;
  }

  refreshConnections(recordNew) {
    this.syncSplitFocusSubscriptions();
    this.syncWindowNumbers();
    const map = new Map();
    if (!this.seenTabs) this.seenTabs = new WeakSet();
    for (const item of this.getOpenTabs()) {
      const profile = item.tab.profile;
      if (!profile || !profile.id) continue;
      const id = String(profile.id);
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(item);
      if (!this.seenTabs.has(item.tab)) {
        this.seenTabs.add(item.tab);
        if (recordNew && this.profileById(id)) void this.rememberOpened(profile);
      }
    }
    const signature = JSON.stringify(Array.from(map, ([id, items]) => [id, items.map(item => item.tab.session && item.tab.session.open === true)]));
    const changed = signature !== this.connectionSignature;
    if(this.expandedWindowProfiles)for(const id of this.expandedWindowProfiles){const before=this.connectionMap?.get(id)||[],after=map.get(id)||[];if(!after.some(item=>before.some(old=>old.tab===item.tab)))this.expandedWindowProfiles.delete(id);}
    this.connectionMap = map; this.connectionSignature = signature;
    this.updateUnifiedLogUI(false);
    if (changed && this.getRoot() && !this.destroyed) this.refreshSearchTree();
  }

  connectionLabel(profile) {
    if (!this.appService) return '';
    const windows = this.connectionMap && this.connectionMap.get(String(profile.id)) || [];
    if (!windows.length) return '';
    const connected = windows.filter(item => item.tab.session && item.tab.session.open === true).length;
    return connected ? '● ' + connected + '/' + windows.length : this.t('已开 ') + windows.length;
  }

  async showOpenWindows(profile) {
    this.refreshConnections(false);
    const windows = this.connectionMap && this.connectionMap.get(String(profile.id)) || [];
    if (!windows.length) { this.notify(this.t('当前 Tabby 窗口内没有此会话的终端。'), 'info'); return; }
    const ref = this.createOverlay(this.t('切换到已打开窗口'));
    const body = document.createElement('div'); body.className = 'tsm2-dialog-body';
    windows.forEach((item, index) => body.appendChild(this.createButton(this.t('窗口 ') + (index + 1) + ' · ' + (item.tab.displayTitle || item.tab.title || profile.name) + (item.tab.session && item.tab.session.open ? this.t('（已连接）') : this.t('（连接状态待确认）')), this.t('切换终端窗口'), () => {
      if (!this.getOpenTabs().some(current => current.tab === item.tab)) throw new Error(this.t('窗口已关闭，请刷新后重试。'));
      this.runInZone(() => { this.appService.selectTab(item.top); if (item.top !== item.tab && typeof item.top.focus === 'function') item.top.focus(item.tab); });
      ref.overlay.remove();
    }, 'tsm2-secondary')));
    ref.dialog.appendChild(body);
  }

  productionRequired(profile) {
    return (this.featureState().confirmProfileIds || []).includes(String(profile.id));
  }

  async toggleProduction(profile) {
    const state = this.featureState(), ids = new Set((state.confirmProfileIds || []).map(String));
    if (ids.has(String(profile.id))) ids.delete(String(profile.id)); else ids.add(String(profile.id));
    state.confirmProfileIds = Array.from(ids); await this.saveFeatureState(); this.render();
  }

  connectionSummary(profile) {
    const options = this.effectiveConnectionOptions(profile);
    return this.profileName(profile) + ' · ' + (options.user ? options.user + '@' : '') + (options.host || options.target || options.port || this.t('本地终端')) + (profile.type === 'ssh' || profile.type === 'telnet' ? ':' + (options.port || (profile.type === 'ssh' ? 22 : 23)) : '') + ' · ' + String(profile.type || '').toUpperCase();
  }

  effectiveConnectionOptions(profile) {
    if (this.profilesService && typeof this.profilesService.getConfigProxyForProfile === 'function') {
      try { return this.profilesService.getConfigProxyForProfile(profile).options || {}; }
      catch (error) { this.log(this.t('读取继承连接参数失败'), error); }
    }
    return profile.options || {};
  }

  connectionTargetKey(profile) {
    if (!profile) return '';
    const options = this.effectiveConnectionOptions(profile);
    return JSON.stringify([profile.type, ...['host', 'target', 'port', 'user', 'username', 'device', 'command', 'cwd'].map(key => options[key])]);
  }

  showEditDraftRecovery(draft, original, error) {
    const ref = this.createOverlay(this.t('编辑尚未保存')); const body = document.createElement('div'); body.className = 'tsm2-dialog-body';
    const message = document.createElement('div'); message.className = 'tsm2-help'; message.textContent = String(error && this.t(error.message) || this.t('保存失败。')) + this.t(' 本次草稿保留在此窗口，关闭后失效。'); body.appendChild(message);
    body.append(this.createButton(this.t('重试保存草稿'), this.t('重新检查冲突后保存'), async () => { try { await this.guardedWriteProfile(draft, original); ref.overlay.remove(); await this.refreshAndRender(); this.notify(this.t('编辑草稿已保存。'), 'info'); } catch (failure) { this.inlineDialogError(body, String(failure.message || failure)); } }, 'tsm2-primary'), this.createButton(this.t('继续编辑草稿'), this.t('保留本次修改继续编辑'), () => { ref.overlay.remove(); return this.editProfile(original, draft); }, 'tsm2-secondary'));
    ref.dialog.appendChild(body);
  }

  fingerprint(value) {
    const stable = item => {
      if (!item || typeof item !== 'object') return item;
      if (Array.isArray(item)) return item.map(stable);
      const result = {};
      Object.keys(item).sort().forEach(key => { if (!key.startsWith('__')) result[key] = stable(item[key]); });
      return result;
    };
    return JSON.stringify(stable(value));
  }

  async checkEditConflict(profile, original) {
    let live = this.profileById(profile.id);
    if (!live) throw new Error(this.t('此会话已被删除，不能保存旧窗口中的编辑。'));
    if (this.fingerprint(live) !== this.fingerprint(original)) {
      const expected = this.fingerprint(live);
      if (!await this.confirm(this.t('会话已在其他位置修改'), '“' + this.profileName(profile) + this.t('”在此编辑窗口打开后发生了变化。继续会用本窗口内容覆盖当前设置；取消后可重新打开编辑。'), this.t('仍然覆盖'))) throw new Error(this.t('已取消覆盖，请重新打开编辑窗口读取最新配置。'));
      live = this.profileById(profile.id);
      if (!live || this.fingerprint(live) !== expected) throw new Error(this.t('配置再次发生变化，请重新打开编辑窗口。'));
    }
    return this.clone(live);
  }

  async guardedWriteProfile(profile, original) {
    await this.checkEditConflict(profile, original);
    await this.writeProfile(profile, false);
  }

  deletionImpact(profileIds, groupIds) {
    const groups = this.liveGroups(); const affected = new Set((groupIds || []).map(String));
    let changed = true;
    while (changed) { changed = false; groups.forEach(group => { if (!affected.has(String(group.id)) && affected.has(String(group.parentGroupId || group.parentId || ''))) { affected.add(String(group.id)); changed = true; } }); }
    const ids = new Set((profileIds || []).map(String));
    const profiles = this.liveProfiles().filter(profile => ids.has(String(profile.id)) || affected.has(String(profile.group || '')));
    return { profiles, groups: groups.filter(group => affected.has(String(group.id))) };
  }

  pruneUndo() {
    this.undoStack = (this.undoStack || []).filter(item => item.expires > Date.now()).slice(-10);
  }

  async deleteWithUndo(profileIds, groupIds) {
    if (this.deleteInProgress) throw new Error(this.t('已有删除或撤销正在处理。'));
    const preview = this.deletionImpact(profileIds, groupIds);
    if (!preview.profiles.length && !preview.groups.length) return;
    const signature = this.fingerprint(preview);
    const names = preview.profiles.slice(0, 8).map(profile => this.profileName(profile)).join('、');
    if (!await this.confirm(this.t('删除影响预览'), this.t('将删除 ') + preview.groups.length + this.t(' 个目录（含所选目录及子目录）、') + preview.profiles.length + this.t(' 个会话。') + (names ? this.t('\n会话：') + names + (preview.profiles.length > 8 ? '…' : '') : '') + this.t('\n删除后十分钟内可在本窗口撤销；退出 Tabby 后撤销失效。已连接终端不会关闭，凭据库不会被清理。'), this.t('确认删除'))) return;
    const live = this.deletionImpact(profileIds, groupIds);
    if (this.fingerprint(live) !== signature) throw new Error(this.t('删除范围内的数据已发生变化，请重新检查后删除。'));
    this.deleteInProgress = true;
    const snapshot = this.clone(live), pids = new Set(live.profiles.map(profile => String(profile.id))), gids = new Set(live.groups.map(group => String(group.id)));
    snapshot.requiredParents = Array.from(new Set(live.profiles.map(profile => String(profile.group || '')).filter(id => id && !gids.has(id) && this.liveGroups().some(group => String(group.id) === id))));
    const hotkeys = this.config.store.hotkeys && this.config.store.hotkeys.profile;
    snapshot.hotkeys = {};
    if (hotkeys) pids.forEach(id => { const key = id.replace(/\./g, '-'); if (Object.prototype.hasOwnProperty.call(hotkeys, key)) { snapshot.hotkeys[key] = this.clone(hotkeys[key]); delete hotkeys[key]; } });
    this.config.store.profiles = this.liveProfiles().filter(profile => !pids.has(String(profile.id)));
    this.config.store.groups = this.liveGroups().filter(group => !gids.has(String(group.id)));
    try {
      await this.saveFeatureState();
      this.pruneUndo(); this.undoStack.push({ ...snapshot, expires: Date.now() + 10 * 60 * 1000 }); this.pruneUndo();
      this.activeProfileId = null; await this.refreshAndRender(); this.notify(this.t('已删除 ') + pids.size + this.t(' 个会话、') + gids.size + this.t(' 个目录。可在十分钟内撤销。'), 'info'); return true;
    } catch (error) {
      this.restoreDeletedSnapshot(snapshot);
      try { await this.saveFeatureState(); } catch (rollbackError) { this.log(this.t('删除回滚保存失败'), rollbackError); }
      throw error;
    } finally { this.deleteInProgress = false; }
  }

  restoreDeletedSnapshot(snapshot) {
    const profiles = this.liveProfiles(), groups = this.liveGroups();
    snapshot.groups.forEach(group => { if (!groups.some(item => item.id === group.id)) groups.push(this.clone(group)); });
    snapshot.profiles.forEach(profile => { if (!profiles.some(item => item.id === profile.id)) profiles.push(this.clone(profile)); });
    this.config.store.groups = groups; this.config.store.profiles = profiles;
    const hotkeys = this.config.store.hotkeys && this.config.store.hotkeys.profile;
    if (hotkeys) Object.keys(snapshot.hotkeys || {}).forEach(key => { if (!Object.prototype.hasOwnProperty.call(hotkeys, key)) hotkeys[key] = this.clone(snapshot.hotkeys[key]); });
  }

  async undoLastDeletion() {
    if (this.deleteInProgress) throw new Error(this.t('已有删除或撤销正在处理。'));
    this.pruneUndo(); const snapshot = this.undoStack[this.undoStack.length - 1];
    if (!snapshot) { this.notify(this.t('没有可撤销的删除，或已超过十分钟。'), 'info'); return; }
    if (snapshot.profiles.some(profile => this.profileById(profile.id)) || snapshot.groups.some(group => this.liveGroups().some(item => item.id === group.id))) throw new Error(this.t('原 ID 已被其他数据占用，未执行撤销。'));
    const restoredGroups = new Set(snapshot.groups.map(group => String(group.id)));
    if ((snapshot.requiredParents || []).some(id => !this.liveGroups().some(group => String(group.id) === id))) throw new Error(this.t('会话原目录已被删除，请先恢复该目录。'));
    if (snapshot.groups.some(group => { const parent = String(group.parentGroupId || group.parentId || ''); return parent && !restoredGroups.has(parent) && !this.liveGroups().some(item => String(item.id) === parent); })) throw new Error(this.t('原父目录已被删除，请先撤销该目录的删除。'));
    this.deleteInProgress = true;
    const previousHotkeys = new Set(Object.keys(this.config.store.hotkeys && this.config.store.hotkeys.profile || {}));
    this.restoreDeletedSnapshot(snapshot);
    try { await this.saveFeatureState(); this.undoStack.pop(); await this.refreshAndRender(); this.notify(this.t('最近一次删除已撤销。'), 'info'); }
    catch (error) {
      const ids = new Set(snapshot.profiles.map(profile => profile.id)), gids = new Set(snapshot.groups.map(group => group.id));
      this.config.store.profiles = this.liveProfiles().filter(profile => !ids.has(profile.id)); this.config.store.groups = this.liveGroups().filter(group => !gids.has(group.id));
      const hotkeys = this.config.store.hotkeys && this.config.store.hotkeys.profile;
      if (hotkeys) Object.keys(snapshot.hotkeys || {}).forEach(key => { if (!previousHotkeys.has(key) && this.fingerprint(hotkeys[key]) === this.fingerprint(snapshot.hotkeys[key])) delete hotkeys[key]; });
      throw error;
    } finally { this.deleteInProgress = false; }
  }

  createPagedChecklist(container, items, selected, onChange, readonly) {
    const filter = this.input('search', ''); filter.placeholder = this.t('搜索名称、地址、目录或状态');
    const controls = document.createElement('div'); controls.className = 'tsm2-list-controls';
    const summary = document.createElement('span'), list = document.createElement('div'); list.className = 'tsm2-check-list';
    const pager = document.createElement('div'); pager.className = 'tsm2-list-controls';
    let page = 0; const pageSize = 60;
    const matching = () => { const query = filter.value.trim().toLocaleLowerCase(); return items.filter(item => !query || (item.label + ' ' + (item.detail || '')).toLocaleLowerCase().includes(query)); };
    const draw = () => {
      const rows = matching(), pages = Math.max(1, Math.ceil(rows.length / pageSize)); page = Math.min(page, pages - 1);
      summary.textContent = readonly ? this.t('共 ') + items.length + this.t(' 条；筛选 ') + rows.length + this.t(' 条') : this.t('已选 ') + selected.size + ' / ' + items.filter(item => !item.disabled).length + this.t('；筛选 ') + rows.length + this.t(' 条');
      list.replaceChildren();
      rows.slice(page * pageSize, (page + 1) * pageSize).forEach(item => {
        const row = document.createElement('label'); row.className = 'tsm2-check-row';
        const checkbox = this.input('checkbox'); checkbox.checked = selected.has(item.key); checkbox.disabled = !!item.disabled;
        checkbox.addEventListener('change', () => { if (checkbox.checked) selected.add(item.key); else selected.delete(item.key); summary.textContent = this.t('已选 ') + selected.size + this.t('；筛选 ') + rows.length + this.t(' 条'); if (onChange) onChange(); });
        const text = document.createElement('span'), title = document.createElement('strong'), detail = document.createElement('small'); title.textContent = item.label; detail.textContent = item.detail || ''; text.append(title, detail); if (!readonly) row.appendChild(checkbox); row.appendChild(text); list.appendChild(row);
      });
      pager.replaceChildren(this.createButton(this.t('上一页'), this.t('上一页'), () => { page = Math.max(0, page - 1); draw(); }, 'tsm2-secondary'), document.createTextNode((page + 1) + ' / ' + pages), this.createButton(this.t('下一页'), this.t('下一页'), () => { page = Math.min(pages - 1, page + 1); draw(); }, 'tsm2-secondary'));
    };
    controls.append(summary, this.createButton(this.t('全选筛选结果'), this.t('选择所有匹配记录，包括其他页'), () => { matching().filter(item => !item.disabled).forEach(item => selected.add(item.key)); draw(); if (onChange) onChange(); }, 'tsm2-secondary'), this.createButton(this.t('取消筛选结果'), this.t('取消所有匹配记录'), () => { matching().forEach(item => selected.delete(item.key)); draw(); if (onChange) onChange(); }, 'tsm2-secondary'));
    if (readonly) controls.replaceChildren(summary);
    filter.addEventListener('input', () => { page = 0; draw(); });
    container.append(filter, controls, list, pager); draw();
    return { selected, draw };
  }

  showBulkManager() {
    const ref = this.createOverlay(this.t('批量管理会话')); ref.dialog.classList.add('tsm2-wide-dialog');
    const body = document.createElement('div'); body.className = 'tsm2-dialog-body';
    const selected = new Set();
    this.createPagedChecklist(body, this.liveProfiles().map(profile => ({ key: String(profile.id), label: this.profileName(profile), detail: this.connectionSummary(profile) + ' · ' + this.displayGroup(profile.group) })), selected);
    const group = this.addField(body, this.t('批量移动的目标目录'), this.select(this.moveDestinationOptions(), ''));
    const user = this.addField(body, this.t('批量修改用户名（仅 SSH/Telnet；留空不改）'), this.input('text', ''));
    const port = this.addField(body, this.t('批量修改端口（仅 SSH/Telnet；留空不改）'), this.input('number', ''));
    const concurrency = this.addField(body, this.t('批量连接并发数（1–5）'), this.input('number', '2')); concurrency.min = '1'; concurrency.max = '5';
    const help = document.createElement('div'); help.className = 'tsm2-help'; help.textContent = this.t('批量连接逐批打开终端，最多等待每个连接 30 秒；遇到待确认连接会停止后续任务，已有窗口继续由 Tabby 处理，不自动重连。修改用户名后可能需要重新输入密码。'); body.appendChild(help);
    const actions = document.createElement('div'); actions.className = 'tsm2-list-controls';
    const ids = () => { if (!selected.size) throw new Error(this.t('请先勾选会话。')); return Array.from(selected); };
    let busy = false;
    const run = async action => { if (busy) return; busy = true; actions.querySelectorAll('button').forEach(button => button.disabled = true); try { await action(); } catch (error) { this.inlineDialogError(body, String(this.t(error.message) || error)); } finally { busy = false; actions.querySelectorAll('button').forEach(button => button.disabled = false); } };
    actions.append(
      this.createButton(this.t('移动所选'), this.t('批量移动'), () => run(() => this.applyBulkEdits(ids(), { group: group.value })), 'tsm2-secondary'),
      this.createButton(this.t('修改所选'), this.t('批量修改用户名和端口'), () => run(() => this.applyBulkEdits(ids(), { user: user.value.trim(), port: port.value.trim() })), 'tsm2-secondary'),
      this.createButton(this.t('连接所选'), this.t('限并发打开所选会话'), () => run(async () => { const count = Number(concurrency.value); if (!Number.isInteger(count) || count < 1 || count > 5) throw new Error(this.t('并发数必须是 1–5 的整数。')); await this.showBulkConnectProgress(ids(), count); }), 'tsm2-primary'),
      this.createButton(this.t('删除所选'), this.t('预览后批量删除'), () => run(async () => { if (await this.deleteWithUndo(ids(), [])) ref.overlay.remove(); }), 'tsm2-danger')
    ); body.appendChild(actions); ref.dialog.appendChild(body);
  }

  async applyBulkEdits(ids, patch) {
    if (this.bulkEditInProgress) throw new Error(this.t('已有批量修改正在处理。'));
    if (patch.port && (!Number.isInteger(Number(patch.port)) || Number(patch.port) < 1 || Number(patch.port) > 65535)) throw new Error(this.t('端口必须是 1–65535 的整数。'));
    if (patch.group && !this.liveGroups().some(group => String(group.id) === String(patch.group))) throw new Error(this.t('目标目录已不存在。'));
    if (!Object.prototype.hasOwnProperty.call(patch, 'group') && !patch.user && !patch.port) throw new Error(this.t('请填写要修改的用户名或端口。'));
    const originals = ids.map(id => this.profileById(id));
    if (originals.some(profile => !profile)) throw new Error(this.t('部分会话已被删除，请重新打开批量管理。'));
    const snapshots = originals.map(profile => this.clone(profile));
    const affected = snapshots.filter(profile => Object.prototype.hasOwnProperty.call(patch, 'group') || ['ssh', 'telnet'].includes(profile.type));
    if (!affected.length) throw new Error(this.t('没有可修改的 SSH/Telnet 会话。'));
    if (!await this.confirm(this.t('确认批量修改'), this.t('将修改 ') + affected.length + this.t(' 个会话。') + (patch.user ? this.t('\n用户名：') + patch.user : '') + (patch.port ? this.t('\n端口：') + patch.port : '') + (Object.prototype.hasOwnProperty.call(patch, 'group') ? this.t('\n目标：') + (this.displayGroup(patch.group) || this.t('根目录')) : ''), this.t('确认修改'))) return;
    if (affected.some(profile => this.fingerprint(this.profileById(profile.id)) !== this.fingerprint(profile))) throw new Error(this.t('会话在预览期间已被修改，请重新操作。'));
    this.bulkEditInProgress = true; const written = [];
    try {
      for (const profile of affected) {
        if (this.fingerprint(this.profileById(profile.id)) !== this.fingerprint(profile)) throw new Error(this.t('批量处理期间会话发生变化，已停止继续修改。'));
        const next = this.clone(profile); next.options = next.options || {};
        if (Object.prototype.hasOwnProperty.call(patch, 'group')) next.group = patch.group || undefined;
        if (patch.user) next.options.user = patch.user;
        if (patch.port) next.options.port = Number(patch.port);
        written.push({ before: profile, after: this.clone(next) });
        if (this.profilesService && typeof this.profilesService.writeProfile === 'function') await this.profilesService.writeProfile(next);
        else { const index = this.liveProfiles().findIndex(item => item.id === next.id); this.config.store.profiles[index] = next; }
      }
      await this.saveFeatureState(); await this.refreshAndRender(); this.notify(this.t('已修改 ') + affected.length + this.t(' 个会话。'), 'info');
    } catch (error) {
      written.forEach(item => { const index = this.liveProfiles().findIndex(profile => profile.id === item.before.id); if (index >= 0 && this.fingerprint(this.liveProfiles()[index]) === this.fingerprint(item.after)) this.config.store.profiles[index] = item.before; });
      try { await this.saveFeatureState(); } catch (rollbackError) { this.log(this.t('批量修改回滚失败'), rollbackError); }
      throw error;
    } finally { this.bulkEditInProgress = false; }
  }

  async waitForOpenedTab(tab, timeout) {
    if (!tab || !Object.prototype.hasOwnProperty.call(tab, 'session') && !('session' in tab)) return 'opened';
    const deadline = Date.now() + (timeout || 30000);
    while (!this.destroyed && Date.now() < deadline) {
      if (tab.session && tab.session.open === true) return 'connected';
      if (this.appService && !this.getOpenTabs().some(item => item.tab === tab)) return 'closed';
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    return 'pending';
  }

  async runBulkConnect(ids, concurrency, control, onProgress) {
    if (this.bulkConnectInProgress) throw new Error(this.t('已有批量连接正在进行。'));
    const profiles = ids.map(id => this.profileById(id)).map(profile => profile && this.clone(profile));
    if (profiles.some(profile => !profile)) throw new Error(this.t('部分会话已被删除，请重新选择。'));
    const targets = new Map(profiles.map(profile => [String(profile.id), this.connectionTargetKey(profile)]));
    const protectedProfiles = profiles.filter(profile => this.productionRequired(profile));
    if (protectedProfiles.length && !await this.confirm(this.t('生产会话连接确认'), this.t('本批包含 ') + protectedProfiles.length + this.t(' 个需要确认的会话：\n') + protectedProfiles.map(profile => this.connectionSummary(profile)).join('\n'), this.t('确认连接'))) return [];
    this.bulkConnectInProgress = true; let cursor = 0; const results = [];
    const worker = async () => {
      while (cursor < profiles.length && !control.stopped && !this.destroyed) {
        const profile = profiles[cursor++];
        try {
          if (this.fingerprint(this.profileById(profile.id)) !== this.fingerprint(profile) || this.connectionTargetKey(profile) !== targets.get(String(profile.id))) throw new Error(this.t('会话在连接预览后已修改，请重新确认。'));
          const opened = await this.openProfile(profile, { confirmed: true, throwOnFailure: true }); const status = await this.waitForOpenedTab(opened, 30000); results.push({ name: profile.name, status });
          if (status === 'pending' || status === 'opened' && ['ssh', 'telnet'].includes(profile.type)) { control.stopped = true; control.reason = this.t('存在连接待确认的窗口，已停止后续任务。'); }
        }
        catch (error) { results.push({ name: profile.name, status: 'failed', message: String(this.t(error.message) || error) }); }
        if (onProgress) onProgress(results.slice(), profiles.length);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    };
    try { await Promise.all(Array.from({ length: Math.max(1, Math.min(5, concurrency)) }, worker)); return results; }
    finally { this.bulkConnectInProgress = false; }
  }

  async showBulkConnectProgress(ids, concurrency) {
    const ref = this.createOverlay(this.t('批量连接进度')), body = document.createElement('div'); body.className = 'tsm2-dialog-body';
    const summary = document.createElement('div'), list = document.createElement('div'); list.className = 'tsm2-import-list'; const control = { stopped: false };
    body.append(summary, list, this.createButton(this.t('停止后续连接'), this.t('已打开的窗口不会关闭'), () => { control.stopped = true; summary.textContent += this.t(' · 已请求停止后续连接'); }, 'tsm2-secondary')); ref.dialog.appendChild(body);
    summary.textContent = this.t('准备打开 ') + ids.length + this.t(' 个会话，并发 ') + concurrency + this.t('。关闭此进度窗口不会关闭终端。');
    const results = await this.runBulkConnect(ids, concurrency, control, (rows, total) => {
      summary.textContent = this.t('已处理 ') + rows.length + ' / ' + total + (control.stopped ? this.t(' · 已停止后续任务') : ''); list.replaceChildren();
      rows.slice(-100).forEach(row => { const line = document.createElement('div'); line.className = 'tsm2-import-row'; line.textContent = row.name + ' · ' + ({ connected: this.t('已连接'), opened: this.t('窗口已打开'), pending: this.t('连接待确认'), closed: this.t('窗口已关闭'), failed: this.t('打开失败') }[row.status]) + (row.message ? ' · ' + row.message : ''); list.appendChild(line); });
    });
    summary.textContent = this.t('已完成 ') + results.length + ' / ' + ids.length + this.t(' 个连接任务') + (control.stopped ? this.t('，其余未打开。') : '。') + (control.reason || '');
  }

  async executeImportReport(plan, mode) {
    if (this.reportImportInProgress || this.importInProgress) throw new Error(this.t('已有导入正在进行。'));
    this.reportImportInProgress = true;
    const report = { at: new Date().toISOString(), source: plan.sourceLabel, results: [], failedEntries: [], plan, mode };
    try {
      // Preserve empty directories, then isolate each profile transaction for retry.
      let prepared;
      try { prepared = await this.applyImportPlan({ ...plan, groupPaths: (plan.groupPaths || []).concat(plan.entries.map(entry => entry.profile.groupPath).filter(Boolean)), entries: [], invalid: [] }, mode); }
      catch (error) {
        plan.entries.forEach(entry => { report.results.push({ index: entry.index, name: entry.profile.name, sourceFile: entry.sourceFile || '', status: 'failed', reason: this.t('目录准备失败：') + String(this.t(error.message) || error) }); report.failedEntries.push(entry); });
        if (!plan.entries.length) report.results.push({ name: this.t('目录结构'), status: 'failed', reason: String(this.t(error.message) || error) });
        return report;
      }
      let persistenceError = null;
      const markFailed = (entries, error) => entries.forEach(entry => { report.failedEntries.push(entry); report.results.push({ index: entry.index, name: entry.profile.name, sourceFile: entry.sourceFile || '', status: 'failed', reason: String(this.t(error.message) || error) }); });
      const processBatch = async entries => {
        if (persistenceError) { markFailed(entries, persistenceError); return; }
        try {
          const result = await this.applyImportPlan({ ...plan, preparedGroups: prepared.resolved || [], entries, invalid: [] }, mode);
          const outcomes = new Map((result.outcomes || []).map(item => [item.index, item.status]));
          entries.forEach(entry => { const status = outcomes.get(entry.index) || (result.imported ? 'success' : 'skipped'); report.results.push({ index: entry.index, name: entry.profile.name, sourceFile: entry.sourceFile || '', status, reason: status === 'success' ? this.t('已写入') : this.t('重复项，按当前规则跳过') }); });
        } catch (error) {
          if (error.tsmPersistenceFailure) { persistenceError = error; markFailed(entries, error); }
          else if (entries.length > 1) { const middle = Math.floor(entries.length / 2); await processBatch(entries.slice(0, middle)); await processBatch(entries.slice(middle)); }
          else markFailed(entries, error);
        }
      };
      for (let index = 0; index < plan.entries.length; index += 50) await processBatch(plan.entries.slice(index, index + 50));
      (plan.invalid || []).forEach(item => report.results.push({ index: item.index, name: this.t('无效记录'), status: 'skipped', reason: item.message }));
      return report;
    } finally { this.reportImportInProgress = false; this.lastImportReport = report; }
  }

  showImportReport(report) {
    if (!report) { this.notify(this.t('本次运行尚无导入报告。'), 'info'); return; }
    const ref = this.createOverlay(this.t('导入结果报告')); ref.dialog.classList.add('tsm2-wide-dialog');
    const body = document.createElement('div'); body.className = 'tsm2-dialog-body';
    const summary = document.createElement('div'); summary.textContent = this.t('成功 ') + report.results.filter(row => row.status === 'success').length + this.t(' · 跳过 ') + report.results.filter(row => row.status === 'skipped').length + this.t(' · 失败 ') + report.results.filter(row => row.status === 'failed').length; body.appendChild(summary);
    this.createPagedChecklist(body, report.results.map((row, index) => ({ key: String(index), label: (row.status === 'success' ? this.t('成功') : row.status === 'failed' ? this.t('失败') : this.t('跳过')) + ' · ' + row.name, detail: (row.sourceFile ? row.sourceFile + ' · ' : '') + row.reason, disabled: true })), new Set(), null, true);
    const actions = document.createElement('div'); actions.className = 'tsm2-list-controls';
    actions.appendChild(this.createButton(this.t('导出报告'), this.t('导出不含凭据的结果报告'), () => this.downloadTextFile('tabby-import-report.json', JSON.stringify({ at: report.at, source: report.source, results: report.results }, null, 2)), 'tsm2-secondary'));
    if (report.failedEntries.length) actions.appendChild(this.createButton(this.t('仅重试失败项'), this.t('已成功的会话不会再次导入'), async () => { const result = await this.executeImportReport({ ...report.plan, entries: report.failedEntries, invalid: [] }, report.mode); report.failedEntries = result.failedEntries; ref.overlay.remove(); this.showImportReport(result); }, 'tsm2-primary'));
    body.appendChild(actions); ref.dialog.appendChild(body);
  }

  syncWindowNumbers() {
    if (!this.windowNumbers) this.windowNumbers = new WeakMap();
    if (!this.windowBatches) this.windowBatches = new Map();
    const groups = new Map();
    for (const { tab } of this.getOpenTabs()) {
      if (!tab.profile) continue;
      const id = String(tab.profile.id || '');
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(tab);
    }
    for (const id of this.windowBatches.keys()) if (!groups.has(id)) this.windowBatches.delete(id);
    for (const [id, tabs] of groups) {
      let batch = this.windowBatches.get(id);
      // A new batch may arrive before a separate empty-tabs event was observed.
      if (!batch || !tabs.some(tab => batch.tabs.has(tab))) {
        batch = { tabs: new Set(), next: 1 };
        for (const tab of tabs) this.windowNumbers.delete(tab);
      }
      for (const tab of tabs) if (!this.windowNumbers.has(tab)) this.windowNumbers.set(tab, batch.next++);
      batch.tabs = new Set(tabs); this.windowBatches.set(id, batch);
    }
  }

  windowNumber(tab) {
    this.syncWindowNumbers();
    return this.windowNumbers.get(tab) || 1;
  }

  tabLogInfo(tab) {
    return this.logger && typeof this.logger.describeTab === 'function' ? this.logger.describeTab(tab) : null;
  }

  currentLoggingTab() {
    const active = this.appService && this.appService.activeTab;
    const tab = active && typeof active.getFocusedTab === 'function' ? active.getFocusedTab() : active;
    return tab && tab.profile && tab.profile.type === 'ssh' ? tab : null;
  }

  expandWindowRows(rows) {
    const result = [];
    for (const row of rows) {
      result.push(row);
      if (row.kind !== 'profile' || !this.expandedWindowProfiles?.has(String(row.profile.id))) continue;
      for (const item of this.connectionMap && this.connectionMap.get(String(row.profile.id)) || []) {
        if (item.tab.profile && item.tab.profile.type === 'ssh') result.push({ kind: 'window', tab: item.tab, top: item.top, depth: row.depth + 1 });
      }
    }
    return result;
  }

  focusWindow(item) {
    if (!this.getOpenTabs().some(current => current.tab === item.tab)) throw new Error(this.t('该终端窗口已关闭。'));
    this.runInZone(() => { this.appService.selectTab(item.top); if (item.top !== item.tab && typeof item.top.focus === 'function') item.top.focus(item.tab); });
    this.updateUnifiedLogUI(true);
  }

  logStateLabel(info) {
    if (!info) return this.t('等待连接');
    if (info.stopping) return this.t('正在停止…');
    if (info.errorCode) return info.errorCode === 'CREATE_LOG_FAILED' ? this.t('无法创建日志') : this.t('写入失败');
    if (info.recording) return info.recordingMode === 'automatic' ? this.t('自动记录中') : this.t('手动记录中');
    return info.temporarilyStopped ? this.t('本次已停止') : this.t('未记录');
  }

  renderWindowRow(container, item) {
    const tab = item.tab, info = this.tabLogInfo(tab);
    const row = document.createElement('div'); row.className = 'tsm2-window-row'; row.style.paddingLeft = Math.min(52, 12 + item.depth * 10) + 'px';
    row._tsmTab = tab;
    row.dataset.profileId = String(tab.profile.id); row.dataset.sessionKey = info && info.sessionKey || '';
    row.classList.toggle('active', this.currentLoggingTab() === tab);
    const top = document.createElement('div'); top.className = 'tsm2-window-top';
    const name = this.createButton(this.t('窗口 ') + this.windowNumber(tab), this.t('切换到此终端窗口'), () => this.focusWindow(item), 'tsm2-window-name');
    const state = document.createElement('span'); state.className = 'tsm2-window-state' + (info && info.recording ? ' recording' : '') + (info && info.errorCode ? ' failed' : ''); state.textContent = (info && info.recording ? '● ' : '○ ') + this.logStateLabel(info);
    top.append(name, state);
    const address = document.createElement('div'); address.className = 'tsm2-window-address'; const opts = info && info.connection || this.effectiveConnectionOptions(tab.profile); address.textContent = (opts.user ? opts.user + '@' : '') + (opts.host || opts.target || '') + ':' + (opts.port || 22); address.title = tab.displayTitle || tab.title || address.textContent;
    const bottom = document.createElement('div'); bottom.className = 'tsm2-window-bottom';
    const time = document.createElement('span'); time.textContent = info && info.connectedAt ? new Date(info.connectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + this.t(' 连接') : this.t('连接状态待确认');
    const actions = document.createElement('span'); actions.className = 'tsm2-window-actions';
    const toggle = this.createButton(info && info.recording ? this.t('停止') : this.t('记录'), this.t('控制此窗口日志'), () => this.runWindowLogAction(tab, info && info.recording ? 'stop' : info && info.lastOutputPath ? 'resume' : 'start'), 'tsm2-window-link');
    toggle.disabled = !info || !!info.stopping || !!(this.logBusy && this.logBusy.has(info.sessionKey));
    const view = this.createButton(this.t('查看'), this.t('查看此窗口最近日志'), () => this.runWindowLogAction(tab, 'view'), 'tsm2-window-link'); view.disabled = !info || !(info.outputPath || info.lastOutputPath);
    actions.append(toggle, view); bottom.append(time, actions); row.append(top, address, bottom);
    row.addEventListener('click', event => { if (!event.target.closest('button')) this.focusWindow(item); });
    container.appendChild(row);
  }

  renderCurrentLogPanel(panel) {
    const section = document.createElement('section'); section.className = 'tsm2-current-log'; section.setAttribute('aria-label', this.t('会话信息')); panel.appendChild(section); this.fillCurrentLogPanel(section);
  }

  async toggleSessionInfo() {
    const state = this.getStateStore(), previous = state.sessionInfoExpanded;
    state.sessionInfoExpanded = !state.sessionInfoExpanded;
    const panel = this.getRoot().querySelector('.tsm2-current-log');
    if (panel) this.fillCurrentLogPanel(panel);
    try { await this.config.save(); }
    catch (error) { state.sessionInfoExpanded = previous; if (panel) this.fillCurrentLogPanel(panel); throw error; }
  }

  fillCurrentLogPanel(section) {
    const tab = this.currentLoggingTab(), info = tab && this.tabLogInfo(tab);
    const expanded = !!this.getStateStore().sessionInfoExpanded;
    const selected = tab && tab.profile || this.profiles.find(profile => String(profile.id) === this.activeProfileId);
    const conflict = this.logger && this.logger.bridgeConflict;
    const signature = JSON.stringify([expanded, selected, info, tab && this.windowNumber(tab), !!conflict, this.config.store.language, this.getStateStore().language, info && !!(this.logBusy && this.logBusy.has(info.sessionKey))]);
    if (section._contentSignature === signature) return;
    section._contentSignature = signature;
    const scroll = section.querySelector('.tsm2-info-body')?.scrollTop || 0;
    section.replaceChildren(); section.classList.toggle('is-expanded', expanded);
    const heading = this.createButton('', this.t('会话信息'), () => this.toggleSessionInfo(), 'tsm2-info-toggle');
    heading.setAttribute('aria-expanded', String(expanded)); heading.setAttribute('aria-controls', 'tsm2-info-body');
    const arrow = document.createElement('span'); arrow.textContent = expanded ? '▾' : '▸'; arrow.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span'); label.textContent = this.t('会话信息'); heading.append(arrow, label);
    if (info && info.recording) { const dot = document.createElement('span'); dot.className = 'tsm2-info-recording'; dot.textContent = '●'; dot.title = this.logStateLabel(info); heading.appendChild(dot); }
    section.appendChild(heading);
    const body = document.createElement('div'); body.id = 'tsm2-info-body'; body.className = 'tsm2-info-body'; body.hidden = !expanded; section.appendChild(body);
    if (!expanded) return;
    if (!tab) { this.renderProfileDetails(body); return; }
    const status = document.createElement('div'); status.className = 'tsm2-current-log-status' + (info && info.recording ? ' recording' : '') + (conflict || info && info.errorCode ? ' failed' : ''); status.setAttribute('aria-live', 'polite'); status.textContent = conflict ? this.t('日志插件冲突') : this.logStateLabel(info); status.title = conflict ? this.t('检测到独立日志插件，请退出 Tabby 后移出旧插件。') : info && info.errorCode || ''; body.appendChild(status);
    this.renderProfileDetails(body);
    const path = info && (info.outputPath || info.lastOutputPath);
    if (path) { const file = document.createElement('div'); file.className = 'tsm2-current-log-file'; file.textContent = path.split(/[\\/]/).pop(); file.title = path; body.appendChild(file); }
    const actions = document.createElement('div'); actions.className = 'tsm2-log-action-grid';
    const main = this.createButton(info && info.recording ? this.t('停止') : path ? this.t('继续记录') : this.t('记录'), this.t('控制当前终端日志'), () => this.runWindowLogAction(tab, info && info.recording ? 'stop' : path ? 'resume' : 'start'), 'tsm2-primary tsm2-log-main');
    main.disabled = !info || !!info.stopping || !!(this.logBusy && this.logBusy.has(info.sessionKey));
    const view = this.createButton(this.t('查看'), this.t('打开本次连接最近的日志文件'), () => this.runWindowLogAction(tab, 'view'), 'tsm2-secondary'); view.disabled = !path;
    const folder = this.createButton(this.t('目录'), this.t('打开本次日志所在目录'), () => this.runWindowLogAction(tab, 'directory'), 'tsm2-secondary'); folder.disabled = !info;
    actions.append(main, view, folder);
    if (info && !info.recording && path) { const fresh = this.createButton(this.t('新建'), this.t('为当前连接选择新的日志文件'), () => this.runWindowLogAction(tab, 'start'), 'tsm2-secondary'); fresh.disabled = !!info.stopping || !!(this.logBusy && this.logBusy.has(info.sessionKey)); actions.appendChild(fresh); }
    section.appendChild(actions); body.scrollTop = scroll;
  }

  syncSplitFocusSubscriptions() {
    if (this.destroyed) return;
    if (!this.splitFocusSubscriptions) this.splitFocusSubscriptions = new Map();
    const tops = new Set(this.appService && this.appService.tabs || []);
    for (const [top, subscription] of this.splitFocusSubscriptions) {
      if (!tops.has(top)) { subscription.unsubscribe(); this.splitFocusSubscriptions.delete(top); }
    }
    for (const top of tops) {
      if (this.splitFocusSubscriptions.has(top)) continue;
      const event = top.focusChanged$;
      if (event && typeof event.subscribe === 'function') this.splitFocusSubscriptions.set(top, event.subscribe(() => {
        if (this.appService.activeTab === top) this.handleActiveSessionChange();
      }));
    }
  }

  handleActiveSessionChange() {
    const root = this.getRoot(); if (!root || this.destroyed) return;
    const current = this.currentLoggingTab();
    if (current) this.activeProfileId = String(current.profile.id);
    // Update the small panel synchronously; switching focus does not change tree contents.
    const panel = root.querySelector('.tsm2-current-log'); if (panel) this.fillCurrentLogPanel(panel);
    root.querySelectorAll('.tsm2-profile').forEach(row => row.classList.toggle('active', row.dataset.profileId === this.activeProfileId));
    root.querySelectorAll('.tsm2-window-row').forEach(row => row.classList.toggle('active', row._tsmTab === current));
  }

  updateUnifiedLogUI(force) {
    const root = this.getRoot(); if (!root || this.destroyed) return;
    const current = this.currentLoggingTab();
    if (current) this.activeProfileId = String(current.profile.id);
    const panel = root.querySelector('.tsm2-current-log'); if (panel) this.fillCurrentLogPanel(panel);
    const signature = JSON.stringify(this.getOpenTabs().map(item => { const info = this.tabLogInfo(item.tab); return [this.windowNumber(item.tab), info, current === item.tab]; }));
    if (force || signature !== this.windowLogSignature) { this.windowLogSignature = signature; this.scheduleSearchTreeRefresh(); }
  }

  async runWindowLogAction(tab, action) {
    const info = this.tabLogInfo(tab), bridge = this.logger && this.logger.bridge;
    if (!info || !bridge) throw new Error(this.t('此连接尚未就绪，或独立日志插件仍在运行；请检查插件部署。'));
    if (!this.logBusy) this.logBusy = new Set();
    if (this.logBusy.has(info.sessionKey)) return;
    this.logBusy.add(info.sessionKey);
    try {
      const reference = this.logProfileReference(tab.profile);
      const calls = { start: 'logStart', stop: 'logStop', resume: 'logResume', view: 'logView', directory: 'openSessionDirectory' };
      const method = calls[action]; if (!method || typeof bridge[method] !== 'function') throw new Error(this.t('当前日志接口不支持此操作。'));
      const promise = bridge[method](reference, info.sessionKey); this.updateUnifiedLogUI(true);
      const result = await promise;
      if (!result || !result.ok) {
        const labels = { SESSION_CHANGED: this.t('原连接已经重连或关闭，请重新选择窗口。'), NO_PREVIOUS_LOG: this.t('上次日志不存在，请选择新日志文件。'), FILE_ALREADY_EXISTS: this.t('此文件已存在，请选择新文件名。'), WRITE_LOG_FAILED: this.t('日志写入失败，请检查磁盘空间及目录权限。'), LOG_STOPPING: this.t('日志正在结束，请稍后重试。'), LOG_BUSY: this.t('日志操作正在进行，请稍后重试。') };
        throw new Error(labels[result && result.code] || this.logActionFailureMessage(result));
      }
    } catch (error) { this.notify(String(this.t(error.message) || this.t('日志操作失败。')), 'error'); }
    finally { this.logBusy.delete(info.sessionKey); this.updateUnifiedLogUI(true); }
  }
  constructor(config, profilesService, zone, ngbModal, passwordStorage, appService, logger, selector) {
    Object.assign(this,{config,profilesService,zone,ngbModal,passwordStorage,appService,logger,selector});
    this.profiles=[];this.groups=[];this.viewMode='all';this.searchQuery='';this.activeProfileId=null;
    this.collapsedFolders=new Set();this.connectionMap=new Map();this.undoStack=[];this.subscriptions=[];
    this.sidebarWidth=280;this.isVisible=true;this.dockMode='pinned';this.themePreset='nocturneGlass';
    if(typeof suiteSettingsController!=='undefined')this.releaseSettingsController=suiteSettingsController.register(this.config,this);
    this.startTimer=setTimeout(()=>this.start(),0);
  }
  start() {
    if(this.started||this.destroyed)return;this.started=true;
    this.loadUIState();this.injectStyles();this.mountRoot();
    if(typeof SessionHostThemeSync==='function')this.hostThemeSync=new SessionHostThemeSync(this.config,this.appService,()=>this.getThemePalettes(),(m,e)=>this.log(m,e));
    if(typeof installSharedCredentialGuard==='function')this.removeCredentialGuard=installSharedCredentialGuard(this.profilesService,this.config);
    const listen=(stream,fn)=>{if(stream&&stream.subscribe)this.trackSubscription(stream.subscribe(fn));};
    listen(this.config&&this.config.ready$,()=>{this.loadUIState();void this.refreshAndRender();if(this.hostThemeSync)void this.hostThemeSync.initialize(this.themePreset).catch(e=>this.notify(e.message,'error'));});
    listen(this.config&&this.config.changed$,()=>{this.loadUIState();this.applyAppearance();this.scheduleRefresh();});
    for(const name of ['tabsChanged$','tabOpened$','tabClosed$'])listen(this.appService&&this.appService[name],()=>{this.refreshConnections(true);this.scheduleSearchTreeRefresh();});
    listen(this.appService&&this.appService.activeTabChange$,()=>this.handleActiveSessionChange());
    this.syncTimer=setInterval(()=>{this.refreshIfConfigChanged();this.updateUnifiedLogUI(false);},3000);
    if(this.hostThemeSync)void this.hostThemeSync.initialize(this.themePreset).catch(e=>this.notify(e.message,'error'));
    void this.refreshAndRender();
  }
  ngOnDestroy() {
    this.destroyed=true;clearTimeout(this.startTimer);clearTimeout(this.refreshTimer);clearTimeout(this.hideTimer);clearInterval(this.syncTimer);
    for(const s of this.subscriptions||[])try{s.unsubscribe();}catch{}
    for(const s of this.splitFocusSubscriptions?.values()||[])try{s.unsubscribe();}catch{}
    this.releaseSettingsController?.();this.removeCredentialGuard?.();this.hostThemeSync?.destroy();this.closeContextMenu();
    if(typeof document!=='undefined'){document.removeEventListener('mousemove',this.resizeMoveHandler);document.removeEventListener('mouseup',this.resizeEndHandler);this.getRoot()?.remove();document.getElementById(STYLE_ID)?.remove();document.body.classList.remove('tsm2-pinned','tsm2-resizing');document.body.style.removeProperty('--tsm2-width');}
  }
  trackSubscription(value) {if(value)(this.subscriptions||(this.subscriptions=[])).push(value);return value;}
  log(message,error) {if(typeof console!=='undefined'&&error)console.warn('[Session Suite]',message,error);}
  notify(message,kind='info') {this.statusMessage=String(message);this.statusKind=kind;const node=this.getRoot()?.querySelector('.tsm2-status');if(node){node.textContent=message;node.hidden=!message;node.dataset.kind=kind;}}
  runInZone(action) {return this.zone&&this.zone.run?this.zone.run(action):action();}
  getRoot() {return typeof document==='undefined'?null:document.getElementById(ROOT_ID);}
  clampWidth(value) {return Math.max(220,Math.min(Number(value)||280,typeof window==='undefined'?640:Math.max(220,window.innerWidth-200)));}
  getStateStore() {return this.config?.store?.sessionManager||null;}
  loadUIState() {
    const state=this.getStateStore()||{};this.sidebarWidth=this.clampWidth(state.sidebarWidth);this.sidebarFontSize=Math.max(11,Math.min(22,Number(state.sidebarFontSize)||13));this.isVisible=state.sidebarVisible!==false;this.dockMode=state.dockMode==='autohide'?'autohide':'pinned';
    this.themePreset=Object.hasOwn(this.getThemePalettes(),state.themePreset)?state.themePreset:'nocturneGlass';this.collapsedFolders=new Set(state.collapsedList||[]);
  }
  async saveUIState() {
    const target=this.getStateStore();if(!target)return;
    Object.assign(target,{sidebarWidth:this.sidebarWidth,sidebarVisible:this.isVisible,dockMode:this.dockMode,themePreset:this.themePreset,collapsedList:[...this.collapsedFolders]});await this.saveFeatureState();
  }
  scheduleRefresh() {clearTimeout(this.refreshTimer);this.refreshTimer=setTimeout(()=>{void this.refreshAndRender().catch(e=>this.notify(e.message,'error'));},40);}
  getConfigSignature() {
    const select=p=>[p.id,p.name,p.group,p.type,p.color,p.description,...['host','target','port','user','username','device','auth'].map(k=>p.options?.[k])];
    return JSON.stringify([(this.config?.store?.profiles||[]).map(select),this.config?.store?.groups||[],this.featureState().favoriteIds,this.featureState().recentConnections,this.featureState().confirmProfileIds]);
  }
  refreshIfConfigChanged() {const next=this.getConfigSignature();if(next!==this.configSignature){this.configSignature=next;this.scheduleRefresh();}}
  async refreshAndRender() {if(this.destroyed)return;const ticket=(this.refreshGeneration||0)+1;this.refreshGeneration=ticket;const [profiles,groups]=await Promise.all([this.loadProfiles(),this.loadGroups()]);if(this.destroyed||this.refreshGeneration!==ticket)return;this.profiles=profiles;this.groups=groups;this.treeModel=null;this.refreshConnections(false);this.configSignature=this.getConfigSignature();this.runInZone(()=>this.render());}
  async loadProfiles() {let list;try{list=await this.profilesService?.getProfiles?.({includeBuiltin:false});}catch{}const fallback=this.config?.store?.profiles||[];return (Array.isArray(list)&&list.length?list:fallback).filter(p=>p&&p.name&&!p.isTemplate);}
  async loadGroups() {let list;try{list=await this.profilesService?.getProfileGroups?.({includeNonUserGroup:false,includeProfiles:false});}catch{}const fallback=this.config?.store?.groups||[];return (Array.isArray(list)&&list.length?list:fallback).filter(g=>g&&g.id&&g.name);}
  makeId(prefix='session') {return prefix+':'+(typeof globalThis.crypto?.randomUUID==='function'?globalThis.crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));}
  clone(value) {return value==null?{}:JSON.parse(JSON.stringify(value));}
  validColor(value) {return /^#[0-9a-f]{6}$/i.test(String(value))?value:'#3b82f6';}
  groupId(value) {return value==null?'':String(value);}
  groupHasAncestor(id,wanted) {
    const seen=new Set(),byId=new Map((this.groups||[]).map(g=>[String(g.id),g]));
    for(let at=this.groupId(id);at&&!seen.has(at);){if(at===this.groupId(wanted))return true;seen.add(at);const g=byId.get(at);at=this.groupId(g?.parentGroupId||g?.parentId);}
    return false;
  }
  displayGroup(id) {
    const groups=this.groups||[],seen=new Set(),parts=[];let at=String(id||'');
    while(at&&!seen.has(at)){seen.add(at);const g=groups.find(x=>String(x.id)===at);if(!g)return parts.length?parts.join(' / '):at.replace(/[\\/]+/g,' / ');parts.unshift(g.name);at=String(g.parentGroupId||g.parentId||'');}return parts.join(' / ');
  }
  profileGroupChoices() {const rows=(this.groups||[]).map(g=>({value:String(g.id),label:this.displayGroup(g.id)})),counts=new Map();rows.forEach(r=>counts.set(r.label,(counts.get(r.label)||0)+1));return [{value:'',label:this.t('根目录（无分组）')},...rows.map(r=>counts.get(r.label)>1?{...r,label:r.label+' · '+r.value.slice(-6)}:r)];}
  moveDestinationOptions(exclude) {return this.profileGroupChoices().filter(g=>!exclude||!g.value||!this.groupHasAncestor(g.value,exclude));}
  hasNativePasswordStorage() {return typeof this.passwordStorage?.savePassword==='function';}
  async saveNativePassword(profile,password) {
    if(!password)return {ok:true,skipped:true};if(!this.hasNativePasswordStorage())return {ok:false,code:'PASSWORD_STORAGE_UNAVAILABLE'};
    if(!String(profile?.options?.user||'').trim())return {ok:false,code:'USERNAME_REQUIRED'};await this.passwordStorage.savePassword(profile,password);return {ok:true};
  }
  async writeProfile(profile,isNew=false) {
    const svc=this.profilesService;const op=isNew?svc?.newProfile:svc?.writeProfile;
    if(op)await op.call(svc,profile);else {const list=this.liveProfiles();const index=list.findIndex(p=>p.id===profile.id);if(index<0)list.push(profile);else list[index]=profile;this.config.store.profiles=list;}
    await this.saveFeatureState();
  }
  async cloneProfile(profile) {
    if(this.cloneInProgress)return;this.cloneInProgress=true;
    try{const source=suiteI18n.copyBase(profile,this.config),base=source.baseName||profile.name||this.t('会话');let n=0;const names=new Set(this.liveProfiles().flatMap(p=>[p.name,this.profileName(p)]));
      const suffix=(i,lang)=>suiteI18n.copySuffix(i,{store:{sessionManager:{language:lang}}});while(['zh-CN','en-US'].some(lang=>names.has(base+suffix(n,lang))))n++;
      const next=this.clone(profile);next.id=this.makeId(profile.type||'ssh');next.name=base+suiteI18n.copySuffix(n,this.config);next.sessionManagerGeneratedName={kind:'copy',baseName:base,savedName:next.name,sourceId:String(source.sourceId||profile.id),copyIndex:n};
      await this.writeProfile(next,true);await this.refreshAndRender();
    }finally{this.cloneInProgress=false;}
  }
  async deleteProfile(profile) {return this.deleteWithUndo([String(profile.id)],[]);}
  async deleteGroup(group) {return this.deleteWithUndo([],[String(group.id)]);}
  async openProfile(profile,request) {
    if(!profile)return null;this.pendingProfileOpens||=new Map();const key=String(profile.id);if(this.pendingProfileOpens.has(key))return null;
    const marker={};this.pendingProfileOpens.set(key,marker);try{return await this.openSingleProfile(profile,request);}finally{if(this.pendingProfileOpens.get(key)===marker)this.pendingProfileOpens.delete(key);}
  }
  forwardingType(value) {const text=String(value||'').toLowerCase();return /dynamic|socks/.test(text)?'Dynamic':/remote/.test(text)?'Remote':'Local';}
  normalizeForwardRule(raw) {const r=raw||{},type=this.forwardingType(r.type),host=String(r.host||r.listenAddress||r.sourceAddress||'127.0.0.1').trim(),port=Number(r.port??r.listenPort??r.sourcePort),targetAddress=String(r.targetAddress||r.targetHost||r.destinationAddress||r.destinationHost||'').trim(),targetPort=Number(r.targetPort??r.destinationPort??0);if(!Number.isInteger(port)||port<1||port>65535||!host||/[\x00-\x20]/.test(host)||type!=='Dynamic'&&(!targetAddress||!Number.isInteger(targetPort)||targetPort<1||targetPort>65535))return {error:this.t('端口配置无效。')};return {rule:{type,host,port,targetAddress:type==='Dynamic'?'':targetAddress,targetPort:type==='Dynamic'?0:targetPort,description:this.safeImportText(r.description||r.comment,512)}};}
  getForwardingRules(profile) {const rules=this.effectiveConnectionOptions(profile).forwardedPorts;return (Array.isArray(rules)?rules:[]).map(r=>this.normalizeForwardRule(r)).filter(r=>r.rule).map(r=>r.rule);}
  forwardingRuleKey(raw) {const r=this.normalizeForwardRule(raw).rule;if(!r)throw Error(this.t('端口配置无效。'));return JSON.stringify([r.type,r.host.toLowerCase(),r.port,r.targetAddress.toLowerCase(),r.targetPort]);}
  forwardingListenerKey(raw) {const r=this.normalizeForwardRule(raw).rule;if(!r)throw Error(this.t('端口配置无效。'));return JSON.stringify([r.type==='Remote'?'remote':'local',r.host.toLowerCase(),r.port]);}
  createPortConfigDocument(p) {return {format:'tabby-session-manager-port-forwarding',schemaVersion:1,exportedAt:new Date().toISOString(),source:{profileName:this.safeImportText(p.name,256),profileType:p.type||'ssh'},rules:this.getForwardingRules(p)};}
  async applyPortConfig(profile,rules,mode='add',onConflict='skip') {
    const live=this.profileById(profile.id);if(!live)throw Error(this.t('会话已被删除。'));
    const incoming=rules.map(r=>{const n=this.normalizeForwardRule(r);if(n.error)throw Error(n.error);return n.rule;}),next=mode==='replace'?[]:this.getForwardingRules(live);
    if(mode==='replace')for(let i=0;i<incoming.length;i++)if(incoming.slice(0,i).some(r=>this.forwardingListenersConflict(r,incoming[i])))throw Error(this.t('端口规则存在冲突。'));
    for(const rule of incoming){const collisions=next.filter(r=>this.forwardingListenersConflict(r,rule));if(collisions.length&&onConflict!=='replace')continue;for(const r of collisions)next.splice(next.indexOf(r),1);next.push(rule);}
    const copy=this.clone(live);copy.options={...copy.options,forwardedPorts:next};await this.writeProfile(copy);await this.refreshAndRender();return {count:next.length};
  }
  safeImportText(value,limit=4096) {return String(value??'').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').trim().slice(0,limit);}
  protocolToTabby(value) {const key=String(value||'ssh').toLowerCase().replace(/[ _-]/g,'');return ({ssh:'ssh',ssh1:'ssh',ssh2:'ssh',sshv1:'ssh',sshv2:'ssh',secureshell:'ssh',telnet:'telnet',local:'local',serial:'serial',com:'serial'})[key]||null;}
  safeProfileForBackup(profile) {return {sourceId:String(profile.id),name:this.safeImportText(profile.name,256),type:profile.type,color:this.validColor(profile.color),groupRef:String(profile.group||''),groupPath:this.displayGroup(profile.group),description:this.safeImportText(profile.description,2000),options:this.safeBackupOptions(profile.type,profile.options),favorite:this.isFavorite(profile.id),confirmBeforeConnect:this.productionRequired(profile)};}
  createBackupDocument() {return {format:'tabby-session-manager-backup',schemaVersion:2,createdAt:new Date().toISOString(),groups:(this.groups||[]).map(g=>({sourceId:String(g.id),name:g.name,parentSourceId:String(g.parentGroupId||g.parentId||'')})),profiles:(this.profiles||[]).map(p=>this.safeProfileForBackup(p))};}
  exportSafeBackup() {this.downloadTextFile('tabby-sessions.tsm-backup.json',JSON.stringify(this.createBackupDocument(),null,2));}
  normalizeImportRecord(input) {
    const r=input||{},o=r.options||{},type=this.protocolToTabby(r.type||r.protocol||'ssh'),name=this.safeImportText(r.name||r.sessionName||r.session_name||r.host||o.host,256),host=this.safeImportText(r.host||r.hostname||r.ip||r.address||o.host||o.target,512);
    const raw=r.port??o.port,port=raw==null||raw===''?(type==='ssh'?22:undefined):Number(raw);if(!type||!name||(['ssh','telnet'].includes(type)&&!host&&!r.allowEmptyHost)||port!==undefined&&(!Number.isInteger(port)||port<1||port>65535))return {error:this.t('名称为空或协议不受支持。')};
    return {profile:{name,type,host,port,username:this.safeImportText(r.username||r.user||o.user||o.username,256),groupPath:this.canonicalGroupPath(r.groupPath||r.folder||r.group||r.path),description:this.safeImportText(r.description||r.comment||r.remarks,2000),pendingHost:!host&&!!r.allowEmptyHost,color:this.validColor(r.color)}};
  }
  profileIdentityKey(p) {const o=p.options||{};return [p.type||'ssh',p.name,o.host||o.target||p.host,o.port??p.port,o.user||o.username||p.username].map(v=>String(v??'').trim().toLowerCase()).join('\u001f');}
  buildImportPlan(records,sourceLabel,groupPaths=[]) {
    const plan={sourceLabel,groupPaths:[...new Set(groupPaths)],entries:[],conflicts:[],invalid:[]},keys=new Set((this.profiles||[]).map(p=>this.profileIdentityKey(p)));
    (records||[]).slice(0,5000).forEach((r,index)=>{const item=r?.parseError?{error:r.parseError}:this.normalizeImportRecord(r);if(item.error){plan.invalid.push({index:index+1,message:(r?.sourceFile?r.sourceFile+'：':'')+item.error});return;}const key=this.profileIdentityKey(item.profile),entry={index:index+1,profile:item.profile,conflict:keys.has(key),sourceFile:this.safeImportText(r.sourceFile,256)};keys.add(key);plan.entries.push(entry);if(entry.conflict)plan.conflicts.push(entry);});return plan;
  }
  async ensureImportGroups(paths,added) {
    const resolved=new Map();for(const source of paths){const full=this.canonicalGroupPath(source);let parent='',at='';for(const name of full.split('/').filter(Boolean)){at=at?at+'/'+name:name;let group=this.liveGroups().find(g=>g.name===name&&String(g.parentGroupId||g.parentId||'')===parent);if(!group){group={id:this.makeId('group'),name,parentGroupId:parent||undefined};added.push(group.id);if(this.profilesService?.newProfileGroup)await this.profilesService.newProfileGroup(group,{genId:false});else this.config.store.groups=[...this.liveGroups(),group];}parent=String(group.id);resolved.set(at,parent);}}return {resolved};
  }
  async applyImportPlan(plan,mode='skip') {
    if(this.importInProgress)throw Error(this.t('已有导入正在进行。'));this.importInProgress=true;const added=[],created=[],outcomes=[],state=this.featureState();const favoriteBefore=[...(state.favoriteIds||[])],confirmBefore=[...(state.confirmProfileIds||[])];
    try {
      const groupResult=plan.preparedGroups instanceof Map?{resolved:plan.preparedGroups}:plan.backupGroups?await this.ensureBackupGroups(plan.backupGroups,added):await this.ensureImportGroups((plan.groupPaths||[]).concat((plan.entries||[]).map(e=>e.profile.groupPath)),added);
      const resolved=groupResult.resolved||new Map(),keys=new Set(this.liveProfiles().map(p=>this.profileIdentityKey(p)));
      for(const entry of plan.entries||[]){const p=entry.profile,key=this.profileIdentityKey(p);if(mode==='skip'&&keys.has(key)){outcomes.push({index:entry.index,status:'skipped'});continue;}const profile={id:this.makeId(p.type+':import'),type:p.type,name:p.name,color:p.color,description:p.description,group:resolved.get(p.groupRef)||resolved.get(p.groupPath)||undefined,options:p.backupOptions?this.clone(p.backupOptions):{host:p.host,port:p.port,user:p.username}};
        if(p.pendingHost)profile.description='【待补充主机】'+(profile.description||'');
        if(keys.has(key)){profile.name+='（导入副本）';profile.sessionManagerGeneratedName={kind:'import',baseName:p.name,savedName:profile.name};}
        created.push(profile.id);if(this.profilesService?.newProfile)await this.profilesService.newProfile(profile);else this.config.store.profiles=[...this.liveProfiles(),profile];
        if(p.favorite)state.favoriteIds=[...(state.favoriteIds||[]),profile.id];if(p.confirmBeforeConnect)state.confirmProfileIds=[...(state.confirmProfileIds||[]),profile.id];keys.add(key);outcomes.push({index:entry.index,status:'success'});
      }
      try{await this.saveFeatureState();}catch(e){e.tsmPersistenceFailure=true;throw e;}
      await this.refreshAndRender();return {imported:created.length,outcomes,resolved};
    }catch(e){this.config.store.profiles=this.liveProfiles().filter(p=>!created.includes(p.id));const used=new Set(this.liveProfiles().map(p=>String(p.group||'')));this.config.store.groups=this.liveGroups().filter(g=>!added.includes(g.id)||used.has(String(g.id)));state.favoriteIds=(state.favoriteIds||[]).filter(id=>!created.includes(id));state.confirmProfileIds=(state.confirmProfileIds||[]).filter(id=>!created.includes(id));try{await this.saveFeatureState();}catch{}throw e;}finally{this.importInProgress=false;}
  }
  async restoreBackupFromFile() {const files=await this.chooseLocalFiles({accept:'.json'});if(files.length)this.showImportPreview(this.buildBackupImportPlan(JSON.parse(await this.readLocalText(files[0]))));}
  detectCsvDelimiter(text) {const counts=new Map([[',',0],[';',0],['\t',0]]);let quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"')i++;else quoted=!quoted;}else if(!quoted){if(c==='\r'||c==='\n')break;if(counts.has(c))counts.set(c,counts.get(c)+1);}}return [...counts].sort((a,b)=>b[1]-a[1])[0][0];}
  parseDelimitedText(text,separator) {
    const rows=[],line=[];let cell='',quoted=false;const commit=()=>{line.push(cell);cell='';};
    for(let i=0;i<String(text).length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(!quoted&&c===separator)commit();else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;commit();if(line.some(Boolean))rows.push(line.splice(0));else line.length=0;}else cell+=c;}
    if(quoted)throw Error(this.t('CSV 引号未闭合。'));commit();if(line.some(Boolean))rows.push(line);return rows;
  }
  csvHeaderKey(value) {const key=String(value).replace(/^\uFEFF/,'').trim().toLowerCase().replace(/[ _-]/g,'');return ({sessionname:'name',会话名称:'name',名称:'name',hostname:'host',主机:'host',地址:'host',ip:'host',username:'user',用户名:'user',端口:'port',protocol:'type',协议:'type',分组:'folder',目录:'folder',备注:'description'})[key]||key;}
  parseCsvRecords(text) {const rows=this.parseDelimitedText(text,this.detectCsvDelimiter(text)),headers=(rows.shift()||[]).map(k=>this.csvHeaderKey(k));return rows.map(row=>Object.fromEntries(headers.map((k,i)=>[k,row[i]||''])));}
  async importCsvFromFile() {const files=await this.chooseLocalFiles({accept:'.csv,.txt'});if(files.length)this.showImportPreview(this.buildImportPlan(this.parseCsvRecords(await this.readLocalText(files[0])),files[0].name));}
  decodeSecureCRTString(value) {return String(value??'').replace(/\\([0-7]{3})/g,(_,n)=>String.fromCharCode(parseInt(n,8))).replace(/\\"/g,'"').replace(/\\\\/g,'\\');}
  parseSecureCRTIni(text,fileName,relativePath) {
    const data=Object.create(null);for(const line of text.split(/\r?\n/)){const match=line.match(/^([SD]):"([^"]+)"=(.*)$/);if(match)data[match[2]]={type:match[1],value:match[3]};}
    const get=k=>this.decodeSecureCRTString(data[k]?.value||''),numeric=k=>parseInt(data[k]?.value||'0',16);return {name:String(fileName).replace(/\.ini$/i,''),host:get('Hostname'),port:numeric('[SSH2] Port')||numeric('Port')||numeric('[Telnet] Port')||22,user:get('Username'),protocol:get('Protocol Name')||'ssh',folder:String(relativePath||'').split(/[\\/]/).slice(0,-1).join('/')};
  }
  async importSecureCrtIniDirectory() {
    const files=await this.chooseLocalFiles({directory:true});const records=[];for(const file of files.filter(f=>/\.ini$/i.test(f.name)&&!/^__FolderData__\.ini$/i.test(f.name))){try{records.push({...this.parseSecureCRTIni(await this.readLocalText(file),file.name,file.webkitRelativePath),sourceFile:file.webkitRelativePath||file.name});}catch(e){records.push({parseError:e.message,sourceFile:file.name});}}this.showImportPreview(this.buildImportPlan(records,'SecureCRT'));
  }
  parseXshellXsh(text,fileName,relativePath) {
    const values=Object.create(null);for(const line of text.split(/\r?\n/)){const m=line.match(/^([^;#=\[]+)=(.*)$/);if(m)values[m[1].trim().toLowerCase()]=m[2].trim();}
    let host=values.host||'';const parts=host.match(/^\[([^\]]+)\]:(\d+)$/)||host.match(/^([^:]+):(\d+)$/);if(parts)host=parts[1];return {name:String(fileName).replace(/\.xsh$/i,''),host,port:Number(values.port)||(parts?Number(parts[2]):22),user:values.username||'',protocol:values.protocol||'ssh',allowEmptyHost:true,folder:String(relativePath||'').split(/[\\/]/).slice(0,-1).join('/')};
  }
  async importXshellXshFiles(files,label) {const records=[];for(const f of files.filter(f=>/\.xsh$/i.test(f.name))){try{records.push({...this.parseXshellXsh(await this.readLocalText(f),f.name,f.webkitRelativePath),sourceFile:f.webkitRelativePath||f.name});}catch(e){records.push({parseError:e.message,sourceFile:f.name});}}this.showImportPreview(this.buildImportPlan(records,label||'Xshell'));}
  async importXshellXshFilePicker() {return this.importXshellXshFiles(await this.chooseLocalFiles({multiple:true,accept:'.xsh'}));}
  async importXshellXshDirectory() {return this.importXshellXshFiles(await this.chooseLocalFiles({directory:true}));}

  _el(tag,cls,text) {const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=String(text);return e;}
  mountRoot() {if(!this.getRoot()){const root=this._el('section');root.id=ROOT_ID;document.body.append(root);}this.updateLayout();}
  updateLayout() {const root=this.getRoot();if(!root)return;const pinned=this.isVisible&&this.dockMode==='pinned';document.body.classList.toggle('tsm2-pinned',pinned);document.body.style.setProperty('--tsm2-width',this.sidebarWidth+'px');root.style.width=this.sidebarWidth+'px';root.style.setProperty('--tsm2-font-size',(this.sidebarFontSize||13)+'px');root.style.setProperty('--tsm2-row-height',Math.max(30,Math.ceil((this.sidebarFontSize||13)*2.3))+'px');root.style.setProperty('--tsm2-window-height',Math.max(62,Math.ceil((this.sidebarFontSize||13)*4.8))+'px');root.hidden=!this.isVisible;root.dataset.dock=this.dockMode;root.dataset.open=String(pinned||!!this.isDrawerOpen);}
  injectStyles() {let node=document.getElementById(STYLE_ID);if(!node){node=this._el('style');node.id=STYLE_ID;document.head.append(node);}node.textContent=SESSION_STYLES;}
  createButton(label,title,action,cls) {const b=document.createElement('button');b.type='button';b.className=cls||'tsm2-icon';b.textContent=label;if(title){b.title=title;b.setAttribute('aria-label',title);}b.addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();if(b.disabled)return;b.disabled=true;try{await action(e);}catch(error){this.log(this.t('执行操作失败'),error);this.notify(this.t('操作失败：')+this.t(error.message),'error');}finally{b.disabled=false;}});return b;}
  createSvgButton(paths,title,action) {const b=this.createButton('',title,action),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');for(const d of paths){const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',d);svg.append(p);}b.append(svg);return b;}
  render() {
    const root=this.getRoot();if(!root)return;const y=root.querySelector('.tsm2-tree')?.scrollTop||0;root.replaceChildren();this.applyThemeToSurface(root);const panel=this._el('div','tsm2-panel'),header=this._el('header','tsm2-header');header.append(this._el('strong','tsm2-title',this.t('会话管理器')));
    header.append(this.createSvgButton(['M8 3h8v6l3 5H5l3-5z M12 14v7'],this.t(this.dockMode==='pinned'?'固定':'浮动'),()=>this.toggleDockMode()),this.createSvgButton(['M4 6h16 M4 12h16 M4 18h16 M8 3v6 M16 9v6 M10 15v6'],this.t('数据管理'),()=>this.showDataManagementDialog()),this.createButton('+',this.t('新建'),e=>this.showMenu(e.clientX,e.clientY,[{label:this.t('新建会话'),action:()=>this.createNativeProfile('')},{label:this.t('新建独立目录'),action:()=>this.showGroupDialog(null)}])),this.createButton('⋯',this.t('设置'),e=>this.showMenu(e.clientX,e.clientY,[{label:this.t('端口转发检查'),action:()=>this.showForwardCheckDialog()},{label:this.t('批量管理会话'),action:()=>this.showBulkManager()},{label:this.t('查看最近导入报告'),action:()=>this.showImportReport(this.lastImportReport)},{label:this.t('清空最近连接'),action:()=>this.clearRecentConnections()},{label:this.t('风格主题'),action:()=>this.showAppearanceDialog()},{label:this.t('刷新会话列表'),action:()=>this.refreshAndRender()},{label:this.t('隐藏会话管理器'),action:()=>this.toggleVisibility()}])));
    panel.append(header);const wrap=this._el('div','tsm2-search-wrap'),search=this.input('search',this.searchQuery);search.className='tsm2-search';search.placeholder=this.t('搜索名称、主机或用户名');search.addEventListener('compositionstart',()=>this.isSearchComposing=true);search.addEventListener('compositionend',()=>{this.isSearchComposing=false;this.searchQuery=search.value;this.refreshSearchTree();});search.addEventListener('input',()=>{this.searchQuery=search.value;if(!this.isSearchComposing)this.scheduleSearchTreeRefresh();});wrap.append(search);panel.append(wrap);this.renderFeatureBar(panel);
    const tree=this._el('div','tsm2-tree');panel.append(tree);this.renderTree(tree,this.buildTree());tree.scrollTop=y;const status=this._el('div','tsm2-status',this.statusMessage||'');status.hidden=!this.statusMessage;status.dataset.kind=this.statusKind||'info';panel.append(status);this.renderCurrentLogPanel(panel);const resize=this._el('div','tsm2-resize');resize.addEventListener('mousedown',e=>this.startResize(e));panel.append(resize);root.append(panel);
    panel.addEventListener('mouseenter',()=>clearTimeout(this.hideTimer));panel.addEventListener('mouseleave',()=>{if(this.dockMode==='autohide')this.hideTimer=setTimeout(()=>this.closeDrawer(),240);});if(this.dockMode==='autohide')root.append(this.createButton('›',this.t('会话管理器'),()=>this.openDrawer(),'tsm2-show'));this.updateLayout();this.applyAppearance();
  }
  scheduleSearchTreeRefresh() {if(this.searchRefreshFrame)return;const run=()=>{this.searchRefreshFrame=null;this.refreshSearchTree();};this.searchRefreshFrame=typeof requestAnimationFrame==='function'?requestAnimationFrame(run):setTimeout(run,0);}
  refreshSearchTree() {const node=this.getRoot()?.querySelector('.tsm2-tree');if(node){const y=node.scrollTop;this.renderTree(node,this.buildTree());node.scrollTop=y;}const panel=this.getRoot()?.querySelector('.tsm2-current-log');if(panel)this.fillCurrentLogPanel(panel);}
  refreshTreeContent(container) {this.renderTree(container||this.getRoot()?.querySelector('.tsm2-tree'),this.buildTree());}
  toggleVisibility() {this.isVisible=!this.isVisible;this.isDrawerOpen=this.isVisible;void this.saveUIState();this.render();}
  toggleDockMode() {this.dockMode=this.dockMode==='pinned'?'autohide':'pinned';this.isDrawerOpen=true;void this.saveUIState();this.render();}
  openDrawer() {this.isVisible=true;this.isDrawerOpen=true;this.updateLayout();}
  closeDrawer() {this.isDrawerOpen=false;this.updateLayout();}
  startResize(e) {e.preventDefault();this.isResizing=true;this.resizeStartX=e.clientX;this.resizeStartWidth=this.sidebarWidth;this.resizeMoveHandler=e=>this.onResizeMove(e);this.resizeEndHandler=()=>void this.stopResize();document.addEventListener('mousemove',this.resizeMoveHandler);document.addEventListener('mouseup',this.resizeEndHandler,{once:true});}
  onResizeMove(e) {if(this.isResizing){this.sidebarWidth=this.clampWidth(this.resizeStartWidth+e.clientX-this.resizeStartX);this.updateLayout();}}
  async stopResize() {if(typeof document!=='undefined'){document.removeEventListener('mousemove',this.resizeMoveHandler);document.removeEventListener('mouseup',this.resizeEndHandler);}if(!this.isResizing)return;this.isResizing=false;await this.saveUIState();}
  buildTree() {
    if(this.treeModel)return this.treeModel;const root={key:'root',name:'',path:'',children:[],profiles:[]},nodes=new Map();for(const g of this.groups||[])nodes.set(String(g.id),{key:'group:'+g.id,groupId:String(g.id),group:g,name:g.name,path:this.displayGroup(g.id),profiles:[],children:[]});
    for(const node of nodes.values()){let parent=nodes.get(String(node.group.parentGroupId||node.group.parentId||''));if(parent===node||parent&&this.groupHasAncestor(parent.groupId,node.groupId))parent=null;(parent||root).children.push(node);node.parent=parent||root;}
    for(const p of this.profiles||[]){let node=nodes.get(String(p.group||''));if(!node&&p.group){let at=root,path='';for(const name of String(p.group).split(/[\\/]/).filter(Boolean)){path=path?path+'/'+name:name;let child=at.children.find(n=>!n.group&&n.name===name);if(!child){child={key:'path:'+path,name,path,profiles:[],children:[],parent:at};at.children.push(child);}at=child;}node=at;}(node||root).profiles.push(p);}
    const sort=n=>{n.profiles.sort((a,b)=>Number(this.isFavorite(b.id))-Number(this.isFavorite(a.id))||this.profileName(a).localeCompare(this.profileName(b)));n.children.sort((a,b)=>a.name.localeCompare(b.name));n.children.forEach(sort);};sort(root);return this.treeModel=root;
  }
  profileMatches(p) {const text=[this.profileName(p),p.description,p.options?.host,p.options?.target,p.options?.user,p.options?.username,this.displayGroup(p.group)].join(' ').toLocaleLowerCase();return String(this.searchQuery||'').toLocaleLowerCase().trim().split(/\s+/).every(q=>text.includes(q));}
  buildTreeView(root) {const map=new Map();const visit=n=>{const profiles=n.profiles.filter(p=>!this.searchQuery||this.profileMatches(p));let count=profiles.length;n.children.forEach(c=>{visit(c);count+=map.get(c).count;});map.set(n,{profiles,count,matches:count>0});};visit(root);return map;}
  flattenTreeRows(root,view) {const rows=[];const visit=(n,depth)=>{const state=view.get(n);if(this.searchQuery&&!state?.matches)return;const collapsed=this.collapsedFolders.has(n.key)&&!this.searchQuery;rows.push({kind:'folder',node:n,depth,count:state?.count||0,collapsed});if(!collapsed){n.children.forEach(c=>visit(c,depth+1));state.profiles.forEach(profile=>rows.push({kind:'profile',profile,depth:depth+1,parentNode:n}));}};root.children.forEach(n=>visit(n,0));view.get(root).profiles.forEach(profile=>rows.push({kind:'profile',profile,depth:0,parentNode:root}));return rows;}
  renderTree(container,root) {if(!container)return;container.replaceChildren();let rows=this.viewMode&&this.viewMode!=='all'?this.filteredFeatureProfiles().map(profile=>({kind:'profile',profile,depth:0})):this.flattenTreeRows(root,this.buildTreeView(root));rows=this.expandWindowRows(rows);if(!rows.length)container.append(this._el('div','tsm2-empty',this.t('此视图暂无匹配会话。')));else this.renderVirtualTree(container,rows);}
  appendTreeRow(container,item) {if(item.kind==='window')return this.renderWindowRow(container,item);if(item.kind==='profile')return this.renderProfile(container,item.profile,item.depth,item.parentNode);const row=this._el('div','tsm2-folder');row.style.paddingLeft=(8+item.depth*13)+'px';row.append(this._el('span','tsm2-arrow',item.collapsed?'▸':'▾'),this._el('span','tsm2-folder-name',item.node.name),this._el('small','tsm2-folder-count',item.count));row.addEventListener('click',()=>{this.collapsedFolders.has(item.node.key)?this.collapsedFolders.delete(item.node.key):this.collapsedFolders.add(item.node.key);void this.saveUIState();this.refreshSearchTree();});row.addEventListener('contextmenu',e=>{e.preventDefault();this.showFolderMenu(e.clientX,e.clientY,item.node);});container.append(row);}
  renderVirtualTree(container,rows) {if(rows.length<250){rows.forEach(r=>this.appendTreeRow(container,r));return;}const offsets=[0];rows.forEach(r=>offsets.push(offsets.at(-1)+(r.kind==='window'?Math.max(62,Math.ceil((this.sidebarFontSize||13)*4.8)):Math.max(30,Math.ceil((this.sidebarFontSize||13)*2.3)))));const frame=this._el('div');frame.style.cssText='position:relative;height:'+offsets.at(-1)+'px';container.append(frame);const paint=()=>{const top=Math.max(0,container.scrollTop-240),bottom=container.scrollTop+(container.clientHeight||600)+240;frame.replaceChildren();let start=0;while(start<rows.length&&offsets[start+1]<top)start++;for(let i=start;i<rows.length&&offsets[i]<bottom;i++){const slot=this._el('div');slot.style.cssText='position:absolute;left:0;right:0;top:'+offsets[i]+'px;height:'+(offsets[i+1]-offsets[i])+'px';this.appendTreeRow(slot,rows[i]);frame.append(slot);}};container.onscroll=paint;paint();}
  renderProfile(container,p,depth=0) {const row=this._el('div','tsm2-profile'+(String(p.id)===this.activeProfileId?' active':''));row.dataset.profileId=String(p.id);row.style.paddingLeft=(8+depth*13)+'px';if(this.connectionMap?.get(String(p.id))?.length)row.append(this.createButton(this.expandedWindowProfiles?.has(String(p.id))?'▾':'▸',this.t('展开或收起已打开窗口'),()=>{this.expandedWindowProfiles||=new Set();this.expandedWindowProfiles.has(String(p.id))?this.expandedWindowProfiles.delete(String(p.id)):this.expandedWindowProfiles.add(String(p.id));this.refreshSearchTree();}));const dot=this._el('span','tsm2-dot');dot.style.backgroundColor=this.validColor(p.color);row.append(dot,this._el('span','tsm2-profile-name',(this.isFavorite(p.id)?'★ ':'')+(this.productionRequired(p)?'◆ ':'')+this.profileName(p)),this._el('small','tsm2-connection-badge',this.connectionLabel(p)),this._el('small','tsm2-type',String(p.type).toUpperCase()),this.createButton('⋮',this.t('会话操作'),e=>this.showProfileMenu(e.clientX,e.clientY,p)));row.addEventListener('click',e=>{if(e.detail>1)return;this.activeProfileId=String(p.id);void this.openProfile(p);});row.addEventListener('contextmenu',e=>{e.preventDefault();this.showProfileMenu(e.clientX,e.clientY,p);});container.append(row);}
  renderProfileDetails(parent) {const box=this._el('div','tsm2-details'),current=this.currentLoggingTab(),p=current?.profile||this.profiles.find(p=>String(p.id)===this.activeProfileId);if(!p){box.textContent=this.t('未选择会话');parent.append(box);return;}const o=this.effectiveConnectionOptions(p),table=this._el('div','tsm2-details-table');for(const [key,value]of [[this.t('名称'),this.profileName(p)+(current?this.t(' · 窗口 ')+this.windowNumber(current):'')],[this.t('连接地址'),(o.user?o.user+'@':'')+(o.host||o.target||o.device||'—')+(o.port?':'+o.port:'')],[this.t('协议'),p.type.toUpperCase()],[this.t('分组'),this.displayGroup(p.group)||this.t('未分组')],[this.t('认证'),o.auth||this.t('默认')]]){const row=this._el('div','tsm2-details-row');row.append(this._el('span','tsm2-details-key',key),this._el('span','tsm2-details-value',value));table.append(row);}box.append(table);parent.append(box);}
  createOverlay(title) {const overlay=this._el('div','tsm2-overlay'),dialog=this._el('section','tsm2-dialog');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label',title);dialog.append(this._el('div','tsm2-dialog-header',title));overlay.append(dialog);this.applyThemeToSurface(overlay);document.body.append(overlay);let done;const closed=new Promise(r=>done=r),observer=new MutationObserver(()=>{if(!overlay.isConnected){observer.disconnect();done();}});observer.observe(document.body,{childList:true});overlay.addEventListener('mousedown',e=>{if(e.target===overlay)overlay.remove();});return {overlay,dialog,closed};}
  addField(parent,label,control) {const box=this._el('label','tsm2-field');box.append(this._el('span',null,label),control);parent.append(box);return control;}
  input(type,value='') {const node=document.createElement('input');node.type=type;node.value=value??'';return node;}
  select(choices,value) {const e=document.createElement('select');for(const c of choices){const option=document.createElement('option');option.value=c.value;option.textContent=c.label;e.append(option);}e.value=value??'';return e;}
  inlineDialogError(parent,message) {let e=parent.querySelector('.tsm2-error');if(!e){e=this._el('div','tsm2-error');parent.prepend(e);}e.textContent=message;}
  _dialog(title) {const ref=this.createOverlay(title),body=this._el('div','tsm2-dialog-body'),footer=this._el('div','tsm2-dialog-footer');ref.dialog.append(body,footer);footer.append(this.createButton(this.t('关闭'),this.t('关闭'),()=>ref.overlay.remove(),'tsm2-secondary'));return {...ref,body,footer};}
  prompt(title,label,value='') {return new Promise(resolve=>{const ref=this._dialog(title),input=this.addField(ref.body,label,this.input('text',value));ref.closed.then(()=>resolve(null));ref.footer.prepend(this.createButton(this.t('保存'),this.t('保存'),()=>{resolve(input.value);ref.overlay.remove();},'tsm2-primary'));setTimeout(()=>input.focus(),0);});}
  confirm(title,message,label) {return new Promise(resolve=>{const ref=this._dialog(title);ref.body.append(this._el('p',null,message));ref.closed.then(()=>resolve(false));ref.footer.prepend(this.createButton(label||this.t('确认'),label||this.t('确认'),()=>{resolve(true);ref.overlay.remove();},'tsm2-danger'));});}
  closeContextMenu() {for(const t of this.currentMenu?.timers||[])clearTimeout(t);for(const e of this.currentMenu?.elements||[])e.remove();if(this.currentMenu?.removeListener)document.removeEventListener('mousedown',this.currentMenu.removeListener,true);this.currentMenu=null;}
  createContextMenu(x,y) {const e=this._el('div','tsm2-menu');this.applyThemeToSurface(e);document.body.append(e);e.style.left=Math.max(4,Math.min(x,window.innerWidth-260))+'px';e.style.top=Math.max(4,Math.min(y,window.innerHeight-120))+'px';return e;}
  appendContextMenuItems(menu,items) {const ctx=this.currentMenu;for(const item of items){const b=this.createButton(item.label,item.label,()=>{if(item.children)return this.showSubmenu(menu,b,item.children,true);this.closeContextMenu();return item.action?.();},item.danger?'tsm2-menu-item danger':'tsm2-menu-item');b.disabled=!!item.disabled;menu.append(b);let delay,leave,inside=false;const clear=()=>{for(const c of [...ctx.elements])if(c._parentMenu===menu){c.remove();ctx.elements.splice(ctx.elements.indexOf(c),1);}};b.addEventListener('mouseenter',()=>{inside=true;b._pointerInside=true;menu._submenuOwner=b;clearTimeout(leave);clear();if(item.children){delay=setTimeout(()=>{if(inside&&this.currentMenu===ctx)void this.showSubmenu(menu,b,item.children);},160);ctx.timers.add(delay);}});b.addEventListener('mouseleave',()=>{inside=false;b._pointerInside=false;b._request=null;clearTimeout(delay);leave=setTimeout(()=>{if(!b._childInside)clear();},180);ctx.timers.add(leave);});}const r=menu.getBoundingClientRect();if(r.right>window.innerWidth)menu.style.left=Math.max(4,window.innerWidth-r.width-4)+'px';if(r.bottom>window.innerHeight)menu.style.top=Math.max(4,window.innerHeight-r.height-4)+'px';}
  showMenu(x,y,items) {this.closeContextMenu();const ctx={elements:[],timers:new Set()};this.currentMenu=ctx;const menu=this.createContextMenu(x,y);ctx.elements.push(menu);this.appendContextMenuItems(menu,items);ctx.removeListener=e=>{if(!ctx.elements.some(n=>n.contains(e.target)))this.closeContextMenu();};document.addEventListener('mousedown',ctx.removeListener,true);return menu;}
  async showSubmenu(parent,b,children,force=false) {if(force)parent._submenuOwner=b;const ctx=this.currentMenu;if(!ctx)return;const token={};b._request=token;const items=typeof children==='function'?await children():children;if(this.currentMenu!==ctx||b._request!==token||!b.isConnected||parent._submenuOwner!==b||!force&&!b._pointerInside)return;for(const old of [...ctx.elements])if(old._parentMenu===parent){old.remove();ctx.elements.splice(ctx.elements.indexOf(old),1);}const r=b.getBoundingClientRect(),menu=this.createContextMenu(r.right+3,r.top);menu._parentMenu=parent;ctx.elements.push(menu);menu.addEventListener('mouseenter',()=>b._childInside=true);menu.addEventListener('mouseleave',()=>{b._childInside=false;const t=setTimeout(()=>{if(!b._childInside&&!b._pointerInside)menu.remove();},180);ctx.timers.add(t);});this.appendContextMenuItems(menu,items);const bounds=menu.getBoundingClientRect();if(bounds.right>window.innerWidth)menu.style.left=Math.max(4,r.left-bounds.width-3)+'px';return menu;}
  showProfileMenu(x,y,p) {return this.showMenu(x,y,[{label:this.t('连接'),action:()=>this.openProfile(p)},{label:this.t('编辑会话'),action:()=>this.editProfile(p)},{label:this.t(this.isFavorite(p.id)?'取消收藏':'收藏并置顶'),action:()=>this.toggleFavorite(p)},{label:this.t('切换到已打开窗口'),action:()=>this.showOpenWindows(p)},{label:this.t(this.productionRequired(p)?'关闭生产连接确认':'开启生产连接确认'),action:()=>this.toggleProduction(p)},{label:this.t('端口配置'),children:()=>this.getPortConfigMenuItems(p)},{label:this.t('会话日志'),children:()=>this.getProfileLogMenuItems(p)},{label:this.t('移动会话'),action:()=>this.showMoveProfileDialog(p)},{label:this.t('复制会话'),action:()=>this.cloneProfile(p)},this.viewMode==='recent'?{label:this.t('移除最近记录'),action:()=>this.removeRecentConnection(p.id)}:{label:this.t('删除会话'),danger:true,action:()=>this.deleteProfile(p)}]);}
  showFolderMenu(x,y,node) {return this.showMenu(x,y,[{label:this.t('新建会话'),action:()=>this.createNativeProfile(node.groupId||node.path||'')},{label:this.t('新建子分组'),action:()=>this.showGroupDialog(node)},{label:this.t('移动目录'),disabled:!node.group,action:()=>this.showMoveGroupDialog(node.group)},{label:this.t('重命名分组'),disabled:!node.group,action:()=>this.renameGroup(node.group)},{label:this.t('删除分组及会话'),danger:true,disabled:!node.group,action:()=>this.deleteGroup(node.group)}]);}
  async editProfile(profile,draft) {const live=this.clone(this.profileById(profile.id)||profile),provider=this.profilesService?.providerForProfile?.(live);if(!provider||!this.ngbModal||!tabbySettings?.EditProfileModalComponent)return this.showProfileDialog(draft||live,live.group||'');let modal;try{modal=this.ngbModal.open(tabbySettings.EditProfileModalComponent,{size:'lg'});}catch{return this.showProfileDialog(draft||live,live.group||'');}Object.assign(modal.componentInstance,{partialProfile:this.clone(draft||live),profileProvider:provider});const result=await modal.result.catch(()=>null);if(!result)return this.refreshAndRender();try{result.type=provider.id;await this.guardedWriteProfile(result,live);await this.refreshAndRender();}catch(error){this.showEditDraftRecovery(result,live,error);}}
  createProfileGroupPicker(value) {const options=this.profileGroupChoices(),input=this.input('text',this.displayGroup(value)),list=this._el('datalist');list.id=this.makeId('groups');options.forEach(o=>{const e=this._el('option');e.value=o.label;list.append(e);});input.setAttribute('list',list.id);return {input,list,options,initialText:input.value};}
  resolveProfileGroupPicker(value,picker,original='') {const text=String(value||'').trim();if(!text)return '';if(text===picker.initialText)return original;const match=picker.options.find(o=>o.label===text);return match?match.value:text;}
  showMoveDestinationDialog(title,subject,current,choices,onMove) {const ref=this._dialog(title);ref.body.append(this._el('p',null,subject));const dest=this.addField(ref.body,this.t('目标目录'),this.select(choices,current));ref.footer.prepend(this.createButton(this.t('移动'),this.t('确认移动'),async()=>{await onMove(dest.value);ref.overlay.remove();await this.refreshAndRender();},'tsm2-primary'));return ref;}
  showMoveProfileDialog(p) {return this.showMoveDestinationDialog(this.t('移动会话'),this.profileName(p),p.group||'',this.moveDestinationOptions(),async group=>{const live=this.profileById(p.id);if(!live)throw Error(this.t('会话已被删除。'));await this.writeProfile({...this.clone(live),group:group||undefined});});}
  showMoveGroupDialog(g) {return this.showMoveDestinationDialog(this.t('移动目录'),g.name,g.parentGroupId||'',this.moveDestinationOptions(g.id),async parent=>{if(parent&&this.groupHasAncestor(parent,g.id))throw Error(this.t('不能移动到自身或子目录。'));const live=this.liveGroups().find(x=>x.id===g.id);if(live){live.parentGroupId=parent||undefined;delete live.parentId;await this.saveFeatureState();}});}
  async renameGroup(g) {const name=await this.prompt(this.t('重命名分组'),this.t('名称'),g.name);if(name?.trim()){const live=this.liveGroups().find(x=>x.id===g.id);if(live){live.name=name.trim();await this.saveFeatureState();await this.refreshAndRender();}}}
  showGroupDialog(parent) {const ref=this._dialog(this.t('新建独立目录')),name=this.addField(ref.body,this.t('名称'),this.input('text',''));ref.footer.prepend(this.createButton(this.t('保存'),this.t('保存'),async()=>{if(!name.value.trim())return;const g={id:this.makeId('group'),name:name.value.trim(),parentGroupId:parent?.groupId||undefined};if(this.profilesService?.newProfileGroup)await this.profilesService.newProfileGroup(g,{genId:false});else this.config.store.groups=[...this.liveGroups(),g];await this.saveFeatureState();ref.overlay.remove();await this.refreshAndRender();},'tsm2-primary'));return ref;}
  async createNativeProfile(group='',draft=null) {
    this.closeContextMenu();
    if(!this.profilesService?.providerForProfile||!this.ngbModal||!tabbySettings?.EditProfileModalComponent){this.notify(this.t('无法打开 Tabby 原生会话编辑器。'),'error');return;}
    let candidate=draft?this.clone(draft):null;
    try {
      if(!candidate){
        let templates=[];
        if(this.selector?.show&&this.profilesService.getProfiles){
          const profiles=await this.profilesService.getProfiles();
          templates=profiles.filter(p=>p.isTemplate&&this.profilesService.providerForProfile(p));
        }
        let template;
        if(templates.length>1){
          template=await this.selector.show(this.t('选择会话协议'),templates.map(p=>({name:p.name,icon:p.icon||undefined,result:p}))).catch(()=>null);
          if(!template)return;
        }else template=templates[0];
        candidate=template?this.clone(template):{type:'ssh',options:{}};
        delete candidate.id;delete candidate.sessionManagerGeneratedName;
        candidate.name='';candidate.isBuiltin=false;candidate.isTemplate=false;
        // An explicitly empty group prevents template/global defaults assigning a group.
        candidate.group=String(group||'');
      }
      const provider=this.profilesService.providerForProfile(candidate);
      if(!provider)throw Error(this.t('无法打开 Tabby 原生会话编辑器。'));
      const modal=this.ngbModal.open(tabbySettings.EditProfileModalComponent,{size:'lg'});
      Object.assign(modal.componentInstance,{partialProfile:this.clone(candidate),profileProvider:provider});
      const result=await modal.result.catch(()=>null);
      if(!result)return;
      result.type=provider.id;delete result.id;result.isBuiltin=false;result.isTemplate=false;
      if(!String(result.name||'').trim()){
        const effective=this.profilesService.getConfigProxyForProfile?.(result)||result;
        result.name=provider.getSuggestedName?.(effective)||this.t('会话');
      }
      try {
        await this.writeNewNativeProfile(result);
        await this.refreshAndRender();
      }catch(error){this.showNativeCreateRecovery(result,error);}
    }catch(error){this.notify(this.t(error.message),'error');}
  }
  async writeNewNativeProfile(result) {
    const ids=new Set(this.liveProfiles().map(p=>String(p.id)));
    if(!this.profilesService?.newProfile)result.id=this.makeId(result.type);
    try {await this.writeProfile(result,true);}
    catch(error){
      // Keep the unsaved draft separate from the live list; retry must not duplicate it.
      this.config.store.profiles=this.liveProfiles().filter(p=>!(p===result||result.id&&!ids.has(String(result.id))&&p.id===result.id));
      throw error;
    }
  }
  showNativeCreateRecovery(draft,error) {
    const ref=this._dialog(this.t('新建会话尚未保存'));
    ref.body.append(this._el('p','tsm2-help',String(error.message||error)));
    ref.footer.prepend(this.createButton(this.t('继续编辑草稿'),this.t('继续编辑草稿'),()=>{ref.overlay.remove();return this.createNativeProfile('',draft);},'tsm2-primary'));
    return ref;
  }

  showProfileDialog(existing,group='') {
    if(!existing)return this.createNativeProfile(group);
    const ref=this._dialog(this.t(existing?'编辑会话':'新建会话')),original=existing?this.clone(existing):null,picker=this.createProfileGroupPicker(group);const name=this.addField(ref.body,this.t('名称'),this.input('text',existing?.name)),type=this.addField(ref.body,this.t('协议'),this.select(['ssh','telnet','local','serial'].map(value=>({value,label:value.toUpperCase()})),existing?.type||'ssh'));
    const host=this.addField(ref.body,this.t('主机'),this.input('text',existing?.options?.host||existing?.options?.device||existing?.options?.cwd)),port=this.addField(ref.body,this.t('端口'),this.input('text',existing?.options?.port||22)),user=this.addField(ref.body,this.t('用户名'),this.input('text',existing?.options?.user)),auth=this.addField(ref.body,this.t('认证'),this.select(['interactive','password','publicKey','agent'].map(value=>({value,label:{interactive:this.t('交互式'),password:this.t('密码'),publicKey:this.t('私钥'),agent:'SSH Agent'}[value]})),existing?.options?.auth||'interactive')),password=this.addField(ref.body,this.t('密码'),this.input('password',''));password.autocomplete='new-password';password.disabled=!this.hasNativePasswordStorage();this.addField(ref.body,this.t('分组'),picker.input);ref.body.append(picker.list);const description=this.addField(ref.body,this.t('备注'),this.input('text',existing?.description));
    ref.footer.prepend(this.createButton(this.t('保存'),this.t('保存'),async()=>{if(!name.value.trim())throw Error(this.t('名称不能为空。'));const next=existing?this.clone(existing):{id:this.makeId(type.value),options:{}};next.name=name.value.trim();next.type=type.value;next.description=description.value;let dest=this.resolveProfileGroupPicker(picker.input.value,picker,group);if(dest&&!this.liveGroups().some(g=>g.id===dest)){const out=await this.ensureImportGroups([dest],[]);dest=out.resolved.get(this.canonicalGroupPath(dest));}next.group=dest||undefined;if(['ssh','telnet'].includes(next.type)){if(!host.value.trim())throw Error(this.t('请填写主机。'));const n=Number(port.value);if(!Number.isInteger(n)||n<1||n>65535)throw Error(this.t('端口配置无效。'));Object.assign(next.options,{host:host.value.trim(),port:n,user:user.value.trim(),auth:auth.value});}else next.options[next.type==='local'?'cwd':'device']=host.value;
      if(original)await this.checkEditConflict(next,original);if(password.value){const result=await this.saveNativePassword(next,password.value);password.value='';if(!result.ok)throw Error(result.code);}if(original)await this.guardedWriteProfile(next,original);else await this.writeProfile(next,true);ref.overlay.remove();await this.refreshAndRender();},'tsm2-primary'));return ref;
  }
  showAppearanceDialog() {
    const ref=this._dialog(this.t('风格主题'));ref.dialog.classList.add('tsm2-theme-dialog');const lang=this.addField(ref.body,this.t('界面语言'),this.select([{value:'auto',label:this.t('跟随 Tabby')},{value:'zh-CN',label:'简体中文'},{value:'en-US',label:'English'}],this.getStateStore()?.language||'auto'));lang.addEventListener('change',async()=>{await this.setLanguage(lang.value);this.showAppearanceDialog();});
    const toggle=(label,checked,action)=>{const node=this.input('checkbox');node.checked=checked;const wrapper=this._el('label','tsm2-theme-sync-toggle');wrapper.append(node,this._el('span',null,label));ref.body.append(wrapper);node.addEventListener('change',()=>void action(node));return node;};const host=toggle(this.t('同步到 Tabby 主界面'),this.featureState().syncHostTheme!==false,async node=>{await this.hostThemeSync?.setOptions({host:node.checked,terminal:node.checked&&terminal.checked},this.themePreset);this.applyAppearance();}),terminal=toggle(this.t('同步终端配色'),this.featureState().syncTerminalTheme===true,async node=>{await this.hostThemeSync?.setOptions({host:host.checked,terminal:host.checked&&node.checked},this.themePreset);this.applyAppearance();});ref.body.append(this.createButton(this.t('恢复 Tabby 原设置'),this.t('恢复 Tabby 原设置'),async()=>{await this.hostThemeSync?.setOptions({host:false,terminal:false},this.themePreset);ref.overlay.remove();this.render();},'tsm2-secondary'));
    const grid=this._el('div','tsm2-theme-grid');for(const [key,p]of Object.entries(this.getThemePalettes())){const b=this.createButton('',this.t('应用')+this.t(p.label),async()=>{const previous=this.themePreset;try{const state=this.featureState();await this.hostThemeSync?.setOptions({host:state.syncHostTheme!==false,terminal:state.syncTerminalTheme===true},key);this.themePreset=key;await this.saveUIState();ref.overlay.remove();this.render();}catch(e){this.themePreset=previous;this.applyAppearance();throw e;}},'tsm2-secondary tsm2-theme-choice');b.style.cssText='background:'+(p.scene||p.a)+';color:'+p.fg+';border-color:'+p.accent;b.setAttribute('aria-pressed',String(key===this.themePreset));b.append(this._el('strong',null,this.t(p.label)),this._el('small',null,this.t(p.note)));grid.append(b);}ref.body.append(grid);return ref;
  }
  showDataManagementDialog() {const ref=this._dialog(this.t('数据管理'));for(const [label,action]of [['导入 Xshell 会话',()=>this.showXshellImportDialog()],['导入 SecureCRT 会话',()=>this.importSecureCrtIniDirectory()],['导出安全备份',()=>this.exportSafeBackup()],['恢复安全备份',()=>this.restoreBackupFromFile()],['查看最近导入报告',()=>this.showImportReport(this.lastImportReport)]])ref.body.append(this.createButton(this.t(label),this.t(label),action,'tsm2-secondary'));const encoding=this.addField(ref.body,this.t('导入文本编码'),this.select(['auto','utf-8','utf-16le','utf-16be','gb18030'].map(value=>({value,label:value})),this.featureState().importEncoding||'auto'));encoding.addEventListener('change',async()=>{this.featureState().importEncoding=encoding.value;await this.saveFeatureState();});return ref;}
  showXshellImportDialog() {const ref=this._dialog(this.t('导入 Xshell 会话'));for(const [label,action]of [['选择 XSH 文件',()=>this.importXshellXshFilePicker()],['选择 Xshell Sessions 目录',()=>this.importXshellXshDirectory()],['选择 CSV 文件',()=>this.importCsvFromFile()]])ref.body.append(this.createButton(this.t(label),this.t(label),action,'tsm2-secondary'));return ref;}
  showImportPreview(plan) {const ref=this._dialog(this.t('导入预览')),selected=new Set(plan.entries.map(e=>String(e.index))),items=plan.entries.map(e=>({key:String(e.index),label:e.profile.name,detail:[e.profile.host,e.profile.groupPath,e.sourceFile].filter(Boolean).join(' · ')}));ref.dialog.classList.add('tsm2-wide-dialog');this.createPagedChecklist(ref.body,items,selected);const mode=this.addField(ref.body,this.t('重复会话处理'),this.select([{value:'skip',label:this.t('跳过重复项（推荐）')},{value:'copy',label:this.t('导入为副本，不覆盖已有会话')}],'skip'));for(const row of plan.invalid||[])ref.body.append(this._el('p','tsm2-error',row.message));ref.footer.prepend(this.createButton(this.t('确认导入所选'),this.t('确认导入所选'),async()=>{const result=await this.executeImportReport({...plan,entries:plan.entries.filter(e=>selected.has(String(e.index)))},mode.value);ref.overlay.remove();this.showImportReport(result);},'tsm2-primary'));return ref;}
  chooseLocalFiles(options={}) {return new Promise(resolve=>{const input=document.createElement('input');input.type='file';input.style.display='none';input.multiple=!!options.multiple||!!options.directory;if(options.accept)input.accept=options.accept;if(options.directory)input.setAttribute('webkitdirectory','');let settled=false,timer;const finish=()=>{if(settled)return;settled=true;clearTimeout(timer);window.removeEventListener('focus',onFocus);input.remove();resolve(Array.from(input.files||[]));},onFocus=()=>timer=setTimeout(finish,1000);input.addEventListener('change',finish,{once:true});input.addEventListener('cancel',finish,{once:true});window.addEventListener('focus',onFocus);document.body.appendChild(input);try{input.click();}catch{finish();}});}
  async readLocalText(file) {if(file.size>10*1024*1024)throw Error(this.t('单个导入文件不能超过 10 MB。'));const mode=/\.json$/i.test(file.name||'')?'auto':this.featureState().importEncoding||'auto';if(!file.arrayBuffer&&file.text)return (await file.text()).replace(/^\uFEFF/,'');const bytes=new Uint8Array(file.arrayBuffer?await file.arrayBuffer():await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsArrayBuffer(file);}));let encoding=mode;if(mode==='auto'){if(bytes[0]===255&&bytes[1]===254||bytes[1]===0&&bytes[3]===0)encoding='utf-16le';else if(bytes[0]===254&&bytes[1]===255||bytes[0]===0&&bytes[2]===0)encoding='utf-16be';else try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes).replace(/^\uFEFF/,'');}catch{encoding='gb18030';}}return new TextDecoder(encoding,{fatal:true}).decode(bytes).replace(/^\uFEFF/,'');}
  downloadTextFile(name,text) {const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'})),a=this._el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  getPortConfigMenuItems(p) {return [{label:this.t('查看端口配置'),action:()=>this.showPortConfigPreview(p,this.getForwardingRules(p),'',true)},{label:this.t('编辑端口配置'),action:()=>this.showPortConfigPreview(p,this.getForwardingRules(p))},{label:this.t('导出端口配置'),action:()=>this.exportPortConfig(p)},{label:this.t('导入并覆盖'),action:()=>this.importPortConfigFromFile(p,'replace')},{label:this.t('导入并增加'),action:()=>this.importPortConfigFromFile(p,'add')}];}
  exportPortConfig(p) {this.downloadTextFile('tabby-forwarding.tsm-forwarding.json',JSON.stringify(this.createPortConfigDocument(p),null,2));}
  async importPortConfigFromFile(p,mode='replace') {const files=await this.chooseLocalFiles({accept:'.json'});if(!files.length)return;const data=JSON.parse(await this.readLocalText(files[0]));if(data.format!=='tabby-session-manager-port-forwarding'||data.schemaVersion!==1||!Array.isArray(data.rules)||data.rules.length>100)throw Error(this.t('不支持的端口配置格式。'));const valid=[],invalid=[];data.rules.forEach((raw,i)=>{const r=this.normalizeForwardRule(raw);r.rule?valid.push(r.rule):invalid.push((i+1)+': '+r.error);});return this.showPortConfigPreview(p,valid,files[0].name,false,mode,invalid);}
  showPortConfigPreview(p,rules,sourceLabel='',readonly=false,initialMode='replace',invalid=[]) {const ref=this._dialog(this.t('端口配置')),list=this._el('div','tsm2-forward-editor'),rows=[];const add=raw=>{const item=this._el('div','tsm2-forward-edit-row'),type=this.select(['Local','Remote','Dynamic'].map(value=>({value,label:value})),raw?.type||'Local'),host=this.input('text',raw?.host||'127.0.0.1'),port=this.input('number',raw?.port||''),target=this.input('text',raw?.targetAddress||''),targetPort=this.input('number',raw?.targetPort||'');const row={item,type,host,port,target,targetPort};item.append(type,host,port,target,targetPort,this.createButton('×',this.t('删除'),()=>{item.remove();rows.splice(rows.indexOf(row),1);}));rows.push(row);list.append(item);};rules.forEach(add);if(readonly){list.querySelectorAll('input,select,button').forEach(e=>e.disabled=true);ref.body.append(list);return ref;}for(const message of invalid)ref.body.append(this._el('p','tsm2-error',message));ref.body.append(list,this.createButton('+',this.t('新建'),()=>add(),'tsm2-secondary'));const mode=this.addField(ref.body,this.t('导入方式'),this.select([{value:'replace',label:this.t('覆盖')},{value:'add',label:this.t('增加')}],initialMode));const conflict=this.addField(ref.body,this.t('重复会话处理'),this.select([{value:'skip',label:this.t('跳过')},{value:'replace',label:this.t('覆盖')}],'skip'));ref.footer.prepend(this.createButton(this.t('保存'),this.t('保存'),async()=>{await this.applyPortConfig(p,rows.map(r=>({type:r.type.value,host:r.host.value,port:r.port.value,targetAddress:r.target.value,targetPort:r.targetPort.value})),mode.value,conflict.value);ref.overlay.remove();},'tsm2-primary'));return ref;}
  getSessionLogBridge() {const candidate=this.logger?.bridge||(typeof globalThis!=='undefined'?globalThis.__tabbySessionLogManagerBridge:null);return candidate?.apiVersion===2?candidate:null;}
  logProfileReference(p) {const o=this.effectiveConnectionOptions(p);return {id:String(p.id||''),type:p.type,name:p.name,host:o.host||'',port:o.port||22,user:o.user||''};}
  logActionFailureMessage(result) {return this.t('日志操作未完成，未改写日志管理器设置。')+(result?.code?' '+result.code:'');}
  createLogDialogText(text,cls='tsm2-help') {return this._el('div',cls,text);}
  getProfileLogMenuItems(p) {const b=this.getSessionLogBridge();return [{label:this.t('会话日志'),action:()=>this.showProfileLogDialog(p)},{label:this.t('开启自动日志'),disabled:!b?.setProfileEnabled,action:()=>b.setProfileEnabled(this.logProfileReference(p),true)},{label:this.t('关闭自动日志'),disabled:!b?.setProfileEnabled,action:()=>b.setProfileEnabled(this.logProfileReference(p),false)}];}
  showSaveOutputGuide() {const ref=this._dialog(this.t('会话日志'));ref.body.append(this._el('p',null,this.t('当前日志接口不支持此操作。')));return ref;}
  async showProfileLogDialog(p) {const b=this.getSessionLogBridge();if(!b)return this.showSaveOutputGuide();const ref=this._dialog(this.t('日志控制：')+this.profileName(p)),reference=this.logProfileReference(p),status=await b.getCurrentSessionStatus(reference),sessions=status?.sessions||[],selector=this.addField(ref.body,this.t('当前 SSH 连接'),this.select(sessions.map((s,i)=>({value:s.sessionKey,label:this.t('窗口 ')+(i+1)})),sessions[0]?.sessionKey)),details=this._el('p');ref.body.append(details);const update=()=>{const s=sessions.find(s=>s.sessionKey===selector.value);details.textContent=s?(s.outputPath||s.lastOutputPath||this.t('当前未记录')):this.t('当前没有已连接的 SSH 终端。');};selector.addEventListener('change',update);update();for(const [label,method]of [['Log Start','logStart'],['Log Stop','logStop'],['继续记录','logResume'],['Log View','logView'],['Log Directory','openProfileDirectory']]){const button=this.createButton(this.t(label),this.t(label),async()=>{const result=await b[method](reference,selector.value);if(!result?.ok&&!result?.canceled)throw Error(this.logActionFailureMessage(result));ref.overlay.remove();await this.showProfileLogDialog(p);},'tsm2-secondary');button.disabled=!sessions.length&&method!=='openProfileDirectory';ref.footer.prepend(button);}return ref;}
  applyAppearance() {const surfaces=typeof document==='undefined'?[]:[this.getRoot(),...document.querySelectorAll('.tsm2-overlay,.tsm2-menu')];surfaces.filter(Boolean).forEach(node=>this.applyThemeToSurface(node));this.hostThemeSync?.applyUI(this.themePreset);}

}
SessionManagerService.ɵfac = candidate=>new (candidate||SessionManagerService)(coreAngular.ɵɵinject(core.ConfigService,8),coreAngular.ɵɵinject(core.ProfilesService,8),coreAngular.ɵɵinject(coreAngular.NgZone,8),ngb?.NgbModal?coreAngular.ɵɵinject(ngb.NgbModal,8):null,tabbySSH?.PasswordStorageService?coreAngular.ɵɵinject(tabbySSH.PasswordStorageService,8):null,coreAngular.ɵɵinject(core.AppService,8),coreAngular.ɵɵinject(loggerModule.AutoLoggerDecorator,8),core.SelectorService?coreAngular.ɵɵinject(core.SelectorService,8):null);
SessionManagerService.ɵprov=coreAngular.ɵɵdefineInjectable({token:SessionManagerService,factory:SessionManagerService.ɵfac,providedIn:'root'});
class SessionToolbarButtonProvider extends core.ToolbarButtonProvider {
  constructor(service) {super();this.service=service;}
  provide() {return [{icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h7l2 2h9v11H3z M3 7V4h6l3 3"/></svg>',title:this.service.t('会话管理器'),weight:5,click:()=>this.service.toggleVisibility()}];}
}
SessionToolbarButtonProvider.ɵfac=()=>new SessionToolbarButtonProvider(coreAngular.ɵɵinject(SessionManagerService,8));
SessionToolbarButtonProvider.ɵprov=coreAngular.ɵɵdefineInjectable({token:SessionToolbarButtonProvider,factory:SessionToolbarButtonProvider.ɵfac,providedIn:'root'});
class SessionHotkeyProvider extends core.HotkeyProvider {
  constructor(config) {super();this.config=config;}
  async provide() {return [{id:HOTKEY_ID,name:suiteI18n.t('显示或隐藏会话管理器',this.config)}];}
}
SessionHotkeyProvider.ɵfac=()=>new SessionHotkeyProvider(coreAngular.ɵɵinject(core.ConfigService,8));SessionHotkeyProvider.ɵprov=coreAngular.ɵɵdefineInjectable({token:SessionHotkeyProvider,factory:SessionHotkeyProvider.ɵfac,providedIn:'root'});
class SessionHotkeyHandler {
  constructor(hotkeys,service) {this.subscription=hotkeys?.matched$?.subscribe(id=>{if(id===HOTKEY_ID)service.toggleVisibility();});}
  ngOnDestroy() {this.subscription?.unsubscribe();}
}
SessionHotkeyHandler.ɵfac=()=>new SessionHotkeyHandler(coreAngular.ɵɵinject(core.HotkeysService,8),coreAngular.ɵɵinject(SessionManagerService,8));SessionHotkeyHandler.ɵprov=coreAngular.ɵɵdefineInjectable({token:SessionHotkeyHandler,factory:SessionHotkeyHandler.ɵfac,providedIn:'root'});
class TabbySessionManagerModule {constructor(service,hotkeyHandler){this.service=service;this.hotkeyHandler=hotkeyHandler;}}
TabbySessionManagerModule.ɵfac=()=>new TabbySessionManagerModule(coreAngular.ɵɵinject(SessionManagerService,8),coreAngular.ɵɵinject(SessionHotkeyHandler,8));
TabbySessionManagerModule.ɵmod=coreAngular.ɵɵdefineNgModule({type:TabbySessionManagerModule,imports:[common.CommonModule,loggerModule.default],exports:[]});
TabbySessionManagerModule.ɵinj=coreAngular.ɵɵdefineInjector({imports:[common.CommonModule,loggerModule.default],providers:[SessionManagerService,SessionHotkeyHandler,{provide:core.ConfigProvider,useClass:SessionConfigProvider,multi:true},{provide:core.ToolbarButtonProvider,useClass:SessionToolbarButtonProvider,multi:true},{provide:core.HotkeyProvider,useClass:SessionHotkeyProvider,multi:true}]});
exports.default = TabbySessionManagerModule;
exports.SessionManagerService=SessionManagerService;
