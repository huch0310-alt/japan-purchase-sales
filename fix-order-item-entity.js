const fs = require('fs');

let content = fs.readFileSync('/app/dist/orders/entities/order-item.entity.js', 'utf8');
console.log('Before:', content.match(/name: '\w+_id'/g));

content = content.replace(/name: 'order_id'/g, "name: 'orderId'");
content = content.replace(/name: 'product_id'/g, "name: 'productId'");

console.log('After:', content.match(/name: '\w+Id'/g));

fs.writeFileSync('/app/dist/orders/entities/order-item.entity.js', content);
console.log('Fixed order-item entity file');
