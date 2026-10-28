const fs=require('fs'),assert=require('assert/strict');
const {chromium}=require('playwright');
const path=require('path');const root=path.resolve(__dirname,'../..');const base=path.join(root,'dist')+path.sep;fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});const src=fs.readFileSync(base+'index.js','utf8');
const klass=src.slice(src.indexOf('class SessionManagerService {'),src.indexOf('SessionManagerService.ɵfac'));
const controller=fs.readFileSync(base+'host-theme.js','utf8'),css=fs.readFileSync(base+'host-theme.css','utf8');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:1160,height:840}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('BROWSER',e.message)});
 await page.setContent(`<meta charset="utf-8"><style>[hidden]{display:none!important}body{margin:0;background:#080f1b;color:#cbd6e5;font:13px 'Microsoft YaHei',sans-serif}.tab-bar{height:38px;display:flex;gap:10px;align-items:center;background:#111b2b}tab-header{display:block;padding:8px 20px}terminal-tab{display:block;margin-left:350px;height:770px;background:#080f1b;color:#cbd6e5;padding:20px;font:13px/2 Consolas,monospace}settings-tab{display:block;margin-left:350px;padding:24px}settings-tab[hidden]{display:none}settings-tab .content-box{padding:20px}.form-control{display:block;padding:10px;margin:10px 0;border:1px solid gray}.btn{padding:8px 14px;margin:6px;border:1px solid gray}.modal-content{margin-top:24px;padding:20px}.modal-header{padding:12px}.text-muted{color:gray}.label{position:absolute;right:20px;bottom:10px;font-size:12px;color:#8899aa}</style><app-root><div class="tab-bar"><span>Tabby</span><tab-header class="active">production-api · 窗口 1</tab-header><tab-header>设置</tab-header></div><div class="content main"><terminal-tab><div class="xterm">deploy@production-api:~$ systemctl status api<br>● api.service — Application service<br>　Active: active (running)<br><br>deploy@production-api:~$ ▌</div></terminal-tab><settings-tab hidden><h2>设置</h2><ul class="nav-pills"><li><a class="nav-link active">应用</a>　<a class="nav-link">终端</a></li></ul><div class="content-box"><h3>终端与日志</h3><div class="text-muted">应用内设置界面配色验证</div><input class="form-control" value="D:/TabbyLogs"><button class="btn btn-primary">保存</button><button class="btn btn-secondary">取消</button><div class="modal-content"><div class="modal-header">示例应用内弹窗</div><p>会话与日志管理器</p><input class="form-control" placeholder="搜索会话"><button class="btn btn-primary">确认</button></div></div></settings-tab></div></app-root><div class="label">重写候选版 · Tabby 1.0.238 模拟宿主，非实机截图</div>`);
 await page.addScriptTag({content:`window.tsmContrast=(()=>{const module={exports:{}};${fs.readFileSync(base+'contrast.js','utf8')};return module.exports;})();window.suiteI18n=(()=>{const module={exports:{}};const require=()=>(${fs.readFileSync(base+'locales.json','utf8')});${fs.readFileSync(base+'i18n.js','utf8')};return module.exports;})();window.SessionHostThemeSync=(()=>{const module={exports:{}};const __dirname='.';const require=name=>name==='./contrast'?window.tsmContrast:name==='fs'?{readFileSync:()=>${JSON.stringify(css)}}:{join:()=>''};${controller};return module.exports.SessionHostThemeSync;})();
 const SESSION_STYLES=${JSON.stringify(fs.readFileSync(path.join(root,'src/session.css'),'utf8'))};const ROOT_ID='tabby-session-manager-root',STYLE_ID='tabby-session-manager-style',CONFIG_KEY='sessionManager',HOTKEY_ID='toggle-session-manager',tabbySettings={};${klass}
 const p={id:'api',name:'production-api',type:'ssh',group:'prod',options:{host:'10.0.0.12',port:22,user:'deploy'}};
 window.configureCalls=0;window.tab={profile:p,session:{open:true},frontend:{},configure(){configureCalls++;const scheme=tab.profile.terminalColorScheme||config.store.terminal.colorScheme;document.querySelector('terminal-tab').style.backgroundColor=scheme.background;document.querySelector('terminal-tab').style.color=scheme.foreground;}};
 window.app={tabs:[tab],activeTab:tab};window.originalTerminal={background:'theme',fontSize:17,colorScheme:{name:'Original',foreground:'#cbd6e5',background:'#080f1b',colors:Array(16).fill('#abcdef')},lightColorScheme:{name:'Original light',foreground:'#111111',background:'#eeeeee',colors:Array(16).fill('#123456')}};
 window.config={store:{sessionManager:{sidebarWidth:340,sidebarVisible:true,dockMode:'pinned',themePreset:'graphiteGlass',language:'zh-CN'},appearance:{theme:'Original theme',css:'.mine{}',colorSchemeMode:'dark'},terminal:JSON.parse(JSON.stringify(originalTerminal)),profiles:[p],groups:[{id:'prod',name:'生产环境'}]},save:async()=>{}};
 window.watchers=[];config.changed$={subscribe:fn=>{watchers.push(fn);return {unsubscribe(){}}}};window.svc=new SessionManagerService(config,null,{run:fn=>fn()},null,null,app,null);`});





 await page.waitForSelector('.tsm2-panel');

 await page.addScriptTag({content:"window.fixturePalettes="+fs.readFileSync(base+'palettes.json','utf8')+";window.settingsControllers=(()=>{const module={exports:{}};"+fs.readFileSync(base+'settings-controller.js','utf8')+";return module.exports;})();settingsControllers.register(config,svc);window.suiteSettingsUI=(()=>{const module={exports:{}};const require=name=>({'./settings-controller':window.settingsControllers,'./palettes.json':window.fixturePalettes}[name]);"+fs.readFileSync(base+'suite-settings-ui.js','utf8')+";return module.exports;})();"});
 await page.addScriptTag({content:"window.FixtureBuffer=class extends Uint8Array{static alloc(n){return new this(n)}static byteLength(text){return new TextEncoder().encode(text).length}static isBuffer(value){return value instanceof this}static from(value){return new this(typeof value==='string'?new TextEncoder().encode(value):value)}toString(){return new TextDecoder().decode(this)}};window.process={env:{APPDATA:'C:/Fixture'}};window.memoryFS=new Map();window.fakeFS={promises:{readdir:async()=>[],lstat:async()=>({isFile:()=>true,isSymbolicLink:()=>false,size:1,mtime:new Date()})},readFileSync:p=>{if(!memoryFS.has(p))throw Error('ENOENT');return memoryFS.get(p)},existsSync:p=>memoryFS.has(p),mkdirSync(){},writeFileSync:(p,v)=>memoryFS.set(p,v),renameSync:(a,b)=>{memoryFS.set(b,memoryFS.get(a));memoryFS.delete(a)},unlinkSync:p=>memoryFS.delete(p)};window.pathStub={join:(...p)=>p.join('/'),dirname:p=>p.slice(0,p.lastIndexOf('/'))};window.logCore=(()=>{const module={exports:{}};const require=name=>({'buffer':{Buffer:FixtureBuffer},'fs':fakeFS,'path':pathStub,'os':{homedir:()=>'C:/TestUser'},'crypto':{randomBytes:()=>({toString:()=>'abcdef123456'})},'string_decoder':{StringDecoder:class{}},'./i18n':window.suiteI18n}[name]);"+fs.readFileSync(base+'logging-core.js','utf8')+"return module.exports;})();window.LogSettings=(()=>{const module={exports:{}};const require=name=>({'buffer':{Buffer:FixtureBuffer},'fs':fakeFS,'path':pathStub,'./i18n':window.suiteI18n,'./logging-core':logCore,'./suite-settings-ui':window.suiteSettingsUI}[name]);"+fs.readFileSync(base+'logging-settings.js','utf8')+";return module.exports.AutoLoggerSettingsTabComponent;})();"});
 await page.evaluate(()=>{config.store.autoSessionLogger=logCore.defaults('C:/TestUser');config.store.autoSessionLogger.collapsedGroups={prod:false};window.saveCount=0;config.save=async()=>{saveCount++};const host=document.querySelector('settings-tab');host.hidden=false;document.querySelector('terminal-tab').hidden=true;window.logSettings=new LogSettings(config,{dialog:{showOpenDialog:async()=>({filePaths:['C:/ChosenLogs']})},shell:{openPath:async()=>''}},null,null,null,{nativeElement:host});logSettings.ngOnInit();logSettings.ngAfterViewInit();});
 assert(await page.locator('settings-tab h3').isVisible());assert.equal(await page.locator('settings-tab .card').count(),1);
 await page.locator('settings-tab .card input.form-control').fill('C:/ProfileLogs');await page.locator('settings-tab .card input.form-control').dispatchEvent('change');await page.waitForFunction(()=>config.store.autoSessionLogger.profileDirectories.api==='C:/ProfileLogs');
 assert(await page.evaluate(()=>[...memoryFS.values()].some(x=>x.includes('C:/ProfileLogs'))));
 for(const key of ['liquidGlass','modernGradient','warmFrost','ghibliSky','playfulNeo']){await page.evaluate(key=>{svc.themePreset=key;svc.applyAppearance()},key);assert.equal(await page.locator('settings-tab input.form-control').first().evaluate(e=>getComputedStyle(e).textShadow),'none');}
 await page.evaluate(()=>{config.store.sessionManager.language='en-US';window.dispatchEvent(new Event('tabby-session-suite-language-changed'))});assert.equal(await page.locator('settings-tab h3').textContent(),'Tabby Session Suite');
 await page.getByRole('button',{name:'Collapse All',exact:true}).click();assert.equal(await page.locator('settings-tab .card').count(),0);await page.getByRole('button',{name:'Expand All',exact:true}).click();assert.equal(await page.locator('settings-tab .card').count(),1);
 await page.locator('settings-tab').getByRole('button',{name:'Browse',exact:true}).first().click();await page.waitForFunction(()=>config.store.autoSessionLogger.defaultDirectory==='C:/ChosenLogs');


 await page.evaluate(()=>{config.store.sessionManager.language='zh-CN';window.dispatchEvent(new Event('tabby-session-suite-language-changed'))});
 assert.deepEqual(await page.locator('.asl-suite-tab').allTextContents(),['常规','日志','外观']);
 await page.getByRole('tab',{name:'常规',exact:true}).click();
 await page.getByLabel('语言',{exact:true}).selectOption('en-US');
 await page.waitForFunction(()=>config.store.sessionManager.language==='en-US');
 assert(await page.locator('#tsm-suite-general').isVisible());assert.equal(await page.locator('settings-tab h3').textContent(),'Tabby Session Suite');
 await page.getByLabel('Display Mode',{exact:true}).selectOption('autohide');await page.waitForFunction(()=>config.store.sessionManager.dockMode==='autohide'&&svc.dockMode==='autohide');
 await page.getByLabel('Display Mode',{exact:true}).selectOption('pinned');await page.waitForFunction(()=>svc.dockMode==='pinned');
 await page.getByLabel('Panel Width',{exact:true}).evaluate(e=>{e.value='380';e.dispatchEvent(new Event('change',{bubbles:true}))});await page.waitForFunction(()=>config.store.sessionManager.sidebarWidth===380&&svc.sidebarWidth===380);
 await page.getByLabel('Font Size',{exact:true}).selectOption('20');await page.waitForFunction(()=>config.store.sessionManager.sidebarFontSize===20&&svc.sidebarFontSize===20);assert.equal(await page.locator('#tabby-session-manager-root').evaluate(e=>getComputedStyle(e).fontSize),'20px');
 for(const size of [11,16,22]){await page.getByLabel('Font Size',{exact:true}).selectOption(String(size));await page.waitForFunction(size=>svc.sidebarFontSize===size,size);assert.equal(await page.locator('#tabby-session-manager-root').evaluate(e=>getComputedStyle(e).fontSize),size+'px');const row=page.locator('.tsm2-profile').first();assert((await row.boundingBox()).height>=Math.ceil(size*2.3));}
 await page.getByLabel('Font Size',{exact:true}).selectOption('13');await page.waitForFunction(()=>svc.sidebarFontSize===13);
 await page.locator('#tsm-suite-general').getByLabel('Session Info',{exact:true}).selectOption('true');await page.waitForFunction(()=>config.store.sessionManager.sessionInfoExpanded===true);
 await page.locator('#tsm-suite-general').getByLabel('Session Info',{exact:true}).selectOption('false');await page.waitForFunction(()=>config.store.sessionManager.sessionInfoExpanded===false);
 await page.getByLabel('Panel Width',{exact:true}).evaluate(e=>{e.value='340';e.dispatchEvent(new Event('change',{bubbles:true}))});await page.waitForFunction(()=>svc.sidebarWidth===340);
 await page.getByRole('tab',{name:'Appearance',exact:true}).click();assert.equal(await page.locator('.asl-theme-choice').count(),8);
 for(let index=0;index<8;index++){await page.locator('.asl-theme-choice').nth(index).click();await page.waitForFunction(index=>config.store.sessionManager.themePreset===Object.keys(svc.getThemePalettes())[index],index);assert.equal(await page.locator('.asl-theme-choice[aria-pressed=true]').count(),1);}
 await page.getByLabel('Synchronize terminal colors',{exact:true}).check();await page.waitForFunction(()=>config.store.sessionManager.syncTerminalTheme===true);assert((await page.evaluate(()=>configureCalls))>0);
 await page.getByRole('button',{name:'Restore Original Theme and Colors',exact:true}).click();await page.waitForFunction(()=>config.store.sessionManager.syncHostTheme===false&&config.store.sessionManager.syncTerminalTheme===false);
 assert(await page.getByLabel('Synchronize terminal colors',{exact:true}).isDisabled());
 await page.getByLabel('Apply Theme to Tabby Interface',{exact:true}).check();await page.waitForFunction(()=>config.store.sessionManager.syncHostTheme===true);
 assert.equal(await page.evaluate(()=>config.store.autoSessionLogger.profileDirectories.api),'C:/ProfileLogs');
 await page.getByRole('tab',{name:'General',exact:true}).click();await page.getByLabel('Language',{exact:true}).selectOption('zh-CN');await page.waitForFunction(()=>config.store.sessionManager.language==='zh-CN');
 await page.getByRole('tab',{name:'日志',exact:true}).click();assert(await page.locator('.asl-general').isVisible());

 const themes=['graphiteGlass','obsidianChampagne','warmFrost','nocturneGlass','ghibliSky','playfulNeo','liquidGlass','modernGradient'];
 for(const lang of ['zh-CN','en-US'])for(const width of [1160,760]){
   await page.setViewportSize({width,height:960});
   await page.evaluate(lang=>{config.store.sessionManager.language=lang;window.dispatchEvent(new Event('tabby-session-suite-language-changed'));},lang);
   for(const key of themes){
     await page.evaluate(key=>{svc.themePreset=key;svc.applyAppearance()},key);
     const issues=await page.locator('.tsm-log-settings').evaluate(root=>{
       const issues=[];for(const b of root.querySelectorAll('button')){if(!b.getClientRects().length)continue;const s=getComputedStyle(b);if(s.whiteSpace!=='nowrap'&&!b.classList.contains('asl-group-toggle'))issues.push('button wraps');if(b.scrollWidth>b.clientWidth+2)issues.push('button clipped '+b.textContent);}
       if(root.scrollWidth>root.clientWidth+2)issues.push('horizontal overflow');return issues;
     });assert.deepEqual(issues,[],lang+' '+width+' '+key);
   }
 }
 await page.setViewportSize({width:1160,height:960});
 await page.evaluate(async()=>{config.store.sessionManager.language='zh-CN';svc.themePreset='nocturneGlass';svc.applyAppearance();window.dispatchEvent(new Event('tabby-session-suite-language-changed'));await logSettings.toggleLogs(logSettings.profileEntries[0]);const e=logSettings.profileEntries[0];e.logs=[{name:'2026-10-27_14-32-08-125_production-api_a1b2c3.log',size:123456,mtime:new Date('2026-10-27T06:32:08Z')}];logSettings.render();});

 assert.equal(await page.locator('.asl-log-row').count(),1);
 assert.equal(await page.locator('.asl-log-count').textContent(),'1');
 assert.equal(await page.locator('.asl-directory').textContent(),'C:/ProfileLogs');
 assert.equal(await page.locator('.asl-profile-grid .asl-log-count').count(),1);
 assert.equal(await page.locator('.asl-log-toolbar input[type=search]').count(),1);
 const checkExpanded=async()=>{assert.deepEqual(await page.locator('.tsm-log-settings').evaluate(root=>[...root.querySelectorAll('button')].filter(b=>b.scrollWidth>b.clientWidth+2).map(b=>b.textContent)),[])};
 await checkExpanded();

 await page.screenshot({path:path.join(root,'artifacts/log-settings-restored-zh.png'),fullPage:true});
 await page.setViewportSize({width:760,height:960});
 await page.evaluate(()=>{config.store.sessionManager.language='en-US';window.dispatchEvent(new Event('tabby-session-suite-language-changed'));});
 assert(await page.locator('.asl-log-toolbar').isVisible());
 assert.equal(await page.locator('.tsm-log-settings').evaluate(e=>e.scrollWidth<=e.clientWidth+2),true);
 await checkExpanded();
 await page.screenshot({path:path.join(root,'artifacts/log-settings-restored-en-narrow.png'),fullPage:true});



 for(const lang of ['zh-CN','en-US'])for(const width of [1160,760]){
   await page.setViewportSize({width,height:1100});
   await page.evaluate(lang=>{config.store.sessionManager.language=lang;window.dispatchEvent(new Event('tabby-session-suite-language-changed'));},lang);
   for(const key of ['general','logging','appearance']){
     await page.locator('#tsm-suite-tab-'+key).click();assert(await page.locator('#tsm-suite-'+key).isVisible());
     assert(await page.locator('.tsm-log-settings').evaluate(e=>e.scrollWidth<=e.clientWidth+2),lang+' '+width+' '+key+' overflow');
     if(lang==='en-US'&&key!=='logging')assert(!/[\u3400-\u9fff]/.test(await page.locator('#tsm-suite-'+key).innerText()),'Untranslated suite controls');
   }
 }
 await page.setViewportSize({width:1160,height:960});
 await page.evaluate(()=>svc.setLanguage('en-US'));
 await page.locator('#tsm-suite-tab-general').click();
 await page.evaluate(()=>{window.originalSave=config.save;config.save=async()=>{throw Error('Injected settings save failure')}});
 const oldDock=await page.evaluate(()=>config.store.sessionManager.dockMode);
 await page.getByLabel('Display Mode',{exact:true}).selectOption(oldDock==='pinned'?'autohide':'pinned');
 await page.waitForFunction(()=>document.querySelector('.tsm-log-settings').textContent.includes('Injected settings save failure'));
 assert.equal(await page.getByLabel('Display Mode',{exact:true}).inputValue(),oldDock);
 await page.evaluate(()=>{config.save=originalSave;logSettings.settingsError='';logSettings.render();});
 await page.screenshot({path:path.join(root,'artifacts/suite-settings-general-en.png'),fullPage:true});
 await page.locator('#tsm-suite-tab-appearance').click();
 await page.screenshot({path:path.join(root,'artifacts/suite-settings-appearance-en.png'),fullPage:true});
 await page.locator('#tsm-suite-tab-logging').click();

 await page.evaluate(()=>{window.originalRenderContent=logSettings.renderContent;logSettings.renderContent=()=>{throw Error('Injected renderer failure')};logSettings.render();});
 assert(await page.locator('settings-tab h3').isVisible());assert(await page.getByText('Could not load logging settings: Injected renderer failure',{exact:true}).isVisible());
 await page.evaluate(()=>{logSettings.renderContent=originalRenderContent;logSettings.render();window.originalSpecific=logSettings.directoryStore.specific;logSettings.directoryStore.specific=()=>{throw Error('Injected mapping failure')};logSettings.refreshProfiles();});
 assert(await page.locator('settings-tab h3').isVisible());assert(await page.locator('.asl-general').isVisible());assert(await page.getByText('Could not load logging settings: Injected mapping failure',{exact:true}).isVisible());
 await page.evaluate(()=>{logSettings.directoryStore.specific=originalSpecific;logSettings.refreshProfiles();});
 assert(await page.locator('.asl-general').isVisible());

 await page.evaluate(()=>{logSettings.ngOnDestroy();svc.ngOnDestroy()});assert.deepEqual(errors,[]);console.log('PASS unified suite settings: general/logging/appearance, eight themes, shared preferences, theme sync, bilingual labels, save rollback, narrow layout and preserved logger behavior');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
