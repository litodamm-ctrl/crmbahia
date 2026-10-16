const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store'}});
export async function api(request,env){
 const url=new URL(request.url),user=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
 if(!env.DB)return json({error:'La base de datos aún no está disponible.'},503);
 if(url.pathname==='/api/health')return json({storage:'D1',ready:true});
 const row=await env.DB.prepare('SELECT revision, payload FROM crm_workspace WHERE id = ?').bind('main').first();
 if(url.pathname==='/api/conversations'){
  const workspace=row?JSON.parse(row.payload):{leads:[]};
  if(request.method==='GET'){
   const uid=url.searchParams.get('lead');
   if(!uid){const result=await env.DB.prepare('SELECT lead_uid, MAX(created_at) AS last_at, COUNT(*) AS entries FROM crm_conversation_entries GROUP BY lead_uid').all();return json({threads:result.results});}
   if(!workspace.leads.some(c=>c.uid===uid))return json({error:'Cliente no encontrado.'},404);
   const result=await env.DB.prepare('SELECT id,lead_uid,channel,kind,body,actor,created_at FROM crm_conversation_entries WHERE lead_uid = ? ORDER BY created_at DESC, id DESC LIMIT 100').bind(uid).all();
   return json({entries:result.results.reverse(),limit:100});
  }
  if(request.method!=='POST')return json({error:'Método no disponible.'},405);
  if(!user)return json({error:'Inicia sesión para registrar una conversación.'},401);
  if(request.headers.get('origin')!==url.origin)return json({error:'Origen no autorizado.'},403);
  const text=await request.text();if(text.length>30000)return json({error:'El registro es demasiado largo.'},413);
  let entry;try{entry=JSON.parse(text);}catch{return json({error:'Datos inválidos.'},400);}
  if(!entry||typeof entry.id!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(entry.id)||typeof entry.leadUid!=='string'||!['whatsapp','instagram','other'].includes(entry.channel)||!['received_manual','note','draft'].includes(entry.kind)||typeof entry.body!=='string'||!entry.body.trim()||entry.body.length>6000)return json({error:'Completa cliente, canal y texto; máximo 6000 caracteres.'},400);
  const lead=workspace.leads.find(c=>c.uid===entry.leadUid);if(!lead||lead.duplicateOf)return json({error:'Selecciona una oportunidad activa en el CRM.'},400);
  const previous=await env.DB.prepare('SELECT * FROM crm_conversation_entries WHERE id = ?').bind(entry.id).first();
  if(previous){if(previous.lead_uid!==entry.leadUid||previous.body!==entry.body.trim()||previous.channel!==entry.channel||previous.kind!==entry.kind)return json({error:'Identificador utilizado por otro registro.'},409);return json({entry:previous,duplicate:true});}
  const createdAt=new Date().toISOString(),actor=email||user;
  await env.DB.prepare('INSERT INTO crm_conversation_entries (id,lead_uid,channel,kind,body,actor,created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(entry.id,entry.leadUid,entry.channel,entry.kind,entry.body.trim(),actor,createdAt).run();
  return json({entry:{id:entry.id,lead_uid:entry.leadUid,channel:entry.channel,kind:entry.kind,body:entry.body.trim(),actor,created_at:createdAt}},201);
 }
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
