const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connected');

  // Upload the file via SFTP
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }

    console.log('Uploading dist.tar.gz...');
    sftp.fastPut('dist.tar.gz', '/home/ubuntu/dist.tar.gz', {}, (err) => {
      if (err) {
        console.error('Upload error:', err);
        conn.end();
        return;
      }
      console.log('Upload complete');

      // Extract and deploy
      conn.exec('tar -xzf dist.tar.gz && sudo docker cp dist japan-sales-backend:/app/ && rm -rf dist dist.tar.gz', (err, stream) => {
        let output = '';
        stream.on('data', (data) => { output += data; });
        stream.on('close', () => {
          console.log('Deploy result:', output || 'ok');

          // Restart backend
          conn.exec('sudo docker restart japan-sales-backend', (err, stream2) => {
            let output2 = '';
            stream2.on('data', (data) => { output2 += data; });
            stream2.on('close', () => {
              console.log('Restart result:', output2);

              // Wait and check logs
              setTimeout(() => {
                conn.exec('sudo docker logs japan-sales-backend --tail 10 2>&1', (err, stream3) => {
                  let output3 = '';
                  stream3.on('data', (data) => { output3 += data; });
                  stream3.on('close', () => {
                    console.log('Backend logs:');
                    console.log(output3);
                    conn.end();
                  });
                });
              }, 10000);
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