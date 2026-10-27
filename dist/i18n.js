'use strict';
const catalog=require('./locales.json');
function language(config) {
 const store=config&&config.store||{},selected=store.sessionManager&&store.sessionManager.language;
 if(selected==='zh-CN'||selected==='en-US')return selected;
 const locale=store.language||store.appearance&&store.appearance.language||(typeof navigator!=='undefined'?navigator.language:'zh-CN');
 return /^zh(?:$|[-_])/i.test(String(locale||'zh-CN'))?'zh-CN':'en-US';
}
function t(text,config){
 const pair=catalog[text];if(pair)return pair[language(config)==='en-US'?1:0];
 const prefix='Cannot create log directory: ';
 if(typeof text==='string'&&text.startsWith(prefix))return t(prefix,config)+text.slice(prefix.length);
 return text;
}

function profileName(profile,config,visited) {
 if (!profile) return '';
 const name=String(profile.name||''),profiles=config&&config.store&&config.store.profiles||[];
 const seen=visited||new Set();if(seen.has(profile.id)||seen.size>8)return name;seen.add(profile.id);
 let meta=profile.sessionManagerGeneratedName;
 if (!meta || meta.savedName!==name || !['copy','import'].includes(meta.kind)) {
  meta=null;
  const match=name.match(/^(.*?)(?:（副本(\d*)）| \(Copy\s*(\d*)\))$/);
  if(match){const source=profiles.find(p=>p&&p.id!==profile.id&&p.name===match[1]&&p.type===profile.type&&JSON.stringify(p.options||{})===JSON.stringify(profile.options||{}));if(source)meta={kind:'copy',baseName:source.name,sourceId:source.id,copyIndex:Number(match[2]||match[3]||0)};}
 }
 if(!meta)return name;
 const source=profiles.find(p=>p&&p.id===meta.sourceId&&p.name===meta.baseName);
 const base=source?profileName(source,config,seen):String(meta.baseName||'');
 return base+(meta.kind==='copy'?copySuffix(meta.copyIndex,config):t('（导入）',config));
}

function copySuffix(index,config) {
 const n=Number.isSafeInteger(index)&&index>0?index:0;
 return language(config)==='en-US'?' (Copy'+(n?' '+n:'')+')':'（副本'+(n||'')+'）';
}
function copyBase(profile,config) {
 const profiles=config&&config.store&&config.store.profiles||[],seen=new Set();let current=profile;
 while(current&&!seen.has(current.id)&&seen.size<32){
  seen.add(current.id);const name=String(current.name||'');let meta=current.sessionManagerGeneratedName;
  if(!meta||meta.kind!=='copy'||meta.savedName!==name){
   const match=name.match(/^(.*?)(?:（副本(\d*)）| \(Copy\s*(\d*)\))$/);
   const source=match&&profiles.find(p=>p&&p.id!==current.id&&p.name===match[1]&&p.type===current.type&&JSON.stringify(p.options||{})===JSON.stringify(current.options||{}));
   if(!source)return {baseName:name,sourceId:current.id};meta={baseName:source.name,sourceId:source.id};
  }
  const source=profiles.find(p=>p&&p.id===meta.sourceId&&p.name===meta.baseName);
  if(!source)return {baseName:String(meta.baseName||name),sourceId:meta.sourceId||''};
  current=source;
 }
 return {baseName:String(profile&&profile.name||''),sourceId:profile&&profile.id||''};
}
module.exports={t,language,catalog,profileName,copySuffix,copyBase};
