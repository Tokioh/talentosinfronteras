'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createPlatform}=require('../server/platform.cjs');
const {seedDemoData}=require('../server/demo-data.cjs');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tsb-seed-'));
 try{
  const app=createPlatform({dataDir:dir,demoAccounts:true,seedDemoData:true});const added=await app.ready();
  assert.deepEqual(added,{user:4,job:10,application:7,message:9,review:4,saved:6});assert.equal(app.store.all('user').length,7);
  const job=app.store.all('job')[0];app.store.update(job.id,{title:'Modificada manualmente',active:false});
  const candidate=app.store.all('user').find(u=>u.email==='candidata@demo.example');app.store.update(candidate.id,{profile:{bio:'No sobrescribir'}});
  const before=fs.readFileSync(path.join(dir,'platform.csv'),'utf8');
  assert.deepEqual(await seedDemoData(app.store),{user:0,job:0,application:0,message:0,review:0,saved:0});
  assert.equal(fs.readFileSync(path.join(dir,'platform.csv'),'utf8'),before);
  for(const a of app.store.all('application')){assert.ok(app.store.all('job').some(j=>j.id===a.jobId));assert.ok(app.store.all('user').some(u=>u.id===a.candidateId))}
  for(const m of app.store.all('message')){const a=app.store.all('application').find(a=>a.id===m.applicationId);assert.ok(a);assert.deepEqual(new Set([m.fromId,m.toId]),new Set([a.candidateId,a.ownerId]))}
  assert.equal(app.store.all('application').filter(a=>a.sharedAdjustments).length,3);
  console.log('PASS: datos demo relacionados, carga repetible sin duplicados y conservación de modificaciones.');
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
