'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {promisify}=require('node:util');
const scrypt=promisify(crypto.scrypt);
const equal=(a,b)=>a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
// RFC 4180 quoting: JSON is kept inside one quoted CSV field. Atomic replacement, single process only.
function openStore(dir){
 fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const file=path.join(dir,'platform.csv');
 let rows=[];
 if(fs.existsSync(file)){
  const source=fs.readFileSync(file,'utf8');
  if(!source.startsWith('"record"\r\n'))throw Error('Cabecera CSV no válida');
  rows=source.slice(10).split('\r\n').filter(Boolean).map(line=>{
   if(!/^"(?:[^"]|"")*"$/.test(line))throw Error('CSV dañado');
   return JSON.parse(line.slice(1,-1).replace(/""/g,'"'));
  });
 }
 const write=next=>{
  const tmp=file+'.tmp';
  const fd=fs.openSync(tmp,'w',0o600);
  try{fs.writeFileSync(fd,'"record"\r\n'+next.map(r=>'"'+JSON.stringify(r).replace(/"/g,'""')+'"').join('\r\n')+'\r\n');fs.fsyncSync(fd)}finally{fs.closeSync(fd)}
  fs.renameSync(tmp,file);rows=next;
 };
 return {all:kind=>rows.filter(r=>r.kind===kind),add:r=>{write([...rows,r]);return r},update:(id,patch)=>{const old=rows.find(r=>r.id===id);if(!old)throw Error('Registro inexistente');const next={...old,...patch};write(rows.map(r=>r.id===id?next:r));return next},remove:id=>write(rows.filter(r=>r.id!==id))};
}
const publicUser=u=>({id:u.id,name:u.name,role:u.role});
const record=(kind,data)=>({id:crypto.randomUUID(),kind,createdAt:new Date().toISOString(),...data});
function createPlatform(options={}){
 const store=openStore(options.dataDir||process.env.DATA_DIR||path.join(__dirname,'../data'));
 const sessions=new Map(),attempts=new Map();
 const demoEnabled=options.demoAccounts??(process.env.ENABLE_DEMO_ACCOUNTS==='true'||(process.env.ENABLE_DEMO_ACCOUNTS!=='false'&&process.env.NODE_ENV!=='production'));
 const demoAccounts=[];
 const secure=options.secure??process.env.COOKIE_SECURE==='true';
 const origin=options.origin||process.env.PUBLIC_ORIGIN;
 const assets={'/':'platform.html','/platform.js':'platform.js','/navigation.js':'navigation.js','/platform.css':'platform.css','/demo/':'index.html','/app.js':'app.js','/local-tools.js':'local-tools.js','/styles.css':'styles.css','/accessibility.css':'accessibility.css'};
 const fail=(status,message)=>{throw Object.assign(Error(message),{status})};
 const text=(value,max=4000)=>{if(typeof value!=='string'||!value.trim()||value.length>max)fail(400,'Campos incompletos o demasiado largos');return value.trim()};
 const add= (kind,data)=>store.add(record(kind,data));
 async function password(value,salt=crypto.randomBytes(16).toString('hex')){return salt+':'+(await scrypt(value,salt,64)).toString('hex')}
 async function ready(){
  if(demoEnabled){
   const fixtures=[{name:'María · Candidata',email:'candidata@demo.example',role:'candidate',description:'Explora vacantes, configura tu perfil y postúlate.'},{name:'Daniela · Empresa',email:'empresa@demo.example',role:'company',description:'Publica vacantes y revisa las postulaciones recibidas.'},{name:'Equipo · Revisor',email:'revisor@demo.example',role:'reviewer',description:'Consulta solicitudes y responde desde la bandeja de revisión.'}];
   for(const fixture of fixtures){
    const secret='PruebaPortal2026!';let account=store.all('user').find(u=>u.email===fixture.email);
    if(!account)account=add('user',{name:fixture.name,email:fixture.email,role:fixture.role,password:await password(secret),profile:{},demo:true});
    if(account.demo===true&&account.role===fixture.role&&equal(await password(secret,account.password.split(':')[0]),account.password))demoAccounts.push({...fixture,password:secret});
   }
  }
  const email=options.reviewerEmail||process.env.REVIEWER_EMAIL,secret=options.reviewerPassword||process.env.REVIEWER_PASSWORD;
  if(email&&secret&&!store.all('user').some(u=>u.email===email.toLowerCase())){
   if(secret.length<12)throw Error('REVIEWER_PASSWORD requiere al menos 12 caracteres');
   add('user',{name:'Equipo de revisión',email:email.toLowerCase(),password:await password(secret),role:'reviewer',profile:{}});
  }
  if(options.seedDemoData??process.env.SEED_DEMO_DATA==='true'){
   if(!demoEnabled)throw Error('SEED_DEMO_DATA requiere ENABLE_DEMO_ACCOUNTS=true');
   return require('./demo-data.cjs').seedDemoData(store);
  }
 }
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; media-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data))};
  try{
   const url=new URL(req.url,'http://localhost'),p=url.pathname;
   if(p==='/health'){send(200,{ok:true});return}
   if(p==='/api/demo-accounts'&&req.method==='GET'){send(200,demoAccounts);return}
   if(!p.startsWith('/api/')){
    const file=assets[p]||(p.startsWith('/demo/')?assets[p.slice(5)]:null);if(!file||!['GET','HEAD'].includes(req.method))fail(404,'No encontrado');
    const type=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html';res.setHeader('Content-Type',type+'; charset=utf-8');res.end(req.method==='HEAD'?undefined:fs.readFileSync(path.join(__dirname,'..',file)));return;
   }
   let body={};
   if(!['GET','HEAD'].includes(req.method)){
    // Same-origin writes; never trust forwarded host headers for CSRF validation.
    if(req.headers.origin&&req.headers.origin!==(origin||`http://${req.headers.host}`))fail(403,'Origen no permitido');
    if(req.headers['content-type']?.split(';')[0]!=='application/json')fail(415,'Se requiere JSON');
    let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>65536)fail(413,'Solicitud demasiado grande');chunks.push(chunk)}
    try{body=JSON.parse(Buffer.concat(chunks).toString()||'{}')}catch{fail(400,'JSON inválido')}
    if(!body||typeof body!=='object'||Array.isArray(body))fail(400,'JSON inválido');
   }
   const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('tsb_session='))?.slice(12);
   const key=token?crypto.createHash('sha256').update(token).digest('hex'):null;
   const session=sessions.get(key);if(session&&session.expires<Date.now())sessions.delete(key);
   const user=session&&session.expires>Date.now()?store.all('user').find(u=>u.id===session.userId):null;
   const auth=role=>{if(!user)fail(401,'Inicia sesión');if(role&&user.role!==role)fail(403,'No tienes permiso')};
   const cookie=value=>res.setHeader('Set-Cookie',`tsb_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${value?28800:0}${secure?'; Secure':''}`);
   if(['/api/register','/api/login'].includes(p)&&req.method==='POST'){
    const ip=req.socket.remoteAddress;let rate=attempts.get(ip);if(!rate||rate.until<Date.now()){if(attempts.size>10000)attempts.clear();rate={count:0,until:Date.now()+900000};attempts.set(ip,rate)}if(++rate.count>30)fail(429,'Demasiados intentos; espera 15 minutos');
    const email=text(body.email,254).toLowerCase(),pass=text(body.password,200);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'Correo inválido');
    let account=store.all('user').find(u=>u.email===email);
    if(p==='/api/register'){
     if(pass.length<12)fail(400,'Usa una contraseña de al menos 12 caracteres');if(!['candidate','company'].includes(body.role))fail(400,'Rol inválido');if(account)fail(409,'No se puede registrar ese correo');
     const hash=await password(pass);if(store.all('user').some(u=>u.email===email))fail(409,'No se puede registrar ese correo');account=add('user',{email,password:hash,name:text(body.name,90),role:body.role,profile:{}});
    }else{
     const salt=account?.password.split(':')[0]||'00000000000000000000000000000000';const hash=await password(pass,salt);if(!account||(!demoEnabled&&account.demo===true)||!equal(hash,account.password))fail(401,'Credenciales incorrectas');
    }
    for(const [k,s] of sessions)if(s.expires<Date.now())sessions.delete(k);
    if(sessions.size>10000)fail(503,'Demasiadas sesiones');const value=crypto.randomBytes(32).toString('hex');sessions.set(crypto.createHash('sha256').update(value).digest('hex'),{userId:account.id,expires:Date.now()+28800000});cookie(value);send(200,publicUser(account));return;
   }
   if(p==='/api/logout'&&req.method==='POST'){sessions.delete(key);cookie('');send(200,{ok:true});return}
   if(p==='/api/me'&&req.method==='GET'){send(200,user?{...publicUser(user),profile:user.profile}:null);return}
   if(p==='/api/jobs'&&req.method==='GET'){const available=store.all('job').filter(j=>j.active||j.ownerId===user?.id);send(200,user?available:available.map(({ownerId,...job})=>job));return}
   auth();
   if(p==='/api/profile'&&req.method==='PUT'){
    const profile={};for(const field of ['headline','skills','interests','bio','portfolio','adjustments']){if(body[field]!==undefined){if(typeof body[field]!=='string'||body[field].length>15000)fail(400,'Perfil inválido');profile[field]=body[field].trim()}}
    if(profile.portfolio&&!/^https?:\/\//i.test(profile.portfolio))fail(400,'Portafolio debe usar HTTP/HTTPS');store.update(user.id,{profile});send(200,{ok:true});return;
   }
   if(p==='/api/saved'&&req.method==='GET'){send(200,store.all('saved').filter(s=>s.userId===user.id).map(s=>s.jobId));return}
   if(p==='/api/saved'&&req.method==='POST'){auth('candidate');const job=store.all('job').find(j=>j.id===body.jobId&&j.active);if(!job)fail(404,'Vacante no disponible');const saved=store.all('saved').find(s=>s.userId===user.id&&s.jobId===job.id);if(saved)store.remove(saved.id);else add('saved',{userId:user.id,jobId:job.id});send(200,{ok:true});return}
   if(p==='/api/jobs'&&req.method==='POST'){
    auth('company');const fields={};for(const f of ['title','city','mode','salary','functions','skills','environment','conditions'])fields[f]=text(body[f],f==='title'?120:4000);
    if(!['Remoto','Híbrido','Presencial'].includes(fields.mode))fail(400,'Modalidad inválida');send(201,add('job',{...fields,company:user.name,ownerId:user.id,active:true}));return;
   }
   const jobMatch=p.match(/^\/api\/jobs\/([^/]+)$/);
   if(jobMatch&&['PUT','DELETE'].includes(req.method)){
    auth('company');const job=store.all('job').find(j=>j.id===jobMatch[1]&&j.ownerId===user.id);if(!job)fail(404,'Vacante inexistente');
    const patch={};if(req.method==='DELETE')patch.active=false;else for(const f of ['title','city','mode','salary','functions','skills','environment','conditions'])if(body[f]!==undefined)patch[f]=text(body[f],f==='title'?120:4000);
    if(patch.mode&&!['Remoto','Híbrido','Presencial'].includes(patch.mode))fail(400,'Modalidad inválida');send(200,store.update(job.id,patch));return;
   }
   if(p==='/api/applications'&&req.method==='POST'){
    auth('candidate');const job=store.all('job').find(j=>j.id===body.jobId&&j.active);if(!job)fail(404,'Vacante no disponible');if(store.all('application').some(a=>a.jobId===job.id&&a.candidateId===user.id&&a.status!=='withdrawn'))fail(409,'Ya existe una postulación');
    const {adjustments,...profile}=user.profile;
    send(201,add('application',{jobId:job.id,ownerId:job.ownerId,candidateId:user.id,candidateName:user.name,profile,sharedAdjustments:body.shareAdjustments===true?(adjustments||''):'',status:'submitted'}));return;
   }
   if(p==='/api/applications'&&req.method==='GET'){send(200,store.all('application').filter(a=>a.candidateId===user.id||a.ownerId===user.id));return}
   const appMatch=p.match(/^\/api\/applications\/([^/]+)$/);
   if(appMatch&&req.method==='PUT'){
    const a=store.all('application').find(a=>a.id===appMatch[1]&&(a.candidateId===user.id||a.ownerId===user.id));if(!a)fail(404,'Postulación inexistente');
    const allowed=a.candidateId===user.id?['withdrawn']:['reviewing','accepted','rejected'];if(a.status==='withdrawn'||!allowed.includes(body.status))fail(400,'Transición no permitida');
    send(200,store.update(a.id,{status:body.status,updatedAt:new Date().toISOString()}));return;
   }
   if(p==='/api/messages'&&req.method==='GET'){send(200,store.all('message').filter(m=>m.fromId===user.id||m.toId===user.id));return}
   if(p==='/api/messages'&&req.method==='POST'){
    const a=store.all('application').find(a=>a.id===body.applicationId&&(a.candidateId===user.id||a.ownerId===user.id));if(!a)fail(404,'Conversación inexistente');
    send(201,add('message',{applicationId:a.id,fromId:user.id,fromName:user.name,toId:a.candidateId===user.id?a.ownerId:a.candidateId,body:text(body.body,3000)}));return;
   }
   if(p==='/api/reviews'&&req.method==='POST'){send(201,add('review',{userId:user.id,name:user.name,body:text(body.body),status:'pending',resolution:''}));return}
   if(p==='/api/reviews'&&req.method==='GET'){send(200,store.all('review').filter(r=>r.userId===user.id||user.role==='reviewer'));return}
   const reviewMatch=p.match(/^\/api\/reviews\/([^/]+)$/);
   if(reviewMatch&&req.method==='PUT'){auth('reviewer');const r=store.all('review').find(r=>r.id===reviewMatch[1]);if(!r)fail(404,'Solicitud inexistente');send(200,store.update(r.id,{status:'resolved',resolution:text(body.resolution),reviewerId:user.id,resolvedAt:new Date().toISOString()}));return}
   fail(404,'No encontrado');
  }catch(error){if(!res.headersSent)send(error.status||500,{error:error.status?error.message:'Error interno. Inténtalo de nuevo.'});else res.end();if(!error.status)console.error('Error de servidor:',error.message)}
 });
 return {server,ready,store};
}
module.exports={createPlatform,openStore};
if(require.main===module){
 if(process.env.NODE_ENV==='production'&&(!process.env.PUBLIC_ORIGIN||process.env.COOKIE_SECURE!=='true'))throw Error('Producción requiere PUBLIC_ORIGIN y COOKIE_SECURE=true');
 if(process.env.NODE_ENV==='production'&&!/^https:\/\/[^/]+$/.test(process.env.PUBLIC_ORIGIN))throw Error('PUBLIC_ORIGIN debe ser un origen HTTPS sin ruta ni barra final');
 const app=createPlatform();app.ready().then(()=>app.server.listen(Number(process.env.PORT||8000),process.env.HOST||'127.0.0.1',()=>console.log('Plataforma disponible en puerto '+(process.env.PORT||8000)))) .catch(e=>{console.error(e.message);process.exitCode=1});
}
