const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');

const PORT = process.env.PORT || 8000;
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

const products = [
  { id: 1, name: 'keyboard', price: 320 },
  { id: 2, name: 'mouse', price: 150 },
  { id: 3, name: 'monitor', price: 1290 },
  { id: 4, name: 'pendrive', price: 240 }
];
const payments = [];
const users = [];

// additive state: in-memory sessions for the login form / CSRF demo
const sessions = {};

function readFormOrJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      const ct = req.headers['content-type'] || '';
      if (ct.includes('application/x-www-form-urlencoded') || ct.includes('text/plain')) {
        const out = {};
        for (const [k, v] of new URLSearchParams(raw)) out[k] = v;
        return resolve(out);
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

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) out[name] = decodeURIComponent(value);
  }
  return out;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistration(body) {
  const errors = {};
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username) 
    errors.username = 'username is required';
  if (!email) 
    errors.email = 'email is required';
  else if (!EMAIL_RE.test(email)) 
    errors.email = 'invalid email format';
  if (!password) 
    errors.password = 'password is required';

  return { errors, username, email };
}

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

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
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
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
    } catch { 
      return sendJson(res, 400, { error: 'Invalid JSON' }); 
    }
  }

  if (req.method === 'POST' && pathname === '/api/register') {
    try {
      const body = await readBody(req);
      const { errors, username, email } = validateRegistration(body);
      
      if (Object.keys(errors).length > 0) {
        return sendJson(res, 400, { errors });
      }
      const user = { 
        id: users.length + 1, 
        username, email 
      };
      users.push(user);

      return sendJson(res, 201, { id: user.id, username: user.username, email: user.email });
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON' });
    }
  }

  if (req.method === 'POST' && pathname === '/api/login') {
    try {
      const body = await readBody(req);
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const errors = {};
      if (!email) errors.email = 'email is required';
      else if (!EMAIL_RE.test(email)) errors.email = 'invalid email format';
      if (!password) errors.password = 'password is required';
      if (Object.keys(errors).length > 0) return sendJson(res, 400, { errors });

      const sid = 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessions[sid] = email;

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': `sid=${sid}; Path=/`
      });
      return res.end(JSON.stringify({ email }));
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON' });
    }
  }
  // GET /api/account: returns the email of the currently logged-in session
  if (req.method === 'GET' && pathname === '/api/account') {
    const sid = parseCookies(req).sid;
    const email = sid && sessions[sid];
    if (!email) return sendJson(res, 401, { error: 'not logged in' });
    return sendJson(res, 200, { email });
  }

  // POST /api/account/settings: changes the account email
  if (req.method === 'POST' && pathname === '/api/account/settings') {
    const sid = parseCookies(req).sid;
    const current = sid && sessions[sid];
    if (!current) return sendJson(res, 401, { error: 'not logged in' });
    try {
      const body = await readFormOrJsonBody(req);
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      if (!email || !EMAIL_RE.test(email)) {
        return sendJson(res, 400, { errors: { email: 'invalid email format' } });
      }
      sessions[sid] = email;
      return sendJson(res, 200, { email });
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON' });
    }
  }

  if (pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'Not found' });
  serveStatic(req, res);
});

server.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
