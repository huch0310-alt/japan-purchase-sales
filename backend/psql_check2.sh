#!/bin/bash
echo "=== Table structure ==="
sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "\d cart_items"

echo ""
echo "=== NOT NULL constraints ==="
sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'cart_items'"