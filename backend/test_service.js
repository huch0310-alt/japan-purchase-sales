const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  // Create test script that simulates what auth service does
  const script = `
const bcrypt = require('bcrypt');
const { DataSource } = require('typeorm');

async function test() {
  // This is similar to how the app sets up TypeORM
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '172.19.0.2',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'japan2024',
    database: process.env.DB_DATABASE || 'japan_purchase_sales',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: true,
  });
  
  await dataSource.initialize();
  
  const staffRepo = dataSource.getRepository('Staff');
  
  console.log('Finding staff by username...');
  const staff = await staffRepo.findOne({ where: { username: 'admin' } });
  
  console.log('Staff found:', !!staff);
  console.log('Staff object keys:', Object.keys(staff || {}));
  console.log('passwordHash:', staff?.passwordHash);
  console.log('passwordHash type:', typeof staff?.passwordHash);
  
  if (staff?.passwordHash) {
    console.log('Calling bcrypt.compare...');
    const result = await bcrypt.compare('admin123', staff.passwordHash);
    console.log('Compare result:', result);
  } else {
    console.log('ERROR: passwordHash is undefined or missing!');
  }
  
  await dataSource.destroy();
}

test().catch(e => console.error('Error:', e.message, e.stack));
`;
  
  const b64 = Buffer.from(script).toString('base64');
  
  conn.exec(`echo "${b64}" | base64 -d > /tmp/test_service.js && sudo docker cp /tmp/test_service.js japan-sales-backend:/app/test_service.js`, (err, stream) => {
    let output = '';
    stream.on('data', (data) => { output += data; });
    stream.on('close', () => {
      conn.exec('sudo docker exec japan-sales-backend node /app/test_service.js 2>&1', (err, stream2) => {
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
