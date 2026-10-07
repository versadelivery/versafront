[Setup]
#ifndef AppVersion
#define AppVersion "1.0.0"
#endif
AppId={{8E3A2CC3-3D2D-4E41-895C-EC1D63B61F51}
AppName=Conector VersaDelivery
AppVersion={#AppVersion}
AppPublisher=VersaDelivery
DefaultDirName={localappdata}\VersaPrintConnector
DefaultGroupName=Conector VersaDelivery
UninstallDisplayIcon={app}\VersaPrintConnector.exe
SetupIconFile=assets\versa-icon.ico
OutputDir=dist\installer
OutputBaseFilename=VersaPrintConnectorSetup
PrivilegesRequired=lowest
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
DisableProgramGroupPage=yes
SetupLogging=yes
Compression=lzma2
SolidCompression=yes
WizardStyle=modern

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na Área de Trabalho"; GroupDescription: "Atalhos:"; Flags: unchecked

[Files]
Source: "dist\VersaPrintConnector.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\Conector VersaDelivery"; Filename: "{app}\VersaPrintConnector.exe"
Name: "{autodesktop}\Conector VersaDelivery"; Filename: "{app}\VersaPrintConnector.exe"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "VersaPrintConnector"; ValueData: """{app}\VersaPrintConnector.exe"" --background"; Flags: uninsdeletevalue

[Run]
Filename: "{app}\VersaPrintConnector.exe"; Description: "Abrir o Conector VersaDelivery"; Flags: postinstall nowait skipifsilent

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
  begin
    DeleteFile(ExpandConstant('{userstartup}\Conector VersaDelivery.lnk'));
    DeleteFile(ExpandConstant('{userdesktop}\Conector VersaDelivery.lnk'));
  end;
end;
