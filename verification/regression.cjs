const fs = require('fs'), assert = require('assert/strict');
const src=fs.readFileSync(require('path').join(__dirname,'../dist/index.js'),'utf8');
const Klass=new Function("const CONFIG_KEY=\"sessionManager\";"+src.slice(src.indexOf('class SessionManagerService {'),src.indexOf('SessionManagerService.ɵfac'))+'\nreturn SessionManagerService;')();
let count=0;
const test=async(name,fn)=>{await fn();count++;console.log('PASS '+name)};
function fixture(profiles=[],groups=[]) {
 const s=Object.create(Klass.prototype); s.profiles=profiles;s.groups=groups;s.config={store:{profiles,groups},save:async()=>{}};
 s.refreshAndRender=async()=>{s.profiles=s.config.store.profiles;s.groups=s.config.store.groups;s.treeModel=null};s.log=()=>{};
 return s;
}
(async()=>{
await test('non-sensitive connection changes refresh signature',()=>{
 const s=fixture([{id:'p',name:'p',type:'ssh',options:{host:'a'}}]);let sig=s.getConfigSignature();s.profiles[0].options.host='b';assert.notEqual(sig,s.getConfigSignature());sig=s.getConfigSignature();s.profiles[0].options.password='secret';assert.equal(sig,s.getConfigSignature());
});
await test('schema v2 roundtrip preserves nested and slash-containing same-name groups',async()=>{
 const groups=[{id:'a',name:'A / special'},{id:'b',name:'same',parentGroupId:'a'},{id:'c',name:'same',parentGroupId:'a'}];
 const s=fixture([{id:'p',name:'SSH',type:'ssh',group:'c',options:{host:'h',port:22,user:'u',auth:'publicKey',password:'secret',privateKeys:['secret']}},{id:'s',name:'Serial',type:'serial',group:'b',options:{port:'COM3',baudrate:115200,databits:8}},{id:'l',name:'Local',type:'local',options:{cwd:'C:/work',command:'secret',env:{TOKEN:'secret'}}}],groups);
 const backup=s.createBackupDocument();assert.equal(backup.schemaVersion,2);assert(!JSON.stringify(backup).includes('secret'));
 const target=fixture();const plan=target.buildBackupImportPlan(backup);await target.applyImportPlan(plan,'skip');
 assert.equal(target.profiles.length,3);assert.equal(target.groups.length,3);
 assert.notEqual(target.profiles[0].group,target.profiles[1].group);
 assert.equal(target.profiles[0].options.auth,'publicKey');assert.equal(target.profiles[1].options.port,'COM3');assert.equal(target.profiles[1].options.baudrate,115200);assert.equal(target.profiles[2].options.cwd,'C:/work');
 await target.applyImportPlan(target.buildBackupImportPlan(backup),'skip');assert.equal(target.profiles.length,3);assert.equal(target.groups.length,3);
});
await test('legacy schema v1 display paths and external import canonical paths',async()=>{
 const s=fixture();const backup={schemaVersion:1,format:'tabby-session-manager-backup',groups:[{sourceId:'a',name:'A'},{sourceId:'b',name:'B',parentSourceId:'a'}],profiles:[{name:'old',type:'ssh',groupRef:'b',groupPath:'A / B',options:{host:'h',auth:'password'}}]};
 await s.applyImportPlan(s.buildBackupImportPlan(backup),'skip');assert.equal(s.groups.find(g=>g.id===s.profiles[0].group).name,'B');
 await s.applyImportPlan(s.buildImportPlan([{name:'csv',host:'h2',folder:' A / B '}],'CSV'),'skip');assert.equal(s.profiles[0].group,s.profiles[1].group);
});
await test('malformed/cyclic backup rejected before writing',()=>{
 const s=fixture();for(const groups of [[{sourceId:'a',name:'a',parentSourceId:'a'}],[{sourceId:'a',name:'a',parentSourceId:'missing'}],[{sourceId:'a',name:'a'},{sourceId:'a',name:'b'}]]) assert.throws(()=>s.buildBackupImportPlan({schemaVersion:2,format:'tabby-session-manager-backup',groups,profiles:[]}));assert.equal(s.groups.length,0);
});
await test('rollback preserves unrelated concurrent edits',async()=>{
 const s=fixture([{id:'old',name:'old',type:'ssh',options:{host:'old'}}]);
 s.profilesService={newProfile:async p=>{s.config.store.profiles.push(p);s.config.store.profiles[0].name='edited elsewhere';s.config.store.profiles.push({id:'other',name:'other'});throw Error('write failure')}};
 await assert.rejects(()=>s.applyImportPlan(s.buildImportPlan([{name:'new',host:'new',folder:'A/B'}],'CSV'),'skip'));
 assert.deepEqual(s.config.store.profiles.map(p=>p.id),['old','other']);assert.equal(s.config.store.profiles[0].name,'edited elsewhere');assert.equal(s.config.store.groups.length,0);assert.equal(s.importInProgress,false);
});
await test('double import is rejected while first import waits',async()=>{
 const s=fixture();let release; s.config.save=()=>new Promise(r=>{release=r}); const plan=s.buildImportPlan([{name:'new',host:'h'}],'CSV');const first=s.applyImportPlan(plan,'skip');await new Promise(r=>setImmediate(r));await assert.rejects(()=>s.applyImportPlan(plan,'copy'),/正在进行/);release();await first;assert.equal(s.profiles.length,1);
});
await test('Local and Remote coexist; Dynamic overlaps Local; wildcard overlaps concrete',async()=>{
 const local={type:'Local',host:'127.0.0.1',port:8080,targetAddress:'h',targetPort:80};const remote={...local,type:'Remote'};const s=fixture([{id:'p',name:'p',type:'ssh',options:{host:'fresh',forwardedPorts:[local]}}]);
 await s.applyPortConfig({id:'p',options:{host:'stale'}},[remote],'add','skip');assert.equal(s.profiles[0].options.forwardedPorts.length,2);assert.equal(s.profiles[0].options.host,'fresh');
 assert(s.forwardingListenersConflict(local,{...local,type:'Dynamic'}));assert(s.forwardingListenersConflict(local,{...local,host:'0.0.0.0'}));
 await assert.rejects(()=>s.applyPortConfig(s.profiles[0],[local,{...local,targetPort:81}],'replace','skip'),/冲突/);
 await s.applyPortConfig(s.profiles[0],[{...local,host:'0.0.0.0',targetPort:81}],'add','replace');assert.equal(s.profiles[0].options.forwardedPorts.length,2);
});
await test('Xshell, SecureCRT, CSV parsers retained',()=>{
 const s=fixture();assert.equal(s.parseCsvRecords('name,host,user\nhello,server,root')[0].host,'server');
 assert.equal(s.parseXshellXsh('[CONNECTION]\nHost=example.com\nPort=22\nProtocol=SSH\n[CONNECTION:AUTHENTICATION]\nUserName=root','hello.xsh','hello.xsh').host,'example.com');
 const record=s.parseSecureCRTIni('S:"Hostname"=example.com\nS:"Protocol Name"=SSH2\nD:"[SSH2] Port"=00000016','hello.ini','hello.ini');assert.equal(record.host,'example.com');
});
await test('async button prevents repeat submissions and recovers after failure',async()=>{
 let click;global.document={createElement:()=>({setAttribute(){},addEventListener:(name,fn)=>{click=fn}})};
 const s=fixture();s.notify=()=>{};let release,calls=0;const button=s.createButton('save','save',()=>{calls++;return new Promise(r=>release=r)});const event={preventDefault(){},stopPropagation(){}};
 const first=click(event);await click(event);assert.equal(calls,1);assert.equal(button.disabled,true);release();await first;assert.equal(button.disabled,false);
});
await test('file selection and cancellation settle and clean up',async()=>{
 let input;const listeners=new Map();global.window={addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
 global.document={body:{appendChild(){}},createElement:()=>input={style:{},files:[],events:{},setAttribute(){},addEventListener(k,v){this.events[k]=v},click(){},remove(){this.removed=true}}};
 const s=fixture();let pending=s.chooseLocalFiles({directory:true});input.events.cancel();assert.deepEqual(await pending,[]);assert(input.removed);assert.equal(listeners.size,0);
 pending=s.chooseLocalFiles({});input.files=[{name:'test.xsh'}];input.events.change();assert.equal((await pending)[0].name,'test.xsh');assert(input.removed);assert.equal(listeners.size,0);
});
await test('native password service and missing-service safeguards',async()=>{
 const s=fixture();assert.equal((await s.saveNativePassword({options:{user:'u'}},'new')).ok,false);
 let calls=0;s.passwordStorage={savePassword:async(profile,password)=>{calls++;assert.equal(profile.options.user,'u');assert.equal(password,'new')}};
 assert.equal((await s.saveNativePassword({options:{user:'u'}},'new')).ok,true);await s.saveNativePassword({options:{user:'u'}},'');assert.equal(calls,1);
 assert.equal((await s.saveNativePassword({options:{}},'new')).code,'USERNAME_REQUIRED');
});
await test('large session tree search and descendant protection',()=>{
 const s=fixture(Array.from({length:1000},(_,i)=>({id:'p'+i,name:'session'+i,type:'ssh',group:'b',options:{host:'host'+i,user:'root'}})),[{id:'a',name:'A'},{id:'b',name:'B',parentGroupId:'a'}]);
 s.searchQuery='host999';s.collapsedFolders=new Set();const tree=s.buildTree();const view=s.buildTreeView(tree);assert(s.flattenTreeRows(tree,view).some(row=>row.profile&&row.profile.id==='p999'));assert(s.groupHasAncestor('b','a'));assert(!s.groupHasAncestor('a','b'));
});
await test('every original service method retained and Angular entry point preserved',()=>{
 const original="  constructor(\n  constructor(\n  start(\n  ngOnDestroy(\n  trackSubscription(\n  log(\n  notify(\n  runInZone(\n  getRoot(\n  clampWidth(\n  getStateStore(\n  loadUIState(\n  saveUIState(\n  scheduleRefresh(\n  getConfigSignature(\n  refreshIfConfigChanged(\n  refreshAndRender(\n  loadProfiles(\n  loadGroups(\n  makeId(\n  clone(\n  validColor(\n  injectStyles(\n  mountRoot(\n  updateLayout(\n  applyAppearance(\n  createButton(\n  createSvgButton(\n  render(\n  scheduleSearchTreeRefresh(\n  refreshSearchTree(\n  showDataManagementDialog(\n  showAppearanceDialog(\n  toggleVisibility(\n  toggleDockMode(\n  openDrawer(\n  closeDrawer(\n  startResize(\n  onResizeMove(\n  stopResize(\n  buildTree(\n  profileMatches(\n  buildTreeView(\n  refreshTreeContent(\n  flattenTreeRows(\n  appendTreeRow(\n  renderVirtualTree(\n  renderTree(\n  renderProfile(\n  renderProfileDetails(\n  openProfile(\n  closeContextMenu(\n  createContextMenu(\n  appendContextMenuItems(\n  showMenu(\n  showSubmenu(\n  getSessionLogBridge(\n  logProfileReference(\n  getProfileLogMenuItems(\n  logActionFailureMessage(\n  createLogDialogText(\n  showProfileLogDialog(\n  showSaveOutputGuide(\n  editProfile(\n  forwardingType(\n  normalizeForwardRule(\n  getForwardingRules(\n  forwardingRuleKey(\n  forwardingListenerKey(\n  createPortConfigDocument(\n  getPortConfigMenuItems(\n  exportPortConfig(\n  importPortConfigFromFile(\n  showPortConfigPreview(\n  applyPortConfig(\n  showProfileMenu(\n  showFolderMenu(\n  displayGroup(\n  profileGroupChoices(\n  createProfileGroupPicker(\n  resolveProfileGroupPicker(\n  createOverlay(\n  addField(\n  input(\n  select(\n  inlineDialogError(\n  hasNativePasswordStorage(\n  saveNativePassword(\n  writeProfile(\n  deleteProfile(\n  cloneProfile(\n  groupId(\n  groupHasAncestor(\n  moveDestinationOptions(\n  showMoveDestinationDialog(\n  showMoveProfileDialog(\n  showMoveGroupDialog(\n  showProfileDialog(\n  renameGroup(\n  showGroupDialog(\n  deleteGroup(\n  safeImportText(\n  protocolToTabby(\n  safeProfileForBackup(\n  createBackupDocument(\n  downloadTextFile(\n  exportSafeBackup(\n  chooseLocalFiles(\n  readLocalText(\n  normalizeImportRecord(\n  profileIdentityKey(\n  buildImportPlan(\n  showImportPreview(\n  ensureImportGroups(\n  applyImportPlan(\n  restoreBackupFromFile(\n  detectCsvDelimiter(\n  parseDelimitedText(\n  csvHeaderKey(\n  parseCsvRecords(\n  importCsvFromFile(\n  decodeSecureCRTString(\n  parseSecureCRTIni(\n  importSecureCrtIniDirectory(\n  parseXshellXsh(\n  importXshellXshFiles(\n  importXshellXshFilePicker(\n  importXshellXshDirectory(\n  showXshellImportDialog(\n  prompt(\n  confirm(\n  constructor(\n  provide(\n  constructor(\n  ngOnDestroy(";
 const methods=text=>Array.from(text.matchAll(/^  (?:async )?([A-Za-z_]\w*)\(/gm),m=>m[1]);
 for(const name of methods(original))assert(methods(src).includes(name),'missing '+name);
 assert(src.includes('exports.default = TabbySessionManagerModule;'));assert(src.includes('SessionManagerService.ɵfac'));assert(src.includes('SessionToolbarButtonProvider.ɵprov'));
});
console.log('Passed '+count+' regression groups.');
})().catch(error=>{console.error(error);process.exitCode=1});

