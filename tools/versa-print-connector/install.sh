#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/versa-print-connector"
DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
AUTOSTART_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/autostart"
mkdir -p "$APP_DIR/assets" "$DESKTOP_DIR" "$AUTOSTART_DIR"
cp app.py receipt.py "$APP_DIR/"
cp assets/logo-connector.png "$APP_DIR/assets/"

python3 -m venv "$APP_DIR/.venv"
PYTHON="$APP_DIR/.venv/bin/python"
"$PYTHON" -m pip install --disable-pip-version-check -r requirements.txt

cat > "$DESKTOP_DIR/versa-print-connector.desktop" <<EOF_DESKTOP
[Desktop Entry]
Name=Conector VersaDelivery
Comment=Impressão automática de pedidos VersaDelivery
Exec="$PYTHON" "$APP_DIR/app.py"
Terminal=false
Type=Application
Categories=Office;Utility;
EOF_DESKTOP

cat > "$AUTOSTART_DIR/versa-print-connector.desktop" <<EOF_AUTOSTART
[Desktop Entry]
Name=Conector VersaDelivery
Comment=Inicia a impressão de pedidos ao entrar na sessão
Exec="$PYTHON" "$APP_DIR/app.py" --background
Terminal=false
Type=Application
X-GNOME-Autostart-enabled=true
EOF_AUTOSTART

chmod +x "$APP_DIR/app.py" "$DESKTOP_DIR/versa-print-connector.desktop" "$AUTOSTART_DIR/versa-print-connector.desktop"
echo "Instalação concluída. O conector iniciará com a sessão. Abra-o uma vez para conectar a loja e escolher a impressora."
