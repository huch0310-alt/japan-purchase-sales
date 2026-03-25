const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
  console.log('Running debug script...');

  const debugScript = `
const { Client } = require('pg');

async function debug() {
  const client = new Client({
    host: 'japan-sales-postgres',
    user: 'postgres',
    database: 'japan_purchase_sales',
    password: 'japan2024'
  });
  await client.connect();

  // Check customer columns
  const columnsResult = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = $1', ['customers']);
  console.log('Customer columns:', columnsResult.rows.map(r => r.column_name));

  // Check customer with passwordHash
  const customerResult = await client.query('SELECT id, username, "passwordHash", "vipDiscount" FROM customers WHERE username = $1', ['customer1']);
  console.log('Customer with passwordHash:', JSON.stringify(customerResult.rows, null, 2));

  // Check if passwordHash is null or has a value
  if (customerResult.rows.length > 0) {
    console.log('passwordHash value:', customerResult.rows[0].passwordHash);
    console.log('passwordHash type:', typeof customerResult.rows[0].passwordHash);
  }

  await client.end();
}
debug().catch(e => { console.error('Error:', e); process.exit(1); });
`;

  fs.writeFileSync('C:/tmp/debug_order.js', debugScript);

  conn.sftp((err, sftp) => {
    if (err) { console.error('SFTP error:', err); conn.end(); return; }

    sftp.fastPut('C:/tmp/debug_order.js', '/home/ubuntu/debug_order.js', {}, (err) => {
      if (err) { console.error('Upload error:', err); conn.end(); return; }

      conn.exec('sudo docker cp /home/ubuntu/debug_order.js japan-sales-backend:/tmp/debug_order.js', (err, stream) => {
        let output = '';
        stream.on('data', (data) => { output += data; });
        stream.on('close', () => {
          conn.exec('sudo docker exec -e NODE_PATH=/app/node_modules japan-sales-backend node /tmp/debug_order.js 2>&1', (err, stream2) => {
            let output2 = '';
            stream2.on('data', (data) => { output2 += data; });
            stream2.on('close', () => {
              console.log('Debug result:');
              console.log(output2);
              conn.end();
            });
          });
        });
      });
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
