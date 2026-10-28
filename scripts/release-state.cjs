'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function validate(root,onlineProof=false){
 const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8')),p=read('package.json'),ready=read('release-readiness.json'),integrity=read('runtime-integrity.json'),candidate=read('verified-candidate.json');
 assert.equal(p.name,'tabby-session-manager');assert.equal(p.version,'4.1.1');assert.equal(p.private,false);assert.equal(p.publishConfig.registry,'https://registry.npmjs.org/');assert.equal(p.publishConfig.tag,'latest');
 assert.equal(ready.version,p.version);assert.equal(ready.maintainerReportedNativeAcceptance,true);assert.equal(integrity.version,p.version);assert.equal(candidate.version,'4.1.1-local.4');assert.deepEqual(Object.keys(candidate.files).sort(),Object.keys(integrity.files).sort());
 for(const [name,hash]of Object.entries(integrity.files)){
  const data=fs.readFileSync(path.join(root,name));assert.equal(digest(data),hash,'Runtime changed after verification: '+name);
  let semantic=data;if(name==='dist/index.js'){const lines=data.toString('utf8').split('\n');assert.equal(lines[0],'/* Tabby Session Suite 4.1.1: replacement implementation; see src and docs/REIMPLEMENTATION.md. */');semantic=Buffer.from(lines.slice(1).join('\n'));}
  assert.equal(digest(semantic),candidate.files[name],'Runtime differs from accepted local candidate: '+name);
 }
 if(onlineProof){
  const proof=read('stable-publication.json');assert.equal(proof.version,p.version);assert.equal(proof.expectedAccount,'bingbing77');assert.equal(proof.registry,p.publishConfig.registry);
  for(const flag of ['accountVerified','ownershipVerified','versionAvailabilityVerified','packageChecked','isolatedInstallChecked'])assert.equal(proof[flag],true,'Run npm.cmd run prepare:release first: '+flag);
  assert.equal(proof.packageManifestSha256,digest(fs.readFileSync(path.join(root,'package.json'))),'Package metadata changed; rerun prepare:release');
  assert.equal(proof.integrityManifestSha256,digest(fs.readFileSync(path.join(root,'runtime-integrity.json'))),'Runtime manifest changed; rerun prepare:release');
  const age=Date.now()-Date.parse(proof.checkedAt);assert(Number.isFinite(age)&&age>=-300000&&age<86400000,'Online preparation expired; rerun prepare:release');
 }
 return {version:p.version,runtimeFiles:Object.keys(integrity.files).length};
}
module.exports={validate};
