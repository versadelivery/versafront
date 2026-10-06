$ErrorActionPreference = "Stop"

$AppDir = Join-Path $env:LOCALAPPDATA "VersaPrintConnector"
$StartMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
$Startup = [Environment]::GetFolderPath("Startup")
$Desktop = [Environment]::GetFolderPath("Desktop")

Write-Host "Instalando o Conector VersaDelivery..."
if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    throw "Python 3 não encontrado. Instale pelo site python.org marcando 'Add Python to PATH'."
}

New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
Copy-Item "$PSScriptRoot\app.py", "$PSScriptRoot\receipt.py", "$PSScriptRoot\requirements.txt" -Destination $AppDir -Force
New-Item -ItemType Directory -Force -Path (Join-Path $AppDir "assets") | Out-Null
Copy-Item "$PSScriptRoot\assets\logo-connector.png" -Destination (Join-Path $AppDir "assets") -Force
Copy-Item "$PSScriptRoot\uninstall.ps1" -Destination $AppDir -Force

& py -3 -m venv (Join-Path $AppDir ".venv")
$Python = Join-Path $AppDir ".venv\Scripts\python.exe"
$Pythonw = Join-Path $AppDir ".venv\Scripts\pythonw.exe"
& $Python -m pip install --disable-pip-version-check -r (Join-Path $AppDir "requirements.txt")

$Shell = New-Object -ComObject WScript.Shell
$Shortcuts = @(
    @{ Path = Join-Path $StartMenu "Conector VersaDelivery.lnk"; Arguments = '"' + (Join-Path $AppDir "app.py") + '"' },
    @{ Path = Join-Path $Desktop "Conector VersaDelivery.lnk"; Arguments = '"' + (Join-Path $AppDir "app.py") + '"' },
    @{ Path = Join-Path $Startup "Conector VersaDelivery.lnk"; Arguments = '"' + (Join-Path $AppDir "app.py") + '" --background' }
)
foreach ($Entry in $Shortcuts) {
    $Shortcut = $Shell.CreateShortcut($Entry.Path)
    $Shortcut.TargetPath = $Pythonw
    $Shortcut.Arguments = $Entry.Arguments
    $Shortcut.WorkingDirectory = $AppDir
    $Shortcut.Description = "Impressão automática de pedidos VersaDelivery"
    $Shortcut.Save()
}

# Registro de inicialização do usuário: funciona mesmo quando a pasta Startup é restringida por política.
$RunCommand = '"' + $Pythonw + '" "' + (Join-Path $AppDir "app.py") + '" --background'
New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "VersaPrintConnector" -Value $RunCommand

Write-Host "Instalação concluída. O conector iniciará minimizado ao entrar no Windows. Abra-o uma vez para conectar sua loja e escolher a impressora."
Start-Process -FilePath $Pythonw -ArgumentList ('"' + (Join-Path $AppDir "app.py") + '"') -WorkingDirectory $AppDir
