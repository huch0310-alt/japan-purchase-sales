const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Check raw data
  conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT * FROM staff LIMIT 1;"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('=== RAW STAFF ===');
      console.log(output || 'NO OUTPUT');
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
