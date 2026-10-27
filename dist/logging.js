'use strict';
const angular=require('@angular/core'),common=require('@angular/common'),core=require('tabby-core'),terminal=require('tabby-terminal'),settings=require('tabby-settings'),electron=require('tabby-electron');
const {Recorder,defaults}=require('./logging-core');
const {AutoLoggerSettingsTabComponent}=require('./logging-settings');
const suiteI18n=require('./i18n');
class AutoLoggerConfigProvider extends core.ConfigProvider {constructor(){super();this.defaults={autoSessionLogger:defaults(require('os').homedir())};this.platformDefaults={};}}
class AutoLoggerDecorator extends terminal.TerminalDecorator {
  constructor(config,electronService,hostWindow){super();this.engine=new Recorder(config,electronService,hostWindow);}
  get bridge(){return this.engine.bridge;}
  get bridgeConflict(){return this.engine.bridgeConflict;}
  get active(){return this.engine.active;}
  get activeTabs(){return this.engine.activeTabs;}
  attach(tab){this.engine.attach(tab);}
  detach(tab){this.engine.detach(tab);}
  describeTab(tab){return this.engine.describeTab(tab);}
  installBridge(){return this.engine.installBridge();}
  ngOnDestroy(){this.engine.ngOnDestroy();}
}
AutoLoggerDecorator.ctorParameters=()=>[{type:core.ConfigService},{type:electron.ElectronService},{type:electron.ElectronHostWindow}];angular.Injectable()(AutoLoggerDecorator);
AutoLoggerConfigProvider.ctorParameters=()=>[];angular.Injectable()(AutoLoggerConfigProvider);
AutoLoggerSettingsTabComponent.ctorParameters=()=>[{type:core.ConfigService},{type:electron.ElectronService},{type:electron.ElectronHostWindow},{type:angular.ChangeDetectorRef},{type:angular.NgZone},{type:angular.ElementRef}];
angular.Component({template:'<div data-log-settings-mount></div>',standalone:false})(AutoLoggerSettingsTabComponent);
class AutoLoggerSettingsTabProvider extends settings.SettingsTabProvider {
  constructor(config){super();this.config=config;this.id = 'session-log-manager';this.icon='layer-group';this.weight=100;}
  get title(){return suiteI18n.t('Session Suite',this.config);}
  getComponentType(){return AutoLoggerSettingsTabComponent;}
}
AutoLoggerSettingsTabProvider.ctorParameters=()=>[{type:core.ConfigService}];angular.Injectable()(AutoLoggerSettingsTabProvider);
class LoggerModule {}
angular.NgModule({imports:[common.CommonModule,core.default],declarations:[AutoLoggerSettingsTabComponent],entryComponents:[AutoLoggerSettingsTabComponent],providers:[AutoLoggerDecorator,{provide:core.ConfigProvider,useClass:AutoLoggerConfigProvider,multi:true},{provide:settings.SettingsTabProvider,useClass:AutoLoggerSettingsTabProvider,multi:true},{provide:terminal.TerminalDecorator,useExisting:AutoLoggerDecorator,multi:true},{provide:angular.APP_INITIALIZER,useFactory:recorder=>()=>recorder.installBridge(),deps:[AutoLoggerDecorator],multi:true}]})(LoggerModule);
module.exports={default:LoggerModule,AutoLoggerDecorator,AutoLoggerConfigProvider,AutoLoggerSettingsTabComponent,AutoLoggerSettingsTabProvider};
