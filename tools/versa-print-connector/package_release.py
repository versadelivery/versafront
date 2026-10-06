#!/usr/bin/env python3
import tarfile
import zipfile
from pathlib import Path

source = Path(__file__).parent
output = source.parents[1] / "public" / "downloads"
output.mkdir(parents=True, exist_ok=True)
files = ["app.py", "receipt.py", "requirements.txt", "README.md", "install.sh", "install.ps1", "uninstall.ps1", "assets/logo-connector.png"]

with zipfile.ZipFile(output / "versa-print-connector-windows.zip", "w", zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(source / name, f"versa-print-connector/{name}")

with tarfile.open(output / "versa-print-connector-linux.tar.gz", "w:gz") as archive:
    for name in files:
        archive.add(source / name, arcname=f"versa-print-connector/{name}")

print(f"Pacotes gerados em {output}")
