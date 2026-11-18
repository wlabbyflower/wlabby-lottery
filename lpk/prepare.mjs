import fs from 'node:fs';
fs.mkdirSync('lpk/content',{recursive:true});
fs.cpSync('dist','lpk/content/dist',{recursive:true,force:true});
fs.copyFileSync('lpk/serve.mjs','lpk/content/serve.mjs');
fs.copyFileSync('LICENSE','lpk/content/LICENSE');

fs.copyFileSync('lpk/start.sh','lpk/content/start.sh');
fs.chmodSync('lpk/content/start.sh',0o755);
