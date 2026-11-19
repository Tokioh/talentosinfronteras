'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {createServer}=require('../scripts/serve.cjs');
(async()=>{
  const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
    const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/#perfil`);
    await page.locator('[name=name]').fill('Borrador sin guardar');
    await page.locator('nav [href="#vacantes"]').click();
    await page.locator('nav [href="#perfil"]').click();
    assert.equal(await page.locator('[name=name]').inputValue(),'Borrador sin guardar');
    await page.locator('#profile-form button').first().click();
    page.once('dialog',d=>d.accept());const pending=page.waitForEvent('download');await page.locator('#export-data').click();
    assert.equal((await pending).suggestedFilename(),'talento-sin-barreras.json');
    await page.locator('#import-data').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{}')});
    await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('No se importó'));
    const data=await page.evaluate(()=>({format:'tsb-backup',version:1,state:JSON.parse(localStorage.getItem('tsb-v1'))}));data.state.profile.name='Perfil importado';
    page.once('dialog',d=>d.accept());await page.locator('#import-data').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
    await page.waitForFunction(()=>document.querySelector('[name=name]').value==='Perfil importado');
    await page.locator('.sidebar-bottom [href="#empresa"]').click();
    for(const [key,value] of Object.entries({company:'Empresa',title:'Original',city:'Manta',salary:'USD 600 / mes',functions:'Funciones',skills:'Excel',environment:'Accesible'}))await page.locator(`[name=${key}]`).fill(value);
    await page.locator('#employer-form button').first().click();await page.locator('.job').filter({hasText:'Original'}).waitFor();
    await page.locator('.sidebar-bottom [href="#empresa"]').click();await page.locator('[data-edit-job]').click();
    await page.locator('[name=title]').fill('Actualizada');await page.locator('#employer-form button').first().click();
    await page.locator('.job').filter({hasText:'Actualizada'}).waitFor();
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('tsb-v1')).jobs.length),1);
    // Forced quota and deletion failures must be visible to the user.
    await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('quota')};});
    await page.locator('nav [href="#perfil"]').click();await page.locator('#profile-form button').first().click();
    assert.match(await page.locator('#status').textContent(),/solo estarán disponibles/);
    await page.evaluate(()=>{indexedDB.open=()=>{throw Error('blocked')};Storage.prototype.removeItem=()=>{throw Error('blocked')};});
    page.once('dialog',d=>d.accept());await page.locator('#clear-data').click();
    await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('no se pudo confirmar'));
    assert.deepEqual(errors,[]);
    console.log('PASS: borradores, copias, edición de vacantes, cuota y borrado fallido.');
  }finally{await browser?.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
