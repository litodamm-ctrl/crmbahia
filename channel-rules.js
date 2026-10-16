(function(root){
'use strict';
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
function kind(c){const s=norm(c.channel!==undefined?c.channel:c.raw?.Canal);if(/whatsapp|whats app|wpp|wa business/.test(s))return 'whatsapp';if(/instagram|^ig$|instagram_direct/.test(s))return 'instagram';return s?'other':'unknown';}
function phone(value){const s=String(value||'').trim();if(!/^[+\d\s().-]+$/.test(s))return '';const p=s.replace(/\D/g,'');return p.length>=8&&p.length<=15?p:'';}
function handle(value){const s=String(value||'').trim().replace(/^@/,'');return /^[a-zA-Z0-9._]{1,30}$/.test(s)?s:'';}
function whatsapp(value,text=''){const p=phone(value);return p?'https://wa.me/'+p+(text?'?text='+encodeURIComponent(text):''):'';}
function instagram(value){const h=handle(value);return h?'https://www.instagram.com/'+encodeURIComponent(h)+'/':'';}
const api={kind,phone,handle,whatsapp,instagram,label:k=>({whatsapp:'WhatsApp',instagram:'Instagram',other:'Otro canal',unknown:'Sin canal'})[k]||'Sin canal'};
if(typeof module!=='undefined')module.exports=api;else root.Channels=api;
})(typeof window!=='undefined'?window:globalThis);
