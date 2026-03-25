#!/bin/bash
echo "Altering cart_items columns..."

sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "
  ALTER TABLE \"cart_items\" ALTER COLUMN \"customerId\" TYPE uuid USING \"customerId\"::uuid;
  ALTER TABLE \"cart_items\" ALTER COLUMN \"productId\" TYPE uuid USING \"productId\"::uuid;
"

echo "Verifying..."
sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "\d \"cart_items\""