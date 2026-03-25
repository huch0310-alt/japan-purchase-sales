const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Create test script
  const script = `
const bcrypt = require('bcrypt');

// Test password
const password = 'admin123';

// Hash from database
const hash = '$2b$10$cXFPHaQy/XM2HFqC1trzR.m6j04COh.iEn6lttBT0GP77gNCJ.DUG';

console.log('Testing bcrypt.compare...');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('Hash length:', hash.length);

bcrypt.compare(password, hash).then(result => {
  console.log('Compare result:', result);
}).catch(err => {
  console.error('Error:', err.message);
});
`;
  
  const b64 = Buffer.from(script).toString('base64');
  
  conn.exec(`echo "${b64}" | base64 -d > /tmp/test_bcrypt.js && sudo docker cp /tmp/test_bcrypt.js japan-sales-backend:/app/test_bcrypt.js`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      // Run test
      conn.exec('sudo docker exec japan-sales-backend node /app/test_bcrypt.js', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('=== BCRYPT TEST ===');
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
