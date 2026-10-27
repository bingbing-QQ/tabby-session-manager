const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {SessionHostThemeSync}=require('../dist/host-theme');
const src=fs.readFileSync(path.join(__dirname,'../dist/index.js'),'utf8');
const Klass=new Function(src.slice(src.indexOf('class SessionManagerService {'),src.indexOf('SessionManagerService.ɵfac'))+';return SessionManagerService;')();
const palettes=()=>Klass.prototype.getThemePalettes();
const clone=value=>JSON.parse(JSON.stringify(value));
function fixture(){
 let calls=0,recorded,fail=false;
 const config={store:{sessionManager:{themePreset:'graphiteGlass'},appearance:{theme:'custom-user-theme',css:'.my-css{}',colorSchemeMode:'auto',vibrancy:true},terminal:{fontSize:17,font:'MyFont',background:'theme',colorScheme:{name:'MyDark',foreground:'#ffffff',background:'#000000',colors:Array(16).fill('#abcdef')},lightColorScheme:{name:'MyLight',foreground:'#111111',background:'#eeeeee',colors:Array(16).fill('#123456')}}},save:async()=>{if(fail)throw Error('disk full');recorded=clone(config.store);}};
 const tab={frontend:{},configure:()=>calls++};const split={getAllTabs:()=>[tab,tab]};
 const notes=[];const controller=new SessionHostThemeSync(config,{tabs:[split,tab]},palettes,(...args)=>notes.push(args));
 return {config,controller,notes,get calls(){return calls},get recorded(){return recorded},fail:()=>{fail=true}};
}
(async()=>{
 let f=fixture(),original=clone(f.config.store);await f.controller.initialize('graphiteGlass');
 assert.deepEqual(f.config.store,original);await f.controller.setOptions({host:true,terminal:false},'warmFrost');assert.deepEqual(f.config.store.terminal,original.terminal);assert.deepEqual(f.config.store.appearance,original.appearance);assert.equal(f.calls,0);
 console.log('PASS UI-only synchronization never changes appearance config, custom CSS, terminal scheme or live terminal');
 f=fixture();original=clone(f.config.store);await f.controller.setOptions({host:true,terminal:true},'warmFrost');
 assert.equal(f.config.store.terminal.colorScheme.background,'#f1eddf');assert.equal(f.config.store.terminal.colorScheme.foreground,'#171714');assert.equal(f.config.store.terminal.colorScheme.colors.length,16);assert.deepEqual(f.config.store.terminal.colorScheme,f.config.store.terminal.lightColorScheme);assert.equal(f.calls,1);
 const firstBackup=clone(f.config.store.sessionManager.terminalThemeBackup.original);await f.controller.setOptions({host:true,terminal:true},'nocturneGlass');assert.deepEqual(f.config.store.sessionManager.terminalThemeBackup.original,firstBackup);
 assert.deepEqual(f.recorded.sessionManager.terminalThemeBackup.original,firstBackup);assert.equal(f.config.store.terminal.fontSize,17);
 await f.controller.setOptions({host:true,terminal:false},'nocturneGlass');assert.deepEqual(f.config.store.terminal,original.terminal);assert.deepEqual(f.config.store.appearance,original.appearance);assert(!f.config.store.sessionManager.terminalThemeBackup);
 console.log('PASS full dark/light/16-ANSI scheme, nested tabs, one original backup across theme changes and exact restoration');
 f=fixture();original=clone(f.config.store);await f.controller.setOptions({host:true,terminal:true},'ghibliSky');
 const restarted={store:clone(f.recorded),save:async()=>{}};const next=new SessionHostThemeSync(restarted,null,palettes);await next.initialize('ghibliSky');await next.setOptions({host:false,terminal:false},'ghibliSky');assert.deepEqual(restarted.store.terminal,original.terminal);
 console.log('PASS restart retains the original backup and restore survives serialization');
 f=fixture();original=clone(f.config.store);f.fail();await assert.rejects(f.controller.setOptions({host:true,terminal:true},'warmFrost'),/disk full/);assert.deepEqual(f.config.store,original);
 f=fixture();await f.controller.setOptions({host:true,terminal:true},'nocturneGlass');original=clone(f.config.store);f.fail();await assert.rejects(f.controller.setOptions({host:false,terminal:false},'nocturneGlass'),/disk full/);assert.deepEqual(f.config.store,original);
 console.log('PASS failed enable and failed restore roll back managed flags, backup and all terminal colors');
 f=fixture();original=clone(f.config.store);await f.controller.setOptions({host:true,terminal:true},'nocturneGlass');f.config.store.terminal.colorScheme={name:'User changed during sync'};f.config.store.terminal.fontSize=22;
 const result=await f.controller.setOptions({host:false,terminal:false},'nocturneGlass');assert(result.preserveManual);assert.equal(f.config.store.terminal.colorScheme.name,'User changed during sync');assert.deepEqual(f.config.store.terminal.lightColorScheme,original.terminal.lightColorScheme);assert.equal(f.config.store.terminal.fontSize,22);
 console.log('PASS restore preserves manual color changes and unrelated settings');
 f=fixture();original=clone(f.config.store);await Promise.all([f.controller.setOptions({host:true,terminal:true},'nocturneGlass'),f.controller.setOptions({host:true,terminal:true},'warmFrost'),f.controller.setOptions({host:false,terminal:false},'warmFrost')]);assert.deepEqual(f.config.store.terminal,original.terminal);assert.equal(f.config.store.sessionManager.syncTerminalTheme,false);
 console.log('PASS queued rapid theme changes and toggles preserve baseline and end in restored state');
 f=fixture();f.config.store.sessionManager={syncHostTheme:true,syncTerminalTheme:true,themePreset:'nocturneGlass'};original=clone(f.config.store);await f.controller.initialize('nocturneGlass');assert.deepEqual(f.config.store,original);assert(f.notes.length);await assert.rejects(f.controller.setOptions({host:true,terminal:true},'warmFrost'),/备份/);assert.deepEqual(f.config.store,original);
 console.log('PASS missing backup never recaptures synchronized settings as the original');
 f=fixture();await f.controller.setOptions({host:false,terminal:true},'playfulNeo');assert.equal(f.config.store.sessionManager.syncTerminalTheme,false);f.controller.destroy();await assert.rejects(f.controller.setOptions({host:true,terminal:true},'warmFrost'),/关闭/);
 console.log('PASS terminal sync cannot remain enabled with UI sync off and destroyed service rejects writes');
 // Reproduce the v1.0.238 ConfigProxy accessor and persistence semantics:
 // only registered defaults have setters backed by the raw YAML store.
 class ConfigProxy {
  constructor(real,defaults){for(const key of Object.keys(defaults)){
   const value=defaults[key],structural=value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length&&!value.__nonStructural;
   if(structural){real[key]||={};const nested=new ConfigProxy(real[key],value);Object.defineProperty(this,key,{enumerable:true,configurable:false,get:()=>nested});}
   else Object.defineProperty(this,key,{enumerable:true,configurable:false,get:()=>{if(real[key]!==undefined)return real[key];if(value&&typeof value==='object'){real[key]=clone(value);delete real[key].__nonStructural;return real[key];}return value;},set:next=>{real[key]=next;}});
  }}
 }
 f=fixture();const raw=clone(f.config.store),defaults=clone(raw);
 defaults.sessionManager={themePreset:'nocturneGlass',syncHostTheme:true,syncTerminalTheme:false,terminalThemeBackup:null};
 defaults.terminal.colorScheme.__nonStructural=true;defaults.terminal.lightColorScheme.__nonStructural=true;
 f.config.store=new ConfigProxy(raw,defaults);const originalProxyTerminal=clone(f.config.store.terminal);
 const proxyController=new SessionHostThemeSync(f.config,null,palettes);await proxyController.setOptions({host:true,terminal:true},'warmFrost');
 assert(raw.sessionManager.terminalThemeBackup);assert.equal(JSON.parse(JSON.stringify(raw)).sessionManager.terminalThemeBackup.original.colorScheme.value.name,'MyDark');
 const reloaded=clone(raw);f.config.store=new ConfigProxy(reloaded,defaults);const reloadController=new SessionHostThemeSync(f.config,null,palettes);
 await reloadController.initialize('warmFrost');await reloadController.setOptions({host:false,terminal:false},'warmFrost');
 assert.deepEqual(clone(f.config.store.terminal),originalProxyTerminal);assert.equal(reloaded.sessionManager.syncTerminalTheme,false);assert.equal(f.config.store.sessionManager.terminalThemeBackup,null);
 assert(/terminalThemeBackup:\s*null/.test(src));
 console.log('PASS v1.0.238 non-configurable ConfigProxy leaves: backup persists to raw store, reload and restore work through registered setters');
})().catch(error=>{console.error(error);process.exitCode=1});
