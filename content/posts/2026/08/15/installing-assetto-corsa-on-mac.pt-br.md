---
title: "Como Instalei Assetto Corsa em um Mac: Um Guia Passo a Passo"
slug: "installing-assetto-corsa-on-mac"
date: 2026-08-15T09:50:00-03:00
draft: false
tags: ["Assetto Corsa", "Sim Racing", "Telemetria", "Mac", "Jogos", "Wine"]
---

### Por que rodar Assetto Corsa em um Mac?

Como o meu único desktop é um Mac, minha principal motivação por trás dessa configuração é poder rodar o Assetto Corsa no macOS sem precisar de uma máquina Windows dedicada. Além disso, eu queria coletar dados de telemetria para fins de pesquisa e análise de desempenho. Ao coletar dados de telemetria, engenheiros e pilotos podem analisar meticulosamente os parâmetros do veículo, como as entradas de acelerador, pontos de frenagem, curso da suspensão e temperaturas dos pneus. Isso permite que os pilotos identifiquem exatamente onde estão perdendo tempo, otimizem os ajustes do carro e melhorem significativamente sua técnica de pilotagem e consistência na pista.

### CrossOver, Wine e Sikarugir

Quando se pensa em rodar jogos de Windows em um Mac, a primeira solução que costuma vir à mente é o CrossOver. Embora o CrossOver seja excelente e fácil de usar, ele oferece apenas um plano de teste (trial).

Uma alternativa é usar o Wine diretamente. O Wine é uma camada de compatibilidade capaz de rodar aplicativos Windows em sistemas operacionais como macOS e Linux. Em vez de simular a lógica interna do Windows como uma máquina virtual, o Wine traduz as chamadas da API do Windows em chamadas POSIX em tempo real, eliminando as penalidades de desempenho associadas à emulação.

Para facilitar o gerenciamento do Wine no macOS, este guia usa o **Sikarugir**, uma ferramenta baseada no Wine que simplifica o processo de criação de wrappers personalizados para aplicativos Windows.

### Pré-requisitos
Antes de começar, certifique-se de que o **Sikarugir Creator** esteja baixado e instalado no Mac.

---

### 1. Criando o Wrapper
Para começar, precisamos criar o ambiente onde o Assetto Corsa será executado. Abra o aplicativo Sikarugir Creator para começar a construir o wrapper inicial.
![Sikarugir Creator](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/sikarugir_creator.png)

Selecione a engine `WS12WineSikarugir10.0_2` e clique em **Create** para compilar o wrapper inicial.

### 2. Configurando o Wrapper
Com o wrapper criado, o próximo passo é configurar suas definições internas para garantir que o jogo rode perfeitamente no hardware do Mac. Clique com o botão direito no novo wrapper, selecione **Show Package Contents** e abra o utilitário de configuração.
![Wrapper Configuration](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/wrapper-configure.png)

Dentro do menu de configuração, certifique-se de que a camada de tradução do Direct3D para Metal esteja definida (**D3DMetal**). Essa etapa é crucial para alcançar o desempenho ideal em chips Apple Silicon.

### 3. Instalando Dependências e Steam
Antes de podermos instalar o jogo, precisamos configurar a Steam e as dependências essenciais do Windows nas quais o Assetto Corsa necessita. Usando o Winetricks dentro da configuração do wrapper, instale os seguintes pacotes:
- `vc2010`, `vc2012`, `vc2013`, `vc2022`
- `ucrtbase2019`
- `dotnet40`, `dotnet48`
- `steam`

Após o término das instalações, selecione `steam.exe` como o aplicativo Windows a ser executado e clique em **Test Run**.

Quando a configuração do Steam terminar de atualizar e exibir a tela de login, vá para **Tools** na configuração do wrapper e selecione **Kill Wine Processes** para fechá-lo corretamente. A partir deste ponto, o Steam pode ser iniciado diretamente do executável do aplicativo dentro do diretório do Sikarugir.

### 4. Instalando o Assetto Corsa
Agora que a base está montada e o Steam está rodando, é hora de realmente instalar o jogo. Inicie a Steam, faça login na sua conta, baixe o Assetto Corsa e verifique se o jogo inicia com sucesso.
![Steam](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/steam.png)

