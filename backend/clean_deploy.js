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

      // Remove old dist from container
      conn.exec('sudo docker exec japan-sales-backend rm -rf /app/dist', (err2, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Removed old dist');

          // Copy only auth and users (the critical ones with fixes)
          conn.exec('sudo docker cp /home/ubuntu/auth japan-sales-backend:/app/auth && sudo docker cp /home/ubuntu/users japan-sales-backend:/app/users', (err3, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('Copied auth and users');

              // Verify MD5 in container
              conn.exec('sudo docker exec japan-sales-backend md5sum /app/auth/auth.service.js', (err4, stream4) => {
                let output4 = '';
                stream4.on('data', (data) => { output4 += data; });
                stream4.on('close', () => {
                  console.log('Container auth MD5:', output4);

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
