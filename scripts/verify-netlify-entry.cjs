const fs=require('fs'),assert=require('node:assert/strict');
const config=fs.readFileSync('netlify.toml','utf8'),html=fs.readFileSync('netlify-entry/index.html','utf8');
assert.match(config,/publish\s*=\s*"netlify-entry"/);assert.match(config,/from\s*=\s*"\/\*"/);assert.match(config,/status\s*=\s*302/);assert.match(config,/force\s*=\s*true/);
assert.match(config,/to\s*=\s*"https:\/\/lotes-gestion-comercial-marru\.litodamm\.chatgpt\.site\/:splat"/);
assert.match(html,/https:\/\/lotes-gestion-comercial-marru\.litodamm\.chatgpt\.site\//);assert.ok(!html.includes('0285'));assert.ok(!html.includes('crmInitialState'));
assert.deepEqual(fs.readdirSync('netlify-entry'),['index.html']);console.log('Verified: Netlify entry redirects to the private canonical CRM; no customer data, credentials or static CRM copy published.');
