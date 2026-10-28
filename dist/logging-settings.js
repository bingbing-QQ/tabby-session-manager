'use strict';
const fs=require('fs'),path=require('path');
const {Buffer}=require('buffer');
const suiteI18n=require('./i18n');
const suiteSettingsUI=require('./suite-settings-ui');
const {DirectoryStore,profileLogTag,filename,defaults}=require('./logging-core');
class AutoLoggerSettingsTabComponent {
  constructor(config,electron,hostWindow,cd,zone,elementRef) {Object.assign(this,{config,electron:electron||{},hostWindow,cd,zone,elementRef});this.profileEntries=[];this.profileGroups=[];this.logSearch='';this.logSort='newest';this.activePage='logging';this.directoryStore=new DirectoryStore(config);}
  t(text) {return suiteI18n.t(text,this.config);}
  getConfig() {const store=this.config.store;if(!store.autoSessionLogger)store.autoSessionLogger=defaults(require('os').homedir());return store.autoSessionLogger;}
  profileName(entry) {return suiteI18n.profileName((this.config.store.profiles||[]).find(p=>String(p.id)===String(entry.id))||entry,this.config);}
  settingsSignature() {const store=this.config?.store||{},state=store.sessionManager||{};return JSON.stringify([store.language,store.appearance?.language,...['language','dockMode','sidebarWidth','sidebarFontSize','sessionInfoExpanded','themePreset','syncHostTheme','syncTerminalTheme'].map(key=>state[key])]);}
  ngOnInit() {
    this.languageChanged=()=>{this.render();this.zone?.run(()=>this.cd?.markForCheck?.());};
    if(typeof window!=='undefined')window.addEventListener('tabby-session-suite-language-changed',this.languageChanged);
    this.lastSettingsSignature=this.settingsSignature();
    this.settingsSubscription=this.config.changed$?.subscribe(()=>{const next=this.settingsSignature();if(next===this.lastSettingsSignature)return;this.lastSettingsSignature=next;clearTimeout(this.settingsRenderTimer);this.settingsRenderTimer=setTimeout(()=>this.render(),0);});
  }
  ngAfterViewInit() {this.mount=this.elementRef?.nativeElement?.querySelector?.('[data-log-settings-mount]')||this.elementRef?.nativeElement;this.refreshProfiles();}
  ngOnDestroy() {this.destroyed=true;this.settingsSubscription?.unsubscribe();clearTimeout(this.settingsRenderTimer);this.logScanGeneration=(this.logScanGeneration||0)+1;clearTimeout(this.logScanTimer);if(typeof window!=='undefined')window.removeEventListener('tabby-session-suite-language-changed',this.languageChanged);}
  refreshProfiles() {
    this.profileLoadError='';
    this.logScanGeneration=(this.logScanGeneration||0)+1;clearTimeout(this.logScanTimer);
    try {this.rebuildProfiles();}
    catch(error){this.profileLoadError=String(error.message||error);this.profileEntries=[];this.profileGroups=[];this.render();}
  }
  rebuildProfiles() {
    const profiles=(this.config.store.profiles||[]).filter(p=>p.type==='ssh'&&!p.isTemplate),groups=this.config.store.groups||[],nodes=new Map();this.profileEntries=profiles.map(p=>{const o=p.options||{};return {id:String(p.id),name:p.name,host:o.host||'',port:o.port||22,user:o.user||o.username||'',profile:p,directory:this.directoryStore.specific(p),logs:[],logsExpanded:false};});
    const root={key:'__ungrouped__',id:'__ungrouped__',name:this.t('Ungrouped'),entries:[],children:[],totalProfiles:0};for(const g of groups)nodes.set(String(g.id),{key:String(g.id),id:String(g.id),name:g.name,entries:[],children:[],totalProfiles:0});
    for(const g of groups){const n=nodes.get(String(g.id)),parent=nodes.get(String(g.parentGroupId||g.parentId||''));if(parent&&parent!==n)parent.children.push(n);}
    const roots=groups.filter(g=>!nodes.has(String(g.parentGroupId||g.parentId||''))).map(g=>nodes.get(String(g.id)));for(const entry of this.profileEntries)(nodes.get(String(entry.profile.group||''))||root).entries.push(entry);
    const count=(n,seen=new Set())=>{if(seen.has(n))return 0;seen.add(n);n.entries.sort((a,b)=>this.profileName(a).localeCompare(this.profileName(b)));n.totalProfiles=n.entries.length+n.children.reduce((total,c)=>total+count(c,seen),0);return n.totalProfiles;};roots.forEach(n=>count(n));if(root.entries.length)roots.push(root);this.profileGroups=roots.filter(n=>n.totalProfiles||n.entries.length);this.render();this.refreshLogs();
  }
  async setProfileDirectory(entry) {
    const cfg=this.getConfig(),directory=String(entry.directory||'').trim(),id=String(entry.id),key=[entry.name,entry.host,entry.port,entry.user].map(x=>String(x??'').trim().toLowerCase()).join('|');
    const before={profileDirectories:cfg.profileDirectories,profileDirectoryKeys:cfg.profileDirectoryKeys,profiles:cfg.profiles};cfg.profileDirectories={...cfg.profileDirectories,[id]:directory};cfg.profileDirectoryKeys={...cfg.profileDirectoryKeys,[key]:directory};cfg.profiles={...cfg.profiles,[id]:{...(cfg.profiles?.[id]||{}),directory,name:entry.name,host:entry.host,port:entry.port,user:entry.user}};
    try{if(directory)fs.mkdirSync(directory,{recursive:true});await this.config.save();}catch(e){Object.assign(cfg,before);throw e;}if(!this.directoryStore.write(entry,directory))throw Error(this.t('保存日志路径失败。'));
  }
  async pickDefault() {const result=await this.electron.dialog.showOpenDialog(this.hostWindow?.getWindow?.(),{title:this.t('Choose log directory'),properties:['openDirectory','showHiddenFiles','createDirectory']});if(result?.filePaths?.length){const cfg=this.getConfig(),previous=cfg.defaultDirectory;cfg.defaultDirectory=result.filePaths[0];try{await this.config.save();}catch(e){cfg.defaultDirectory=previous;throw e;}this.refreshLogs();this.render();}}
  async pickProfile(entry) {const result=await this.electron.dialog.showOpenDialog(this.hostWindow?.getWindow?.(),{title:this.t('Choose log directory'),properties:['openDirectory','showHiddenFiles','createDirectory']});if(result?.filePaths?.length){const previous=entry.directory;entry.directory=result.filePaths[0];try{await this.setProfileDirectory(entry);}catch(error){entry.directory=previous;throw error;}this.refreshLogs();this.render();}}
  async toggleGroup(group) {const cfg=this.getConfig();cfg.collapsedGroups={...cfg.collapsedGroups,[group.key]:cfg.collapsedGroups?.[group.key]===false};await this.config.save();this.render();}
  async setAllGroupsCollapsed(collapsed) {const cfg=this.getConfig(),map={...cfg.collapsedGroups};for(const group of this.profileGroups){const pending=[group],seen=new Set();while(pending.length){const n=pending.pop();if(seen.has(n))continue;seen.add(n);map[n.key]=collapsed;pending.push(...n.children);}}cfg.collapsedGroups=map;void this.config.save();this.render();}
  formatSize(bytes) {const value=Number(bytes)||0;if(value<1024)return value+' B';const units=['KB','MB','GB'];let n=value/1024,i=0;while(n>=1024&&i<2){n/=1024;i++;}return n.toFixed(1)+' '+units[i];}
  async scanLogMetadata(directory,generation) {
    const catalog={rows:[],errors:[]};
    if(!directory)return catalog;
    try {
      // Directory entries and lstat do not open file data streams. Never read headers here:
      // opening an online-only placeholder can hydrate it and block the renderer.
      const items=await fs.promises.readdir(directory,{withFileTypes:true});
      for(let at=0;at<items.length;at+=8){
        if(this.destroyed||generation!==this.logScanGeneration)return catalog;
        const batch=await Promise.all(items.slice(at,at+8).map(async item=>{
          if(!item.isFile()||!item.name.toLowerCase().endsWith('.log'))return null;
          const full=path.join(directory,item.name);
          try{const stat=await fs.promises.lstat(full);if(!stat.isFile()||stat.isSymbolicLink())return null;return {name:item.name,path:full,size:stat.size,mtime:stat.mtime,modified:stat.mtime,date:stat.mtime};}
          catch(error){catalog.errors.push(item.name+': '+String(error.message||error));return null;}
        }));
        catalog.rows.push(...batch.filter(Boolean));
      }
    }catch(error){if(error.code!=='ENOENT')catalog.errors.push(String(error.message||error));}
    return catalog;
  }
  async loadLogsForEntry(entry) {
    const directory=entry.directory||this.getConfig().defaultDirectory,generation=this.logScanGeneration||0;
    this.logScanGeneration=generation;this.logCatalogCache||=new Map();
    if(!this.logCatalogCache.has(directory))this.logCatalogCache.set(directory,this.scanLogMetadata(directory,generation));
    const catalog=await this.logCatalogCache.get(directory);
    if(this.destroyed||generation!==this.logScanGeneration||directory!==(entry.directory||this.getConfig().defaultDirectory))return;
    const tag=profileLogTag(entry.id),name=filename(entry.name);
    entry.logs=catalog.rows.filter(log=>{
      if(entry.allDirectoryLogs)return true;
      if(log.name.includes('_'+tag+'_'))return true;
      if(/_p-[a-z0-9]+-[0-9a-f]{8}_/i.test(log.name))return false;
      const modern=/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-\d{3}_(.*)_[0-9a-f]{6,32}\.log$/i.exec(log.name);
      return modern?modern[1]===name:log.name.endsWith('_'+name+'.log');
    }).sort((a,b)=>b.mtime-a.mtime);
    entry.logsScanned=true;entry.logError=catalog.errors.join('\n');
  }
  refreshLogs() {
    clearTimeout(this.logScanTimer);const generation=(this.logScanGeneration||0)+1;this.logScanGeneration=generation;
    this.logCatalogCache=new Map();this.logsLoading=true;
    const pending=[...this.profileEntries];for(const entry of pending){entry.logs=[];entry.logError='';entry.logsScanned=false;entry.logLimit=100;}
    const run=async()=>{
      for(const entry of pending){
        if(this.destroyed||generation!==this.logScanGeneration)return;
        try{await this.loadLogsForEntry(entry);}catch(error){if(generation===this.logScanGeneration){entry.logs=[];entry.logsScanned=true;entry.logError=String(error.message||error);}}
        if(this.destroyed||generation!==this.logScanGeneration)return;
        const button=this.mount?.querySelector?.('[data-log-count="'+this.profileEntries.indexOf(entry)+'"]');if(button){button.textContent=String(entry.logs.length);button.title=entry.logError||this.t(entry.logsExpanded?'Collapse logs':'Show logs');}
        await new Promise(resolve=>setTimeout(resolve,0));
      }
      if(!this.destroyed&&generation===this.logScanGeneration){this.logsLoading=false;if(pending.some(e=>e.logsExpanded))this.render();}
    };
    this.logScanTimer=setTimeout(()=>void run(),0);
  }
  async toggleLogs(entry) {entry.logsExpanded=!entry.logsExpanded;this.render();if(entry.logsExpanded){await this.loadLogsForEntry(entry);this.render();}}
  filteredLogs(entry) {const query=this.logSearch.toLowerCase(),rows=entry.logs.filter(log=>log.name.toLowerCase().includes(query)),sort=this.logSort;return rows.sort((a,b)=>sort==='oldest'?a.mtime-b.mtime:['largest','sizeDesc'].includes(sort)?b.size-a.size:sort==='sizeAsc'?a.size-b.size:['name','nameAsc'].includes(sort)?a.name.localeCompare(b.name):sort==='nameDesc'?b.name.localeCompare(a.name):b.mtime-a.mtime);}
  formatDateTime(value) {return new Date(value).toLocaleString();}
  async viewLog(log) {const message=await this.electron.shell.openPath(log.path);if(message)throw Error(message);}
  async openDirectory(entry) {const dir=typeof entry==='string'?entry:entry.directory||this.getConfig().defaultDirectory;if(fs.existsSync(dir)){const message=await this.electron.shell.openPath(dir);if(message)throw Error(message);}}
  render() {
    if(this.destroyed)return;
    try {this.renderContent();}
    catch(error){
      const host=this.mount||this.elementRef?.nativeElement;if(!host)return;
      const box=document.createElement('div');box.style.padding='16px';
      const title=document.createElement('h3');title.textContent=this.t('Suite Settings Title');
      const message=document.createElement('p');message.textContent=this.t('日志设置页面加载失败')+': '+String(error.message||error);
      const retry=document.createElement('button');retry.type='button';retry.className='btn btn-secondary';retry.textContent=this.t('Reload');retry.addEventListener('click',()=>this.refreshProfiles());
      box.append(title,message,retry);host.replaceChildren(box);
    }
  }
  renderContent() {
    const host=this.mount||this.elementRef?.nativeElement;if(!host)return;
    host.replaceChildren();
    const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
    const error=err=>host.prepend(el('p','text-danger',this.t(err.message)));
    const guard=fn=>(...args)=>Promise.resolve().then(()=>fn(...args)).catch(error);
    const button=(text,action,cls='')=>{const b=el('button','btn btn-secondary '+cls,this.t(text));b.type='button';b.addEventListener('click',async()=>{if(b.disabled)return;b.disabled=true;try{await action();}catch(e){error(e);}finally{b.disabled=false;}});return b;};
    const style=el('style');style.textContent=`
      .tsm-log-settings{min-width:0;max-width:none;padding:16px;color:inherit;container-type:inline-size}
      .tsm-log-settings *{box-sizing:border-box}
      .tsm-log-settings [hidden]{display:none!important}
      .tsm-log-settings .asl-suite-tabs{display:flex;gap:22px;border-bottom:1px solid var(--tsm-host-edge,#52616c);margin:0 0 22px}
      .tsm-log-settings .asl-suite-tab{border:0;border-radius:0;background:transparent;color:inherit;padding:0 4px 12px;min-height:32px;white-space:nowrap;box-shadow:none}
      .tsm-log-settings .asl-suite-tab[aria-selected="true"]{box-shadow:inset 0 -2px var(--tsm-host-accent,currentColor)}
      .tsm-log-settings .asl-suite-page{min-width:0}
      .tsm-log-settings .asl-suite-heading{margin:24px 0 12px}.tsm-log-settings .asl-suite-heading:first-child{margin-top:0}
      .tsm-log-settings .asl-setting-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0;margin:0;border-bottom:1px solid var(--tsm-host-edge,#52616c)}
      .tsm-log-settings .asl-setting-row .form-select{width:200px;flex:0 1 200px}
      .tsm-log-settings .asl-width-control{display:flex;align-items:center;gap:10px;flex:0 1 200px;min-width:0}
      .tsm-log-settings .asl-width-control input{min-width:0;width:140px;accent-color:var(--tsm-host-accent,currentColor)}
      .tsm-log-settings .asl-width-control output{white-space:nowrap;font-size:12px}
      .tsm-log-settings .asl-theme-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}
      .tsm-log-settings .asl-theme-grid .asl-theme-choice{display:flex;flex-direction:column;align-items:stretch;text-align:left;gap:7px;padding:10px;min-width:0;white-space:normal;overflow-wrap:anywhere}
      .tsm-log-settings .asl-theme-choice[aria-pressed="true"]{outline:2px solid var(--tsm-host-accent,currentColor);outline-offset:-2px}
      .tsm-log-settings .asl-theme-choice small{margin:0;line-height:1.5;white-space:normal}
      .tsm-log-settings .asl-theme-swatch{height:52px;border-radius:4px;display:flex;align-items:center;justify-content:center}
      .tsm-log-settings .asl-theme-swatch>span{border:1px solid currentColor;border-radius:5px;padding:3px 16px}
      .tsm-log-settings .asl-restore-theme{margin-top:12px}
      @container(max-width:420px){.tsm-log-settings .asl-setting-row{align-items:flex-start;flex-wrap:wrap;gap:9px}.tsm-log-settings .asl-setting-row .form-select{width:100%;flex-basis:100%}.tsm-log-settings .asl-theme-grid{gap:8px}.tsm-log-settings .asl-theme-grid .asl-theme-choice{padding:8px;font-size:12px}}

      .tsm-log-settings h3{margin:0 0 4px;font-size:18px}.tsm-log-settings h5{margin:0;font-size:16px}
      .tsm-log-settings .asl-titlebar{display:flex;align-items:center;gap:11px;margin-bottom:16px}
      .tsm-log-settings .asl-mark{display:grid;place-items:center;flex:0 0 32px;width:32px;height:32px;border:1px solid var(--tsm-host-edge,#52616c);border-radius:8px;background:rgba(66,211,178,.08);color:#a9b8b6}
      .tsm-log-settings .asl-general{padding:16px;margin-bottom:24px;border:0;border-radius:6px;background:rgba(127,127,127,.045)}
      .tsm-log-settings .asl-check{display:flex;align-items:center;gap:9px;margin:16px 0;cursor:pointer}
      .tsm-log-settings .asl-check input{flex:0 0 auto;margin:0;width:15px;height:15px}
      .tsm-log-settings .asl-help{display:block;margin:7px 0 0;line-height:1.65;font-size:12px}
      .tsm-log-settings .asl-field-label{display:block;margin:0 0 7px}
      .tsm-log-settings .asl-path{display:flex;flex-wrap:wrap;align-items:center;gap:8px;min-width:0}
      .tsm-log-settings .form-control,.tsm-log-settings .form-select{min-width:0;margin:0;width:100%;height:34px;min-height:34px;padding:5px 10px;font:inherit;line-height:22px;border:1px solid var(--tsm-host-edge,#52616c);border-radius:5px;background:var(--tsm-host-input,rgba(127,127,127,.1));color:inherit;box-shadow:none}
      .tsm-log-settings .asl-path>.form-control{flex:1 1 210px}
      .tsm-log-settings .btn{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;margin:0;min-height:32px;padding:5px 12px;font:inherit;font-size:13px;line-height:20px;white-space:nowrap;word-break:normal;overflow-wrap:normal;border:1px solid var(--tsm-host-edge,#52616c);border-radius:5px;box-shadow:none}
      .tsm-log-settings .asl-section-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px}
      .tsm-log-settings .asl-controls{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin:0 0 10px}
      .tsm-log-settings .asl-group{min-width:0;margin-bottom:8px}
      .tsm-log-settings .asl-group-toggle{width:100%;justify-content:flex-start;text-align:left;padding:9px 10px;background:var(--tsm-host-fill,rgba(127,127,127,.08));white-space:normal}
      .tsm-log-settings .asl-group-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .tsm-log-settings .asl-group-count{margin-left:8px;padding-left:0;flex:none;font-size:12px}
      .tsm-log-settings .asl-children{margin:6px 0 6px 12px;padding-left:10px;border-left:1px solid var(--tsm-host-edge,#52616c)}
      .tsm-log-settings .asl-profile-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1.75fr) 58px 72px;gap:0;align-items:center;padding:0;border-bottom:1px solid var(--tsm-host-edge,rgba(127,127,127,.2));min-width:0}
      .tsm-log-settings .card{display:block;margin:0;padding:0;border:0;border-radius:0;background:transparent!important}
      .tsm-log-settings .asl-profile-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
      .tsm-log-settings .asl-column-head{font-size:12px;padding-top:6px;padding-bottom:6px}
      .tsm-log-settings .asl-log-panel{padding:12px;background:var(--tsm-host-fill,rgba(127,127,127,.035));min-width:0}
      .tsm-log-settings .asl-log-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-end;margin-bottom:10px}
      .tsm-log-settings .asl-log-toolbar input{flex:0 1 138px;max-width:138px}.tsm-log-settings .asl-log-toolbar select{flex:0 1 120px;width:120px}
      .tsm-log-settings .asl-log-list{max-height:360px;overflow:auto;min-width:0}
      .tsm-log-settings .asl-log-row{display:grid;grid-template-columns:minmax(0,1fr) 72px 132px 58px;gap:8px;align-items:center;padding:5px 0;border-top:1px solid var(--tsm-host-edge,rgba(127,127,127,.15))}
      .tsm-log-settings .asl-log-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}.tsm-log-settings .asl-log-size{text-align:right;font-size:12px}.tsm-log-settings .asl-log-date{font-size:12px}
      @container(max-width:580px){.tsm-log-settings .asl-profile-grid{grid-template-columns:minmax(0,1fr) auto auto}.tsm-log-settings .asl-profile-name{grid-column:1/-1}.tsm-log-settings .asl-column-head{display:none}.tsm-log-settings .asl-log-row{grid-template-columns:minmax(0,1fr) 60px auto}.tsm-log-settings .asl-log-date{display:none}}

      .tsm-log-settings .asl-titlebar .small{font-size:12px;line-height:1.6}
      .tsm-log-settings .asl-general .asl-check:last-of-type{margin-bottom:4px}
      .tsm-log-settings .asl-path{flex-wrap:nowrap;gap:0}
      .tsm-log-settings .asl-path>.form-control{flex:1 1 0;border-top-right-radius:0;border-bottom-right-radius:0}
      .tsm-log-settings .asl-path>.btn{border-top-left-radius:0;border-bottom-left-radius:0}
      .tsm-log-settings .asl-profile-grid>*{min-width:0;margin:7px 8px}
      .tsm-log-settings .asl-profile-grid .btn{padding:4px 8px;font-size:12px;justify-self:stretch}
      .tsm-log-settings .asl-profile-grid .asl-log-count{min-width:40px;justify-self:center;margin:7px 0;background:transparent}
      .tsm-log-settings .asl-profile-grid .form-control{width:calc(100% - 16px);height:30px;min-height:30px;font-size:13px;padding:4px 8px}
      .tsm-log-settings .asl-column-head>*{margin-top:5px;margin-bottom:5px}
      .tsm-log-settings .asl-column-head>:nth-child(3){text-align:center}
      .tsm-log-settings .asl-log-header{display:flex;align-items:center;gap:12px;min-width:0;margin-bottom:8px;flex-wrap:wrap}
      .tsm-log-settings .asl-directory{flex:1 1 100px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
      .tsm-log-settings .asl-log-toolbar{margin:0;gap:6px;flex:0 1 auto}
      .tsm-log-settings .asl-log-toolbar .btn{font-size:12px;padding:4px 6px;background:transparent}
      .tsm-log-settings .asl-log-panel{padding:8px 12px}
      .tsm-log-settings .asl-log-row .btn{font-size:12px;padding:4px 8px}
      .tsm-log-settings .asl-controls .btn{font-size:12px;padding:4px 9px;background:transparent}
      .tsm-log-settings .asl-group-toggle{padding:8px 9px;border-color:transparent;border-radius:5px;gap:7px}
      .tsm-log-settings .asl-folder-count{margin-left:auto;font-size:12px}
      .tsm-log-settings .asl-footer{display:block;margin-top:16px;line-height:1.7;font-size:12px}
      @container(max-width:580px){.tsm-log-settings .asl-profile-grid{grid-template-columns:minmax(0,1.2fr) minmax(0,1.8fr) 50px 68px}.tsm-log-settings .asl-profile-name{grid-column:auto}.tsm-log-settings .asl-column-head{display:grid}.tsm-log-settings .asl-profile-grid>*{margin-left:4px;margin-right:4px}.tsm-log-settings .asl-profile-grid .form-control{width:calc(100% - 8px)}.tsm-log-settings .asl-log-row{grid-template-columns:minmax(0,1fr) 64px 58px}.tsm-log-settings .asl-log-toolbar{flex:1 1 auto}.tsm-log-settings .asl-log-toolbar input{flex:1 1 108px;max-width:none}.tsm-log-settings .asl-log-toolbar select{flex:0 0 120px}}
    `;host.append(style);
    const cfg=this.getConfig(),main=el('div','tsm-log-settings');if(this.profileLoadError)main.append(el('p','text-danger',this.t('日志设置页面加载失败')+': '+this.profileLoadError));
    const title=el('header','asl-titlebar'),mark=el('span','asl-mark'),heading=el('div');mark.setAttribute('aria-hidden','true');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 32 32');svg.setAttribute('width','26');svg.setAttribute('height','26');
    const shape=(tag,attrs)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);svg.append(node);};
    shape('rect',{x:'4',y:'5',width:'24',height:'22',rx:'3',fill:'none',stroke:'currentColor','stroke-width':'1.7'});shape('path',{d:'M4 12h24 M12 12v15',fill:'none',stroke:'currentColor','stroke-width':'1.7'});mark.append(svg);
    heading.append(el('h3',null,this.t('Suite Settings Title')));if(suiteI18n.language(this.config)!=='en-US')heading.append(el('div','text-muted small','Tabby Session Suite'));title.append(mark,heading);main.append(title);
    if(this.settingsError)main.append(el('p','text-danger',this.t(this.settingsError)));
    const nav=el('div','asl-suite-tabs');nav.setAttribute('role','tablist');nav.setAttribute('aria-label',this.t('Suite Settings Title'));
    const loggingPage=el('section','asl-suite-page');loggingPage.id='tsm-suite-logging';loggingPage.setAttribute('role','tabpanel');loggingPage.setAttribute('aria-labelledby','tsm-suite-tab-logging');
    for(const [key,label]of [['general','Suite General Tab'],['logging','Logging'],['appearance','Appearance']]){const tab=el('button','asl-suite-tab',this.t(label));tab.type='button';tab.id='tsm-suite-tab-'+key;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','tsm-suite-'+key);tab.setAttribute('aria-selected',String(this.activePage===key));tab.addEventListener('click',()=>{this.activePage=key;this.render();this.mount?.querySelector('#tsm-suite-tab-'+key)?.focus();});nav.append(tab);}main.append(nav);
    const general=el('section','asl-general');general.append(el('h5',null,this.t('General')));
    const check=(label,key)=>{const box=el('label','asl-check'),input=el('input');input.type='checkbox';input.checked=key==='recordCommands'?cfg[key]===true:cfg[key]!==false;input.addEventListener('change',guard(async()=>{const old=cfg[key];cfg[key]=input.checked;try{await this.config.save();}catch(e){cfg[key]=old;input.checked=old;throw e;}}));box.append(input,el('span',null,this.t(label)));general.append(box);};
    check('Enable default automatic logging','enabled');
    const pathInput=el('input','form-control'),pathLabel=el('label','asl-field-label',this.t('Default log directory')),pathBox=el('div','asl-path');pathInput.id='tsm-default-log-directory';pathLabel.htmlFor=pathInput.id;pathInput.value=cfg.defaultDirectory||'';pathInput.setAttribute('aria-label',this.t('Default log directory'));pathInput.addEventListener('change',guard(async()=>{const old=cfg.defaultDirectory;cfg.defaultDirectory=pathInput.value;try{await this.config.save();}catch(e){cfg.defaultDirectory=old;pathInput.value=old;throw e;}this.refreshLogs();}));pathBox.append(pathInput,button('Browse',()=>this.pickDefault()));general.append(pathLabel,pathBox,el('small','asl-help text-muted',this.t('Used only when an SSH profile has no specific directory. Existing log files are kept permanently and are never cleaned up by this plugin.')));
    check('Record submitted command lines','recordCommands');general.append(el('small','asl-help text-warning',this.t('Disabled by default. Enable only when command auditing is required: typed passwords or tokens may be written to local logs.')));loggingPage.append(general);
    const section=el('section'),sectionHeading=el('div','asl-section-heading'),sectionText=el('div');sectionText.append(el('h5',null,this.t('SSH profile log directories')),el('small','asl-help text-muted',this.t('Set a separate local log directory for each SSH profile.')));sectionHeading.append(sectionText,button('Reload',()=>this.refreshProfiles()));section.append(sectionHeading);
    if(this.profileGroups.length){const controls=el('div','asl-controls');controls.append(button('Expand all',()=>this.setAllGroupsCollapsed(false)),button('Collapse all',()=>this.setAllGroupsCollapsed(true)));section.append(controls);}else section.append(el('p','text-muted',this.t('No saved SSH profiles were detected.')));
    const logPanel=entry=>{const panel=el('div','asl-log-panel'),toolbar=el('div','asl-log-toolbar'),search=el('input','form-control');search.type='search';search.value=this.logSearch;search.placeholder=this.t('Filter file names');search.setAttribute('aria-label',this.t('Filter file names'));search.addEventListener('change',()=>{this.logSearch=search.value;entry.logLimit=100;this.render();});const sort=el('select','form-select');sort.setAttribute('aria-label',this.t('Sort logs'));for(const [value,label]of [['newest','Newest'],['oldest','Oldest'],['nameAsc','Name A-Z'],['nameDesc','Name Z-A'],['sizeDesc','Largest'],['sizeAsc','Smallest']]){const option=el('option',null,this.t(label));option.value=value;sort.append(option);}sort.value=this.logSort;sort.addEventListener('change',()=>{this.logSort=sort.value;entry.logLimit=100;this.render();});toolbar.append(search,sort,button('Open Folder',()=>this.openDirectory(entry)));const panelHeader=el('div','asl-log-header'),directory=el('span','asl-directory text-muted',entry.directory||this.getConfig().defaultDirectory||this.t('No log directory configured'));directory.title=directory.textContent;panelHeader.append(directory,toolbar);panel.append(panelHeader);panel.append(el('p','text-muted',this.t('日志仅按文件名匹配，不读取内容。同名或重命名日志可查看目录全部日志。')),button(entry.allDirectoryLogs?'仅此会话':'目录全部日志',async()=>{entry.allDirectoryLogs=!entry.allDirectoryLogs;await this.loadLogsForEntry(entry);this.render();}));const list=el('div','asl-log-list'),logs=this.filteredLogs(entry),limit=entry.logLimit||100;for(const log of logs.slice(0,limit)){const row=el('div','asl-log-row'),name=el('span','asl-log-name',log.name);name.title=log.name;row.append(name,el('span','asl-log-size text-muted',this.formatSize(log.size)),el('span','asl-log-date text-muted',this.formatDateTime(log.mtime)),button('查看',()=>this.viewLog(log)));list.append(row);}if(!logs.length)list.append(el('p','text-muted',this.t('No log files found.')));panel.append(list);if(logs.length>limit)panel.append(button('加载更多',()=>{entry.logLimit=limit+100;this.render();}));if(entry.logError)panel.append(el('p','text-danger',entry.logError));return panel;};
    const draw=(group,parent,seen)=>{if(seen.has(group))return;seen.add(group);const box=el('section','asl-group'),expanded=cfg.collapsedGroups?.[group.key]===false,toggle=button('',()=>this.toggleGroup(group),'asl-group-toggle');toggle.setAttribute('aria-expanded',String(expanded));toggle.append(el('span',null,expanded?'▾':'▸'),el('strong','asl-group-name',group.key==='__ungrouped__'?this.t('Ungrouped'):group.name),el('span','asl-group-count text-muted',String(group.totalProfiles||group.entries.length)+' '+this.t('profiles')));if(group.children.length)toggle.append(el('small','asl-folder-count text-muted',group.children.length+' '+this.t('folders')));box.append(toggle);if(expanded){if(group.entries.length){const labels=el('div','asl-profile-grid asl-column-head text-muted');for(const text of ['Profile','Log directory','Logs',''])labels.append(el('span',null,this.t(text)));box.append(labels);}for(const entry of group.entries){const card=el('div','card'),row=el('div','asl-profile-grid'),name=el('strong','asl-profile-name',this.profileName(entry));name.title=this.profileName(entry);const input=el('input','form-control');input.value=entry.directory;input.placeholder=cfg.defaultDirectory;input.setAttribute('aria-label',this.profileName(entry)+' · '+this.t('Log directory'));input.title=entry.directory||cfg.defaultDirectory;input.addEventListener('change',guard(async()=>{const previous=entry.directory;entry.directory=input.value;try{await this.setProfileDirectory(entry);this.refreshLogs();this.render();}catch(e){entry.directory=previous;input.value=previous;throw e;}}));const count=button('',()=>this.toggleLogs(entry),'asl-log-count');count.dataset.logCount=String(this.profileEntries.indexOf(entry));count.textContent=entry.logsScanned?String(entry.logs.length):'—';count.title=this.t(entry.logsExpanded?'Collapse logs':'Show logs');count.setAttribute('aria-label',this.profileName(entry)+' · '+count.title);count.setAttribute('aria-expanded',String(entry.logsExpanded));row.append(name,input,count,button('Browse',()=>this.pickProfile(entry)));card.append(row);if(entry.logsExpanded)card.append(logPanel(entry));box.append(card);}if(group.children.length){const children=el('div','asl-children');group.children.forEach(child=>draw(child,children,seen));box.append(children);}}parent.append(box);};
    for(const group of this.profileGroups)draw(group,section,new Set());loggingPage.append(section,el('small','asl-footer text-muted',this.t('文件夹默认折叠并记住展开状态。每个新 SSH 窗口生成独立日志；已有日志不会自动清理。')));
    const pages=suiteSettingsUI.render(this,el,button);for(const [key,page]of [['logging',loggingPage],['general',pages.general],['appearance',pages.appearance]]){page.hidden=this.activePage!==key;main.append(page);}host.append(main);
  }
}
module.exports={AutoLoggerSettingsTabComponent};
