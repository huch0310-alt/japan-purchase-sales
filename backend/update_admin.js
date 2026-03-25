const { Client } = require('ssh2');

const newHash = '$2b$10$dfNWkMBViUaaVPRX3ByCMevbI9dXOOjvJbZx98qRq/DHByMexDNZy';

const conn = new Client();

conn.on('ready', () => {
  console.log('Updating admin password hash...');
  
  const sql = `UPDATE staff SET "passwordHash" = '${newHash}' WHERE username = 'admin';`;
  
  conn.exec(`sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "${sql.replace(/"/g, '\\"')}"`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Update result:', output);
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
