'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
for(const file of ['app.js','local-tools.js','scripts/serve.cjs','tests/accessibility.cjs','tests/flows.cjs','tests/local-tools.cjs']){
  new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
}
console.log('PASS: sintaxis JavaScript');
