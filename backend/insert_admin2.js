const { Client } = require('ssh2');

// Hash from the backend container
const hash = '$2b$10$dfNWkMBViUaaVPRX3ByCMevbI9dXOOjvJbZx98qRq/DHByMexDNZy';

const conn = new Client();

conn.on('ready', () => {
  console.log('Inserting admin user...');
  
  // Insert admin with proper enum cast
  const sql = `INSERT INTO staff (id, username, "passwordHash", name, phone, role, "isActive", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'admin',
      '${hash}',
      '系统管理员',
      '13800138000',
      'super_admin',
      true,
      NOW(),
      NOW()
    );`;
  
  conn.exec(`sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "${sql.replace(/"/g, '\\"')}"`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Insert result:', output.trim());
      
      // Verify
      conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT id, username, name, role, \"isActive\" FROM staff;"', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('=== STAFF ===');
          console.log(output2);
          conn.end();
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
