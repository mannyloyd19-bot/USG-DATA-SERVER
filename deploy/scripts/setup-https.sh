#!/bin/bash
set -e

DOMAIN="${1:-usgdataserver.duckdns.org}"
EMAIL="${2:-admin@example.com}"

echo "Installing nginx + certbot..."
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "Writing nginx config..."
sudo cp deploy/nginx/usg-data-server.conf /etc/nginx/sites-available/usg-data-server.conf
sudo sed -i "s/usgdataserver.duckdns.org/${DOMAIN}/g" /etc/nginx/sites-available/usg-data-server.conf

sudo ln -sf /etc/nginx/sites-available/usg-data-server.conf /etc/nginx/sites-enabled/usg-data-server.conf
sudo nginx -t
sudo systemctl reload nginx

echo "Requesting Let's Encrypt certificate..."
sudo certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" --redirect

echo "HTTPS setup complete for ${DOMAIN}"
