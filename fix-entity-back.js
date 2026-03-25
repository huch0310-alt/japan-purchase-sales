const fs = require('fs');

// Fix order entity
let content = fs.readFileSync('/app/dist/orders/entities/order.entity.js', 'utf8');
content = content.replace(/name: 'customerId'/g, "name: 'customer_id'");
content = content.replace(/name: 'invoiceId'/g, "name: 'invoice_id'");
fs.writeFileSync('/app/dist/orders/entities/order.entity.js', content);
console.log('Fixed order entity');

// Fix order-item entity
content = fs.readFileSync('/app/dist/orders/entities/order-item.entity.js', 'utf8');
content = content.replace(/name: 'orderId'/g, "name: 'order_id'");
content = content.replace(/name: 'productId'/g, "name: 'product_id'");
fs.writeFileSync('/app/dist/orders/entities/order-item.entity.js', content);
console.log('Fixed order-item entity');

// Fix orders service
content = fs.readFileSync('/app/dist/orders/orders.service.js', 'utf8');
content = content.replace(/customer: customer/g, "customerId: customer");
content = content.replace(/order: savedOrder/g, "orderId: savedOrder");
content = content.replace(/product: itemData.product/g, "productId: itemData.product");
fs.writeFileSync('/app/dist/orders/orders.service.js', content);
console.log('Fixed orders service');
