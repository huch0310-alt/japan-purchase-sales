const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected');

  // Check MD5 of local file we're uploading
  const fs = require('fs');
  const crypto = require('crypto');
  const localFile = fs.readFileSync('dist/auth/auth.service.js');
  const localHash = crypto.createHash('md5').update(localFile).digest('hex');
  console.log('Local MD5:', localHash);

  conn.sftp((err, sftp) => {
    if (err) { console.error('SFTP error:', err); conn.end(); return; }

    console.log('Uploading dist.tar.gz...');
    sftp.fastPut('dist.tar.gz', '/home/ubuntu/dist_new.tar.gz', {}, (err) => {
      if (err) { console.error('Upload error:', err); conn.end(); return; }
      console.log('Upload complete');

      // Check MD5 on server
      conn.exec('md5sum /home/ubuntu/dist_new.tar.gz', (err, stream) => {
        let output = '';
        stream.on('data', (data) => { output += data; });
        stream.on('close', () => {
          console.log('Server tar MD5:', output);

          // Extract and check
          conn.exec('cd /home/ubuntu && tar -xzf dist_new.tar.gz && md5sum auth/auth.service.js', (err, stream2) => {
            let output2 = '';
            stream2.on('data', (data) => { output2 += data; });
            stream2.on('close', () => {
              console.log('Extracted auth MD5:', output2);
              conn.end();
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
