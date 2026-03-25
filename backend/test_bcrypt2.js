const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Write hash to a temp file in the container
  conn.exec('sudo docker exec japan-sales-backend sh -c "echo \'$2b$10$dfNWkMBViUaaVPRX3ByCMevbI9dXOOjvJbZx98qRq/DHByMexDNZy\' > /tmp/hash.txt"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Write result:', output);
      
      // Now test bcrypt
      conn.exec('sudo docker exec japan-sales-backend node -e "const bcrypt = require(\'bcrypt\'); const fs = require(\'fs\'); const h = fs.readFileSync(\'/tmp/hash.txt\', \'utf8\').trim(); console.log(\'Hash:\', h); bcrypt.compare(\'admin123\', h).then(r => console.log(\'Match:\', r));"', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('=== BCRYPT TEST ===');
          console.log(output2);
          conn.end();
        });
      });
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
