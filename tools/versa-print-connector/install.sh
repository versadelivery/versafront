#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/versa-print-connector"
DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
mkdir -p "$APP_DIR" "$DESKTOP_DIR"
cp app.py receipt.py "$APP_DIR/"
mkdir -p "$APP_DIR/assets"
cp assets/logo-inline-black.png "$APP_DIR/assets/"

cat > "$DESKTOP_DIR/versa-print-connector.desktop" <<EOF
[Desktop Entry]
Name=Conector VersaDelivery
Comment=Impressão automática de pedidos VersaDelivery
Exec=python3 $APP_DIR/app.py
Terminal=false
Type=Application
Categories=Office;Utility;
EOF

chmod +x "$APP_DIR/app.py" "$DESKTOP_DIR/versa-print-connector.desktop"
echo "Conector instalado. Procure por 'Conector VersaDelivery' no menu de aplicativos."
