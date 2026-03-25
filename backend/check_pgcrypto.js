const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Check if pgcrypto extension is available
  conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT * FROM pg_extension WHERE extname = \'pgcrypto\';"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('=== PGCRYPTO ===');
      console.log(output);
      
      // Try to create extension if not exists
      conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Create extension result:', output2.trim());
          
          // Now try to generate hash using PostgreSQL's crypt function
          // Note: PostgreSQL's crypt uses a different algorithm than bcrypt
          // But we can try using gen_salt to generate a salt and then crypt
          conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT crypt(\'admin123\', gen_salt(\'bf\'));"', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('Crypt result:', output3.trim());
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
