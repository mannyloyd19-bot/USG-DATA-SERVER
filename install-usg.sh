#!/bin/bash

echo "🚀 Starting USG DATA SERVER Production Setup..."

# Step 1: folders
echo "📁 Creating storage folders..."
mkdir -p storage/uploads storage/backups

# Step 2: install deps
echo "📦 Installing dependencies..."
npm install

# Step 3: install pm2
echo "⚙️ Installing PM2..."
npm install -g pm2

# Step 4: kill old process if exists
echo "🧹 Cleaning old PM2 process..."
pm2 delete usg-data-server || true

# Step 5: start server
echo "🚀 Starting USG server..."
pm2 start src/server.js --name usg-data-server

# Step 6: save pm2
echo "💾 Saving PM2 process..."
pm2 save

# Step 7: enable startup
echo "🔁 Enabling auto-start..."
STARTUP_CMD=$(pm2 startup | grep sudo)

if [ ! -z "$STARTUP_CMD" ]; then
  echo "👉 Running startup command..."
  eval $STARTUP_CMD
  pm2 save
else
  echo "⚠️ Could not auto-run startup command. Run manually:"
  pm2 startup
fi

# Step 8: final status
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "✅ USG DATA SERVER DEPLOYED!"
echo ""
echo "🌐 Local: http://localhost:3000"
echo "🌐 Public: http://usgdataserver.duckdns.org"
echo ""
echo "📌 Next steps:"
echo "- Check SSL Center"
echo "- Check Boot Diagnostics"
echo "- Check Live Readiness"
echo ""
