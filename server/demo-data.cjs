'use strict';
const crypto=require('node:crypto');
const {promisify}=require('node:util');
const scrypt=promisify(crypto.scrypt);
// Fictional Ecuadorian fixtures. Existing rows (including modified demo rows) are never overwritten.
async function seedDemoData(store){
 const counts={user:0,job:0,application:0,message:0,review:0,saved:0};
 const ago=days=>new Date(Date.now()-days*86400000).toISOString();
 const add=(kind,key,data)=>{
  const existing=store.all(kind).find(r=>r.fixtureKey===key);if(existing)return existing;
  counts[kind]++;return store.add({id:crypto.randomUUID(),kind,fixtureKey:key,createdAt:ago(7),...data});
 };
 const baseCandidate=store.all('user').find(u=>u.email==='candidata@demo.example'&&u.demo===true);
 const baseCompany=store.all('user').find(u=>u.email==='empresa@demo.example'&&u.demo===true);
 const reviewer=store.all('user').find(u=>u.email==='revisor@demo.example'&&u.demo===true);
 if(!baseCandidate||!baseCompany||!reviewer)throw Error('La carga requiere las tres cuentas demo. No se modificarán cuentas normales.');
 async function user(key,name,email,role,profile){
  const existing=store.all('user').find(u=>u.fixtureKey===key);if(existing)return existing;
  if(store.all('user').some(u=>u.email===email))throw Error('Correo reservado ya existente; no se sobrescribirá: '+email);
  const salt=crypto.randomBytes(16).toString('hex');const hash=salt+':'+(await scrypt('PruebaPortal2026!',salt,64)).toString('hex');
  return add('user',key,{name,email,role,profile,password:hash,demo:true});
 }
 const company2=await user('demo-company-nexo','Nexo Digital','nexo@demo.example','company',{headline:'Soluciones digitales accesibles',bio:'Empresa ficticia de tecnología y servicios digitales.'});
 const company3=await user('demo-company-raiz','Raíz Servicios','raiz@demo.example','company',{headline:'Servicios administrativos y logísticos',bio:'Organización ficticia con procesos de inclusión laboral.'});
 const candidate2=await user('demo-candidate-andres','Andrés Vera','andres@demo.example','candidate',{headline:'Asistente administrativo',skills:'Excel, Organización, Comunicación',interests:'Administración, operaciones',bio:'Perfil ficticio con experiencia en reportes y organización documental.',adjustments:'Puesto de trabajo ajustable y pausas acordadas.'});
 const candidate3=await user('demo-candidate-lucia','Lucía Cedeño','lucia@demo.example','candidate',{headline:'Desarrolladora de interfaces web',skills:'HTML, CSS, JavaScript, Accesibilidad',interests:'Tecnología, diseño',bio:'Perfil ficticio con proyectos de interfaces accesibles.',adjustments:'Material de formación disponible por escrito.'});
 // Fill only genuinely empty, generated profiles. Never replace a profile edited by a person.
 if(!Object.values(baseCandidate.profile||{}).some(Boolean))store.update(baseCandidate.id,{profile:{headline:'Especialista en atención al cliente',skills:'Atención al cliente, Comunicación, Herramientas digitales',interests:'Servicio al cliente, tecnología',bio:'Perfil de demostración. Experiencia ficticia en atención por chat y seguimiento de solicitudes.',adjustments:'Instrucciones importantes en texto y horarios con pausas acordadas.'}});
 if(!Object.values(baseCompany.profile||{}).some(Boolean))store.update(baseCompany.id,{profile:{headline:'Empresa de servicios y experiencia del cliente',bio:'Empresa ficticia para explorar publicación, candidaturas y mensajería.'}});
 const specs=[
  ['customer',baseCompany,'Especialista en atención al cliente','Manta','Remoto','USD 550 – 700 / mes','Atención al cliente, Comunicación, Herramientas digitales','Responder consultas por chat y correo, registrar incidencias y acompañar su resolución.','Equipo de trabajo remoto y reuniones con subtítulos.','Horarios flexibles, Comunicación escrita, Inducción accesible'],
  ['documents',company3,'Asistente de gestión documental','Portoviejo','Híbrido','USD 500 – 650 / mes','Organización, Excel, Comunicación','Clasificar documentos, verificar registros y mantener archivos digitales.','Dos días en oficina con ascensor y puesto ajustable.','Acceso sin escalones, Documentos accesibles, Puesto ajustable'],
  ['frontend',company2,'Desarrollador de interfaces web','Quito','Remoto','USD 1.000 – 1.500 / mes','HTML, CSS, JavaScript, Accesibilidad','Construir interfaces, corregir incidencias y verificar navegación con teclado.','Equipo distribuido y comunicación asíncrona con documentación escrita.','Horarios flexibles, Comunicación escrita, Inducción accesible'],
  ['admin',company3,'Auxiliar administrativo','Guayaquil','Presencial','USD 500 – 620 / mes','Excel, Organización, Comunicación','Preparar reportes, actualizar hojas de cálculo y coordinar agendas.','Oficina en planta baja, ruta accesible y espacio tranquilo.','Acceso sin escalones, Puesto ajustable, Documentos accesibles'],
  ['content',company2,'Diseñador de contenidos digitales','Cuenca','Remoto','USD 650 – 900 / mes','Diseño, Redacción, Comunicación, Accesibilidad','Crear piezas y textos claros, incorporar alternativas textuales y subtítulos.','Trabajo por entregas con retroalimentación por escrito.','Horarios flexibles, Comunicación escrita, Documentos accesibles'],
  ['qa',company2,'Analista de calidad de software','Quito','Híbrido','USD 850 – 1.200 / mes','Pruebas de software, Organización, Herramientas digitales','Ejecutar pruebas, documentar errores y verificar correcciones.','Un día presencial, formación en texto y equipos ajustables.','Inducción accesible, Acceso sin escalones, Comunicación escrita'],
  ['sales',baseCompany,'Asesor de ventas por chat','Manta','Remoto','USD 520 – 700 / mes','Atención al cliente, Redacción, Comunicación','Orientar consultas de productos y registrar pedidos mediante canales escritos.','Sin llamadas obligatorias; turnos acordados y herramientas digitales.','Comunicación escrita, Horarios flexibles'],
  ['data',company3,'Asistente de registro de datos','Portoviejo','Híbrido','USD 500 – 600 / mes','Excel, Organización, Herramientas digitales','Revisar datos, detectar duplicados y elaborar resúmenes semanales.','Puesto ajustable, instrucciones documentadas y pausas programadas.','Puesto ajustable, Documentos accesibles, Inducción accesible'],
  ['community',baseCompany,'Gestor de comunidad digital','Guayaquil','Remoto','USD 600 – 850 / mes','Comunicación, Redacción, Herramientas digitales','Moderar comentarios, atender consultas y organizar publicaciones.','Objetivos semanales, comunicación escrita y reuniones subtituladas.','Horarios flexibles, Comunicación escrita'],
  ['support',company2,'Asistente de soporte de plataformas','Cuenca','Remoto','USD 650 – 900 / mes','Herramientas digitales, Comunicación, Organización','Resolver consultas de uso y documentar soluciones frecuentes.','Canal de soporte por tickets y material formativo accesible.','Comunicación escrita, Inducción accesible, Horarios flexibles']
 ];
 const jobs={};for(const [key,owner,title,city,mode,salary,skills,functions,environment,conditions] of specs)jobs[key]=add('job','demo-job-'+key,{ownerId:owner.id,company:owner.name,title,city,mode,salary,skills,functions,environment,conditions,active:true});
 const candidates=[store.all('user').find(u=>u.id===baseCandidate.id),candidate2,candidate3];
 const appSpecs=[['maria-customer',candidates[0],'customer','reviewing',true],['maria-sales',candidates[0],'sales','submitted',false],['maria-support',candidates[0],'support','accepted',true],['andres-admin',candidate2,'admin','reviewing',true],['andres-customer',candidate2,'customer','submitted',false],['lucia-frontend',candidate3,'frontend','accepted',false],['lucia-customer',candidate3,'customer','rejected',false]];
 const apps={};for(const [key,candidate,jobKey,status,share] of appSpecs){const {adjustments,...profile}=candidate.profile||{};const job=jobs[jobKey];apps[key]=add('application','demo-app-'+key,{jobId:job.id,ownerId:job.ownerId,candidateId:candidate.id,candidateName:candidate.name,profile,sharedAdjustments:share?(adjustments||''):'',status,createdAt:ago(5),updatedAt:ago(2)})}
 const conversations=[
  ['maria-customer',candidates[0],'Hola. Me interesa conocer cómo se organiza la inducción escrita del puesto.'],
  ['maria-customer',baseCompany,'Hola, María. La inducción cuenta con guías de texto y reuniones con subtítulos. Podemos acordar las pausas.'],
  ['maria-customer',candidates[0],'Gracias. Puedo participar en una entrevista por videollamada subtitulada el jueves.'],
  ['andres-customer',candidate2,'Hola. Tengo experiencia con atención escrita y organización de solicitudes. ¿El equipo se entrega para trabajo remoto?'],
  ['andres-customer',baseCompany,'Sí. En este escenario de demostración, la vacante incluye equipo y acompañamiento inicial.'],
  ['maria-support',company2,'Tu postulación de ejemplo pasó al estado aceptada. Coordinemos los siguientes pasos por este canal.'],
  ['maria-support',candidates[0],'Recibido. Agradezco que las instrucciones se compartan también por escrito.'],
  ['andres-admin',company3,'Podemos revisar juntos la distribución del puesto ajustable antes de la incorporación.'],
  ['lucia-frontend',candidate3,'Comparto mi interés en las pruebas de teclado y el desarrollo de interfaces accesibles.']
 ];
 for(const [i,[appKey,author,body]] of conversations.entries()){const app=apps[appKey];add('message','demo-message-'+i,{applicationId:app.id,fromId:author.id,fromName:author.name,toId:author.id===app.candidateId?app.ownerId:app.candidateId,body,createdAt:ago(3-i/10)})}
 const reviews=[
  [candidates[0],'Quisiera revisar por qué una vacante no coincide con mis competencias de atención al cliente.','pending',''],
  [candidate2,'Encontré dificultades para comprender los requisitos de una vacante; solicito una explicación escrita.','pending',''],
  [candidates[0],'Necesito confirmar cómo corregir las competencias de mi perfil.','resolved','Puedes editar tus competencias en Perfil y currículum. La afinidad se recalcula al consultar las vacantes.'],
  [candidate3,'¿Los ajustes privados intervienen en el orden de las recomendaciones?','resolved','No. Las coincidencias usan competencias; los ajustes privados no participan en la afinidad ni se comparten sin autorización.']
 ];
 for(const [i,[candidate,body,status,resolution]] of reviews.entries())add('review','demo-review-'+i,{userId:candidate.id,name:candidate.name,body,status,resolution,...(status==='resolved'?{reviewerId:reviewer.id,resolvedAt:ago(1)}:{})});
 for(const [i,[candidate,key]] of [[candidates[0],'customer'],[candidates[0],'sales'],[candidates[0],'community'],[candidate2,'admin'],[candidate2,'documents'],[candidate3,'frontend']].entries()){
  if(!store.all('saved').some(s=>s.userId===candidate.id&&s.jobId===jobs[key].id))add('saved','demo-saved-'+i,{userId:candidate.id,jobId:jobs[key].id});
 }
 return counts;
}
module.exports={seedDemoData};
