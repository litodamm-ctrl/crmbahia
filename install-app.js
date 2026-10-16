'use strict';
// Installation adds a launcher; CRM documents and customer data remain online-only.
(()=>{
 let promptEvent=null;
 const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const button=document.createElement('button');button.id='installBahia';button.type='button';button.className='install-bahia';button.textContent='↓ Instalar en PC';button.setAttribute('aria-label','Instalar Bahia Investment en PC');
 document.querySelector('.header-actions').append(button);
 const dialog=document.createElement('dialog');dialog.id='installBahiaDialog';dialog.setAttribute('aria-labelledby','installBahiaTitle');document.body.append(dialog);
 const update=()=>{button.hidden=standalone();};
 function showHelp(){
  dialog.innerHTML='<div class="dialog-head"><div><span class="eyebrow">BAHIA EN TU COMPUTADOR</span><h2 id="installBahiaTitle">Instalar Bahia Investment</h2></div><button type="button" class="icon" id="closeInstallBahia" aria-label="Cerrar instrucciones de instalación">×</button></div><p>Accede desde el escritorio o la barra de tareas, en una ventana propia y con la misma base de clientes.</p><ol class="install-steps"><li>Abre esta dirección en <strong>Chrome o Microsoft Edge</strong> e inicia sesión con tu cuenta autorizada.</li><li>Si aparece el icono de instalación en la barra de direcciones, selecciónalo. También puedes buscar <strong>Instalar</strong> o <strong>Aplicaciones</strong> en el menú del navegador.</li><li>Confirma el nombre <strong>Bahia Investment</strong>. Después puedes fijar su icono a la barra de tareas de Windows.</li></ol><label>Dirección del CRM<input id="installBahiaUrl" readonly></label><div class="button-group"><button type="button" id="copyBahiaUrl">Copiar dirección</button><button type="button" class="primary" id="promptInstallBahia">Instalar ahora</button></div><p id="installBahiaStatus" role="status"></p><p class="subtle">Si estás en el navegador de Codex o ChatGPT, abre la dirección en Chrome o Edge. La instalación no cambia los permisos ni conecta Meta o la IA. Necesitas internet para consultar y guardar; no se descargan los clientes para trabajar sin conexión.</p>';
  dialog.querySelector('#installBahiaUrl').value=location.origin+'/';
  dialog.querySelector('#closeInstallBahia').onclick=()=>dialog.close();
  dialog.querySelector('#promptInstallBahia').hidden=!promptEvent;
  dialog.querySelector('#promptInstallBahia').onclick=install;
  dialog.querySelector('#copyBahiaUrl').onclick=async()=>{try{await navigator.clipboard.writeText(location.origin+'/');dialog.querySelector('#installBahiaStatus').textContent='Dirección copiada. Ábrela en Chrome o Edge.';}catch{dialog.querySelector('#installBahiaUrl').select();dialog.querySelector('#installBahiaStatus').textContent='Copia la dirección seleccionada y ábrela en Chrome o Edge.';}};
  dialog.showModal();
 }
 async function install(){
  if(!promptEvent){showHelp();return;}
  const event=promptEvent;promptEvent=null;
  try{await event.prompt();const choice=await event.userChoice;if(choice.outcome==='accepted'){if(dialog.open)dialog.close();toast('Solicitud de instalación aceptada. El navegador completará la instalación.');}else if(dialog.open){dialog.querySelector('#installBahiaStatus').textContent='Instalación cancelada. Puedes seguir trabajando desde el navegador.';}}catch{if(!dialog.open)showHelp();dialog.querySelector('#installBahiaStatus').textContent='No se pudo abrir la instalación. Usa el menú de Chrome o Edge.';}
  const direct=dialog.querySelector('#promptInstallBahia');if(direct)direct.hidden=true;
 }
 button.onclick=()=>promptEvent?install():showHelp();
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;const direct=dialog.querySelector('#promptInstallBahia');if(direct)direct.hidden=false;update();});
 window.addEventListener('appinstalled',()=>{promptEvent=null;button.hidden=true;if(dialog.open)dialog.close();toast('Bahia Investment instalada. Puedes abrirla desde tus aplicaciones.');});
 window.matchMedia('(display-mode: standalone)').addEventListener('change',update);update();
 const offline=document.createElement('div');offline.className='install-offline';offline.setAttribute('role','status');offline.textContent='Sin conexión a internet. Espera a recuperar la conexión y verifica el guardado antes de cerrar la app.';document.querySelector('.app header').after(offline);
 const connectivity=()=>{offline.hidden=navigator.onLine;};window.addEventListener('online',connectivity);window.addEventListener('offline',connectivity);connectivity();
})();
