const fs = require('fs');

let content = fs.readFileSync('/app/dist/orders/orders.service.js', 'utf8');

// Fix customerId to customer
content = content.replace(/customerId: customer/g, "customer: customer");
content = content.replace(/customerId: data.customerId/g, "customer: customer");

// Fix orderId to order
content = content.replace(/orderId: savedOrder.id/g, "order: savedOrder");
content = content.replace(/orderId: savedOrder/g, "order: savedOrder");

// Fix productId to product
content = content.replace(/productId: itemData.product.id/g, "product: itemData.product");
content = content.replace(/productId: itemData.product/g, "product: itemData.product");

fs.writeFileSync('/app/dist/orders/orders.service.js', content);
console.log('Fixed orders.service.js');
