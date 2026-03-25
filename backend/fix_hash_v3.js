const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Generating hash in container...');
  
  // Generate hash and save to file in postgres container (not backend)
  conn.exec('sudo docker exec japan-sales-backend node -e "const bcrypt = require(\'bcrypt\'); bcrypt.hash(\'admin123\', 10).then(h => { require(\'fs\').writeFileSync(\'/tmp/admin_hash.txt\', h); console.log(h); });"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      const hash = output.trim();
      console.log('Generated hash:', hash);
      console.log('Hash length:', hash.length);
      
      // Now copy the file to postgres container
      conn.exec('sudo docker cp japan-sales-backend:/tmp/admin_hash.txt /tmp/admin_hash.txt', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Copy result:', output2.trim());
          
          // Use psql with the hash directly from file
          conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "\copy (SELECT \'\' || read_file(\'/tmp/admin_hash.txt\') || \'\' AS hash) TO \'/tmp/hash_out.txt\'"', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('Copy out result:', output3.trim());
              
              // Read the hash from the file
              conn.exec('sudo docker exec japan-sales-postgres cat /tmp/hash_out.txt', (err, stream4) => {
                let hashOut = '';
                stream4.on('data', (data) => { hashOut += data; });
                stream4.on('close', () => {
                  console.log('Hash from file:', hashOut.trim());
                  console.log('Hash length:', hashOut.trim().length);
                  
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
