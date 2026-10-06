$ErrorActionPreference = "SilentlyContinue"
$AppDir = Join-Path $env:LOCALAPPDATA "VersaPrintConnector"
$StartMenuShortcut = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Conector VersaDelivery.lnk"
$DesktopShortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) "Conector VersaDelivery.lnk"
$StartupShortcut = Join-Path ([Environment]::GetFolderPath("Startup")) "Conector VersaDelivery.lnk"

Remove-Item $StartMenuShortcut -Force
Remove-Item $DesktopShortcut -Force
Remove-Item $StartupShortcut -Force
Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "VersaPrintConnector" -Force
Remove-Item $AppDir -Recurse -Force
Write-Host "Conector VersaDelivery removido."
