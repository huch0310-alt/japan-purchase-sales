const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Generating hash...');
  
  // Generate hash in backend container
  conn.exec('sudo docker exec japan-sales-backend node -e "const bcrypt = require(\'bcrypt\'); bcrypt.hash(\'admin123\', 10).then(h => { require(\'fs\').writeFileSync(\'/tmp/h.txt\', h); console.log(\'done\'); });"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Gen result:', output.trim());
      
      // Copy hash file to tmp on host
      conn.exec('sudo docker cp japan-sales-backend:/tmp/h.txt /tmp/h_from_container.txt', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Copy:', output2.trim());
          
          // Read hash from file on host
          const fs = require('fs');
          // We can't read directly, so let's use node on the server
          conn.exec('cat /tmp/h_from_container.txt', (err, stream3) => {
            let hash = '';
            stream3.on('data', (data) => { hash += data; });
            stream3.on('close', () => {
              console.log('Hash from host file:', hash.trim());
              console.log('Length:', hash.trim().length);
              
              // Now use psql with proper escaping using COPY FROM STDIN
              // First, let's just check what's in the file
              conn.exec('wc -c /tmp/h_from_container.txt', (err, stream4) => {
                let wc = '';
                stream4.on('data', (data) => { wc += data; });
                stream4.on('close', () => {
                  console.log('File size:', wc.trim());
                  
                  // Try using base64 to transfer the hash
                  conn.exec('base64 /tmp/h_from_container.txt', (err, stream5) => {
                    let b64 = '';
                    stream5.on('data', (data) => { b64 += data; });
                    stream5.on('close', () => {
                      console.log('Base64:', b64.trim());
                      console.log('Base64 length:', b64.trim().length);
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
