const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected');

  // Check container state
  conn.exec('sudo docker ps -a | grep backend', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Container:', output);

      // Check /app/auth exists?
      conn.exec('sudo docker exec japan-sales-backend test -d /app/auth && echo "auth exists" || echo "auth missing"', (err2, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Auth dir check:', output2);

          // List auth contents
          conn.exec('sudo docker exec japan-sales-backend sh -c "ls -la /app/auth/ 2>&1"', (err3, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('Auth contents:', output3);

              // Check if container is running
              conn.exec('sudo docker exec japan-sales-backend ps aux | grep node', (err4, stream4) => {
                let output4 = '';
                stream4.on('data', (data) => { output4 += data; });
                stream4.on('close', () => {
                  console.log('Node processes:', output4);
                  conn.end();
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
