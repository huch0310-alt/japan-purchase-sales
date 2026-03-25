const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Try login first
  console.log('Testing login...');
  
  conn.exec('curl -s -X POST http://43.153.155.76/api/auth/staff/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\'', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Login result:', output);
      
      // Check logs
      conn.exec('sudo docker logs japan-sales-backend --tail 30 2>&1', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('=== BACKEND LOGS ===');
          console.log(output2);
          conn.end();
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
