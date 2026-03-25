const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Try to query the staff table directly via the backend's database
  conn.exec('sudo docker exec japan-sales-backend psql -U postgres -d japan_purchase_sales -c "SELECT id, username, \"passwordHash\" FROM staff WHERE username = '\''admin'\'';"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('=== DIRECT QUERY ===');
      console.log(output);
      
      // Also check if bcrypt.compare works with the hash
      conn.exec('sudo docker exec japan-sales-backend node -e "const bcrypt = require(\'bcrypt\'); const h = \'$2b$10$dfNWkMBViUaaVPRX3ByCMevbI9dXOOjvJbZx98qRq/DHByMexDNZy\'; console.log(\'Hash:\', h); bcrypt.compare(\'admin123\', h).then(r => console.log(\'Match:\', r));"', (err, stream2) => {
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
