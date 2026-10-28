'use strict';
const path=require('path');try{const result=require('./release-state.cjs').validate(path.resolve(__dirname,'..'),true);console.log('PASS stable '+result.version+' publication guard: accepted candidate, runtime, package and recent account preparation');}catch(error){console.error('STOP: '+error.message);process.exitCode=1;}
