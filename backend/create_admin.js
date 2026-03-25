const { Client } = require('ssh2');

const conn = new Client();

// bcrypt hash for 'admin123'
const passwordHash = '$2b$10$ceI.gtDDC1nasJv8o6t.peYzZpwsztJFJaBasXt4qB5sjcmIg7en.';

conn.on('ready', () => {
  console.log('Creating admin user...');
  
  // Insert admin user
  const adminSQL = `INSERT INTO staff (id, username, "passwordHash", name, phone, role, "isActive", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'admin',
      '${passwordHash}',
      '系统管理员',
      '13800138000',
      'super_admin'::staff_role_enum,
      true,
      NOW(),
      NOW()
    ) ON CONFLICT (username) DO UPDATE SET "isActive" = true, role = 'super_admin'::staff_role_enum;`;
  
  conn.exec(`sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "${adminSQL.replace(/"/g, '\\"')}"`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Admin insert result:', output.trim());
      
      // Verify
      conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT id, username, name, role, \"isActive\" FROM staff;"', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('=== STAFF TABLE ===');
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
