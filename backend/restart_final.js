const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Restarting backend...');
  
  conn.exec('sudo docker restart japan-sales-backend', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Restart:', output.trim());
      
      setTimeout(() => {
        console.log('Testing login...');
        conn.exec('curl -s -X POST http://43.153.155.76/api/auth/staff/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\'', (err, stream2) => {
          let output2 = '';
          stream2.on('data', (data) => { output2 += data; });
          stream2.on('close', () => {
            console.log('Login result:', output2);
            conn.end();
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
