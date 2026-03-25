const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Check staff table columns
  conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT column_name FROM information_schema.columns WHERE table_name = \'staff\' ORDER BY ordinal_position;"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('=== STAFF COLUMNS ===');
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
