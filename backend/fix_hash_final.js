const { Client } = require('ssh2');

// The base64 encoded hash
const b64Hash = 'JDJiJDEwJFFuQ3dYRkp6SWVZS3B2bEtISlNIMi5JOXBlTnZxY1RVZC9zYlpGZXlHaC9ZTVZUWGRKdmkuCg==';

const conn = new Client();

conn.on('ready', () => {
  console.log('Decoding hash...');
  
  // Decode base64 on server and update database
  const cmd = `echo "${b64Hash}" | base64 -d > /tmp/hash.txt && cat /tmp/hash.txt && echo "---" && sudo docker exec -i japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "UPDATE staff SET \\"passwordHash\\" = '''' || \$(cat /tmp/hash.txt) || '''' WHERE username = 'admin';"`;
  
  conn.exec(cmd, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Result:', output);
      
      // Verify
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
