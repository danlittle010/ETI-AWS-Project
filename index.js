const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_ROOT = path.join(__dirname);

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getContentType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
}

function send500(res, err) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('500 Internal Server Error\n' + err);
}

const SIGNUP_FILE = path.join(PUBLIC_ROOT, 'Signup.json');

function writeJsonFile(filePath, data, callback) {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', callback);
}

function ensureSignupFile(callback) {
  fs.readFile(SIGNUP_FILE, 'utf8', (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        writeJsonFile(SIGNUP_FILE, [], callback);
        return;
      }
      callback(err);
      return;
    }

    try {
      JSON.parse(content);
      callback(null);
    } catch (parseError) {
      writeJsonFile(SIGNUP_FILE, [], callback);
    }
  });
}

function addSignupEntry(entry, callback) {
  ensureSignupFile((err) => {
    if (err) {
      callback(err);
      return;
    }

    fs.readFile(SIGNUP_FILE, 'utf8', (readErr, fileContent) => {
      if (readErr) {
        callback(readErr);
        return;
      }

      let list = [];
      try {
        list = JSON.parse(fileContent || '[]');
      } catch (parseError) {
        list = [];
      }

      list.push(entry);
      writeJsonFile(SIGNUP_FILE, list, callback);
    });
  });
}

function serveFile(req, res) {
  let requestedUrl = req.url.split('?')[0];
  if (requestedUrl === '/') {
    requestedUrl = '/main.html';
  }

  const safePath = path.normalize(requestedUrl).replace(/^\.+/, '');
  const filePath = path.join(PUBLIC_ROOT, safePath);

  if (!filePath.startsWith(PUBLIC_ROOT)) {
    send404(res);
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      send404(res);
      return;
    }

    if (stats.isDirectory()) {
      send404(res);
      return;
    }

    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        send500(res, err2);
        return;
      }

      const contentType = getContentType(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/api/signup' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });

    req.on('end', () => {
      let payload;
      try {
        payload = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        return;
      }

      if (!payload.fullname || !payload.email || !payload.password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing fields in payload' }));
        return;
      }

      const safeEntry = {
        fullname: String(payload.fullname),
        email: String(payload.email),
        password: String(payload.password),
        createdAt: new Date().toISOString()
      };

      addSignupEntry(safeEntry, (addErr) => {
        if (addErr) {
          send500(res, addErr);
          return;
        }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: safeEntry }));
      });
    });

    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('405 Method Not Allowed');
    return;
  }

  serveFile(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Serving main.html as root path.');
});