const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  // Check MD5 sums of both auth service files
  conn.exec('sudo docker exec japan-sales-backend md5sum /app/dist/auth/auth.service.js /app/auth/auth.service.js 2>&1', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('MD5 sums:', output);

      // Check app.module.js line that imports auth
      conn.exec('sudo docker exec japan-sales-backend grep -n "require" /app/dist/app.module.js | head -10', (err2, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('app.module requires:', output2);
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
