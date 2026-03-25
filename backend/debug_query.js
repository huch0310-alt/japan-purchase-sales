const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Enabling TypeORM logging and testing...');
  
  // Stop backend
  conn.exec('sudo docker stop japan-sales-backend', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Stop:', output.trim());
      
      // Remove container
      conn.exec('sudo docker rm japan-sales-backend', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Remove:', output2.trim());
          
          // Get postgres IP
          conn.exec('sudo docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" japan-sales-postgres', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              const pgIP = output3.trim();
              console.log('Postgres IP:', pgIP);
              
              // Run with logging enabled
              const cmd = `sudo docker run -d \
                --name japan-sales-backend \
                --restart always \
                -e NODE_ENV=production \
                -e DB_HOST=${pgIP} \
                -e DB_PORT=5432 \
                -e DB_USERNAME=postgres \
                -e DB_PASSWORD=japan2024 \
                -e DB_DATABASE=japan_purchase_sales \
                -e DB_SYNCHRONIZE=false \
                -e DB_LOGGING=true \
                -e JWT_SECRET=japan-super-secret-jwt-key-2024 \
                -e JWT_EXPIRES_IN=7d \
                -e PORT=3001 \
                --network ba6ddcfacefcf44cd25c596ea97f0309e30bfaeefaf63564be62cd214d861af5 \
                -p 3001:3001 \
                japan-purchase-sales-backend:latest`;
              
              conn.exec(cmd, (err, stream4) => {
                let output4 = '';
                stream4.on('data', (data) => { output4 += data; });
                stream4.on('close', (code) => {
                  console.log('Run exit code:', code);
                  
                  // Wait for startup
                  setTimeout(() => {
                    // Test login
                    conn.exec('curl -s -X POST http://43.153.155.76/api/auth/staff/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\'', (err, stream5) => {
                      let output5 = '';
                      stream5.on('data', (data) => { output5 += data; });
                      stream5.on('close', () => {
                        console.log('Login result:', output5);
                        
                        // Check logs
                        conn.exec('sudo docker logs japan-sales-backend --tail 50 2>&1', (err, stream6) => {
                          let output6 = '';
                          stream6.on('data', (data) => { output6 += data; });
                          stream6.on('close', () => {
                            console.log('=== BACKEND LOGS ===');
                            console.log(output6);
                            conn.end();
                          });
                        });
                      });
                    });
                  }, 10000);
                });
              });
            });
          });
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('Error:', err);
}).connect({
  host: '43.153.155.76',
  port: 22,
  username: 'ubuntu',
  password: 'hucheng151002+',
  readyTimeout: 20000
});
