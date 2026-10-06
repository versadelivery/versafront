# Conector de Impressão VersaDelivery

Aplicativo local que recebe a fila da loja e imprime cupons ESC/POS em impressoras térmicas de 80 mm configuradas no CUPS.

## Arch Linux / Manjaro

```bash
sudo pacman -S --needed python python-pip python-virtualenv tk cups imagemagick
sudo systemctl enable --now cups
cd tools/versa-print-connector
./install.sh
```

Se o arquivo foi extraído sem a permissão de execução, use `bash install.sh`.

Depois, abra **Conector VersaDelivery** no menu de aplicativos. O botão **Teste de impressão** funciona sem login e permite validar a impressora antes do deploy da API.

## Ubuntu / Debian

```bash
sudo apt install python3-venv python3-tk cups imagemagick
cd tools/versa-print-connector
./install.sh
```

## Windows 10 e 11

1. Instale o Python 3 por `python.org` e marque **Add Python to PATH**.
2. Extraia a pasta do conector.
3. Clique com o botão direito em `install.ps1` e selecione **Executar com PowerShell**.

Ou execute no PowerShell dentro da pasta:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

O instalador cria atalhos no menu Iniciar, na Área de Trabalho e na pasta de inicialização do Windows. Ele abre uma vez após a instalação para você conectar a loja e escolher a impressora. A senha fica no Gerenciador de Credenciais do Windows. Nos próximos logins do Windows, o conector inicia minimizado e conecta automaticamente. O conector usa diretamente o spooler do Windows e não exige CUPS ou ImageMagick.

## Sistemas suportados

- Arch Linux, Manjaro, Ubuntu, Debian e outras distribuições Linux com CUPS.
- Windows 10 e 11, usando o spooler nativo.
- macOS usa CUPS, mas o instalador ainda precisa ser empacotado e validado.

Na primeira execução, informe a conta da loja, selecione a impressora, escolha a largura do papel e clique em **Conectar à loja**. O conector oferece **Automático (80 mm)**, **58 mm** e **80 mm**; a escolha fica salva para a próxima inicialização. A senha é armazenada pelo gerenciador seguro de credenciais do sistema operacional; não é gravada no arquivo de configuração. O endereço da API fica configurado internamente.

Com a conexão ativa, minimizar ou fechar a janela mantém a impressão rodando em segundo plano. O ícone continua na barra de tarefas; use **Desconectar e sair** para encerrar. Após a primeira configuração, o conector inicia com a sessão do usuário e reconecta automaticamente depois de reiniciar ou entrar novamente no computador. No Linux, o gerenciador de senhas da sessão (Secret Service/KWallet) precisa estar disponível para guardar as credenciais. Para impressão automática de pedidos, ative o modo em **Configurações > Impressoras** no VersaDelivery.
