const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connected');

  conn.sftp((err, sftp) => {
    if (err) { console.error('SFTP error:', err); conn.end(); return; }

    console.log('Uploading dist.tar.gz...');
    sftp.fastPut('dist.tar.gz', '/home/ubuntu/dist.tar.gz', {}, (err) => {
      if (err) { console.error('Upload error:', err); conn.end(); return; }
      console.log('Upload complete');
      conn.end();
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
