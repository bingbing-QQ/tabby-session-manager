'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),{spawnSync}=require('child_process'),runNpm=require('./npm-runner.cjs');
const root=path.resolve(__dirname,'..'),registry='https://registry.npmjs.org/',packageFile=path.join(root,'package.json'),readyFile=path.join(root,'release-readiness.json'),proofFile=path.join(root,'stable-publication.json');
const p=JSON.parse(fs.readFileSync(packageFile)),proof=JSON.parse(fs.readFileSync(proofFile));assert.equal(p.name,'tabby-session-manager');assert.equal(p.version,'4.1.0');
const work=path.join(root,'artifacts','npm-release');fs.mkdirSync(work,{recursive:true});
function npm(args,cwd=root){const r=runNpm(args,cwd);if(r.error)throw r.error;return r;}
function ok(result,label){if(result.status!==0)throw Error(label+'\n'+result.stdout+'\n'+result.stderr);return result.stdout;}
function node(file,args=[]){const r=spawnSync(process.execPath,[path.join(root,file),...args],{cwd:root,stdio:'inherit',timeout:120000});if(r.status!==0)throw Error('Check failed: '+file);}
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function verifyRuntime(installed){const hashes=JSON.parse(fs.readFileSync(path.join(root,'runtime-integrity.json'))).files;for(const [name,hash]of Object.entries(hashes))assert.equal(digest(path.join(installed,name)),hash,name);}
try {
 assert.equal(ok(npm(['whoami','--registry='+registry]),'npm account check failed').trim(),'bingbing77');
 const info=JSON.parse(ok(npm(['view',p.name,'name','maintainers','--json','--registry='+registry]),'Package ownership lookup failed'));assert.equal(info.name,p.name);assert((info.maintainers||[]).some(m=>(typeof m==='string'?m.split(' ')[0]:m.name)==='bingbing77'),'Package is not maintained by bingbing77');
 const version=npm(['view',p.name+'@4.1.0','version','--json','--registry='+registry]);if(version.status===0)throw Error('Version 4.1.0 already exists. Do not republish it.');let absent;try{absent=JSON.parse(version.stdout);}catch{}assert.equal(absent?.error?.code,'E404','Cannot confirm whether 4.1.0 is available');
 console.log('PASS account, package ownership and unpublished stable version');
 node('scripts/verify.cjs');
 const candidateDir=path.join(work,'candidate');fs.mkdirSync(candidateDir,{recursive:true});
 const candidate=JSON.parse(ok(npm(['pack',p.name+'@4.1.0-rc.1','--json','--ignore-scripts','--pack-destination',candidateDir,'--registry='+registry]),'Candidate download failed'));
 const sandbox=fs.mkdtempSync(path.join(work,'install-'));fs.writeFileSync(path.join(sandbox,'package.json'),JSON.stringify({name:'tabby-stable-install-check',version:'1.0.0',private:true}));
 ok(npm(['install',path.join(candidateDir,candidate[0].filename),'--ignore-scripts','--no-audit','--no-fund','--package-lock=false'],sandbox),'Candidate installation failed');
 const installed=path.join(sandbox,'node_modules',p.name);assert.equal(JSON.parse(fs.readFileSync(path.join(installed,'package.json'))).version,'4.1.0-rc.1');verifyRuntime(installed);
 console.log('PASS runtime matches actual downloaded npm candidate');
 p.private=false;p.publishConfig.tag='latest';fs.writeFileSync(packageFile,JSON.stringify(p,null,2)+'\n');
 const report=JSON.parse(ok(npm(['pack','--json','--ignore-scripts','--pack-destination',work]),'Stable pack failed'));const reportFile=path.join(work,'pack-report.json');fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');node('scripts/check-pack.cjs',[reportFile]);const tarball=path.join(work,report[0].filename);
 ok(npm(['install',tarball,'--ignore-scripts','--no-audit','--no-fund','--package-lock=false'],sandbox),'Stable package installation failed');assert.equal(JSON.parse(fs.readFileSync(path.join(installed,'package.json'))).version,'4.1.0');verifyRuntime(installed);
 ok(npm(['uninstall',p.name,'--ignore-scripts','--no-audit','--no-fund','--package-lock=false'],sandbox),'Stable uninstall failed');assert(!fs.existsSync(installed));
 Object.assign(proof,{rcRuntimeMatched:true,packageChecked:true,isolatedInstallChecked:true,checkedAt:new Date().toISOString(),packageManifestSha256:digest(packageFile),tarballSha256:digest(tarball)});fs.writeFileSync(proofFile,JSON.stringify(proof,null,2)+'\n');const ready=JSON.parse(fs.readFileSync(readyFile));ready.npmNameOwnershipConfirmed=true;fs.writeFileSync(readyFile,JSON.stringify(ready,null,2)+'\n');node('scripts/check-release.cjs');
 console.log('READY: stable 4.1.0 prepared. Nothing has been published by this command.');console.log('Next: npm.cmd publish --tag latest --access public --registry='+registry);
}catch(error){p.private=true;fs.writeFileSync(packageFile,JSON.stringify(p,null,2)+'\n');console.error('STOP: '+error.message);process.exitCode=1;}
