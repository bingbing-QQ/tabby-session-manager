const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const base=path.join(__dirname,'../scratch-logs/settings-init');fs.mkdirSync(base,{recursive:true});
fs.writeFileSync(path.join(base,'one.log'),'Profile ID : p1\r\nhello');fs.writeFileSync(path.join(base,'two.log'),'Profile ID : p2\r\nhello');fs.writeFileSync(path.join(base,'broken.log'),'broken');
let reads=0;const disk={...fs,readdirSync:(...args)=>{reads++;return fs.readdirSync(...args)},openSync:(file,...args)=>{if(String(file).endsWith('broken.log'))throw Error('File temporarily inaccessible');return fs.openSync(file,...args)}};
const cache={};function load(name){if(cache[name])return cache[name];const module={exports:{}};const context={module,exports:module.exports,process,console,setTimeout,clearTimeout,require:dep=>dep==='fs'?disk:dep==='./logging-core'?load('logging-core'):dep.startsWith('./')?require(path.join(__dirname,'../dist',dep)):require(dep)};assert.equal(context.Buffer,undefined);vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist',name+'.js'),'utf8'),context);return cache[name]=module.exports;}
const {AutoLoggerSettingsTabComponent:Settings}=load('logging-settings');
const wait=()=>new Promise(resolve=>setTimeout(resolve,40));
function fixture(){const config={store:{autoSessionLogger:{defaultDirectory:base,collapsedGroups:{}},profiles:[{id:'p1',type:'ssh',name:'same'},{id:'p2',type:'ssh',name:'same'}],groups:[]},save:async()=>{}};const s=new Settings(config);s.directoryStore={specific:()=>''};s.render=()=>{s.paints=(s.paints||0)+1};return s;}
(async()=>{
 let s=fixture();s.refreshProfiles();assert(s.paints>0,'Settings must render before reading log contents');assert.equal(reads,0);await wait();assert.equal(reads,1,'Shared directory is scanned once per refresh');assert.equal(s.profileEntries[0].logs.length,1);assert.equal(s.profileEntries[1].logs.length,1);assert(s.profileEntries.every(e=>e.logError.includes('temporarily inaccessible')));assert.equal(s.logsLoading,false);s.ngOnDestroy();
 s=fixture();const scan=s.loadLogsForEntry.bind(s);s.loadLogsForEntry=e=>{if(e.id==='p1')throw Error('Single-entry failure');return scan(e)};s.refreshProfiles();await wait();assert(s.profileEntries[0].logError.includes('Single-entry'));assert.equal(s.profileEntries[1].logs.length,1);s.ngOnDestroy();
 s=fixture();s.directoryStore.specific=()=>{throw Error('Legacy mapping failure')};s.refreshProfiles();assert(s.profileLoadError.includes('mapping'));assert(s.paints>0);s.ngOnDestroy();
 s=fixture();let scans=0;s.loadLogsForEntry=()=>scans++;s.refreshProfiles();s.ngOnDestroy();await wait();assert.equal(scans,0,'Closed settings must cancel pending scan');
 console.log('PASS settings initialization without global Buffer, paint-before-scan, shared catalog, unreadable file isolation, entry failure, mapping failure and teardown cancellation');
})().catch(e=>{console.error(e);process.exitCode=1});
