const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Check the compiled staff entity
  conn.exec('sudo docker exec japan-sales-backend cat /app/dist/users/entities/staff.entity.js 2>&1 | head -30', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('=== COMPILED ENTITY ===');
      console.log(output);
      conn.end();
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
