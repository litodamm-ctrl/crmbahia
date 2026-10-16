const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
const assets={};for(const name of ['index.html','styles.css','core.js','app.js','access.js','professional.js','funnel-rules.js','funnel.js','sales-rules.js','sales.js','advisor-rules.js','advisor.js','comment-status-rules.js','comment-status.js','channel-rules.js','channels.js','project-registry.js','inbox-rules.js','inbox.js','transport.js','advisor-identity.js','refresh-crm.js','agent-rules.js','virtual-agent.js','connection-recovery.js','meta-connect.js','multichat.js'])assets['/'+name]=fs.readFileSync(path.join(root,name),'utf8');
const api=fs.readFileSync(path.join(root,'worker/api.mjs'),'utf8').replace('export async function api','async function api');
const runtime=fs.readFileSync(path.join(root,'worker/runtime.mjs'),'utf8');
const agent=fs.readFileSync(path.join(root,'worker/agent.mjs'),'utf8');
const rules=fs.readFileSync(path.join(root,'agent-rules.js'),'utf8');
const server=rules+'\n'+agent+'\n'+api+'\nconst assets='+JSON.stringify(assets)+';\n'+runtime;
fs.mkdirSync(path.join(root,'dist/server'),{recursive:true});fs.writeFileSync(path.join(root,'dist/server/index.js'),server);fs.mkdirSync(path.join(root,'dist/.openai'),{recursive:true});fs.copyFileSync(path.join(root,'.openai/hosting.json'),path.join(root,'dist/.openai/hosting.json'));
console.log('Worker built with embedded assets and authenticated CRM API.');
