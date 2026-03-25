const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Create a test script on the backend
  const script = `
const typeorm = require('typeorm');
const { DataSource } = typeorm;

async function test() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '172.19.0.2',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'japan2024',
    database: process.env.DB_DATABASE || 'japan_purchase_sales',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
  });
  
  await dataSource.initialize();
  
  const staffRepo = dataSource.getRepository('Staff');
  const staff = await staffRepo.findOne({ where: { username: 'admin' } });
  
  console.log('Staff object:', JSON.stringify(staff, null, 2));
  console.log('Keys:', Object.keys(staff || {}));
  
  await dataSource.destroy();
}

test().catch(e => console.error('Error:', e.message));
`;
  
  const b64 = Buffer.from(script).toString('base64');
  
  conn.exec(`echo "${b64}" | base64 -d > /tmp/test_orm.js && sudo docker cp /tmp/test_orm.js japan-sales-backend:/app/test_orm.js`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      console.log('Copy result:', output.trim());
      
      // Run the test
      conn.exec('sudo docker exec japan-sales-backend node /app/test_orm.js', (err, stream2) => {
        let output2 = '';
        stream2.on('data', (data) => { output2 += data; });
        stream2.on('close', () => {
          console.log('=== TEST OUTPUT ===');
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
