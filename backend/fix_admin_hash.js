const { Client } = require('ssh2');

// The correct hash
const hash = '$2b$10$dfNWkMBViUaaVPRX3ByCMevbI9dXOOjvJbZx98qRq/DHByMexDNZy';

const conn = new Client();

conn.on('ready', () => {
  console.log('Updating admin hash...');
  
  // Write the hash to a temp file in the container
  conn.exec(`sudo docker exec japan-sales-postgres sh -c "echo '${hash}' > /tmp/hash.txt"`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Write hash:', output.trim());
      
      // Now read the hash and update the database
      conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "UPDATE staff SET \\"passwordHash\\" = \'\'\''$(cat /tmp/hash.txt)\'\'\'\' WHERE username = \'admin\';"', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Update result:', output2.trim());
          
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
