'use strict';
const {createPlatform}=require('../server/platform.cjs');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tsb-platform-'));let app,browser;
 try{
  app=createPlatform({dataDir:dir,demoAccounts:true,reviewerEmail:'reviewer@example.test',reviewerPassword:'Reviewer-secret-12345'});await app.ready();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));let base=`http://127.0.0.1:${app.server.address().port}`;
  const client=()=>{let cookie='';return async(p,method='GET',body)=>{const r=await fetch(base+'/api/'+p,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),cookie},body:body?JSON.stringify(body):undefined});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];const data=await r.json();return {status:r.status,data}}};
  const company=client(),candidate=client(),other=client(),anonymous=client(),reviewer=client();
  assert.equal((await anonymous('jobs')).status,200);
  assert.equal((await anonymous('applications')).status,401);
  const demoAccounts=(await anonymous('demo-accounts')).data;assert.equal(demoAccounts.length,3);
  for(const account of demoAccounts){const demoClient=client();assert.equal((await demoClient('login','POST',{email:account.email,password:account.password})).data.role,account.role)}
  await company('register','POST',{name:'Empresa real',email:'company@example.test',password:'Password-test-12345',role:'company'});
  await candidate('register','POST',{name:'Candidata',email:'candidate@example.test',password:'Password-test-12345',role:'candidate'});
  await other('register','POST',{name:'Otra',email:'other@example.test',password:'Password-test-12345',role:'candidate'});
  assert.equal((await other('register','POST',{name:'Revisor falso',email:'x@example.test',password:'Password-test-12345',role:'reviewer'})).status,400);
  assert.equal((await candidate('jobs','POST',{title:'No permitido'})).status,403);
  const job=(await company('jobs','POST',{title:'Analista',city:'Manta',mode:'Remoto',salary:'USD 800 / mes',functions:'Probar',skills:'Excel',environment:'Oficina accesible',conditions:'Pausas'})).data;
  await candidate('saved','POST',{jobId:job.id});assert.deepEqual((await candidate('saved')).data,[job.id]);assert.equal((await other('saved')).data.length,0);
  await candidate('profile','PUT',{skills:'Excel',bio:'Experiencia',adjustments:'Dato privado'});
  const application=(await candidate('applications','POST',{jobId:job.id})).data;
  assert.equal(application.sharedAdjustments,'');assert.equal(application.profile.adjustments,undefined);
  assert.equal((await candidate('applications','POST',{jobId:job.id})).status,409);
  assert.equal((await other('applications')).data.length,0);
  assert.equal((await other('applications/'+application.id,'PUT',{status:'withdrawn'})).status,404);
  assert.equal((await other('messages','POST',{applicationId:application.id,body:'Intrusión'})).status,404);
  await candidate('messages','POST',{applicationId:application.id,body:'Hola, "empresa"\nSegunda línea'});
  assert.equal((await company('messages')).data[0].body,'Hola, "empresa"\nSegunda línea');
  assert.equal((await other('messages')).data.length,0);
  await company('applications/'+application.id,'PUT',{status:'reviewing'});
  assert.equal((await candidate('applications')).data[0].status,'reviewing');
  await candidate('applications/'+application.id,'PUT',{status:'withdrawn'});
  const shared=(await candidate('applications','POST',{jobId:job.id,shareAdjustments:true})).data;assert.equal(shared.sharedAdjustments,'Dato privado');
  assert.equal((await other('jobs/'+job.id,'DELETE',{})).status,403);
  const review=(await candidate('reviews','POST',{body:'Revisar recomendación'})).data;
  assert.equal((await other('reviews')).data.length,0);
  await reviewer('login','POST',{email:'reviewer@example.test',password:'Reviewer-secret-12345'});
  assert.equal((await candidate('reviews/'+review.id,'PUT',{resolution:'Falsa respuesta'})).status,403);
  assert.equal((await reviewer('reviews/'+review.id,'PUT',{resolution:'Revisado por una persona de prueba'})).status,200);
  assert.equal((await candidate('reviews')).data[0].status,'resolved');
  const csrf=await fetch(base+'/api/logout',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.example'},body:'{}'});assert.equal(csrf.status,403);
  assert.equal((await fetch(base+'/data/platform.csv')).status,404);
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
  await page.locator('.hero').waitFor();
  fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});await page.screenshot({path:path.join(__dirname,'../test-results/public-home.png'),fullPage:true});
  await page.goto(base+'/#jobs');await page.locator('[data-public-detail]').first().waitFor();await page.locator('[data-public-detail]').first().click();await page.getByRole('dialog').waitFor();assert.equal(await page.locator('#opportunity a[href="#login"]').count(),1);await page.locator('#close-opportunity').click();
  assert.equal((await anonymous('jobs')).data.every(j=>!Object.hasOwn(j,'ownerId')),true);
  assert.equal(await page.locator('body.public-site').count(),1);assert.equal(await page.locator('aside').isVisible(),false);
  await page.goto(base+'/#login');
  assert.equal(await page.locator('[data-demo-account]').count(),3);
  for(let i=0;i<demoAccounts.length;i++){
   await page.locator(`[data-demo-account="${i}"]`).click();
   assert.equal(await page.locator('form[data-action=login] [name=email]').inputValue(),demoAccounts[i].email);
   assert.equal(await page.locator('form[data-action=login] [name=password]').inputValue(),demoAccounts[i].password);
   assert.equal(await page.locator('form[data-action=login]').count(),1);
  }
  await page.setViewportSize({width:375,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.setViewportSize({width:1440,height:1000});
  fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});await page.screenshot({path:path.join(__dirname,'../test-results/login-demo-accounts.png'),fullPage:true});
  assert.equal(await page.locator('.shell aside .brand').count(),1);
  assert.equal(await page.locator('form[data-action=login]').count(),1);
  await page.locator('form[data-action=login] [name=email]').fill('company@example.test');await page.locator('form[data-action=login] [name=password]').fill('Password-test-12345');await page.locator('form[data-action=login] button').click();
  await page.getByRole('heading',{name:'Hola, Empresa real.',exact:true}).waitFor();
  assert.equal(await page.locator('aside [href="#adjustments"]').count(),0);
  await page.goto(base+'/#company');await page.getByRole('heading',{name:'Analista',exact:true}).waitFor();
  assert.equal(await page.locator('.job .job-top').count(),1);
  assert.equal(await page.locator('link[href="/styles.css"]').count(),1);assert.equal(await page.locator('link[href="/accessibility.css"]').count(),1);
  assert.equal(await page.locator('[data-condition]').count(),3);assert.equal(await page.locator('form[data-action=job]').count(),0);
  fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});await page.screenshot({path:path.join(__dirname,'../test-results/platform-desktop.png'),fullPage:true});
  await page.locator('[data-detail]').click();await page.getByRole('dialog').waitFor();assert.equal(await page.locator('#opportunity-title').textContent(),'Analista');await page.locator('#close-opportunity').click();
  await page.locator('[data-view=applications]').click();await page.locator('form[data-action=app-status]').first().waitFor();assert.equal(await page.locator('form[data-action=message]').count(),0);
  await page.locator('aside [data-view=messages]').click();await page.getByRole('heading',{name:'Conversación',exact:true}).waitFor();
  assert.equal(await page.locator('[data-preference]').count(),10);await page.locator('#access-button').click();await page.locator('[data-preference=contrast]').check();await page.keyboard.press('Escape');assert.equal(await page.locator('#access-button').getAttribute('aria-expanded'),'false');await page.locator('#access-button').click();await page.locator('#reset-preferences').click();await page.locator('#close-access').click();
  await page.setViewportSize({width:375,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.screenshot({path:path.join(__dirname,'../test-results/platform-mobile.png'),fullPage:true});
  for(const section of ['profile','adjustments','messages','reviews','company','jobs']){await page.goto(base+'/#'+section);await page.locator('#content h1').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Desbordamiento: ${section}`)}
  await page.goto(base+'/#profile');await page.locator('[name=bio]').waitFor();await page.locator('[name=bio]').fill('Borrador de empresa sin guardar');
  await page.locator('aside [data-view=dashboard]').click();await page.locator('aside [data-view=profile]').click();await page.waitForFunction(()=>document.querySelector('[name=bio]')?.value==='Borrador de empresa sin guardar');
  await page.locator('form[data-action=profile] button').click();await page.locator('.form-feedback').waitFor();
  for(const role of ['candidate','reviewer']){
   const account=demoAccounts.find(a=>a.role===role);await page.request.post(base+'/api/login',{data:{email:account.email,password:account.password}});await page.goto(base+'/?session='+role+'#dashboard');await page.getByRole('heading',{name:'Hola, '+account.name+'.',exact:true}).waitFor();
   assert.equal(await page.locator('aside [data-view=publish]').count(),0);
   assert.equal(await page.locator('aside [data-view=adjustments]').count(),role==='candidate'?1:0);
   if(role==='reviewer')assert.equal(await page.locator('aside [data-view=messages]').count(),0);
  }
  assert.deepEqual(errors,[]);await browser.close();browser=null;
  await new Promise(r=>app.server.close(r));app=createPlatform({dataDir:dir,demoAccounts:false});await app.ready();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${app.server.address().port}`;
  assert.deepEqual((await anonymous('demo-accounts')).data,[]);
  assert.equal((await anonymous('login','POST',{email:demoAccounts[0].email,password:demoAccounts[0].password})).status,401);
  assert.equal((await company('login','POST',{email:'company@example.test',password:'Password-test-12345'})).status,200);
  assert.equal((await company('messages')).data.length,1);assert.equal((await company('jobs')).data[0].title,'Analista');
  console.log('PASS: CSV persistente, cuentas, roles, privacidad, entrega interna, estados, CSRF, reinicio y navegador.');
 }finally{await browser?.close();if(app?.server.listening)await new Promise(r=>app.server.close(r));fs.rmSync(dir,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
