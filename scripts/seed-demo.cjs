'use strict';
const fs=require('node:fs'),path=require('node:path'),net=require('node:net');
const {createPlatform}=require('../server/platform.cjs');
(async()=>{
 const running=await new Promise(resolve=>{const socket=net.connect({host:'127.0.0.1',port:Number(process.env.PORT||8000)});socket.setTimeout(1500);socket.once('connect',()=>{socket.destroy();resolve(true)});socket.once('error',()=>resolve(false));socket.once('timeout',()=>{socket.destroy();resolve(false)})});
 if(running)throw Error('Detén el servidor antes de poblar el CSV (Ctrl+C). No ejecutar escritores simultáneos.');
 const dir=path.resolve(process.env.DATA_DIR||path.join(__dirname,'../data'));const file=path.join(dir,'platform.csv');
 if(fs.existsSync(file)){const backups=path.join(dir,'backups');fs.mkdirSync(backups,{recursive:true,mode:0o700});const name='platform.before-seed.'+new Date().toISOString().replace(/[:.]/g,'-')+'.csv';fs.copyFileSync(file,path.join(backups,name));console.log('Copia previa creada en data/backups (o DATA_DIR/backups). Contiene información privada.');}
 const app=createPlatform({dataDir:dir,demoAccounts:true,seedDemoData:true});
 const counts=await app.ready();console.log('Registros ficticios nuevos:',JSON.stringify(counts));
 console.log('Datos guardados en '+file+'. Reinicia el servidor. Las cuentas demo deben estar habilitadas para utilizarlas.');
})().catch(e=>{console.error(e.message);process.exitCode=1});
