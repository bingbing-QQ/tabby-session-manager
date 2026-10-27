'use strict';
// Tabby v1.0.238: theme variables, TerminalColorScheme and public tab.configure().
const {ensureContrast,onColor}=require('./contrast');
const HOST_STYLE_ID = 'tabby-session-manager-host-theme';
const TERMINAL_KEYS = ['colorScheme', 'lightColorScheme', 'background'];
const STATE_KEYS = ['syncHostTheme', 'syncTerminalTheme', 'terminalThemeBackup', 'themePreset'];
const copy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const snapshot = (obj,keys) => Object.fromEntries(keys.map(key=>[key,{exists:obj[key]!==undefined,value:copy(obj[key])}]));
const restore = (obj,values) => { for(const [key,item] of Object.entries(values)) {
  if(item.exists)obj[key]=copy(item.value);
  else if(Object.getOwnPropertyDescriptor(obj,key)?.configurable===false)obj[key]=undefined;
  else delete obj[key];
} };
const rgb = value => value.slice(1).match(/../g).map(x=>parseInt(x,16));
const blend = (a,b,t) => '#'+rgb(a).map((x,i)=>Math.round(x*(1-t)+rgb(b)[i]*t).toString(16).padStart(2,'0')).join('');

class SessionHostThemeSync {
  constructor(config,app,palettes,report=()=>{}) {
    this.config=config;this.app=app;this.palettes=palettes;this.report=report;
    this.pending=Promise.resolve();this.disposed=false;this.recoveryReady=false;
    this.cssTemplate=require('fs').readFileSync(require('path').join(__dirname,'host-theme.css'),'utf8');
  }
  state() { return this.config && this.config.store && this.config.store.sessionManager; }
  palette(key) {
    const p=this.palettes()[key]||this.palettes().nocturneGlass;
    return {...p,fg:p.fg||'#e8edf5',muted:p.muted||'#aab8ca',edge:p.edge||'#ffffff26',fill:p.fill||'#ffffff0c',
      scene:p.scene||(p.glow?'radial-gradient(ellipse at 90% 0%,rgba('+p.glow+',.25),transparent 58%),linear-gradient(155deg,'+p.a+','+p.b+')':p.a)};
  }
  terminalScheme(key) {
    const p=this.palette(key);
    const colors=p.light
      ? ['#242424','#a5283b','#23633d','#76540b','#2457a7','#793c91','#12616d','#626262','#4c4c4c','#b22038','#1b6338','#7a5200','#174eaa','#76318f','#006575','#171714']
      : ['#20242c','#e68b8b','#93c6a2','#dfc080','#8eb4e0','#c6a2d8','#8ac7ce','#d4d9e2','#7d8795','#ffaaaa','#b7e2be','#f4d798','#b0d1f5','#e0bbed','#b2e1e6','#f1f3f7'];
    const selection=p.light?'#cbd8ce':'#364252';
    return {name:'Session Manager · '+p.label,foreground:ensureContrast(p.fg,p.a),background:p.a,cursor:ensureContrast(p.fg,p.a),cursorAccent:p.a,
      selection,selectionForeground:ensureContrast(p.fg,selection),colors:colors.map(color=>ensureContrast(color,p.a))};
  }
  applyUI(key) {
    if(typeof document==='undefined'||this.disposed)return;
    const state=this.state();
    if(!state||state.syncHostTheme===false){this.removeUI();return;}
    const p=this.palette(key),base=p.a,fg=p.fg,accent=p.accent;
    const more=blend(base,p.light?'#ffffff':'#000000',.18),less=blend(base,fg,p.light?.06:.10);
    const vars={
      '--tsm-host-bg':base,'--tsm-host-scene':p.scene,'--tsm-host-fg':fg,'--tsm-host-muted':p.muted,
      '--tsm-host-edge':p.edge,'--tsm-host-fill':p.fill,'--tsm-host-input':p.input||less,'--tsm-host-accent':accent,
      '--tsm-host-shadow':p.light?'0 12px 32px #00000020':'0 18px 48px #03071266',
      '--tsm-host-radius':key==='playfulNeo'?'0px':'14px',
      '--body-bg':base,'--theme-bg':base,'--theme-fg':fg,'--theme-bg-more':more,'--theme-bg-more-2':more,
      '--theme-bg-less':less,'--theme-bg-less-2':less,'--theme-fg-more':fg,'--theme-fg-more-2':fg,
      '--theme-fg-less':p.muted,'--theme-fg-less-2':p.muted,
      '--bs-body-bg':base,'--bs-body-color':fg,'--bs-body-bg-rgb':rgb(base).join(','),'--bs-body-color-rgb':rgb(fg).join(','),
      '--bs-secondary-bg':less,'--bs-tertiary-bg':more,'--bs-secondary-color':p.muted,'--bs-tertiary-color':p.muted,
      '--bs-emphasis-color':fg,'--bs-border-color':p.edge,'--bs-link-color':accent,'--bs-link-hover-color':accent,'--tsm-host-on-accent':onColor(accent)
    };
    const semantic={primary:accent,secondary:p.muted,tertiary:less,warning:p.light?'#76540b':'#dfc080',danger:p.light?'#a5283b':'#e68b8b',success:p.light?'#23633d':'#93c6a2',info:p.light?'#2457a7':'#8eb4e0',dark:'#20242c',light:'#f3f4f6',link:accent};
    for(const [name,value] of Object.entries(semantic)) {
      for(const suffix of ['', '-more','-more-2','-less','-less-2'])vars['--theme-'+name+suffix]=value;
      vars['--theme-'+name+'-fg']=onColor(value);vars['--theme-'+name+'-active-bg']=value;vars['--theme-'+name+'-active-fg']=onColor(value);
      vars['--bs-'+name]=value;vars['--bs-'+name+'-rgb']=rgb(value).join(',');vars['--bs-'+name+'-bg']=less;vars['--bs-'+name+'-color']=value;
    }
    let style=document.getElementById(HOST_STYLE_ID);
    if(!style){style=document.createElement('style');style.id=HOST_STYLE_ID;document.head.appendChild(style);}
    const css='html[data-tsm-host-theme] {'+Object.entries(vars).map(([k,v])=>k+':'+v+' !important;').join('')+'}\n'+this.cssTemplate;
    if(style.textContent!==css)style.textContent=css;
    document.documentElement.dataset.tsmHostTheme=key;
    document.documentElement.dataset.tsmHostMode=p.light?'light':'dark';
  }
  removeUI() {
    if(typeof document==='undefined')return;
    const style=document.getElementById(HOST_STYLE_ID);if(style)style.remove();
    delete document.documentElement.dataset.tsmHostTheme;delete document.documentElement.dataset.tsmHostMode;
  }
  refreshTerminals() {
    const seen=new Set();
    const visit=tab=>{
      if(!tab||seen.has(tab))return;seen.add(tab);
      if(typeof tab.configure==='function'&&tab.frontend){try{tab.configure();}catch(e){this.report('刷新终端配色失败',e);}}
      if(typeof tab.getAllTabs==='function')for(const child of tab.getAllTabs())visit(child);
    };
    for(const tab of this.app&&this.app.tabs||[])visit(tab);
  }
  async initialize(key) {
    if(this.disposed)return;
    const state=this.state();if(!state)return;
    if(state.syncTerminalTheme===true){
      // Do not recapture an already synchronized scheme as the original on restart.
      if(!state.terminalThemeBackup||state.terminalThemeBackup.version!==1){
        this.report('终端配色备份不可用，未重新写入终端设置。');this.applyUI(key);return;
      }
      await this.setOptions({host:state.syncHostTheme!==false,terminal:true},key);
    } else if(state.terminalThemeBackup){await this.setOptions({host:state.syncHostTheme!==false,terminal:false},key);}
    else {this.applyUI(key);}
    this.recoveryReady=true;
  }
  setOptions(options,key) {
    const task=()=>this.commit(options,key);
    this.pending=this.pending.catch(()=>{}).then(task);return this.pending;
  }
  async commit(options,key) {
    if(this.disposed)throw Error('主题服务已关闭。');
    const state=this.state(),store=this.config&&this.config.store;
    if(!state||!store)throw Error('Tabby 配置尚未就绪，请稍后重试。');
    const wantHost=!!options.host,wantTerminal=wantHost&&!!options.terminal;
    const term=store.terminal||{};
    const beforeState=snapshot(state,STATE_KEYS),beforeTerminal=snapshot(term,TERMINAL_KEYS);
    let preserveManual=false,changedTerminal=false;
    try {
      if(wantTerminal) {
        if(state.syncTerminalTheme&&(!state.terminalThemeBackup||state.terminalThemeBackup.version!==1))throw Error('终端配色备份不可用，请先关闭终端同步并检查设置。');
        if(!state.terminalThemeBackup)state.terminalThemeBackup={version:1,createdAt:new Date().toISOString(),original:copy(beforeTerminal),lastApplied:{}};
        const backup=state.terminalThemeBackup;
        if(backup.version!==1||!backup.original||TERMINAL_KEYS.some(k=>!backup.original[k]))throw Error('终端配色备份格式不完整，未修改配色。');
        const scheme=this.terminalScheme(key);
        const values={colorScheme:scheme,lightColorScheme:scheme,background:'colorScheme'};
        if(!store.terminal)store.terminal=term;
        for(const name of TERMINAL_KEYS){term[name]=copy(values[name]);backup.lastApplied[name]=copy(values[name]);}
        changedTerminal=true;
      } else if(state.terminalThemeBackup) {
        const backup=state.terminalThemeBackup;
        if(backup.version!==1||!backup.original||!backup.lastApplied||TERMINAL_KEYS.some(k=>!backup.original[k]))throw Error('终端配色备份格式不完整，未执行恢复。');
        for(const name of TERMINAL_KEYS){
          if(equal(term[name],backup.lastApplied[name])){restore(term,{[name]:backup.original[name]});changedTerminal=true;}
          else preserveManual=true; // Never overwrite a manual change made during synchronization.
        }
        // ConfigProxy leaf accessors are non-configurable in Tabby 1.0.238.
        // Assign through its setter; deleting an accessor throws and doesn't persist.
        state.terminalThemeBackup=null;
      }
      state.syncHostTheme=wantHost;state.syncTerminalTheme=wantTerminal;state.themePreset=key;
      const appliedState=snapshot(state,STATE_KEYS),appliedTerminal=snapshot(term,TERMINAL_KEYS);
      try {await this.config.save();}
      catch(error){
        // Revert only fields still owned by this transaction, preserving unrelated/concurrent edits.
        for(const name of STATE_KEYS)if(equal(state[name],appliedState[name].value))restore(state,{[name]:beforeState[name]});
        for(const name of TERMINAL_KEYS)if(equal(term[name],appliedTerminal[name].value))restore(term,{[name]:beforeTerminal[name]});
        throw error;
      }
      this.applyUI(key);if(changedTerminal)this.refreshTerminals();
      if(preserveManual)this.report('已恢复原配色；同步期间手动更改的配色项已保留。');
      return {preserveManual};
    } catch(error) {
      this.applyUI(state.themePreset||key);throw error;
    }
  }
  destroy() {this.disposed=true;this.removeUI();}
}
module.exports={SessionHostThemeSync};
