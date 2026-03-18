#!/usr/bin/env bash
set -e
node scripts/manual-backup.js
pm2 stop usg-data-server
echo "USG DATA SERVER stopped after backup."
