const { Client } = require('ssh2');

// Base64 encoded hash: $2b$10$dfNWkMBViUaaVPRX3ByCMevbI9dXOOjvJbZx98qRq/DHByMexDNZy
const hashB64 = Buffer.from('$2b$10$dfNWkMBViUaaVPRX3ByCMevbI9dXOOjvJbZx98qRq/DHByMexDNZy').toString('base64');

const conn = new Client();

conn.on('ready', () => {
  console.log('Hash B64:', hashB64);
  
  // Decode and test bcrypt
  conn.exec('sudo docker exec japan-sales-backend node -e "const bcrypt = require(\'bcrypt\'); const h = Buffer.from(\'' + hashB64 + '\', \'base64\').toString(\'utf8\'); console.log(\'Hash:\', h); bcrypt.compare(\'admin123\', h).then(r => console.log(\'Match:\', r));"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('=== BCRYPT TEST ===');
      console.log(output);
      conn.end();
    });
  });
}).on('error', (err) => {
  console.error('Error:', err);
}).connect({
  host: '43.153.155.76',
  port: 22,
  username: 'ubuntu',
  password: 'hucheng151002+',
  readyTimeout: 20000
});
