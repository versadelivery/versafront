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

1. Baixe **Windows 10/11 (.exe)** em **Configurações > Impressoras** no VersaDelivery.
2. Abra `VersaPrintConnectorSetup.exe` e conclua a instalação.
3. O conector abrirá para você conectar a loja e selecionar a impressora.

O instalador inclui o runtime e as dependências do aplicativo; não é necessário instalar Python, CUPS ou ImageMagick. Ele cria um atalho no menu Iniciar, oferece um atalho opcional na Área de Trabalho e configura o início automático com o Windows. A senha fica no Gerenciador de Credenciais do Windows. Nas próximas sessões, o conector inicia minimizado e reconecta automaticamente.

## Sistemas suportados

- Arch Linux, Manjaro, Ubuntu, Debian e outras distribuições Linux com CUPS.
- Windows 10 e 11 (64 bits), usando o instalador independente e o spooler nativo.
- macOS usa CUPS, mas o instalador ainda precisa ser empacotado e validado.

Na primeira execução, informe a conta da loja, selecione a impressora, escolha a largura do papel e clique em **Conectar à loja**. O conector oferece **Automático (80 mm)**, **58 mm** e **80 mm**; a escolha fica salva para a próxima inicialização. A senha é armazenada pelo gerenciador seguro de credenciais do sistema operacional; não é gravada no arquivo de configuração. O endereço da API fica configurado internamente.

Com a conexão ativa, minimizar ou fechar a janela mantém a impressão rodando em segundo plano. O ícone continua na barra de tarefas; use **Desconectar e sair** para encerrar. Após a primeira configuração, o conector inicia com a sessão do usuário e reconecta automaticamente depois de reiniciar ou entrar novamente no computador. No Linux, o gerenciador de senhas da sessão (Secret Service/KWallet) precisa estar disponível para guardar as credenciais. Para impressão automática de pedidos, ative o modo em **Configurações > Impressoras** no VersaDelivery.
