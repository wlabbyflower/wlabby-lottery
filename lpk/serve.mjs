import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=process.env.LOTTERY_WEB_ROOT||path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg'};
http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end('{"ok":true}');}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  if(url.pathname==='/'){res.writeHead(302,{Location:'/log-lottery/','Cache-Control':'no-store'});return res.end();}
  const relative=decodeURIComponent(url.pathname.replace(/^\/log-lottery\/?/,''));
  let filename=path.resolve(root,relative||'index.html');
  if(!filename.startsWith(path.resolve(root)+path.sep)){res.writeHead(403);return res.end();}
  if(!fs.existsSync(filename)||!fs.statSync(filename).isFile())filename=path.join(root,'index.html');
  res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':filename.endsWith('index.html')?'no-store':'public,max-age=3600','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(filename).pipe(res);
 }catch{res.writeHead(400);res.end();}
}).listen(Number(process.env.PORT||8080),process.env.HOST||'127.0.0.1');
