const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connected');

  // Check docker containers
  conn.exec('sudo docker ps -a', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Docker containers:');
      console.log(output);

      // Check docker images
      conn.exec('sudo docker images', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Docker images:');
          console.log(output2);

          // Check if there's a docker-compose file
          conn.exec('ls -la /home/ubuntu/', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('Ubuntu home:');
              console.log(output3);
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
