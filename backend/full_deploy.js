const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected');

  conn.sftp((err, sftp) => {
    if (err) { console.error('SFTP error:', err); conn.end(); return; }

    console.log('Uploading dist.tar.gz...');
    sftp.fastPut('dist.tar.gz', '/home/ubuntu/dist_new.tar.gz', {}, (err) => {
      if (err) { console.error('Upload error:', err); conn.end(); return; }
      console.log('Upload complete');

      // Stop container
      conn.exec('sudo docker stop japan-sales-backend', (err, stream) => {
        let output = '';
        stream.on('data', (data) => { output += data; });
        stream.on('close', () => {
          console.log('Stopped');

          // Extract to /home/ubuntu/new_dist
          conn.exec('cd /home/ubuntu && rm -rf new_dist && mkdir new_dist && tar -xzf dist_new.tar.gz -C new_dist', (err2, stream2) => {
            let output2 = '';
            stream2.on('data', (data) => { output2 += data; });
            stream2.on('close', () => {
              console.log('Extracted to new_dist');

              // Remove old dist from container
              conn.exec('sudo docker exec japan-sales-backend rm -rf /app/dist', (err3, stream3) => {
                let output3 = '';
                stream3.on('data', (data) => { output3 += data; });
                stream3.on('close', () => {
                  console.log('Removed old dist');

                  // Copy new dist to container
                  conn.exec('sudo docker cp /home/ubuntu/new_dist/. japan-sales-backend:/app/dist/', (err4, stream4) => {
                    let output4 = '';
                    stream4.on('data', (data) => { output4 += data; });
                    stream4.on('close', () => {
                      console.log('Copied new dist');

                      // Verify DEBUG exists
                      conn.exec('sudo docker exec japan-sales-backend grep -c DEBUG /app/dist/auth/auth.service.js', (err5, stream5) => {
                        let output5 = '';
                        stream5.on('data', (data) => { output5 += data; });
                        stream5.on('close', () => {
                          console.log('DEBUG count:', output5);

                          // Start container
                          conn.exec('sudo docker start japan-sales-backend', (err6, stream6) => {
                            let output6 = '';
                            stream6.on('data', (data) => { output6 += data; });
                            stream6.on('close', () => {
                              console.log('Started');
                              setTimeout(() => {
                                conn.exec('sudo docker logs japan-sales-backend --tail 5 2>&1', (err7, stream7) => {
                                  let output7 = '';
                                  stream7.on('data', (data) => { output7 += data; });
                                  stream7.on('close', () => {
                                    console.log('Logs:', output7);
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
