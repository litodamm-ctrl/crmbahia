'use strict';
(function(){
const screen=document.querySelector('#loginScreen'),name=document.querySelector('#advisorName'),pin=document.querySelector('#accessPin'),error=document.querySelector('#loginError');let roster=[];
function unlock(advisor){document.querySelector('#currentAdvisor').textContent=advisor;document.querySelector('.sidebar-foot .avatar').textContent=advisor.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();document.body.classList.remove('locked');screen.hidden=true;}
function remember(advisor){try{sessionStorage.setItem('bahia-advisor',advisor);sessionStorage.setItem('bahia-entry','yes');}catch{}}
window.refreshAdvisorAccess=function(records,ready){
 const options=Advisor.options(records).filter(o=>o.id!=='__review__'),previous=Advisor.key(name.value);roster=options;
 name.replaceChildren();const prompt=document.createElement('option');prompt.value='';prompt.textContent=ready?'Selecciona tu nombre':'Cargando responsables del CRM…';name.append(prompt);for(const advisor of options){const option=document.createElement('option');option.value=advisor.id;option.textContent=advisor.name;name.append(option);}name.disabled=!ready||!options.length;if(options.some(o=>o.id===previous))name.value=previous;
 if(!ready)return;let saved='',entered=false;try{saved=sessionStorage.getItem('bahia-advisor')||'';entered=sessionStorage.getItem('bahia-entry')==='yes';}catch{}
 const current=options.find(o=>o.id===Advisor.key(saved));if(entered&&current){remember(current.name);unlock(current.name);}else if(entered){try{sessionStorage.removeItem('bahia-entry');sessionStorage.removeItem('bahia-advisor');}catch{}document.body.classList.add('locked');screen.hidden=false;error.textContent='Selecciona la asesora registrada como responsable en el CRM.';}
};
document.querySelector('#loginForm').addEventListener('submit',e=>{e.preventDefault();const advisor=roster.find(o=>o.id===name.value);if(!advisor){error.textContent='Selecciona una asesora registrada en el CRM.';return;}if(pin.value!=='0285'){error.textContent='Clave incorrecta. Inténtalo nuevamente.';pin.value='';pin.focus();return;}remember(advisor.name);pin.value='';error.textContent='';unlock(advisor.name);});
document.querySelector('#logout').addEventListener('click',()=>{try{sessionStorage.removeItem('bahia-advisor');sessionStorage.removeItem('bahia-entry');}catch{}document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.body.classList.add('locked');screen.hidden=false;document.querySelector('#currentAdvisor').textContent='Equipo comercial';name.value='';pin.value='';error.textContent='';name.focus();});
})();
