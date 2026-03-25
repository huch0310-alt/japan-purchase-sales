const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected');

  // Check what's in /app/auth
  conn.exec('sudo docker exec japan-sales-backend ls -la /app/auth/', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('/app/auth contents:', output);

      // Check if auth.service.js exists
      conn.exec('sudo docker exec japan-sales-backend cat /app/auth/auth.service.js | head -30', (err2, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('auth.service.js content:', output2.substring(0, 500));
          conn.end();
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
