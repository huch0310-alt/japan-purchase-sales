const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connected');

  // Extract the tar.gz
  conn.exec('cd /home/ubuntu && tar -xzf dist.tar.gz', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Extracted');

      // Copy dist to container
      conn.exec('sudo docker cp dist japan-sales-backend:/app/', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Copy result:', output2 || 'ok');

          // Restart container
          conn.exec('sudo docker restart japan-sales-backend', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('Restart result:', output3);

              // Wait and check logs
              setTimeout(() => {
                conn.exec('sudo docker logs japan-sales-backend --tail 15 2>&1', (err, stream4) => {
                  let output4 = '';
                  stream4.on('data', (data) => { output4 += data; });
                  stream4.on('close', () => {
                    console.log('Backend logs:');
                    console.log(output4);
                    conn.end();
                  });
                });
              }, 5000);
            });
          });
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: '43.153.155.76',
  port: 22,
  username: 'ubuntu',
  password: 'hucheng151002+',
  readyTimeout: 20000
});
