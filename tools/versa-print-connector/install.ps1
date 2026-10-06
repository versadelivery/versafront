$ErrorActionPreference = "Stop"

$AppDir = Join-Path $env:LOCALAPPDATA "VersaPrintConnector"
$StartMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
$Desktop = [Environment]::GetFolderPath("Desktop")

Write-Host "Instalando o Conector VersaDelivery..."
if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    throw "Python 3 não encontrado. Instale pelo site python.org marcando 'Add Python to PATH'."
}

New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
Copy-Item "$PSScriptRoot\app.py", "$PSScriptRoot\receipt.py", "$PSScriptRoot\requirements.txt" -Destination $AppDir -Force
Copy-Item "$PSScriptRoot\uninstall.ps1" -Destination $AppDir -Force

& py -3 -m venv (Join-Path $AppDir ".venv")
$Python = Join-Path $AppDir ".venv\Scripts\python.exe"
$Pythonw = Join-Path $AppDir ".venv\Scripts\pythonw.exe"
& $Python -m pip install --disable-pip-version-check -r (Join-Path $AppDir "requirements.txt")

$Shell = New-Object -ComObject WScript.Shell
foreach ($ShortcutPath in @(
    (Join-Path $StartMenu "Conector VersaDelivery.lnk"),
    (Join-Path $Desktop "Conector VersaDelivery.lnk")
)) {
    $Shortcut = $Shell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $Pythonw
    $Shortcut.Arguments = '"' + (Join-Path $AppDir "app.py") + '"'
    $Shortcut.WorkingDirectory = $AppDir
    $Shortcut.Description = "Impressão automática de pedidos VersaDelivery"
    $Shortcut.Save()
}

Write-Host "Instalação concluída. Abra 'Conector VersaDelivery' pelo menu Iniciar ou pela Área de Trabalho."
