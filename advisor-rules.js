(function(root){
const aliases={'maria camila gomez':'maria camila','maria jose mercado':'maria jose'};
const normalized=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
const key=v=>aliases[normalized(v)]||normalized(v);
function options(leads){const map=new Map();for(const c of leads){const name=String(c.owner||'').trim().replace(/\s+/g,' ');if(name&&!map.has(key(name)))map.set(key(name),({'maria camila':'Maria Camila Gómez','maria jose':'Maria José Mercado'}[key(name)]||name));}const known=new Set(['maria camila','maria jose']);const result=[...map].filter(([id])=>known.has(id)).map(([id,name])=>({id,name})).sort((a,b)=>a.name.localeCompare(b.name,'es'));if([...map.keys()].some(id=>!known.has(id)))result.push({id:'__review__',name:'Responsable por revisar'});return result;}
const matches=(owner,selected)=>!selected||(selected==='__unassigned__'?!key(owner):selected==='__review__'?!!key(owner)&&!['maria camila','maria jose'].includes(key(owner)):key(owner)===selected);
const display=value=>({'maria camila':'Maria Camila Gómez','maria jose':'Maria José Mercado'}[key(value)]||String(value||'').trim()||'Sin asignar');
root.Advisor={key,options,matches,display};
})(typeof window!=='undefined'?window:globalThis);
