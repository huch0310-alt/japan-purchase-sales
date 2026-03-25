const { Client } = require('ssh2');
const fs = require('fs');

const sqlContent = "UPDATE staff SET \"passwordHash\" = '$2b$10$dfNWkMBViUaaVPRX3ByCMevbI9dXOOjvJbZx98qRq/DHByMexDNZy' WHERE username = 'admin';\n";
const b64 = Buffer.from(sqlContent).toString('base64');

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected');
  
  // Write SQL file to server
  const cmd = `echo "${b64}" | base64 -d > /tmp/fix_hash.sql`;
  conn.exec(cmd, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', (code) => {
      console.log('Write SQL file result:', code);
      
      // Execute SQL
      conn.exec('sudo docker exec -i japan-sales-postgres psql -U postgres -d japan_purchase_sales -f /tmp/fix_hash.sql', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('SQL result:', output2.trim());
          
          // Verify
          conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT id, username, char_length(\\"passwordHash\\") as hash_len FROM staff;"', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('=== VERIFY ===');
              console.log(output3);
              conn.end();
            });
          });
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
