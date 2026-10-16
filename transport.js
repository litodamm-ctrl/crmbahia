(function(root){'use strict';let initialConsumed=false;
function validState(data){return !!data&&Number.isInteger(data.revision)&&data.revision>=0&&(data.state===null||!!data.state&&Array.isArray(data.state.leads)&&Array.isArray(data.state.sources));}
function takeInitial(document){if(initialConsumed)return null;initialConsumed=true;const element=document.getElementById('crmInitialState');if(!element)return null;try{const data=JSON.parse(element.textContent);if(!validState(data))return null;return data;}catch{return null;}finally{element.remove();}}
async function loadInitial(document){const embedded=takeInitial(document);if(embedded)return embedded;return new Promise(resolve=>{const script=document.createElement('script');let timer;const finish=()=>{clearTimeout(timer);script.remove();const value=root.__crmSessionBootstrap;delete root.__crmSessionBootstrap;resolve(validState(value)?value:null);};script.src='/crm-session.js?load='+Date.now();script.async=true;script.onload=finish;script.onerror=finish;timer=setTimeout(finish,15000);document.head.append(script);});}
async function request(path,options={},fetcher=fetch){const read=!options.method||options.method==='GET';let response;try{response=await fetcher('/?crmEndpoint='+encodeURIComponent(path),{...options,credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});}catch{throw Object.assign(Error('No se pudo conectar con el CRM. Revisa la conexión e inténtalo de nuevo.'),{code:'NETWORK'});}
 const contentType=response.headers.get('content-type')||'';
 if(response.status===401||response.status===403||(response.redirected&&/signin|signout|login|callback/i.test(response.url)))throw Object.assign(Error('Es necesario verificar de nuevo el acceso privado con ChatGPT.'),{code:'ACCESS_REQUIRED',status:response.status});
 if(!contentType.includes('application/json'))throw Object.assign(Error('La conexión devolvió una página en lugar de los datos del CRM. Recarga la página o verifica el acceso con ChatGPT.'),{code:'NON_JSON',status:response.status});
 let data;try{data=await response.json();}catch{throw Object.assign(Error('La respuesta del CRM llegó incompleta. Vuelve a cargar los clientes.'),{code:'INVALID_JSON',status:response.status});}
 if(!response.ok)throw Object.assign(Error(data.error||'No se pudo completar la operación.'),{conflict:data.conflict,status:response.status});
 if(read&&path==='/api/state'&&!validState(data))throw Object.assign(Error('El servidor no devolvió una base de clientes válida. No se reemplazaron tus datos.'),{code:'INVALID_STATE'});return data;
}
root.CRMTransport={validState,takeInitial,loadInitial,request};
})(typeof window!=='undefined'?window:globalThis);
