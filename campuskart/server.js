const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = http.createServer((req, res) => {
  let filePath = decodeURIComponent(req.url.split('?')[0]);

  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }

  const fullPath = path.join(ROOT, filePath);

  fs.stat(fullPath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(fullPath, (readErr, data) => {
        if (readErr) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
      return;
    }

    const isAsset = /\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/.test(filePath);

    if (isAsset) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    fs.readFile(path.join(ROOT, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`CampusKart frontend server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
