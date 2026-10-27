'use strict';
const net = require('net');
const path = require('path');
const {execFile} = require('child_process');
function run(file,args){return new Promise((resolve,reject)=>execFile(file,args,{windowsHide:true,timeout:9000,maxBuffer:4*1024*1024,encoding:'utf8'},(error,stdout)=>error?reject(error):resolve(stdout)));}
function parseExclusions(text){
 const ranges=[];for(const line of String(text||'').split(/\r?\n/)){const m=line.match(/^\s*(\d+)\s+(\d+)\s*(\*)?\s*$/);if(m){const start=Number(m[1]),end=Number(m[2]);if(start>=1&&end<=65535&&end>=start)ranges.push({start,end});}}
 // Empty lists still have a table separator; command errors must never be treated as an empty success.
 if(!ranges.length&&!/^\s*-+\s+-+/m.test(String(text)))throw Error('EXCLUSION_PARSE_FAILED');
 return ranges;
}
function parseNetstat(text){
 if(!/Proto|协议/i.test(String(text)))throw Error('LISTENER_PARSE_FAILED');
 const rows=[];for(const line of String(text).split(/\r?\n/)){
  const m=line.match(/^\s*TCP\s+(\[?[^\s]+\]?):(\d+)\s+\S+\s+(?:LISTENING|侦听)\s+(\d+)\s*$/i);
  if(m){const address=m[1].replace(/^\[|\]$/g,'');if(net.isIP(address))rows.push({address,port:Number(m[2]),pid:Number(m[3]),process:''});}
 }return rows;
}
async function systemSnapshot(options={}){
 const platform=options.platform||process.platform,execute=options.run||run;
 const state={ranges4:[],ranges6:[],ranges4Known:false,ranges6Known:false,listeners:[],listenersKnown:false,warnings:[]};
 if(platform!=='win32'){state.warnings.push('WINDOWS_DETAILS_UNAVAILABLE');return state;}
 const dir=process.env.SystemRoot||'C:\\Windows';
 const queries=[['ranges4',['interface','ipv4','show','excludedportrange','protocol=tcp']],['ranges6',['interface','ipv6','show','excludedportrange','protocol=tcp']]];
 const tasks=queries.map(async([key,args])=>{try{state[key]=parseExclusions(await execute(path.join(dir,'System32','netsh.exe'),args));state[key+'Known']=true;}catch(_){state.warnings.push(key==='ranges4'?'IPV4_EXCLUSIONS_UNAVAILABLE':'IPV6_EXCLUSIONS_UNAVAILABLE');}});
 const script="$ErrorActionPreference='Stop';[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new();try{$rows=@(Get-NetTCPConnection -State Listen -ErrorAction Stop | ForEach-Object { $listenerPid=$_.OwningProcess; $listenerProcess=Get-Process -Id $listenerPid -ErrorAction SilentlyContinue; [pscustomobject]@{address=$_.LocalAddress;port=$_.LocalPort;pid=$listenerPid;process=$listenerProcess.ProcessName} }); ConvertTo-Json -InputObject $rows -Compress}catch{if($_.FullyQualifiedErrorId -like 'CmdletizationQuery_NotFound*'){'[]'}else{exit 1}}";
 tasks.push((async()=>{try{const parsed=JSON.parse((await execute(path.join(dir,'System32','WindowsPowerShell','v1.0','powershell.exe'),['-NoLogo','-NoProfile','-NonInteractive','-Command',script])).replace(/^\uFEFF/,''));const rows=Array.isArray(parsed)?parsed:parsed?[parsed]:[];state.listeners=rows.filter(r=>r&&net.isIP(String(r.address))&&Number.isInteger(Number(r.port))).map(r=>({address:String(r.address),port:Number(r.port),pid:Number(r.pid)||0,process:String(r.process||'')}));state.listenersKnown=true;}catch(_){try{state.listeners=parseNetstat(await execute(path.join(dir,'System32','netstat.exe'),['-ano','-p','tcp']));state.listenersKnown=true;}catch(_){state.warnings.push('LISTENERS_UNAVAILABLE');}}})());
 await Promise.all(tasks);return state;
}
function normalize(rule){rule=rule||{};const type=String(rule.type||'Local');return {type,host:String(rule.host||'127.0.0.1'),port:Number(rule.port),targetAddress:String(rule.targetAddress||''),targetPort:Number(rule.targetPort)||0};}
function ruleKey(rule){const r=normalize(rule);return JSON.stringify([r.type,r.host,r.port,r.type==='Dynamic'?'':r.targetAddress,r.type==='Dynamic'?0:r.targetPort]);}
function overlap(a,b){if(a===b)return true;if(a==='::'||b==='::')return true;return net.isIP(a)===4&&net.isIP(b)===4&&(a==='0.0.0.0'||b==='0.0.0.0');}
function listenerOf(fw){try{const server=fw&&fw.listener;if(!server)return null;const address=typeof server.address==='function'?server.address():null;if(server.listening===true||address&&typeof address==='object')return {active:true,address};if(server.listening===false)return {active:false};return null;}catch(_){return null;}}
function probe(host,port,{timeout=1200,cancelled=()=>false}={}){
 return new Promise(resolve=>{
  if(cancelled())return resolve({binding:'CANCELLED'});
  const server=net.createServer(socket=>socket.destroy());let settled=false;let timer;
  const finish=result=>{if(settled)return;settled=true;clearTimeout(timer);try{server.close(()=>resolve(result));}catch(_){resolve(result);}};
  server.once('error',e=>finish({binding:e.code==='EADDRINUSE'?'OCCUPIED':e.code==='EACCES'?'DENIED':'UNKNOWN',code:e.code||'BIND_FAILED'}));
  server.once('listening',()=>{if(settled){try{server.close();}catch(_){}return;}finish({binding:cancelled()?'CANCELLED':'AVAILABLE'});});
  timer=setTimeout(()=>finish({binding:'UNKNOWN',code:'BIND_TIMEOUT'}),timeout);
  try{server.listen({host,port,exclusive:true});}catch(e){finish({binding:'UNKNOWN',code:e.code||'BIND_FAILED'});}
 });
}
async function checkRules(targets,options={}){
 const cancelled=options.cancelled||(()=>false),snapshot=options.snapshot||await systemSnapshot(options),test=options.probe||probe;
 const results=[],cache=new Map(),targetsByBinding=new Map();
 const jobs=[];
 for(const target of targets){for(const source of target.rules||[]){const rule=normalize(source);jobs.push({target,rule});if(rule.type!=='Remote'){const key=rule.host+':'+rule.port;if(!targetsByBinding.has(key))targetsByBinding.set(key,new Set());targetsByBinding.get(key).add(target.id);}}}
 if(jobs.length>1000)throw Error('TOO_MANY_RULES');
 for(const {target,rule} of jobs){
  if(cancelled())break;
  const result={targetId:target.id,targetLabel:target.label,profileId:target.profileId||'',rule,runtime:'CONFIGURED',binding:'UNKNOWN',details:[],checkedAt:new Date().toISOString()};
  const stillCurrent=()=>!target.isCurrent||target.isCurrent();
  if(!stillCurrent()){result.runtime=target.kind==='window'?'DISCONNECTED':'CONFIGURED';result.binding='STALE';result.details.push('TARGET_CHANGED');results.push(result);continue;}
  const ssh=target.sshSession,connected=!!ssh&&ssh.open===true;
  const registered=connected&&Array.isArray(ssh.forwardedPorts)?ssh.forwardedPorts.find(fw=>ruleKey(fw)===ruleKey(rule)):null;
  if(target.kind==='window'&&(!stillCurrent()||!connected))result.runtime='DISCONNECTED';
  if(!Number.isInteger(rule.port)||rule.port<1||rule.port>65535){result.binding='INVALID';result.details.push('INVALID_PORT');results.push(result);continue;}
  if(['Local','Remote'].includes(rule.type)&&(!rule.targetAddress.trim()||!Number.isInteger(rule.targetPort)||rule.targetPort<1||rule.targetPort>65535)){result.binding='INVALID';result.details.push('INVALID_TARGET');results.push(result);continue;}
  if(rule.type==='Remote'){result.binding='REMOTE_ONLY';if(registered&&stillCurrent())result.runtime='REMOTE_REGISTERED';result.details.push('REMOTE_NOT_PROBED');results.push(result);continue;}
  if(!['Local','Dynamic'].includes(rule.type)){result.binding='INVALID';result.details.push('INVALID_RULE_TYPE');results.push(result);continue;}
  // Do not resolve arbitrary DNS names or bind a different interface from the configured one.
  if(!net.isIP(rule.host)){result.binding='UNKNOWN';result.details.push('LITERAL_ADDRESS_REQUIRED');results.push(result);continue;}
  const ownListener=registered&&listenerOf(registered);
  if(ownListener&&ownListener.active&&stillCurrent()){result.runtime='LISTENING';result.binding='CURRENT_CONNECTION';result.details.push('LISTENER_NOT_BUSINESS_TEST');results.push(result);continue;}
  if(registered&&!ownListener){result.binding='UNKNOWN';result.details.push('OWNERSHIP_UNCONFIRMED');results.push(result);continue;}
  const family=net.isIP(rule.host),ranges=family===6?snapshot.ranges6:snapshot.ranges4;
  const excluded=(ranges||[]).find(r=>rule.port>=r.start&&rule.port<=r.end);
  const owners=(snapshot.listeners||[]).filter(r=>r.port===rule.port&&overlap(rule.host,r.address));
  const shared=[];
  for(const other of options.openTargets||targets){if(other.isCurrent&&!other.isCurrent())continue;const session=other.sshSession;if(!session||session.open!==true)continue;for(const fw of session.forwardedPorts||[]){if(fw.type==='Remote'||Number(fw.port)!==rule.port||!overlap(rule.host,String(fw.host||'127.0.0.1')))continue;const listener=listenerOf(fw);if(listener&&listener.active)shared.push({session,fw,label:other.label});}}
  const exactShared=shared.find(s=>s.session===ssh&&ruleKey(s.fw)===ruleKey(rule));
  if(exactShared&&stillCurrent()){result.runtime='LISTENING';result.binding='CURRENT_CONNECTION';result.details.push('SHARED_SSH_CONNECTION');}
  else if(owners.length||shared.length){result.binding='OCCUPIED';result.owners=owners;result.relatedWindows=[...new Set(shared.map(s=>s.label))];if(connected&&target.kind==='window')result.runtime='CONFLICT';if(registered&&!ownListener)result.details.push('OWNERSHIP_UNCONFIRMED');}
  else if(excluded){result.binding='EXCLUDED';result.excludedRange=excluded;}
  else {
   const key=rule.host+':'+rule.port;
   if(!cache.has(key))cache.set(key,test(rule.host,rule.port,{cancelled}));
   Object.assign(result,await cache.get(key));
   if(result.binding==='OCCUPIED'&&connected&&target.kind==='window')result.runtime='CONFLICT';
   if(result.binding==='DENIED')result.details.push('DENIAL_NOT_CONFIRMED_EXCLUSION');
   if(registered)result.details.push('REGISTERED_WITHOUT_VERIFIED_LISTENER');
  }
  if((targetsByBinding.get(rule.host+':'+rule.port)||new Set()).size>1)result.details.push('MULTIPLE_SELECTED_BINDINGS');
  if(!stillCurrent()){result.runtime=target.kind==='window'?'DISCONNECTED':'CONFIGURED';result.binding='STALE';result.details.push('TARGET_CHANGED');}
  if(target.kind==='window'&&ssh&&ssh.open!==true){result.runtime='DISCONNECTED';result.binding='STALE';result.details.push('TARGET_CHANGED');}
  results.push(result);if(options.onProgress)options.onProgress(results.length,jobs.length);
 }
 return {checkedAt:new Date().toISOString(),results,warnings:snapshot.warnings||[],cancelled:cancelled()};
}
module.exports={systemSnapshot,parseExclusions,parseNetstat,normalize,ruleKey,listenerOf,probe,checkRules,overlap};
