const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Check the Dockerfile to understand how to start the container
  conn.exec('cat /home/ubuntu/japan-purchase-sales/Dockerfile', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Dockerfile:', output);

      // Check .env file
      conn.exec('cat /home/ubuntu/japan-purchase-sales/.env', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('.env:', output2);

          // Check if we can run the container
          conn.exec('sudo docker run -d --name japan-sales-backend -p 3001:3001 --network japan-sales-network -e NODE_ENV=production japan-purchase-sales-backend:latest 2>&1', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('Docker run result:', output3);
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
