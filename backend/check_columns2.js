const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Check actual column names with quotes
  conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT attname FROM pg_attribute WHERE attrelid = (SELECT oid FROM pg_class WHERE relname = \'staff\') AND attnum > 0 ORDER BY attnum;"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('=== ACTUAL COLUMN NAMES ===');
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
