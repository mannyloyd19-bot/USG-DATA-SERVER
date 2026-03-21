#!/bin/bash

echo "⬇️ Pulling latest changes..."
git pull

echo "📦 Installing updates..."
npm install

echo "🔄 Restarting server..."
pm2 restart usg-data-server

echo "✅ Update complete!"
