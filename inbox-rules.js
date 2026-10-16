(function(root){'use strict';
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
function search(c,q){return !norm(q)||norm([c.name,c.phone,c.email,c.project,c.owner,c.summary,c.notes].join(' ')).includes(norm(q));}
function evidence(c){const result=[];for(const [field,label] of [['summary','Resumen del CRM'],['notes','Notas de la asesora']]){const body=String(c[field]||'').trim();if(body.length>2)result.push({id:field,body,label});}for(const [i,h] of (c.history||[]).entries()){const body=String(h.text||'').trim();if(body.length>2&&!/^\d+$/.test(body))result.push({id:'history-'+i,body,label:'Seguimiento del CRM · '+(h.date||'Sin fecha')});}return result;}
const api={search,evidence,label:k=>({received_manual:'Mensaje del cliente · registro manual',note:'Nota interna',draft:'Borrador · no enviado'})[k]||'Registro'};if(typeof module!=='undefined')module.exports=api;else root.InboxRules=api;
})(typeof window!=='undefined'?window:globalThis);
