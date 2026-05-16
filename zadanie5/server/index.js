const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

const products = [
  { id: 1, name: 'keyboard', price: 320 },
  { id: 2, name: 'mouse', price: 150 },
  { id: 3, name: 'monitor', price: 1290 },
  { id: 4, name: 'pendrive', price: 240 }
];
const payments = [];

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        return resolve({});
      }
      try { 
        resolve(JSON.parse(raw)); 
      } catch (e) {
        reject(e); 
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  let pathname = url.parse(req.url).pathname;
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.join(CLIENT_DIST, pathname);
  if (!filePath.startsWith(CLIENT_DIST)) { 
    res.writeHead(403); 
    return res.end('Forbidden'); 
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(CLIENT_DIST, 'index.html'), (e2, d2) => {
        if (e2) {
          res.writeHead(404); 
          return res.end('Not found'); 
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url);
  if (req.method === 'GET' && pathname === '/api/products') return sendJson(res, 200, products);
  if (req.method === 'GET' && pathname === '/api/payments') return sendJson(res, 200, payments);
  if (req.method === 'POST' && pathname === '/api/payments') {
    try {
      const body = await readBody(req);
      const product = products.find(p => p.id === Number(body.productId));
      if (!product) {
        return sendJson(res, 400, { error: 'Product unknown' });
      }
      const payment = {
       id: payments.length + 1, 
       productId: product.id, 
       productName: product.name, 
       amount: product.price, 
       createdAt: new Date().toISOString() 
      };
      payments.push(payment);
      return sendJson(res, 201, payment);
    } catch (e) { 
      return sendJson(res, 400, { error: 'Invalid JSON' }); 
    }
  }
  if (pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'Not found' });
  serveStatic(req, res);
});

server.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
