const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Creating hash file...');
  
  // First generate the hash inside the container
  conn.exec('sudo docker exec japan-sales-backend node -e "const bcrypt = require(\'bcrypt\'); bcrypt.hash(\'admin123\', 10).then(h => require(\'fs\').writeFileSync(\'/tmp/admin_hash.txt\', h));"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Hash generation:', output.trim());
      
      // Read the hash file
      conn.exec('sudo docker exec japan-sales-backend cat /tmp/admin_hash.txt', (err, stream2) => {
        let hash = '';
        stream2.on('data', (data) => { hash += data; });
        stream2.on('close', () => {
          console.log('Generated hash:', hash.trim());
          
          // Update the database with the hash
          const sql = `UPDATE staff SET "passwordHash" = '${hash.trim()}' WHERE username = 'admin';`;
          const b64 = Buffer.from(sql).toString('base64');
          
          conn.exec(`echo "${b64}" | base64 -d > /tmp/update_hash.sql`, (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('SQL file written');
              
              // Execute SQL
              conn.exec('sudo docker exec -i japan-sales-postgres psql -U postgres -d japan_purchase_sales -f /tmp/update_hash.sql', (err, stream4) => {
                let output4 = '';
                stream4.on('data', (data) => { output4 += data; });
                stream4.on('close', () => {
                  console.log('SQL result:', output4.trim());
                  
                  // Verify
                  conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT id, username, char_length(\\"passwordHash\\") as hash_len FROM staff;"', (err, stream5) => {
                    let output5 = '';
                    stream5.on('data', (data) => { output5 += data; });
                    stream5.on('close', () => {
                      console.log('=== VERIFY ===');
                      console.log(output5);
                      conn.end();
                    });
                  });
                });
              });
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
