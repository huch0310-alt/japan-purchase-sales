const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connected');

  // Restart backend
  conn.exec('sudo docker restart japan-sales-backend', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Restart output:', output);

      // Wait for startup and check logs
      setTimeout(() => {
        conn.exec('sudo docker logs japan-sales-backend --tail 15 2>&1', (err, stream2) => {
          let output2 = '';
          stream2.on('data', (data) => { output2 += data; });
          stream2.on('close', () => {
            console.log('Backend logs:');
            console.log(output2);
            conn.end();
          });
        });
      }, 10000);
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