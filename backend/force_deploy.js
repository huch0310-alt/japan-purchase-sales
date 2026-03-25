const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connected');

  // Extract tar.gz (creates files directly in /home/ubuntu/)
  conn.exec('cd /home/ubuntu && tar -xzf dist.tar.gz && ls -la | head -10', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Extracted:', output);

      // Check users/entities
      conn.exec('cat /home/ubuntu/users/entities/customer.entity.js | grep -A2 passwordHash', (err, stream1) => {
        let out1 = '';
        stream1.on('data', (d) => { out1 += d; });
        stream1.on('close', () => {
          console.log('Local customer entity:', out1);

          // Stop container
          conn.exec('sudo docker stop japan-sales-backend', (err, stream2) => {
            let output2 = '';
            stream2.on('data', (data) => { output2 += data; });
            stream2.on('close', () => {
              console.log('Stopped');

              // Remove old files in container /app
              conn.exec('sudo docker exec japan-sales-backend rm -rf /app/*', (err, stream3) => {
                let output3 = '';
                stream3.on('data', (data) => { output3 += data; });
                stream3.on('close', () => {
                  console.log('Removed old files');

                  // Copy all files from /home/ubuntu to container /app
                  conn.exec('sudo docker cp /home/ubuntu/. japan-sales-backend:/app/', (err, stream4) => {
                    let output4 = '';
                    stream4.on('data', (data) => { output4 += data; });
                    stream4.on('close', () => {
                      console.log('Copy result:', output4 || 'ok');

                      // Verify
                      conn.exec('sudo docker exec japan-sales-backend cat /app/users/entities/customer.entity.js | grep -A2 passwordHash', (err, stream5) => {
                        let output5 = '';
                        stream5.on('data', (data) => { output5 += data; });
                        stream5.on('close', () => {
                          console.log('Container customer entity:', output5);

                          // Start container
                          conn.exec('sudo docker start japan-sales-backend', (err, stream6) => {
                            let output6 = '';
                            stream6.on('data', (data) => { output6 += data; });
                            stream6.on('close', () => {
                              console.log('Start result:', output6);
                              setTimeout(() => {
                                conn.exec('sudo docker logs japan-sales-backend --tail 10 2>&1', (err, stream7) => {
                                  let output7 = '';
                                  stream7.on('data', (data) => { output7 += data; });
                                  stream7.on('close', () => {
                                    console.log('Backend logs:', output7);
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
                });
              });
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
