#!/usr/bin/env bash
set -e
pm2 start usg-data-server || pm2 restart usg-data-server
echo "USG DATA SERVER started."
