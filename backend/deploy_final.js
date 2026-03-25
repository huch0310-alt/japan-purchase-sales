const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected');

  conn.sftp((err, sftp) => {
    if (err) { console.error('SFTP error:', err); conn.end(); return; }

    console.log('Uploading dist.tar.gz...');
    sftp.fastPut('dist.tar.gz', '/home/ubuntu/dist_final.tar.gz', {}, (err) => {
      if (err) { console.error('Upload error:', err); conn.end(); return; }
      console.log('Upload complete');

      // Extract
      conn.exec('cd /home/ubuntu && tar -xzf dist_final.tar.gz -C new_dist 2>/dev/null || (rm -rf new_dist && mkdir new_dist && tar -xzf dist_final.tar.gz -C new_dist)', (err2, stream2) => {
        stream2.on('data', () => {});
        stream2.on('close', () => {
          console.log('Extracted');

          // Copy to container
          conn.exec('sudo docker cp /home/ubuntu/new_dist/. japan-sales-backend:/app/dist/', (err3, stream3) => {
            stream3.on('data', () => {});
            stream3.on('close', () => {
              console.log('Copied');

              // Restart
              conn.exec('sudo docker restart japan-sales-backend', (err4, stream4) => {
                stream4.on('data', () => {});
                stream4.on('close', () => {
                  console.log('Restarted');
                  setTimeout(() => {
                    conn.exec('sudo docker logs japan-sales-backend --tail 3 2>&1', (err5, stream5) => {
                      let output = '';
                      stream5.on('data', (data) => { output += data; });
                      stream5.on('close', () => {
                        console.log('Logs:', output);
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
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: '43.153.155.76',
  port: 22,
  username: 'ubuntu',
  password: 'hucheng151002+',
  readyTimeout: 20000
});
