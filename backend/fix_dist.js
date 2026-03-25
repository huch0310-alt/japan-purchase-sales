const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected');

  // Stop container
  conn.exec('sudo docker stop japan-sales-backend', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Stopped');

      // Copy new files to /app/dist/auth/ specifically
      conn.exec('sudo docker cp /home/ubuntu/auth/auth.service.js japan-sales-backend:/app/dist/auth/auth.service.js && sudo docker cp /home/ubuntu/auth/auth.controller.js japan-sales-backend:/app/dist/auth/auth.controller.js && sudo docker cp /home/ubuntu/auth/auth.module.js japan-sales-backend:/app/dist/auth/auth.module.js', (err2, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Copied to dist/auth');

          // Also copy users entities to dist/users
          conn.exec('sudo docker cp /home/ubuntu/users/entities japan-sales-backend:/app/dist/users/', (err3, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('Copied users/entities');

              // Verify the auth.service.js has DEBUG
              conn.exec('sudo docker exec japan-sales-backend grep -c DEBUG /app/dist/auth/auth.service.js', (err4, stream4) => {
                let output4 = '';
                stream4.on('data', (data) => { output4 += data; });
                stream4.on('close', () => {
                  console.log('DEBUG count in dist/auth:', output4);

                  // Start container
                  conn.exec('sudo docker start japan-sales-backend', (err5, stream5) => {
                    let output5 = '';
                    stream5.on('data', (data) => { output5 += data; });
                    stream5.on('close', () => {
                      console.log('Started');
                      conn.end();
                    });
                  });
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
