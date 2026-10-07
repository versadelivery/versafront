#!/usr/bin/env python3
import tarfile
from pathlib import Path

source = Path(__file__).parent
output = source.parents[1] / "public" / "downloads"
output.mkdir(parents=True, exist_ok=True)
files = ["app.py", "receipt.py", "requirements.txt", "README.md", "install.sh", "assets/logo-connector.png"]

with tarfile.open(output / "versa-print-connector-linux.tar.gz", "w:gz") as archive:
    for name in files:
        archive.add(source / name, arcname=f"versa-print-connector/{name}")

print(f"Pacote Linux gerado em {output}")