### 5. Adicionando o Content Manager
O Content Manager é um launcher alternativo que oferece uma interface de usuário mais limpa e significativamente mais rápida que a do jogo original. Ele torna o gerenciamento de mods, a configuração de gráficos e o ajuste fino das configurações de controle muito mais intuitivos.

Para configurar o wrapper para iniciar o Content Manager diretamente em vez de apenas o Steam, siga estes passos:

Primeiro, baixe o instalador do Content Manager do seu site oficial. Em seguida, retorne à seção **Tools** na configuração do wrapper, selecione **Install Software** e escolha a opção para copiar uma pasta para dentro. Selecione o diretório do Content Manager e altere o caminho principal do executável na configuração para apontar para `Content Manager.exe` dentro do diretório Program Files.

Faça um rápido **Test Run** para validar a configuração. Uma vez confirmada, tudo pode ser fechado; o executável principal agora iniciará o Content Manager diretamente.

### 6. Habilitando o HUD de Desempenho
Como um toque final à configuração básica, você pode querer monitorar suas taxas de quadros para ver como o seu Mac está lidando com o jogo. Para fazer isso, o HUD de FPS pode ser habilitado no jogo. Abra o configurador do wrapper, navegue até a guia **Advanced** e selecione **Performance HUD**.
![Performance HUD Option](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/perf-hud_option.png)

### Extra: Instalando o Plugin ACTI

Agora passando para o principal assunto de interesse: como apontado na introdução, meu objetivo principal era coletar dados de telemetria. Uma ótima maneira de conseguir isso é instalando um plugin de telemetria, e para essa etapa, abordarei a instalação do ACTI (Assetto Corsa Telemetry Interface). É aqui que ter instalado o Content Manager antes se mostra incrivelmente útil, pois simplifica drasticamente o processo de ativar e gerenciar aplicativos Python como o ACTI.

Antes de prosseguir, você precisará baixar o plugin ACTI de sua fonte oficial e extrair o arquivo baixado para acessar seus arquivos.

Primeiro, mova o diretório `acti` extraído para um local dentro do wrapper, por exemplo: `C:/Users/Sikarugir/AppData/Local/acti`.

Em seguida, mova o conteúdo do `acti_trig_cntrl` para o diretório do Assetto Corsa (por exemplo, `Sikarugir/Steam.app/Contents/SharedSupport/prefix/drive_c/Program Files (x86)/Steam/steamapps/common/assettocorsa`). **Tome cuidado para adicionar esses arquivos aos diretórios existentes em vez de substituí-los.**

No Content Manager, navegue até **Settings** > **Python Apps**. Certifique-se de que a opção **Enable Python Apps** esteja marcada e selecione `acti` na lista de aplicativos ativados.
![Python Apps](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/python-apps.png)

Nas configurações do aplicativo Python para o ACTI, defina o local do `acti.exe` local para o caminho completo onde ele foi colocado no primeiro passo. O **Endereço IP0** deve ser definido como `localhost`.
![Python App Settings](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/python-app_settings.png)

Dentro do jogo, procure as configurações do ACTI no painel lateral e habilite **Auto Launch** e **Auto Connect**. A princípio, o status de controle do ACTI ficará amarelo. Depois de habilitar os recursos de início automático e conexão automática e reiniciar a sessão, o plugin aparecerá como ativo e começará a coletar a telemetria.
![ACTI In-Game Settings](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/acti_ingame.png)

As sessões gravadas estarão disponíveis no diretório `telem` dentro da pasta `acti` definida no primeiro passo.

### Conclusão
E é isso! Agora você tem o Assetto Corsa totalmente funcional em um Mac, completo com o Content Manager para uma melhor interface e o plugin ACTI coletando dados de telemetria com sucesso. Esteja você tentando raspar aqueles últimos décimos do seu tempo de volta ou apenas começando com a análise de telemetria, esta configuração oferece todas as ferramentas que você precisa nativamente no macOS.

Como próximo passo, quando eu tiver acesso a um volante de corrida como o Logitech G29, irei explorar sua compatibilidade por meio desse wrapper e testar como ele funciona dentro deste ambiente.

Boa corrida! 🏎️
