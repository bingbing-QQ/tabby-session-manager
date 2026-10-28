'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),{spawnSync}=require('child_process'),runNpm=require('./npm-runner.cjs'),{validate}=require('./release-state.cjs');
const root=path.resolve(__dirname,'..'),registry='https://registry.npmjs.org/',p=JSON.parse(fs.readFileSync(path.join(root,'package.json'))),proofFile=path.join(root,'stable-publication.json'),work=path.join(root,'artifacts','npm-release');
const digest=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function npm(args,cwd=root){const r=runNpm([...args,'--registry='+registry,'--cache='+path.join(root,'artifacts','npm-cache'),'--update-notifier=false'],cwd);if(r.error)throw r.error;return r;}
function ok(r,label){if(r.status!==0)throw Error(label+'\n'+r.stdout+'\n'+r.stderr);return r.stdout;}
function node(name,args=[]){const r=spawnSync(process.execPath,[path.join(root,name),...args],{cwd:root,stdio:'inherit',timeout:120000,windowsHide:true});assert.equal(r.status,0,'Check failed: '+name);}
function runtime(dir){for(const [n,h]of Object.entries(JSON.parse(fs.readFileSync(path.join(root,'runtime-integrity.json'))).files))assert.equal(digest(path.join(dir,n)),h,n);}
try{
 fs.mkdirSync(work,{recursive:true});fs.writeFileSync(proofFile,JSON.stringify({version:'4.1.1',expectedAccount:'bingbing77',registry,accountVerified:false,ownershipVerified:false,versionAvailabilityVerified:false,checkedAt:null},null,2)+'\n');validate(root);
 assert.equal(ok(npm(['whoami']),'npm login required').trim(),'bingbing77','Expected npm account bingbing77');
 const info=JSON.parse(ok(npm(['view',p.name,'name','maintainers','--json','--prefer-online']),'Package ownership lookup failed'));assert.equal(info.name,p.name);assert((info.maintainers||[]).some(m=>(typeof m==='string'?m.split(' ')[0]:m.name)==='bingbing77'),'Package is not maintained by bingbing77');
 const result=npm(['view',p.name+'@'+p.version,'version','--json','--prefer-online']);if(result.status===0)throw Error('Version '+p.version+' already exists. Do not publish it again.');let absent;try{absent=JSON.parse(result.stdout);}catch{}assert.equal(absent?.error?.code,'E404','Cannot confirm unpublished version; check registry connectivity');
 node('scripts/verify.cjs');
 const report=JSON.parse(ok(npm(['pack','--ignore-scripts','--json','--pack-destination',work]),'npm pack failed')),reportFile=path.join(work,'pack-report.json');fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');node('scripts/check-pack.cjs',[reportFile]);
 const tarball=path.join(work,report[0].filename),sandbox=fs.mkdtempSync(path.join(work,'install-'));fs.writeFileSync(path.join(sandbox,'package.json'),JSON.stringify({name:'tabby-release-isolation',version:'1.0.0',private:true}));
 ok(npm(['install',tarball,'--ignore-scripts','--no-audit','--no-fund','--package-lock=false'],sandbox),'Isolated installation failed');const installed=path.join(sandbox,'node_modules',p.name);assert.equal(JSON.parse(fs.readFileSync(path.join(installed,'package.json'))).version,p.version);runtime(installed);
 ok(npm(['uninstall',p.name,'--ignore-scripts','--no-audit','--no-fund','--package-lock=false'],sandbox),'Isolated uninstall failed');assert(!fs.existsSync(installed));
 fs.writeFileSync(proofFile,JSON.stringify({version:p.version,expectedAccount:'bingbing77',registry,accountVerified:true,ownershipVerified:true,versionAvailabilityVerified:true,packageChecked:true,isolatedInstallChecked:true,checkedAt:new Date().toISOString(),packageManifestSha256:digest(path.join(root,'package.json')),integrityManifestSha256:digest(path.join(root,'runtime-integrity.json')),tarballSha256:digest(tarball)},null,2)+'\n');validate(root,true);
 console.log('READY: stable 4.1.1 prepared. Nothing has been published.');console.log('Next command: npm.cmd publish --tag latest --access public --registry='+registry);
}catch(error){console.error('STOP: '+error.message);process.exitCode=1;}
