'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),p=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const excluded=new Set(['.git','node_modules','scratch-logs','artifacts']);const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(excluded.has(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else files.push(f)}}walk(root);
const rules=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],['npm-token',/\bnpm_[A-Za-z0-9]{30,}\b/],['aws-key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/]];
const findings=[];for(const f of files){if(!/\.(?:md|txt|json|js|cjs|ya?ml)$/.test(f)&&!['LICENSE','NOTICE','.gitignore'].includes(path.basename(f)))continue;const text=fs.readFileSync(f,'utf8');for(const [kind,rule]of rules)if(rule.test(text))findings.push({kind,file:path.relative(root,f).replaceAll('\\','/')})}assert.deepEqual(findings,[],'Recognizable secret material found (report paths only).');
for(const name of ['Tabby-MIT.txt','StyleKit-MIT.txt','Legacy-Logger-MIT.txt']){assert(p.files.includes('licenses/'));const text=fs.readFileSync(path.join(root,'licenses',name),'utf8');assert(text.includes('Permission is hereby granted'));}
const integrity=JSON.parse(fs.readFileSync(path.join(root,'runtime-integrity.json'),'utf8'));assert.deepEqual(fs.readdirSync(path.join(root,'dist')).sort(),Object.keys(integrity.files).map(n=>n.slice(5)).sort(),'Unreviewed dist entry');for(const [name,hash]of Object.entries(integrity.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex'),hash,'Approved runtime mismatch: '+name);
const runtime=Object.keys(integrity.files).filter(n=>n.endsWith('.js')).map(n=>fs.readFileSync(path.join(root,n),'utf8')).join('\n');
assert(!/\b(?:eval|fetch)\s*\(/.test(runtime));assert(!/\bnew\s+Function\s*\(/.test(runtime));assert(!/\.innerHTML\s*=/.test(runtime));
assert.equal(typeof p.private,'boolean','Publishability must be explicit.');
console.log('PASS audit guards: '+files.length+' inventory files, upstream/legacy notices, approved runtime hashes, recognizable secret formats and high-risk runtime sinks. This is not legal clearance or a complete security audit.');
