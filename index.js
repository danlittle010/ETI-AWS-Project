const http = require('http');
const fs = require('fs');
const path = require('path');
const { searchFlights } = require('./test_3');

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
const SQL_FILE = path.join(PUBLIC_ROOT, 'expedia_setup.sql');

function writeJsonFile(filePath, data, callback) {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', callback);
}

function appendToSqlFile(entry, callback) {
  const date = new Date(entry.createdAt);
  const formattedDate = date.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
  const insertStmt = `\nINSERT INTO users (fullname, email, password, createdAt) VALUES ('${entry.fullname.replace(/'/g, "''")}', '${entry.email.replace(/'/g, "''")}', '${entry.password.replace(/'/g, "''")}', '${formattedDate}');\n`;
  
  fs.appendFile(SQL_FILE, insertStmt, 'utf8', (err) => {
    if (err) {
      console.error('Failed to append to SQL file:', err);
    } else {
      console.log('Successfully appended user to SQL file');
    }
    callback(err);
  });
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
      writeJsonFile(SIGNUP_FILE, list, (writeErr) => {
        if (writeErr) {
          callback(writeErr);
          return;
        }
        // Also append to SQL file
        appendToSqlFile(entry, callback);
      });
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

  // AJAX endpoint: Get all signup users
  if (url === '/api/users' && req.method === 'GET') {
    fs.readFile(SIGNUP_FILE, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }
      try {
        const users = JSON.parse(content || '[]');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
      } catch (parseErr) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
      }
    });
    return;
  }

  // AJAX endpoint: Search flights via backend
  if (url === '/api/search-flights' && req.method === 'POST') {
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

      const requiredFields = ['departure', 'arrival', 'departureDate', 'returnDate'];
      const missingField = requiredFields.find((field) => !payload[field]);
      if (missingField) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Missing field: ${missingField}` }));
        return;
      }

      searchFlights(payload)
        .then((json) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: json }));
        })
        .catch((err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message || 'Flight search failed' }));
        });
    });
    return;
  }

  // AJAX endpoint: Get travel deals
  if (url === '/api/travel-deals' && req.method === 'GET') {
    const travelDeals = [
      { id: 1, destination: 'Paris, France', price: 650.00, airline: 'Air France' },
      { id: 2, destination: 'Tokyo, Japan', price: 890.00, airline: 'JAL' },
      { id: 3, destination: 'London, UK', price: 550.00, airline: 'British Airways' }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(travelDeals));
    return;
  }

  // AJAX endpoint: Get all updates at once
  if (url === '/api/updates' && req.method === 'GET') {
    const travelDeals = [
      { id: 1, destination: 'Paris, France', price: 650.00, airline: 'Air France' },
      { id: 2, destination: 'Tokyo, Japan', price: 890.00, airline: 'JAL' },
      { id: 3, destination: 'London, UK', price: 550.00, airline: 'British Airways' }
    ];
    
    fs.readFile(SIGNUP_FILE, 'utf8', (err, content) => {
      let users = [];
      try {
        users = JSON.parse(content || '[]');
      } catch (parseErr) {
        users = [];
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        users: users,
        travelDeals: travelDeals,
        timestamp: new Date().toISOString()
      }));
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