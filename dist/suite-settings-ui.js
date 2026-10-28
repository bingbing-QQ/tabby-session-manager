'use strict';
const controllers=require('./settings-controller'),palettes=require('./palettes.json');
function serviceFor(component){const service=controllers.get(component.config);if(!service)throw Error(component.t('Tabby 配置尚未就绪，请稍后重试。'));return service;}
async function setGeneral(component,key,value){
 const service=serviceFor(component),state=component.config.store.sessionManager;if(!state)throw Error(component.t('Tabby 配置尚未就绪，请稍后重试。'));
 if(key==='language')return service.setLanguage(value);
 if(!['dockMode','sidebarWidth','sidebarFontSize','sessionInfoExpanded'].includes(key))throw Error('Unsupported setting');
 if(key==='dockMode'&&!['pinned','autohide'].includes(value))throw Error('Unsupported display mode');
 if(key==='sidebarWidth')value=service.clampWidth(Number(value));
 if(key==='sidebarFontSize'){value=Number(value);if(!Number.isFinite(value))throw Error('Invalid font size');value=Math.max(11,Math.min(22,Math.round(value)));}
 const old=state[key];state[key]=value;
 try{await component.config.save();}catch(error){if(state[key]===value)state[key]=old;service.loadUIState();service.render();throw error;}
 service.loadUIState();service.render();component.render();
}
async function setAppearance(component,options={},key){
 const service=serviceFor(component),state=component.config.store.sessionManager;
 key=key||state.themePreset||'nocturneGlass';if(!Object.hasOwn(palettes,key))throw Error('Unsupported theme');
 if(!service.hostThemeSync)throw Error(component.t('Tabby 配置尚未就绪，请稍后重试。'));
 try {await service.hostThemeSync.setOptions({host:options.host??state.syncHostTheme!==false,terminal:options.terminal??state.syncTerminalTheme===true},key);}
 finally {service.loadUIState();service.render();component.render();}
}
function render(component,el,button){
 const state=component.config.store.sessionManager||{},service=controllers.get(component.config);
 const general=el('section','asl-suite-page');general.id='tsm-suite-general';general.setAttribute('role','tabpanel');general.setAttribute('aria-labelledby','tsm-suite-tab-general');
 const appearance=el('section','asl-suite-page');appearance.id='tsm-suite-appearance';appearance.setAttribute('role','tabpanel');appearance.setAttribute('aria-labelledby','tsm-suite-tab-appearance');
 const pending=action=>{const run=()=>component.destroyed?undefined:action();component.settingsTask=(component.settingsTask||Promise.resolve()).catch(()=>{}).then(run);return component.settingsTask;};
 const showError=error=>{component.settingsError=String(error.message||error);component.render();};
 const change=(input,action)=>input.addEventListener('change',async()=>{input.disabled=true;try{await pending(action);component.settingsError='';component.render();}catch(error){showError(error);}finally{input.disabled=false;}});
 const heading=(parent,text)=>parent.append(el('h5','asl-suite-heading',component.t(text)));
 const select=(label,key,choices)=>{const row=el('label','asl-setting-row'),input=el('select','form-select');row.append(el('span',null,component.t(label)));for(const [value,text]of choices){const option=el('option',null,component.t(text));option.value=value;input.append(option);}input.value=String(state[key]??(key==='language'?'auto':key==='dockMode'?'pinned':key==='sidebarFontSize'?13:false));input.setAttribute('aria-label',component.t(label));input.disabled=!service;change(input,()=>setGeneral(component,key,key==='sessionInfoExpanded'?input.value==='true':input.value));row.append(input);general.append(row);return input;};
 heading(general,'界面语言');select('语言','language',[['auto','跟随 Tabby'],['zh-CN','简体中文'],['en-US','English']]);
 heading(general,'会话面板');select('显示方式','dockMode',[['pinned','固定'],['autohide','浮动']]);
 const widthRow=el('label','asl-setting-row'),width=el('input'),widthBox=el('span','asl-width-control'),value=el('output');width.type='range';width.min='220';width.max=String(service?service.clampWidth(640):640);width.value=String(service?.sidebarWidth||state.sidebarWidth||280);width.setAttribute('aria-label',component.t('面板宽度'));value.textContent=width.value+' px';width.disabled=!service;width.addEventListener('input',()=>value.textContent=width.value+' px');change(width,()=>setGeneral(component,'sidebarWidth',width.value));widthBox.append(width,value);widthRow.append(el('span',null,component.t('面板宽度')),widthBox);general.append(widthRow);
 select('字体大小','sidebarFontSize',Array.from({length:12},(_,i)=>[String(i+11),String(i+11)+' px']));
 select('会话信息','sessionInfoExpanded',[['false','折叠'],['true','展开']]);
 heading(appearance,'风格主题');const grid=el('div','asl-theme-grid');for(const [key,palette]of Object.entries(palettes)){
  const choice=button('',()=>pending(()=>setAppearance(component,{},key)),'asl-theme-choice');choice.disabled=!service;choice.setAttribute('aria-pressed',String((state.themePreset||'nocturneGlass')===key));choice.setAttribute('aria-label',component.t(palette.label));
  const swatch=el('span','asl-theme-swatch');swatch.style.background=palette.scene||palette.a;swatch.style.color=palette.fg;swatch.append(el('span',null,'Aa'));swatch.setAttribute('aria-hidden','true');
  choice.append(swatch,el('strong',null,component.t(palette.label)),el('small','asl-help',component.t(palette.note)));grid.append(choice);
 }appearance.append(grid);heading(appearance,'主题同步');
 const checkbox=(text,checked,action,disabled=false)=>{const row=el('label','asl-check'),input=el('input');input.type='checkbox';input.checked=checked;input.disabled=!service||disabled;input.setAttribute('aria-label',component.t(text));row.append(input,el('span',null,component.t(text)));change(input,()=>action(input.checked));appearance.append(row);};
 checkbox('同步到 Tabby 主界面',state.syncHostTheme!==false,checked=>setAppearance(component,{host:checked,terminal:checked&&state.syncTerminalTheme===true}));
 checkbox('同步终端配色',state.syncTerminalTheme===true,checked=>setAppearance(component,{host:true,terminal:checked}),state.syncHostTheme===false);
 const restore=button('恢复 Tabby 原设置',()=>pending(async()=>{await setAppearance(component,{host:false,terminal:false});component.render();}),'asl-restore-theme');restore.disabled=!service;appearance.append(restore);
 if(!service)general.append(el('p','asl-help text-muted',component.t('Tabby 配置尚未就绪，请稍后重试。')));
 return {general,appearance};
}
module.exports={render,setGeneral,setAppearance};
