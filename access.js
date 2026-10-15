'use strict';
(function(){
const screen=document.querySelector('#loginScreen'),name=document.querySelector('#advisorName'),pin=document.querySelector('#accessPin'),error=document.querySelector('#loginError');
function unlock(advisor){document.querySelector('#currentAdvisor').textContent=advisor;document.body.classList.remove('locked');screen.hidden=true;}
document.querySelector('#loginForm').addEventListener('submit',e=>{e.preventDefault();const advisor=name.value.trim();if(!advisor){error.textContent='Escribe el nombre del asesor.';return;}if(pin.value!=='0285'){error.textContent='Clave incorrecta. Inténtalo nuevamente.';pin.value='';pin.focus();return;}try{sessionStorage.setItem('bahia-advisor',advisor);sessionStorage.setItem('bahia-entry','yes');}catch{}pin.value='';error.textContent='';unlock(advisor);});
document.querySelector('#logout').addEventListener('click',()=>{try{sessionStorage.removeItem('bahia-advisor');sessionStorage.removeItem('bahia-entry');}catch{}document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.body.classList.add('locked');screen.hidden=false;document.querySelector('#currentAdvisor').textContent='Equipo comercial';name.value='';pin.value='';error.textContent='';name.focus();});
try{const advisor=sessionStorage.getItem('bahia-advisor');if(advisor&&sessionStorage.getItem('bahia-entry')==='yes')unlock(advisor);}catch{}
})();
