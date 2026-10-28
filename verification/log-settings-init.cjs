const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
let scans=0,reads=0,gate=null;
const names=['2026-10-28_12-00-00-001_same_a1b2c3.log','2026-10-28_12-00-00-001_other_a1b2c4.log','renamed.log','bad.log','link.log'];
const disk={...fs,openSync(){reads++;throw Error('Cloud hydration attempted')},readSync(){reads++;throw Error('Cloud hydration attempted')},readFileSync(){reads++;throw Error('Cloud hydration attempted')},promises:{
 async readdir(dir){scans++;if(gate)await gate;if(dir==='missing'){const e=Error('missing');e.code='ENOENT';throw e;}return names.map(name=>({name,isFile:()=>true}));},
 async lstat(file){if(file.endsWith('bad.log'))throw Error('Metadata unavailable');return {isFile:()=>true,isSymbolicLink:()=>file.endsWith('link.log'),size:900,mtime:new Date()};}
}};
const moduleMock={exports:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist/logging-settings.js'),'utf8'),{module:moduleMock,exports:moduleMock.exports,process,console,setTimeout,clearTimeout,require:dep=>dep==='fs'?disk:dep.startsWith('./')?require(path.join(__dirname,'../dist',dep)):require(dep)});
const Settings=moduleMock.exports.AutoLoggerSettingsTabComponent;
function fixture(){const config={store:{autoSessionLogger:{defaultDirectory:'cloud',collapsedGroups:{}},profiles:[{id:'p1',type:'ssh',name:'same'},{id:'p2',type:'ssh',name:'same'}],groups:[]},save:async()=>{}};const s=new Settings(config);s.directoryStore={specific:()=>''};s.render=()=>s.paints=(s.paints||0)+1;return s;}
async function settle(s){for(let n=0;n<100&&s.logsLoading;n++)await new Promise(r=>setTimeout(r,5));assert.equal(s.logsLoading,false);}
(async()=>{
 let s=fixture();s.refreshProfiles();assert(s.paints>0);assert.equal(scans,0);await settle(s);assert.equal(scans,1,'Shared directory has one asynchronous metadata scan');assert.equal(reads,0);assert(s.profileEntries.every(e=>e.logs.length===1));assert(s.profileEntries.every(e=>e.logError.includes('Metadata unavailable')));
 await s.toggleLogs(s.profileEntries[0]);assert.equal(reads,0);assert.equal(scans,1,'Expanding reuses metadata cache');s.profileEntries[0].allDirectoryLogs=true;await s.loadLogsForEntry(s.profileEntries[0]);assert.equal(s.profileEntries[0].logs.length,3,'Unmatched and renamed logs remain reachable without content reads');
 let opened='';s.electron={shell:{openPath:async p=>{opened=p;return ''}}};await s.viewLog(s.profileEntries[0].logs[0]);assert(opened.endsWith('.log'),'Only explicit View delegates to OS');s.ngOnDestroy();
 let release;gate=new Promise(r=>release=r);s=fixture();s.refreshProfiles();await new Promise(r=>setTimeout(r,10));let tick=false;await new Promise(r=>setTimeout(()=>{tick=true;r()},0));assert(tick,'Pending cloud metadata must not block event loop');s.config.store.autoSessionLogger.defaultDirectory='missing';s.refreshLogs();gate=null;release();await settle(s);assert(s.profileEntries.every(e=>e.logs.length===0),'Stale cloud scan cannot overwrite new directory');s.ngOnDestroy();
 gate=new Promise(r=>release=r);s=fixture();s.refreshProfiles();await new Promise(r=>setTimeout(r,10));s.ngOnDestroy();const paints=s.paints;gate=null;release();await new Promise(r=>setTimeout(r,15));assert.equal(s.paints,paints,'Destroyed settings must not repaint');
 s=fixture();s.directoryStore.specific=()=>{throw Error('Mapping failure')};s.refreshProfiles();assert(s.profileLoadError.includes('Mapping'));assert(s.paints>0);s.ngOnDestroy();assert.equal(reads,0);
 console.log('PASS metadata-only cloud scan: zero file-data opens/reads, shared cache, filename matching, all-directory fallback, errors, responsive pending I/O, stale-scan rejection and teardown');
})().catch(e=>{console.error(e);process.exitCode=1});
