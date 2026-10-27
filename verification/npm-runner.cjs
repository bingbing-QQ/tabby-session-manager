const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'scratch-logs','npm runner fixture');fs.mkdirSync(folder,{recursive:true});
const cli=path.join(folder,'npm-cli.js');fs.writeFileSync(cli,"process.stdout.write(JSON.stringify({args:process.argv.slice(2),cwd:process.cwd()}));");
const before=process.env.npm_execpath;process.env.npm_execpath=cli;
try {
 const run=require('../scripts/npm-runner.cjs');
 for(const args of [['whoami','--registry=https://registry.npmjs.org/'],['install',path.join(folder,'test package & sample.tgz'),'--ignore-scripts','--package-lock=false'],['pack','--json','--pack-destination',folder]]){
  const result=run(args,folder);assert.equal(result.status,0,result.stderr);const parsed=JSON.parse(result.stdout);assert.deepEqual(parsed.args,args);assert.equal(path.resolve(parsed.cwd),path.resolve(folder));
 }
 console.log('PASS npm runner: direct Node CLI invocation preserves command names and paths containing spaces or shell characters');
}finally {if(before===undefined)delete process.env.npm_execpath;else process.env.npm_execpath=before;}
