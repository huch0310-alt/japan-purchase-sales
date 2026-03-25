const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Running Node.js on backend to update password...');
  
  // Create a Node.js script on the backend container to update the password
  const script = `
const { Client } = require('ssh2');
const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function updatePassword() {
  const client = new Client({
    host: process.env.DB_HOST || '172.19.0.2',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'japan2024',
    database: process.env.DB_DATABASE || 'japan_purchase_sales'
  });
  
  await client.connect();
  
  const hash = await bcrypt.hash('admin123', 10);
  console.log('Generated hash:', hash);
  
  const result = await client.query('UPDATE staff SET "passwordHash" = $1 WHERE username = $2 RETURNING id', [hash, 'admin']);
  console.log('Update result:', result.rowCount);
  
  await client.end();
  
  // Now verify
  const client2 = new Client({
    host: process.env.DB_HOST || '172.19.0.2',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'japan2024',
    database: process.env.DB_DATABASE || 'japan_purchase_sales'
  });
  
  await client2.connect();
  const res = await client2.query('SELECT id, username, char_length("passwordHash") as hash_len FROM staff');
  console.log('Staff:', res.rows);
  await client2.end();
}

updatePassword().catch(console.error);
`;
  
  // Write script to file
  const fs = require('fs');
  fs.writeFileSync('/tmp/update_pw.js', script);
  
  // Copy script to backend container
  conn.exec('sudo docker cp /tmp/update_pw.js japan-sales-backend:/tmp/update_pw.js', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Copy result:', output.trim());
      
      // Install pg client in backend container if not present
      conn.exec('sudo docker exec japan-sales-backend npm list pg 2>&1 || sudo docker exec japan-sales-backend npm install pg --save', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('PG install:', output2.trim());
          
          // Run the script
          conn.exec('sudo docker exec japan-sales-backend node /tmp/update_pw.js', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('=== SCRIPT OUTPUT ===');
              console.log(output3);
              conn.end();
            });
          });
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
