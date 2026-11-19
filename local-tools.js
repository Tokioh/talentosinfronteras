'use strict';
// Local-only enhancements. Drafts stay in this tab's memory, never in a second storage key.
const drafts=new Map();
let editingJob=null;
function captureDrafts(){
  for(const form of document.querySelectorAll('#main form')){
    if(!form.id||['apply-form','media-form','search-form'].includes(form.id))continue;
    drafts.set(form.id,[...form.elements].filter(el=>el.name||el.id).filter(el=>!['button','submit','file'].includes(el.type)).map(el=>({key:el.name||el.id,value:el.value,checked:el.checked})));
  }
}
function restoreDrafts(){
  for(const form of document.querySelectorAll('#main form')){
    for(const saved of drafts.get(form.id)||[]){
      const el=[...form.elements].find(el=>(el.name||el.id)===saved.key&&(el.type!=='checkbox'||el.value===saved.value));
      if(!el)continue;
      el.value=saved.value;if(el.type==='checkbox')el.checked=saved.checked;
    }
  }
}
function bindLocalTools(page){
  restoreDrafts();
  if(page==='perfil'){
    $('#main').insertAdjacentHTML('beforeend',`<section class="panel" aria-labelledby="backup-title"><h2 id="backup-title">Copia de seguridad de datos de texto</h2><p>La copia incluye perfil, ajustes privados, postulaciones, mensajes y solicitudes. No incluye audio ni video. El archivo no está cifrado: no lo compartas y guárdalo en un lugar seguro.</p><button type="button" id="export-data">Exportar copia JSON</button><label class="field">Restaurar copia (reemplaza los datos de texto actuales)<input type="file" id="import-data" accept=".json,application/json"></label></section>`);
    $('#export-data').onclick=()=>{if(confirm('La copia contiene información privada y no está cifrada. ¿Descargarla?'))download('talento-sin-barreras.json',JSON.stringify({format:'tsb-backup',version:1,createdAt:new Date().toISOString(),state},null,2))};
    $('#import-data').onchange=async e=>{
      const file=e.target.files[0];if(!file)return;
      try{
        if(file.size>5*1024*1024)throw Error('La copia supera 5 MB.');
        const data=JSON.parse(await file.text());
        if(data.format!=='tsb-backup'||data.version!==1||!data.state||typeof data.state!=='object'||Array.isArray(data.state))throw Error('Formato de copia no compatible.');
        const next=restoreState(data.state);
        for(const key of ['jobs','saved','applications','messages','requests','adjustments'])if(!Array.isArray(data.state[key])||next[key].length!==data.state[key].length)throw Error('La copia contiene registros inválidos.');
        if(!confirm('¿Reemplazar tus datos de texto por esta copia? Los archivos multimedia actuales no se modificarán.'))return;
        state=next;drafts.clear();editingJob=null;const persisted=save();applyAccess();render(true);toast(persisted?'Copia restaurada.':'Copia cargada solo en esta sesión.');
      }catch(error){toast('No se importó la copia. '+error.message)}finally{if(e.target.isConnected)e.target.value=''}
    };
  }
  if(page==='empresa'){
    const form=$('#employer-form');
    for(const button of document.querySelectorAll('[data-delete-job]')){
      const edit=document.createElement('button');edit.type='button';edit.className='secondary';edit.textContent='Editar vacante';edit.dataset.editJob=button.dataset.deleteJob;
      button.before(edit);
      edit.onclick=()=>{
        const job=state.jobs.find(j=>j.id===edit.dataset.editJob);if(!job)return;
        editingJob=job.id;
        for(const el of form.elements){if(!el.name)continue;if(el.type==='checkbox')el.checked=job.conditions.includes(el.value);else if(el.name in job)el.value=el.name==='skills'?job.skills.join(', '):job[el.name]}
        captureDrafts();render();$('#employer-form input').focus();
      };
    }
    if(editingJob){form.querySelector('button').textContent='Guardar cambios de vacante';const cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent='Cancelar edición';cancel.onclick=()=>{editingJob=null;drafts.delete(form.id);render(true)};form.querySelector('.actions').append(cancel)}
  }
}
document.addEventListener('input',e=>{if(e.target.closest('#main form'))captureDrafts()});
document.addEventListener('change',e=>{if(e.target.closest('#main form'))captureDrafts()});
// Draft recovery covers in-app navigation; reload/closing the tab clears drafts.
window.addEventListener('storage',e=>{
  if(e.key!=='tsb-v1'&&e.key!==null)return;
  // Never overwrite the current tab's edits silently.
  toast('Los datos cambiaron en otra pestaña. Recarga para verlos; exporta antes si necesitas conservar los cambios de esta pestaña.');
});
