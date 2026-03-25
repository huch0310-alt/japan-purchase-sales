#!/bin/bash
echo "=== cart_items table ==="
sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "\d cart_items"

echo ""
echo "=== customers table ==="
sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "\d customers"