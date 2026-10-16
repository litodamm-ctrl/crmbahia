export default {async fetch(request,env){
 try{
  const p=new URL(request.url).pathname;
  if(p==='/crm-session.js'){
   if(request.method!=='GET')return new Response('Method not allowed',{status:405});
   const dataResponse=await api(new Request(new URL('/api/state',request.url),{headers:request.headers}),env);
   if(!dataResponse.ok)return dataResponse;
   const data=await dataResponse.json();
   const safe=JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
   return new Response('window.__crmSessionBootstrap='+safe+';',{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'}});
  }
  const endpoint=new URL(request.url).searchParams.get('crmEndpoint');
  if(p==='/'&&endpoint!==null){
   if(!/^\/api\/(state|refresh|conversations|audit|agent|health)(\?[^#]*)?$/.test(endpoint))return new Response(JSON.stringify({error:'Ruta de conexión inválida.'}),{status:400,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store'}});
   return await api(new Request(new URL(endpoint,request.url),request),env);
  }
  if(p.startsWith('/api/'))return await api(request,env);
  let content=assets[p==='/'?'/index.html':p];
  if(content===undefined)return new Response('Not found',{status:404});
  if(p==='/'||p==='/index.html'){
   // Dispatch authenticates this private document request before it reaches the worker.
   // Read the same private database at runtime; never bake customer data into assets.
   const stateResponse=await api(new Request(new URL('/api/state',request.url),{headers:request.headers}),env);
   if(stateResponse.ok){
    const data=await stateResponse.json();
    const safe=JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
    content=content.replace('</head>','<script type="application/json" id="crmInitialState">'+safe+'</script></head>');
   }
  }
  return new Response(content,{headers:{'Content-Type':p.endsWith('.css')?'text/css':p.endsWith('.js')?'text/javascript':'text/html','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'}});
 }catch(error){console.error('CRM request failed',error.message);return new Response(JSON.stringify({error:'No se pudo completar la operación.'}),{status:500,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store'}});}
}};
