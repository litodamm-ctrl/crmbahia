const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store'}});
export async function api(request,env){
 const url=new URL(request.url),user=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
 if(!env.DB)return json({error:'La base de datos aún no está disponible.'},503);
 if(url.pathname==='/api/health')return json({storage:'D1',ready:true});
 const row=await env.DB.prepare('SELECT revision, payload FROM crm_workspace WHERE id = ?').bind('main').first();
 if(request.method==='GET'&&url.pathname==='/api/state')return json({revision:row?.revision||0,state:row?JSON.parse(row.payload):null,identity:user?{id:user,email}:null});
 if(request.method==='GET'&&url.pathname==='/api/audit'){const result=await env.DB.prepare('SELECT actor, created_at, summary FROM crm_audit ORDER BY created_at DESC LIMIT 100').all();return json({entries:result.results});}
 if(request.method!=='POST'||!['/api/state','/api/sync'].includes(url.pathname))return json({error:'Ruta no disponible.'},404);
 // Validate a server-side secret in addition to the private Sites dispatch boundary.
 // The shared updater uses the existing Site-scoped service credential, never the advisor PIN.
 const serviceSync=url.pathname==='/api/sync'&&!user&&!request.headers.get('origin')&&!!env.CRM_SYNC_KEY&&request.headers.get('x-crm-service-key')===env.CRM_SYNC_KEY;
 if(!user&&!serviceSync)return json({error:'Inicia sesión con ChatGPT para guardar cambios.'},401);
 if(!serviceSync&&request.headers.get('origin')!==url.origin)return json({error:'Origen no autorizado.'},403);
 const raw=await request.text();if(raw.length>2500000)return json({error:'El CRM supera el límite de esta versión.'},413);
 let body;try{body=JSON.parse(raw);}catch{return json({error:'Datos inválidos.'},400);}
 if(!body.requestId||typeof body.requestId!=='string'||body.requestId.length>80||!Number.isInteger(body.revision)||body.revision<0)return json({error:'Falta la versión del CRM.'},400);
 const existing=await env.DB.prepare('SELECT revision FROM crm_audit WHERE request_id = ?').bind(body.requestId).first();if(existing)return json({revision:existing.revision,duplicate:true});
 const data=body.state;
 if(!data||!Array.isArray(data.leads)||data.leads.length>2000||!Array.isArray(data.sources)||data.sources.length>100||!['demo','importado'].includes(data.mode)||data.leads.some(c=>!c||typeof c.uid!=='string'||typeof c.name!=='string'||typeof c.project!=='string'||c.uid.length>300||c.name.length>150))return json({error:'Estructura de CRM inválida.'},400);
 if(new Set(data.leads.map(c=>c.uid)).size!==data.leads.length)return json({error:'Hay identificadores repetidos.'},400);
 if((row?.revision||0)!==body.revision)return json({error:'Otro usuario actualizó el CRM. Recarga los datos antes de guardar.',conflict:true},409);
 const version=body.revision+1,payload=JSON.stringify(data),summary=String(body.summary||'Actualización de CRM').slice(0,300),time=new Date().toISOString();
 const write=env.DB.prepare('INSERT INTO crm_workspace (id,revision,payload,updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,payload=excluded.payload,updated_at=excluded.updated_at WHERE crm_workspace.revision = ?').bind('main',version,payload,time,body.revision);
 // D1 batch is transactional. The INSERT audit executes only if this revision is still current.
 const audit=env.DB.prepare('INSERT INTO crm_audit (request_id,revision,actor,created_at,summary) SELECT ?, ?, ?, ?, ? WHERE changes() = 1 AND EXISTS (SELECT 1 FROM crm_workspace WHERE id = ? AND revision = ? AND updated_at = ?)').bind(body.requestId,version,email||user||'Actualización diaria autorizada',time,summary,'main',version,time);
 const result=await env.DB.batch([write,audit]);
 if(!result[0].meta.changes||!result[1].meta.changes)return json({error:'El CRM cambió mientras guardabas. Recarga y revisa tus cambios.',conflict:true},409);
 return json({revision:version});
}
