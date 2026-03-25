const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Check what columns TypeORM actually expects
  // Let's add a password_hash column and copy the data
  console.log('Adding password_hash column...');
  
  conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "ALTER TABLE staff ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Add column result:', output.trim());
      
      // Copy data
      conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "UPDATE staff SET password_hash = passwordHash;"', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Copy data result:', output2.trim());
          
          // Now verify both columns
          conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT id, username, char_length(passwordHash) as camel, char_length(password_hash) as snake FROM staff;"', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('=== BOTH COLUMNS ===');
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
