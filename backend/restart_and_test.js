const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Restarting backend...');
  
  conn.exec('sudo docker restart japan-sales-backend', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Restart result:', output.trim());
      
      // Wait for startup
      setTimeout(() => {
        // Test login
        console.log('Testing login...');
        conn.exec('curl -s -X POST http://43.153.155.76/api/auth/staff/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\'', (err, stream2) => {
          let output2 = '';
          stream2.on('data', (data) => { output2 += data; });
          stream2.on('close', () => {
            console.log('Login result:', output2);
            
            // Check logs
            conn.exec('sudo docker logs japan-sales-backend --tail 15 2>&1', (err, stream3) => {
              let output3 = '';
              stream3.on('data', (data) => { output3 += data; });
              stream3.on('close', () => {
                console.log('=== BACKEND LOGS ===');
                console.log(output3);
                conn.end();
              });
            });
          });
        });
      }, 10000);
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
