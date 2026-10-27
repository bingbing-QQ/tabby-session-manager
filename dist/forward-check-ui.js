'use strict';
const checker=require('./forward-check');
function readRules(svc,profile){try{const rules=svc.effectiveConnectionOptions(profile).forwardedPorts;return Array.isArray(rules)?rules.map(checker.normalize):[];}catch(_){return [];}}
function openTargets(svc){return svc.getOpenTabs().filter(({tab})=>tab.profile&&tab.profile.type==='ssh').map(({tab})=>{
 const session=tab.sshSession||null,profile=tab.profile;
 const read=()=>readRules(svc,tab.profile);
 const rules=read(),signature=JSON.stringify(rules),opts=svc.effectiveConnectionOptions(profile);
 return {id:'window:'+profile.id+':'+svc.windowNumber(tab),kind:'window',profileId:String(profile.id||''),label:svc.profileName(profile)+svc.t(' · 窗口 ')+svc.windowNumber(tab)+' · '+String(opts.host||''),rules,sshSession:session,tab,isCurrent:()=>!svc.destroyed&&svc.getOpenTabs().some(item=>item.tab===tab)&&tab.sshSession===session&&JSON.stringify(read())===signature};
 });}
function savedTargets(svc){return svc.liveProfiles().filter(p=>p.type==='ssh'&&!p.isTemplate).map(profile=>{
 const read=p=>readRules(svc,p),rules=read(profile),signature=JSON.stringify(rules),opts=svc.effectiveConnectionOptions(profile);
 return {id:'saved:'+profile.id,kind:'saved',profileId:String(profile.id),label:svc.profileName(profile)+' · '+String(opts.host||''),rules,isCurrent:()=>{const live=svc.profileById(profile.id);return !!live&&JSON.stringify(read(live))===signature;}};
 });}
