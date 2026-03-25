const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Check networks
  conn.exec('sudo docker network ls', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Networks:', output);

      // Inspect postgres container network
      conn.exec('sudo docker inspect japan-sales-postgres --format "{{json .NetworkSettings.Networks}}"', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Postgres networks:', output2);

          // Inspect backend container network
          conn.exec('sudo docker inspect japan-sales-backend --format "{{json .NetworkSettings.Networks}}"', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('Backend networks:', output3);

              // Stop and remove the broken backend
              conn.exec('sudo docker stop japan-sales-backend && sudo docker rm japan-sales-backend', (err, stream4) => {
                let output4 = '';
                stream4.on('data', (data) => { output4 += data; });
                stream4.on('close', () => {
                  console.log('Container removed');

                  // Start new container with proper network and env
                  conn.exec('sudo docker run -d --name japan-sales-backend --network japan-sales-network -p 3001:3001 -e DB_HOST=japan-sales-postgres -e DB_PORT=5432 -e DB_USERNAME=postgres -e DB_PASSWORD=japan2024 -e DB_DATABASE=japan_purchase_sales -e NODE_ENV=production -e TZ=Asia/Tokyo japan-purchase-sales-backend:latest 2>&1', (err, stream5) => {
                    let output5 = '';
                    stream5.on('data', (data) => { output5 += data; });
                    stream5.on('close', () => {
                      console.log('New container start:', output5);

                      // Wait and check logs
                      setTimeout(() => {
                        conn.exec('sudo docker logs japan-sales-backend --tail 15 2>&1', (err, stream6) => {
                          let output6 = '';
                          stream6.on('data', (data) => { output6 += data; });
                          stream6.on('close', () => {
                            console.log('Backend logs:', output6);
                            conn.end();
                          });
                        });
                      }, 5000);
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
