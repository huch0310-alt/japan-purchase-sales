const fs = require('fs');

let content = fs.readFileSync('/app/dist/orders/entities/order.entity.js', 'utf8');
console.log('Before:', content.match(/name: 'customer_\w+'/g));

content = content.replace(/name: 'customer_id'/g, "name: 'customerId'");
content = content.replace(/name: 'invoice_id'/g, "name: 'invoiceId'");

console.log('After:', content.match(/name: 'customer\w+'/g));

fs.writeFileSync('/app/dist/orders/entities/order.entity.js', content);
console.log('Fixed entity file');
