'use strict';
const {chromium}=require('playwright');
const {createPlatform}=require('../server/platform.cjs');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tsb-wcag-'));const app=createPlatform({dataDir:dir,demoAccounts:true});let browser;const report=[];
 try{
  await app.ready();const users=app.store.all('user');const company=users.find(u=>u.role==='company'),candidate=users.find(u=>u.role==='candidate');
  app.store.add({id:'accessible-job',kind:'job',ownerId:company.id,company:company.name,title:'Analista de pruebas',city:'Manta',mode:'Remoto',salary:'USD 800 / mes',functions:'Verificar interfaces',skills:'Excel, Comunicación',environment:'Entorno accesible',conditions:'Horarios flexibles',active:true});
  app.store.add({id:'accessible-application',kind:'application',jobId:'accessible-job',ownerId:company.id,candidateId:candidate.id,candidateName:candidate.name,profile:{skills:'Excel'},status:'submitted',sharedAdjustments:''});
  app.store.add({id:'accessible-review',kind:'review',userId:candidate.id,name:candidate.name,body:'Revisar una recomendación',status:'pending',resolution:''});
  await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.server.address().port}`;
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
  const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
  async function audit(page,role,route){await page.evaluate(axe);const result=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}));report.push({role,route,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:result.incomplete.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))})}
  const scans=[['public',['home','jobs','how','company','login','register']],['candidate',['dashboard','jobs','profile','adjustments','applications','messages','reviews']],['company',['dashboard','company','publish','applications','messages','profile','reviews']],['reviewer',['dashboard','reviews','profile']]];
  for(const [role,routes] of scans){
   const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();
   if(role!=='public'){const account=users.find(u=>u.role===role);const response=await context.request.post(base+'/api/login',{data:{email:account.email,password:'PruebaPortal2026!'}});assert.equal(response.status(),200)}
   for(const route of routes){
    await page.goto(base+'/?audit='+role+'-'+route+'#'+route);await page.locator('#content h1').waitFor();
    await audit(page,role,route);
    if(role==='public'&&route==='login'){
     await page.locator('form[data-action=login] button').click();
     assert.equal(await page.locator('.form-errors:focus').count(),1);
     assert.equal(await page.locator('[aria-invalid=true]').count(),2);
     await page.locator('.form-errors a').first().click();assert.equal(await page.locator('[name=email]:focus').count(),1);
     await audit(page,role,'login-errors');
    }
    if(role==='public'&&route==='jobs'){
     const trigger=page.locator('[data-public-detail]').first();await trigger.focus();await page.keyboard.press('Enter');await page.locator('#opportunity[open]').waitFor();assert.equal(await page.locator('#opportunity-title:focus').count(),1);await audit(page,role,'job-dialog');for(let i=0;i<8;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement===document.body||document.querySelector('#opportunity').contains(document.activeElement)),true)}await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
    }
    for(const width of [320,375]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Reflujo ${role}/${route} a ${width}px`)}await page.setViewportSize({width:1280,height:900});
   }
   await page.locator('#access-button').click();
   for(const box of await page.locator('[data-preference]').all())await box.check();
   await page.locator('#close-access').click();await page.waitForTimeout(250);
   for(const width of [320,375,768]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Preferencias ${role} a ${width}px`)}
   await audit(page,role,'all-preferences');
   await context.close();
  }
  const out=path.join(__dirname,'../test-results');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'wcag-report.json'),JSON.stringify(report,null,2));
  const failures=report.filter(r=>r.violations.length);for(const r of failures)console.error(JSON.stringify(r,null,2));
  assert.equal(failures.length,0,'Hay infracciones automáticas; consultar test-results/wcag-report.json');
  console.log(`PASS: axe WCAG A/AA y buenas prácticas en ${report.length} vistas/roles; reflujo a 320/375 px. Requiere revisión manual adicional.`);
 }finally{await browser?.close();if(app.server.listening)await new Promise(r=>app.server.close(r));fs.rmSync(dir,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
