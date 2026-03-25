const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Test bcrypt comparison with the stored hash
  const cmd = 'sudo docker exec japan-sales-backend node -e "const bcrypt = require(\'bcrypt\'); const h = \'$2b$10$dfNWkMBViUaaVPRX3ByCMevbI9dXOOjvJbZx98qRq/DHByMexDNZy\'; console.log(\'Hash:\', h); bcrypt.compare(\'admin123\', h).then(r => console.log(\'Match:\', r));"';
  conn.exec(cmd, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('=== BCRYPT TEST ===');
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
