const dns = require('dns');
const net = require('net');

async function check() {
  console.log('Checking DNS resolution...');
  dns.resolve4('japan-sales-postgres', (err, addresses) => {
    if (err) {
      console.log('DNS error:', err.message);
    } else {
      console.log('Resolved IPs:', addresses);
    }

    // Try to connect to port 5432
    console.log('\nTrying to connect to japan-sales-postgres:5432...');
    const client = new net.Socket();
    client.connect(5432, 'japan-sales-postgres', () => {
      console.log('Connected!');
      client.destroy();
    });
    client.on('error', (e) => {
      console.log('Connection error:', e.message);
    });
  });
}

check();