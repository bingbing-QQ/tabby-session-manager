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
 const ui=fs.readFileSync(base+'forward-check-ui.js','utf8');
 await page.addScriptTag({content: `window.checkCalls=[];window.checkWait=null;window.fakeChecker={normalize:r=>({type:r.type||'Local',host:r.host||'127.0.0.1',port:Number(r.port),targetAddress:r.targetAddress||'',targetPort:Number(r.targetPort)||0}),checkRules:async(targets,options)=>{checkCalls.push(targets.map(t=>t.id));if(checkWait)await new Promise(resolve=>window.finishCheck=resolve);let results=[];for(const target of targets)for(const rule of target.rules){results.push({targetId:target.id,targetLabel:target.label,profileId:target.profileId,rule,runtime:target.kind==='saved'?'CONFIGURED':rule.port===15432?'LISTENING':'CONFIGURED',binding:rule.port===62002?'EXCLUDED':rule.port===15432?'CURRENT_CONNECTION':'AVAILABLE',details:[],excludedRange:rule.port===62002?{start:61999,end:62098}:undefined,checkedAt:new Date().toISOString()});}return{checkedAt:new Date().toISOString(),results,warnings:[]}}};window.forwardCheckUI=(()=>{const module={exports:{}};const require=()=>fakeChecker;${ui};return module.exports;})();`});
 await page.evaluate(()=>{const rules=[{type:'Local',host:'127.0.0.1',port:62002,targetAddress:'db',targetPort:3306},{type:'Local',host:'127.0.0.1',port:15432,targetAddress:'db',targetPort:5432}];config.store.profiles[0].options.forwardedPorts=rules;const p2={id:'other',name:'production-api',type:'ssh',options:{host:'10.0.0.13',user:'ops',port:22,forwardedPorts:[{type:'Remote',host:'127.0.0.1',port:18080,targetAddress:'localhost',targetPort:8080}]}};config.store.profiles.push(p2);app.tabs=[tab,{profile:config.store.profiles[0],sshSession:{open:true,forwardedPorts:[]},session:{open:true}},{profile:p2,sshSession:{open:true,forwardedPorts:[]},session:{open:true}}];tab.sshSession={open:true,forwardedPorts:[]};svc.profiles=config.store.profiles;svc.render();});
 for(const title of ['固定','数据管理','新建','设置'])assert.equal(await page.locator('.tsm2-header').getByRole('button',{name:title,exact:true}).count(),1);
 await page.getByRole('button',{name:'设置',exact:true}).click();await page.getByRole('button',{name:'端口转发检查',exact:true}).click();
 assert.equal(await page.locator('.tsm2-forward-targets input:checked').count(),1);
 await page.getByRole('button',{name:'检查所选',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.tsm2-forward-table'));
 assert.equal(await page.locator('.tsm2-forward-table tbody tr').count(),2);assert((await page.locator('.tsm2-forward-output').innerText()).includes('系统排除'));
 assert.equal(await page.locator('.tsm2-forward-detail-dialog').count(),0);
 await page.locator('.tsm2-forward-table tbody tr').first().getByRole('button',{name:'查看检查详情',exact:true}).click();
 const details=page.locator('.tsm2-forward-detail-dialog');assert(await details.isVisible());assert((await details.innerText()).includes('62002'));assert((await details.innerText()).includes('61999–62098'));assert((await details.innerText()).includes('目标地址：db:3306'));
 await page.screenshot({path:'artifacts/tabby-v400-forward-details-zh.png'});
 await details.getByRole('button',{name:'关闭',exact:true}).last().click();assert.equal(await details.count(),0);assert.equal(await page.locator('.tsm2-forward-table tbody tr').count(),2);
 await page.locator('.tsm2-forward-table tbody tr').nth(1).getByRole('button',{name:'查看检查详情',exact:true}).click();assert((await details.innerText()).includes('15432'));assert(!(await details.innerText()).includes('61999–62098'));await details.getByRole('button',{name:'关闭',exact:true}).last().click();

 await page.getByRole('combobox',{name:'检查对象',exact:true}).selectOption('opened');assert.equal(await page.locator('.tsm2-forward-targets input').count(),3);assert(await page.getByRole('button',{name:'检查所选',exact:true}).isDisabled());await page.locator('.tsm2-forward-targets input').nth(1).check();await page.getByRole('button',{name:'检查所选',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.tsm2-forward-table'));assert.equal((await page.evaluate(()=>checkCalls.at(-1))).length,1);assert((await page.locator('.tsm2-forward-output').innerText()).includes('窗口 2'));
 await page.getByRole('combobox',{name:'检查对象',exact:true}).selectOption('saved');assert.equal(await page.locator('.tsm2-forward-targets input').count(),2);await page.locator('.tsm2-forward-targets input').nth(1).check();await page.getByRole('button',{name:'检查所选',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.tsm2-forward-table'));assert.equal(await page.locator('.tsm2-forward-table tbody tr').count(),1);assert.equal(await page.evaluate(()=>checkCalls.at(-1)[0]),'saved:other');
 await page.getByRole('button',{name:'关闭',exact:true}).last().click();await page.evaluate(()=>svc.setLanguage('en-US'));
 for(const title of ['Pinned','Data Management','New','Settings'])assert.equal(await page.locator('.tsm2-header').getByRole('button',{name:title,exact:true}).count(),1);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Port Forwarding Check',exact:true}).click();await page.getByRole('button',{name:'Check Selected',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.tsm2-forward-table'));assert(!/[\u3400-\u9fff]/.test(await page.locator('.tsm2-forward-dialog').innerText()));
 
 for(const theme of ['graphiteGlass','obsidianChampagne','warmFrost','nocturneGlass','ghibliSky','playfulNeo','liquidGlass','modernGradient']){
 await page.evaluate(theme=>{svc.themePreset=theme;svc.applyAppearance();},theme);
 await page.locator('.tsm2-forward-table tbody tr').first().getByRole('button',{name:'View Check Details',exact:true}).click();
 const dialog=page.locator('.tsm2-forward-detail-dialog');assert(await dialog.isVisible());assert(!/[\u3400-\u9fff]/.test(await dialog.innerText()));
 await page.setViewportSize({width:800,height:600});const r=await dialog.boundingBox();assert(r.x>=0&&r.y>=0&&r.x+r.width<=800&&r.y+r.height<=600);await dialog.getByRole('button',{name:'Close',exact:true}).last().click();
 }
 await page.setViewportSize({width:1160,height:840});
 // Removing the parent also removes its open detail window.
 await page.locator('.tsm2-forward-table tbody tr').first().getByRole('button',{name:'View Check Details',exact:true}).click();
 await page.evaluate(()=>document.querySelector('.tsm2-forward-dialog').closest('.tsm2-overlay').remove());await page.waitForTimeout(30);assert.equal(await page.locator('.tsm2-forward-detail-dialog').count(),0);
 await page.evaluate(()=>svc.showForwardCheckDialog());await page.getByRole('button',{name:'Check Selected',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.tsm2-forward-table'));

 // Closing during a check must not render its late result or enable actions in another dialog.
 await page.evaluate(()=>checkWait=true);await page.getByRole('button',{name:'Check Selected',exact:true}).click();await page.waitForFunction(()=>typeof finishCheck==='function');assert(await page.locator('.tsm2-forward-targets input').first().isDisabled());await page.getByRole('button',{name:'Close',exact:true}).last().click();await page.evaluate(()=>{finishCheck();checkWait=false;});await page.waitForTimeout(50);assert.equal(await page.locator('.tsm2-overlay').count(),0);
 await page.evaluate(()=>{config.store.sessionManager.language='zh-CN';svc.showForwardCheckDialog();});await page.getByRole('button',{name:'检查所选',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.tsm2-forward-table'));await page.screenshot({path:'artifacts/tabby-v400-forward-check-zh.png'});
 await page.setViewportSize({width:800,height:650});assert(await page.locator('.tsm2-forward-dialog').evaluate(el=>el.getBoundingClientRect().right<=innerWidth&&el.getBoundingClientRect().left>=0));
 await page.getByRole('button',{name:'关闭',exact:true}).last().click();
 await page.setViewportSize({width:1160,height:840});
 for(const [key,zh,en] of [['liquidGlass','流动玻璃','Liquid Glass'],['modernGradient','现代渐变','Modern Gradient']]){
  await page.evaluate(()=>{config.store.sessionManager.language='zh-CN';svc.showAppearanceDialog()});
  assert.equal(await page.locator('.tsm2-theme-choice').count(),8);
  await page.locator('.tsm2-theme-choice').filter({hasText:zh}).click();
  await page.waitForFunction(key=>svc.themePreset===key,key);
  assert.equal(await page.evaluate(()=>config.store.sessionManager.themePreset),key);
  assert.equal(await page.locator('html').getAttribute('data-tsm-host-theme'),key);
  await page.screenshot({path:'artifacts/tabby-v400-'+key+'.png'});
  for(const method of ['showDataManagementDialog','showBulkManager','showAppearanceDialog']){
   await page.evaluate(method=>svc[method](),method);
   assert.equal(await page.locator('.tsm2-overlay').last().getAttribute('data-tsm-theme'),key);
   assert(await page.locator('.tsm2-dialog').last().evaluate(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right<=innerWidth+1&&r.left>=-1}));
   await page.evaluate(()=>document.querySelectorAll('.tsm2-overlay').forEach(e=>e.remove()));
  }
  await page.evaluate(async()=>{svc.getSessionLogBridge=()=>({getCurrentSessionStatus:()=>({ok:true,sessions:[],directory:'D:/TabbyLogs'})});await svc.showProfileLogDialog(config.store.profiles[0]);});
  assert.equal(await page.locator('.tsm2-overlay').last().getAttribute('data-tsm-theme'),key);
  await page.evaluate(()=>document.querySelectorAll('.tsm2-overlay').forEach(e=>e.remove()));
  await page.setViewportSize({width:800,height:600});
  await page.evaluate(()=>svc.showAppearanceDialog());
  assert(await page.locator('.tsm2-dialog').last().evaluate(e=>{const r=e.getBoundingClientRect();return r.bottom<=innerHeight+1&&r.top>=-1}));
  await page.evaluate(()=>document.querySelectorAll('.tsm2-overlay').forEach(e=>e.remove()));
  await page.setViewportSize({width:1160,height:840});
  await page.evaluate(()=>{config.store.sessionManager.language='en-US';svc.showAppearanceDialog()});
  assert.equal(await page.locator('.tsm2-theme-choice').filter({hasText:en}).count(),1);
  await page.evaluate(()=>document.querySelectorAll('.tsm2-overlay').forEach(e=>e.remove()));
  await page.evaluate(()=>{svc.showProfileMenu(120,180,config.store.profiles[0])});
  assert.equal(await page.locator('.tsm2-menu').last().getAttribute('data-tsm-theme'),key);
  await page.evaluate(()=>svc.closeContextMenu());
  await page.evaluate(()=>{document.querySelector('settings-tab').hidden=false;document.querySelector('terminal-tab').hidden=true});
  assert.equal(await page.locator('settings-tab .form-control').first().evaluate(e=>getComputedStyle(e).color),'rgb(244, 242, 255)');
  await page.screenshot({path:'artifacts/tabby-v400-'+key+'-settings.png'});
  await page.evaluate(()=>{document.querySelector('settings-tab').hidden=true;document.querySelector('terminal-tab').hidden=false});
 }
 await page.evaluate(()=>svc.ngOnDestroy());
 assert.deepEqual(errors,[]);console.log('PASS real menu entry, four short bilingual tooltips, current/open/saved target selection, exact selected scope, English coverage, narrow layout, closed-dialog late-result cancellation and busy locking');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});


