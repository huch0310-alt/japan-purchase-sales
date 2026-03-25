#!/bin/bash
sudo docker exec japan-sales-postgres psql -U postgres -d japan_purchase_sales -c "\d orders"