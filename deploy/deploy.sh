#!/usr/bin/env bash
# Shared deployment helper script for the Ubuntu faculty server.
# Assumes repo is cloned at /var/www/ah-slap/repo and static files are served from /var/www/ah-slap/html.

set -euo pipefail

APP_ROOT="/var/www/ah-slap"
REPO_DIR="$APP_ROOT/repo"
HTML_DIR="$APP_ROOT/html"
BRANCH="${1:-main}"

echo "==> Pulling latest code from origin/$BRANCH..."
cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "==> Building backend..."
cd "$REPO_DIR/server"
npm install
npm run db:init
npm run build

echo "==> Restarting backend in PM2..."
if pm2 describe ahslap-api > /dev/null 2>&1; then
  pm2 restart ahslap-api
else
  pm2 start dist/index.js --name ahslap-api
  pm2 save
fi

echo "==> Building frontend..."
cd "$REPO_DIR/client"
npm install
npm run build

echo "==> Publishing static frontend to $HTML_DIR..."
mkdir -p "$HTML_DIR"
rm -rf "${HTML_DIR:?}/"*
cp -r dist/* "$HTML_DIR/"
chmod -R 755 "$HTML_DIR"

echo "==> Deployment complete! Checking /api/health..."
curl -fsS http://127.0.0.1:3001/api/health && echo ""
