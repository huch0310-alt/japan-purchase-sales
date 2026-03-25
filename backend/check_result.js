const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Run the script and capture stderr
  conn.exec('sudo docker exec japan-sales-backend node /tmp/update_pw.js 2>&1', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('=== SCRIPT OUTPUT ===');
      console.log(output);
      
      // Check staff table
      conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT id, username, char_length(\\"passwordHash\\") as hash_len FROM staff;"', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('=== VERIFY ===');
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
