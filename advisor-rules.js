(function(root){
const key=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
function options(leads){const map=new Map();for(const c of leads){const name=String(c.owner||'').trim().replace(/\s+/g,' ');if(name&&!map.has(key(name)))map.set(key(name),name);}return [...map].map(([id,name])=>({id,name})).sort((a,b)=>a.name.localeCompare(b.name,'es'));}
const matches=(owner,selected)=>!selected||(selected==='__unassigned__'?!key(owner):key(owner)===selected);
root.Advisor={key,options,matches};
})(typeof window!=='undefined'?window:globalThis);
