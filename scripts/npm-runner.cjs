'use strict';
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
function findCLI(){
 const candidates=[process.env.npm_execpath,path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js')].filter(Boolean);
 if(process.platform==='win32'){
  const where=spawnSync('where.exe',['npm.cmd'],{encoding:'utf8',timeout:10000});
  if(where.status===0)for(const line of where.stdout.trim().split(/\r?\n/))candidates.push(path.join(path.dirname(line),'node_modules/npm/bin/npm-cli.js'));
 }
 const cli=candidates.find(file=>path.basename(file)==='npm-cli.js'&&fs.existsSync(file));
 if(!cli)throw Error('Cannot locate npm-cli.js. Run this check using npm.cmd run prepare:test.');
 return cli;
}
module.exports=function runNpm(args,cwd){
 // Invoke the npm JavaScript entry directly; never parse arguments through cmd.exe.
 return spawnSync(process.execPath,[findCLI(),...args],{cwd,encoding:'utf8',timeout:120000,windowsHide:true});
};
