#!/usr/bin/env bash
# Primer setup en un VPS Ubuntu/Debian (DonWeb Cloud).
# Uso (como usuario con sudo): bash deploy/donweb-setup.sh /var/www/midulcecata
set -euo pipefail

APP_DIR="${1:-/var/www/midulcecata}"

echo "==> Node 20 (NodeSource)"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Herramientas"
sudo apt-get update -y
sudo apt-get install -y git nginx
sudo npm install -g pm2

echo "==> Carpeta de la app: $APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "Cloná el repo en $APP_DIR (o copiá el código) y volvé a correr este script."
  echo "  git clone https://github.com/MarcosSchloymann/plush-MiDulceCata.git $APP_DIR"
  exit 0
fi

cd "$APP_DIR"
git pull --ff-only || true

echo "==> Dependencias y build"
npm install
npm install --prefix server
npm install --prefix client
npm run build
(cd server && npx prisma migrate deploy)

echo "==> PM2"
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | tail -n 1

echo ""
echo "Listo el proceso Node. Falta:"
echo "  1) Completar $APP_DIR/server/.env (ver server/.env.example)"
echo "  2) Copiar deploy/nginx-midulcecata.conf.example a Nginx"
echo "  3) certbot --nginx -d TU-DOMINIO"
echo "  4) pm2 restart midulcecata"
