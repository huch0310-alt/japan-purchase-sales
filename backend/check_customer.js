const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Checking customer table...');

  conn.exec(`sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'customers' ORDER BY ordinal_position"`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Customer columns:');
      console.log(output);
      conn.end();
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: '43.153.155.76',
  port: 22,
  username: 'ubuntu',
  password: 'hucheng151002+',
  readyTimeout: 20000
});