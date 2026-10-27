const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../dist/index.js'),'utf8'),tabbySettings={EditProfileModalComponent:class NativeEditor{}};
const K=new Function('tabbySettings',src.slice(src.indexOf('class SessionManagerService {'),src.indexOf('SessionManagerService.ɵfac'))+';return SessionManagerService;')(tabbySettings);
function fixture(){
 const s=Object.create(K.prototype);s.groups=[{id:'a',name:'same'},{id:'b',name:'same',parentGroupId:'a'}];s.config={store:{profiles:[],groups:s.groups,sessionManager:{}},save:async()=>{}};s.closeContextMenu=()=>{};s.refreshAndRender=async()=>{};s.notify=(m)=>{s.error=m};s.t=x=>x;s.clone=x=>JSON.parse(JSON.stringify(x));s.saveFeatureState=()=>s.config.save();
 s.profilesService={providerForProfile:p=>({id:p.type,getSuggestedName:p=>'suggested-'+p.options.host}),getConfigProxyForProfile:p=>p,newProfile:async p=>{p.id='generated-'+(++s.ids);s.config.store.profiles.push(p)}};s.ids=0;
 s.ngbModal={open:(component,options)=>{assert.equal(component,tabbySettings.EditProfileModalComponent);assert.equal(options.size,'lg');const componentInstance={};s.modal={componentInstance};return {componentInstance,result:Promise.resolve().then(()=>s.answer(componentInstance.partialProfile))};}};
 s.answer=p=>({...p,name:'new',options:{host:'host'}});s.showNativeCreateRecovery=(draft,error)=>{s.recovery={draft,error}};return s;
}
(async()=>{
 let s=fixture();await s.createNativeProfile('b');assert.equal(s.modal.componentInstance.partialProfile.group,'b');assert.equal(s.config.store.profiles[0].group,'b');assert.equal(s.config.store.profiles.length,1);assert.equal(s.modal.componentInstance.profileProvider.id,'ssh');
 s=fixture();await s.showProfileDialog(null,'');assert.equal(s.modal.componentInstance.partialProfile.group,'');assert.equal(s.config.store.profiles[0].group,'');
 s=fixture();s.answer=p=>({...p,group:'a',name:'chosen'});await s.createNativeProfile('b');assert.equal(s.config.store.profiles[0].group,'a');
 s=fixture();s.answer=()=>null;await s.createNativeProfile('b');assert.equal(s.config.store.profiles.length,0);
 s=fixture();s.selector={show:async(_,options)=>options.find(o=>o.result.type==='local').result};s.profilesService.getProfiles=async()=>[{id:'ssh-template',type:'ssh',isTemplate:true,name:'SSH',group:'wrong'},{id:'local-template',type:'local',isTemplate:true,name:'Local',options:{command:'cmd'},group:'wrong'}];await s.createNativeProfile('');assert.equal(s.modal.componentInstance.partialProfile.group,'');assert.equal(s.modal.componentInstance.partialProfile.type,'local');assert.equal(s.modal.componentInstance.partialProfile.id,undefined);assert.equal(s.config.store.profiles[0].type,'local');
 s=fixture();s.selector={show:async()=>{throw Error('cancel')}};s.profilesService.getProfiles=async()=>[{type:'ssh',isTemplate:true},{type:'local',isTemplate:true}];await s.createNativeProfile('b');assert.equal(s.modal,undefined);assert.equal(s.config.store.profiles.length,0);
 s=fixture();s.answer=p=>({...p,name:'',options:{host:'host'}});await s.createNativeProfile();assert.equal(s.config.store.profiles[0].name,'suggested-host');
 s=fixture();s.config.store.profiles=[{id:'original',name:'keep'}];s.config.save=async()=>{throw Error('disk full')};await s.createNativeProfile('b');assert.deepEqual(s.config.store.profiles,[{id:'original',name:'keep'}]);assert.equal(s.recovery.draft.group,'b');s.config.save=async()=>{};await s.createNativeProfile('',s.recovery.draft);assert.equal(s.config.store.profiles.length,2);assert.equal(s.config.store.profiles[1].group,'b');
 s=fixture();s.showMenu=(_,__,items)=>items;s.createNativeProfile=g=>{s.group=g};await s.showFolderMenu(0,0,{groupId:'b',path:'same / same'})[0].action();assert.equal(s.group,'b');
 s=fixture();s.ngbModal=null;await s.createNativeProfile();assert(s.error);assert.equal(s.config.store.profiles.length,0);
 console.log('PASS native creation: group IDs, empty root, user override, cancel, protocols, suggested names, failed-save draft retry and folder menu');
})().catch(e=>{console.error(e);process.exitCode=1});
