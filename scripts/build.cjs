const fs=require('fs');const root=require('path').resolve(__dirname,'..');for(const folder of ['shared','logger'])for(const name of fs.readdirSync(root+'/src/'+folder))fs.writeFileSync(root+'/dist/'+name,fs.readFileSync(root+'/src/'+folder+'/'+name,'utf8').replace(/^\uFEFF/,'').replaceAll('\r\n','\n'));let retained=fs.readFileSync(root+'/src/suite-features.methods','utf8').replace(/^\uFEFF/,'').replaceAll('\r\n','\n');const parts=['session-replacement.methods','session-ui.methods'].map(n=>fs.readFileSync(root+'/src/'+n,'utf8').replace(/^\uFEFF/,''));const styles=fs.readFileSync(root+'/src/session.css','utf8').replace(/^\uFEFF/,'');
const header=`/* Tabby Session Suite 4.1.0: replacement implementation; see src and docs/REIMPLEMENTATION.md. */
'use strict';
const core=require('tabby-core'),coreAngular=require('@angular/core'),common=require('@angular/common');
const loggerModule=require('./logging'),suiteI18n=require('./i18n'),forwardCheckUI=require('./forward-check-ui');
const {installSharedCredentialGuard}=require('./credential-guard'),{SessionHostThemeSync}=require('./host-theme');
const optional=name=>{try{return require(name);}catch{return null;}};const ngb=optional('@ng-bootstrap/ng-bootstrap'),tabbySettings=optional('tabby-settings'),tabbySSH=optional('tabby-ssh');
const suiteSettingsController=require('./settings-controller');
const ROOT_ID='tabby-session-manager-root',STYLE_ID='tabby-session-manager-style';
const CONFIG_KEY = 'sessionManager';
const HOTKEY_ID = 'toggle-session-manager';
const SESSION_STYLES=${JSON.stringify(styles)};
class SessionConfigProvider extends core.ConfigProvider {
  constructor() {super();this.defaults={sessionManager:{favoriteIds:[],recentConnections:[],confirmProfileIds:[],importEncoding:'auto',sidebarWidth:280,sidebarVisible:true,dockMode:'pinned',collapsedList:[],appearanceMode:'layered',accentMode:'theme',colorPreset:'slate',themePreset:'nocturneGlass',language: 'auto',sessionInfoExpanded:false,syncHostTheme:true,syncTerminalTheme:false,terminalThemeBackup:null,panelColor:'slate',textColor:'light'},hotkeys:{[HOTKEY_ID]:['Ctrl-Alt-S']}};}
}
SessionConfigProvider.ɵfac=()=>new SessionConfigProvider();
SessionConfigProvider.ɵprov=coreAngular.ɵɵdefineInjectable({token:SessionConfigProvider,factory:SessionConfigProvider.ɵfac,providedIn:'root'});
class SessionManagerService {
`;
const footer=`
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
`;
fs.writeFileSync(root+'/dist/index.js',header+retained+'\n'+parts.join('\n')+footer);
