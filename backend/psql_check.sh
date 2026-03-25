#!/bin/bash
sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cart_items'"