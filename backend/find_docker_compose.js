const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Check for docker-compose files
  conn.exec('find /home/ubuntu -name "docker-compose*.yml" -o -name "docker-compose*.yaml" 2>/dev/null', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Docker compose files:', output);

      // Check if there's a Japan purchase sales directory
      conn.exec('ls -la /home/ubuntu/japan-purchase-sales/', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Japan purchase sales dir:', output2);
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