const runtime={CONFIGURED:'已配置',LISTENING:'正在监听',CONFLICT:'端口冲突',DISCONNECTED:'连接失效',REMOTE_REGISTERED:'远端已登记'};
const binding={UNKNOWN:'未能确认',AVAILABLE:'可以监听',EXCLUDED:'系统排除',OCCUPIED:'普通占用',CURRENT_CONNECTION:'当前连接使用',DENIED:'绑定被拒绝',INVALID:'规则无效',REMOTE_ONLY:'需在远端检查',STALE:'对象已变化',CANCELLED:'检查已取消'};
const explanations={INVALID_TARGET:'本地或远程转发必须指定有效的目标地址和目标端口。',REMOTE_NOT_PROBED:'远程转发监听在服务器端，本工具不登录远端执行检查。',LITERAL_ADDRESS_REQUIRED:'当前仅检查明确的 IPv4 或 IPv6 监听地址，未解析主机名。',INVALID_PORT:'监听端口必须是 1–65535 的整数。',INVALID_RULE_TYPE:'无法识别转发类型。',LISTENER_NOT_BUSINESS_TEST:'已确认当前转发的本地监听，未验证远端业务。',SHARED_SSH_CONNECTION:'此窗口复用了同一个 SSH 连接和转发监听。',OWNERSHIP_UNCONFIRMED:'转发已登记，但无法确认监听属于当前转发。',DENIAL_NOT_CONFIRMED_EXCLUSION:'绑定被拒绝，但未确认命中系统排除范围，不能据此认定端口被占用。',REGISTERED_WITHOUT_VERIFIED_LISTENER:'转发已登记，但没有确认到运行中的本地监听。',MULTIPLE_SELECTED_BINDINGS:'多个所选对象使用同一监听地址和端口，启动独立连接时可能冲突。',TARGET_CHANGED:'检查期间对象已关闭、重连或规则已变化，请重新选择并检查。'};
const warningLabels={WINDOWS_DETAILS_UNAVAILABLE:'当前平台无法读取 Windows 排除范围和进程信息。',IPV4_EXCLUSIONS_UNAVAILABLE:'未能读取 IPv4 排除范围。',IPV6_EXCLUSIONS_UNAVAILABLE:'未能读取 IPv6 排除范围。',LISTENERS_UNAVAILABLE:'未能读取本地监听进程，普通占用仍通过绑定错误判断。'};
function show(svc){
 const t=text=>svc.t(text),ref=svc.createOverlay(t('端口转发检查'));ref.dialog.classList.add('tsm2-forward-dialog');
 const body=document.createElement('div');body.className='tsm2-dialog-body';let scope='current',targets=[],selected=new Set(),report=null,busy=false,generation=0,page=0;
 const controls=document.createElement('div');controls.className='tsm2-forward-controls';
 const mode=svc.select([{value:'current',label:t('当前窗口')},{value:'opened',label:t('已打开窗口')},{value:'saved',label:t('已保存会话')}],scope);mode.setAttribute('aria-label',t('检查对象'));
 const check=svc.createButton(t('检查所选'),t('检查所选'),()=>run(),'tsm2-primary');
 const reload=svc.createButton(t('刷新对象'),t('刷新对象'),()=>load(),'tsm2-secondary');
 const label=document.createElement('label');label.textContent=t('检查对象');label.appendChild(mode);controls.append(label,check,reload);body.appendChild(controls);
 const list=document.createElement('div');list.className='tsm2-forward-targets';list.setAttribute('aria-label',t('选择检查对象'));body.appendChild(list);
 const status=document.createElement('div');status.className='tsm2-help';status.setAttribute('aria-live','polite');body.appendChild(status);
 const output=document.createElement('div');output.className='tsm2-forward-output';body.appendChild(output);
 const detailWindows=new Set();
 const hint=document.createElement('div');hint.className='tsm2-help';hint.textContent=t('仅检查所选对象，不自动连接、不重建转发、不修改规则或系统设置。可以监听仅代表检查时的绑定结果。');body.appendChild(hint);
 ref.dialog.appendChild(body);const footer=document.createElement('div');footer.className='tsm2-dialog-footer';
 const exportButton=svc.createButton(t('导出检查报告'),t('导出检查报告'),()=>{if(report)svc.downloadTextFile('tabby-forward-check.json',JSON.stringify(report,null,2));},'tsm2-secondary');exportButton.disabled=true;
 footer.append(exportButton,svc.createButton(t('关闭'),t('关闭'),()=>ref.overlay.remove(),'tsm2-secondary'));ref.dialog.appendChild(footer);
 ref.closed.then(()=>{generation++;for(const child of detailWindows)child.overlay.remove();detailWindows.clear();});
 const updateButtons=()=>{list.querySelectorAll('input').forEach(input=>{input.disabled=busy;});check.disabled=busy||!selected.size;mode.disabled=busy;reload.disabled=busy;exportButton.disabled=busy||!report;};
 function load(){generation++;report=null;page=0;output.replaceChildren();exportButton.disabled=true;
  scope=mode.value;const opened=openTargets(svc);targets=scope==='saved'?savedTargets(svc):scope==='opened'?opened:opened.filter(target=>target.tab===svc.currentLoggingTab());
  targets=targets.filter(target=>target.rules.length);selected=new Set();if(scope==='current'&&targets[0])selected.add(targets[0].id);
  list.replaceChildren();if(!targets.length){const empty=document.createElement('div');empty.textContent=t('没有包含转发规则的可选 SSH 对象。');list.appendChild(empty);}
  for(const target of targets){const row=document.createElement('label');row.className='tsm2-forward-target';const input=svc.input('checkbox');input.checked=selected.has(target.id);input.setAttribute('aria-label',target.label);input.addEventListener('change',()=>{if(input.checked)selected.add(target.id);else selected.delete(target.id);updateButtons();});const name=document.createElement('span');name.textContent=target.label+' · '+target.rules.length+' '+t('条规则');name.title=name.textContent;row.append(input,name);list.appendChild(row);}
  status.textContent=scope==='saved'?t('已保存会话仅检查配置和本地绑定，不会自动建立 SSH 连接。'):t('选择包含转发规则的窗口后执行检查。');updateButtons();
 }
 function showDetails(row){
  const child=svc.createOverlay(t('转发检查详情'));child.dialog.classList.add('tsm2-forward-detail-dialog');detailWindows.add(child);child.closed.then(()=>detailWindows.delete(child));
  const detail=document.createElement('div');detail.className='tsm2-dialog-body tsm2-forward-details-body';child.dialog.appendChild(detail);
  const footer=document.createElement('div');footer.className='tsm2-dialog-footer';footer.appendChild(svc.createButton(t('关闭'),t('关闭'),()=>child.overlay.remove(),'tsm2-secondary'));child.dialog.appendChild(footer);
const title=document.createElement('strong');title.textContent=row.targetLabel+' · '+row.rule.host+':'+row.rule.port;const values=document.createElement('div');values.textContent=t(runtime[row.runtime]||'未能确认')+' · '+t(binding[row.binding]||'未能确认');detail.append(title,values);
  const add=text=>{const item=document.createElement('div');item.textContent=text;detail.appendChild(item);};
  add(t('监听地址：')+row.rule.host+':'+row.rule.port);
  add(t('目标地址：')+(row.rule.type==='Dynamic'?'SOCKS':row.rule.targetAddress+':'+row.rule.targetPort));
  add(t('检查时间：')+new Date(row.checkedAt||report.checkedAt).toLocaleString());
  if(row.runtime==='DISCONNECTED')add(t('SSH 连接已断开，端口可以绑定也不代表转发已经恢复。'));
  if(row.runtime==='CONFIGURED')add(t('规则已保存，但未确认当前对象有运行中的转发。'));
  if(row.binding==='EXCLUDED')add(t('端口命中 Windows 系统排除范围，创建监听会受到限制。'));
  if(row.binding==='OCCUPIED')add(t('该地址和端口已有监听，请查看占用进程或相关窗口。'));
  if(row.binding==='UNKNOWN')add(t('现有信息不足以确认状态，请结合查询提示和错误代码判断。'));
  if(row.excludedRange)add(t('系统排除范围：')+row.excludedRange.start+'–'+row.excludedRange.end);
  for(const owner of row.owners||[])add((owner.process||t('未知进程'))+' · PID '+owner.pid+' · '+owner.address+':'+owner.port);
  for(const text of row.relatedWindows||[])add(t('相关窗口：')+text);
  if(row.binding==='AVAILABLE')add(t('临时监听已立即关闭，未保留检查端口。'));
  if(row.binding==='CURRENT_CONNECTION')add(t('当前转发自己的监听未被停止或重新绑定。'));
  if(row.code)add(t('错误代码：')+row.code);
  for(const key of row.details||[])if(explanations[key])add(t(explanations[key]));
 }
 function draw(){output.replaceChildren();if(!report)return;
  const rows=report.results,totalPages=Math.max(1,Math.ceil(rows.length/50));page=Math.min(page,totalPages-1);
  const table=document.createElement('table');table.className='tsm2-forward-table';const thead=document.createElement('thead'),head=document.createElement('tr');
  for(const text of ['对象与转发','转发运行','端口绑定','详情']){const th=document.createElement('th');th.textContent=t(text);head.appendChild(th);}thead.appendChild(head);table.appendChild(thead);const tbody=document.createElement('tbody');
  for(const row of rows.slice(page*50,page*50+50)){const tr=document.createElement('tr');const target=document.createElement('td');const name=document.createElement('div');name.className='tsm2-forward-object';name.textContent=row.targetLabel;name.title=row.targetLabel;const address=document.createElement('div');address.textContent=row.rule.type+' '+row.rule.host+':'+row.rule.port;const dest=document.createElement('div');dest.className='tsm2-help';dest.textContent=row.rule.type==='Dynamic'?'SOCKS':'→ '+row.rule.targetAddress+':'+row.rule.targetPort;target.append(name,address,dest);
   const run=document.createElement('td');run.textContent=t(runtime[row.runtime]||'未能确认');if(row.runtime==='LISTENING')run.className='recording';const bind=document.createElement('td');bind.textContent=t(binding[row.binding]||'未能确认');if(['EXCLUDED','DENIED','INVALID','OCCUPIED'].includes(row.binding))bind.className='failed';const action=document.createElement('td');action.appendChild(svc.createButton(t('查看'),t('查看检查详情'),()=>showDetails(row),'tsm2-window-link'));tr.append(target,run,bind,action);tbody.appendChild(tr);
  }table.appendChild(tbody);output.appendChild(table);
  if(rows.length>50){const pager=document.createElement('div');pager.className='tsm2-forward-controls';pager.append(svc.createButton(t('上一页'),t('上一页'),()=>{page=Math.max(0,page-1);draw();},'tsm2-secondary'),document.createTextNode((page+1)+' / '+totalPages),svc.createButton(t('下一页'),t('下一页'),()=>{page=Math.min(totalPages-1,page+1);draw();},'tsm2-secondary'));output.appendChild(pager);}
 }
 async function run(){if(busy||!selected.size)return;busy=true;report=null;output.replaceChildren();const request=++generation;updateButtons();status.textContent=t('正在检查');
  const chosen=targets.filter(target=>selected.has(target.id));const cancelled=()=>svc.destroyed||!ref.overlay.isConnected||request!==generation;
  try{const result=await checker.checkRules(chosen,{cancelled,openTargets:openTargets(svc),onProgress:(done,total)=>{if(!cancelled())status.textContent=t('正在检查')+' '+done+' / '+total;}});
   if(cancelled())return;report=result;page=0;draw();status.textContent=t('检查完成：')+result.results.length+' '+t('条规则')+' · '+new Date(result.checkedAt).toLocaleTimeString();for(const warning of result.warnings){if(warningLabels[warning])status.textContent+=' '+t(warningLabels[warning]);}
  }catch(error){if(!cancelled())status.textContent=error.message==='TOO_MANY_RULES'?t('规则超过 1000 条，请减少所选对象后分批检查。'):t('检查失败，请重试。');}
  finally{if(!cancelled()){busy=false;updateButtons();}}
 }
 mode.addEventListener('change',load);load();return ref;
}
module.exports={show,openTargets,savedTargets,runtime,binding,explanations,warningLabels};
