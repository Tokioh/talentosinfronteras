'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = {'/':'index.html','/index.html':'index.html','/app.js':'app.js','/local-tools.js':'local-tools.js','/styles.css':'styles.css','/accessibility.css':'accessibility.css'};
function createServer() {
  return http.createServer((req, res) => {
    const file = files[new URL(req.url, 'http://localhost').pathname];
    if (!file || !['GET', 'HEAD'].includes(req.method)) {res.writeHead(404).end(); return;}
    const type = file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'text/html';
    res.setHeader('Content-Type', type + '; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    fs.readFile(path.join(root, file), (error, data) => {
      if (error) {res.writeHead(500).end('No se pudo leer el recurso.'); return;}
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
}
module.exports = {createServer};
if (require.main === module) {
  const port = Number(process.env.PORT || 8000);
  createServer().listen(port, '127.0.0.1', () => console.log(`TalentoSinBarreras: http://127.0.0.1:${port}`));
}
