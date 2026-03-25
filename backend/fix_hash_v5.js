const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Generating hash in backend container...');
  
  conn.exec('sudo docker exec japan-sales-backend node -e "const bcrypt = require(\'bcrypt\'); bcrypt.hash(\'admin123\', 10).then(h => require(\'fs\').writeFileSync(\'/tmp/h_final.txt\', h));"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Gen result:', output.trim());
      
      // Copy file to host
      conn.exec('sudo docker cp japan-sales-backend:/tmp/h_final.txt /tmp/h_final.txt', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Copy result:', output2.trim());
          
          // Read file content and update database using a different approach
          // Use psql with a heredoc to avoid escaping issues
          conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales << EOF\nUPDATE staff SET "passwordHash" = E\'\$2b\$10\$QnCwXFJzIeYKpvlKHJSH2.I9peNvqcTUd/sbZFeyGh/YMVTXdJvi.\' WHERE username = \'admin\';\nEOF', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('PSQL result:', output3.trim());
              
              // Verify
              conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT id, username, char_length(\\"passwordHash\\") as hash_len FROM staff;"', (err, stream4) => {
                let output4 = '';
                stream4.on('data', (data) => { output4 += data; });
                stream4.on('close', () => {
                  console.log('=== VERIFY ===');
                  console.log(output4);
                  conn.end();
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
