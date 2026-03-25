const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Creating and running password update script...');
  
  // Create script content
  const script = `const bcrypt = require('bcrypt');
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
  console.log('Generated hash length:', hash.length);
  const result = await client.query('UPDATE staff SET "passwordHash" = $1 WHERE username = $2 RETURNING id', [hash, 'admin']);
  console.log('Rows updated:', result.rowCount);
  await client.end();
  
  // Verify
  const client2 = new Client({
    host: process.env.DB_HOST || '172.19.0.2',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'japan2024',
    database: process.env.DB_DATABASE || 'japan_purchase_sales'
  });
  await client2.connect();
  const res = await client2.query('SELECT id, username, char_length("passwordHash") as hl FROM staff');
  console.log('Staff:', JSON.stringify(res.rows));
  await client2.end();
}

updatePassword().catch(e => { console.error('Error:', e.message); process.exit(1); });
`;
  
  // Write to a temporary file using a different method
  // Use base64 encoding to avoid escaping issues
  const b64 = Buffer.from(script).toString('base64');
  
  conn.exec(`echo "${b64}" | base64 -d > /tmp/up.js && sudo docker cp /tmp/up.js japan-sales-backend:/app/update_pw.js`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Write result:', output.trim());
      
      // Run the script
      conn.exec('sudo docker exec japan-sales-backend node /app/update_pw.js', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('=== SCRIPT OUTPUT ===');
          console.log(output2);
          
          // Verify
          conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT id, username, char_length(\\"passwordHash\\") as hl FROM staff;"', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('=== VERIFY ===');
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
