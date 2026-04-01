const { Client } = require('ssh2');

// Backup the admin hash
const adminHash = '$2b$10$dfNWkMBViUaaVPRX3ByCMevbI9dXOOjvJbZx98qRq/DHByMexDNZy';

const conn = new Client();

conn.on('ready', () => {
  console.log('Dropping all tables and recreating...');
  
  // Drop all tables
  conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "DROP TABLE IF EXISTS operation_logs, messages, invoices, orders, order_items, products, categories, cart_items, customer_members, member_levels, inventory_logs, inventory_alerts, returns, points_logs CASCADE;"', (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Drop result:', output.trim());
      
      // Keep staff table but remove data
      conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "DELETE FROM staff;"', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('Delete staff result:', output2.trim());
          
          // Restart backend to let it recreate tables
          console.log('Restarting backend...');
          conn.exec('sudo docker restart japan-sales-backend', (err, stream3) => {
            let output3 = '';
            stream3.on('data', (data) => { output3 += data; });
            stream3.on('close', () => {
              console.log('Restart:', output3.trim());
              
              // Wait for tables to be created
              setTimeout(() => {
                // Check tables
                conn.exec('sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name;"', (err, stream4) => {
                  let output4 = '';
                  stream4.on('data', (data) => { output4 += data; });
                  stream4.on('close', () => {
                    console.log('=== TABLES ===');
                    console.log(output4);
                    conn.end();
                  });
                });
              }, 10000);
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
