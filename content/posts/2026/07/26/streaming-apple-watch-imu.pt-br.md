---
title: "Extraindo Dados Brutos de IMU do Apple Watch"
date: 2026-07-26T08:00:00-03:00
draft: false
tags: ["Apple Watch", "IMU", "Natação", "Análise de Dados", "HealthKit"]
---

Eu gosto muito de nadar. Definitivamente não sou um atleta profissional, mas já passei tempo suficiente na piscina para perceber que, se você quiser melhorar sua técnica, apenas contar voltas não vai ser suficiente.

Não me entenda mal, o aplicativo nativo de Exercício do Apple Watch é fantástico para a visão geral. Ele rastreia sua distância total, sua frequência cardíaca média e até calcula sua pontuação SWOLF perfeitamente. Mas quando se trata do micro-nível, o detalhamento biomecânico da sua braçada, ele deixa muito a desejar.

O próprio hardware do Apple Watch é incrivelmente poderoso e captura mais do que dados de alta fidelidade suficientes para uma análise biomecânica profunda. No entanto, o aplicativo Fitness nativo é projetado para o público consumidor em geral. Ele abstrai todos esses dados brutos dos sensores, escolhendo apresentar apenas os resumos de alto nível. Por causa disso, você não consegue ver a queda de potência da sua braçada ao longo de uma série, ou as taxas precisas de rotação do braço.

![Aplicativo de Exercício nativo mostrando métricas de alto nível como distância e frequência cardíaca](https://storage.googleapis.com/blog-images-southamerica-east1/2026/07/streaming-apple-watch-imu/fitness-app.jpg)
*(Nota: Esta captura de tela é uma gravação real, mas de uma sessão diferente. A visualização de dados personalizada que você verá mais adiante é da sessão em que eu estava testando minha nova ferramenta, que o aplicativo nativo não gravou porque eu estava gravando exclusivamente com o novo app!)*

Você pode estar pensando: "Por que não usar um aplicativo de Sensor Logger?" Embora eles existam, quase sempre estão escondidos atrás de um paywall e, mais importante, raramente são otimizados para o ambiente úmido de uma piscina.

Então, decidi construir minha própria solução.

## A Ideia: Um Streamer Personalizado para o Apple Watch

<p align="center"><img src="https://storage.googleapis.com/blog-images-southamerica-east1/2026/07/streaming-apple-watch-imu/app-icon.png" alt="Ícone do aplicativo SwimDataStreamer apresentando um nadador estilizado" /></p>

O objetivo era simples: construir um aplicativo leve para o Apple Watch que extraísse dados em tempo real de uma Unidade de Medição Inercial (_Inertial Measurement Unit_ - IMU), adaptado especificamente para a natação.

Para aqueles não familiarizados, uma IMU é um componente eletrônico repleto de acelerômetros e giroscópios. Ela mede a força específica e a taxa angular de um corpo. Dentro do Apple Watch, a IMU é o motor invisível que alimenta recursos como contagem de passos, detecção de queda e detecção de elevação do pulso. Ao acessar diretamente esse fluxo de dados brutos, podemos medir as forças físicas exatas (como gravidade e aceleração) geradas por cada braçada na água.

![Mockups da interface do usuário do SwimDataStreamer para Apple Watch e aplicativo companheiro para iOS](https://storage.googleapis.com/blog-images-southamerica-east1/2026/07/streaming-apple-watch-imu/swim_app_ui.png)

Para conseguir isso, utilizei a interface do HealthKit, conectando-me à API Workout Session. Isso permite que o aplicativo seja executado perfeitamente em segundo plano durante um treino de natação, enquanto extrai dados de sensores de alta frequência como Aceleração do Usuário (`userAcc`), Taxa de Rotação (`rotation`) e Frequência Cardíaca.

Um dos maiores obstáculos ao construir qualquer coisa para a natação é a própria água. Telas capacitivas ficam loucas quando molhadas, causando toques fantasmas que podem acidentalmente pausar ou arruinar sua gravação. Para consertar isso, certifiquei-me de que o aplicativo travasse automaticamente a tela do relógio no segundo em que o treino começa.

Como o Bluetooth não viaja através da água, transmitir os dados ao vivo para um telefone na borda da piscina não era uma opção. Em vez disso, os dados são armazenados em buffer localmente no relógio. Assim que termino minhas séries, pressiono a Digital Crown e o Botão Lateral para desbloquear a tela, encerro o treino e o arquivo CSV bruto é sincronizado automaticamente com meu iPhone para análise offline.

## Dando Sentido aos Dados Brutos

Obter os dados é apenas metade da batalha. Uma vez sincronizados com o telefone, a verdadeira diversão começa. Escrevi um script em Python para mastigar o CSV bruto, extrair os blocos ativos de natação e plotar as respostas biomecânicas e cardiovasculares.

![Painel de Análise de Blocos de Sessão mostrando a potência da braçada e a taxa de rotação do braço](https://storage.googleapis.com/blog-images-southamerica-east1/2026/07/streaming-apple-watch-imu/dashboard.png)

Quando você visualiza isso, obtém uma perspectiva completamente diferente do seu treino:

*   **Potência da Braçada:** Olhando para os vetores `userAcc`, você pode ver a força G exata de cada puxada. É um proxy direto para a potência que você gera a cada braçada.
*   **Orientação do Pulso e Taxa de Rotação do Braço:** O vetor de gravidade e a taxa de rotação atuam como um proxy preciso para sua forma e taxa de braçada. Você pode ver literalmente como seu braço está se movendo através da água.

O maior insight vem quando você compara diferentes séries. Na visualização acima, as Séries 1-6 foram claramente sprints de alta intensidade. Elas são curtas, com picos massivos de esforço (chegando a 8.27 G!), e por serem tão breves, a frequência cardíaca média permaneceu relativamente baixa.

Por outro lado, as Séries 7-10 foram puxadas de resistência. Elas duraram muito mais tempo (cerca de 3:55), tiveram um esforço máximo menor por braçada, mas mantiveram minha frequência cardíaca sustentada em até 155 BPM. Ver esses micro-dados é um divisor de águas. Posso identificar o momento exato em que a potência da minha braçada começa a cair devido à fadiga durante uma série de resistência, o que me diz exatamente quando preciso me concentrar mais em manter a minha forma.

## Experimente

Como esta é uma ferramenta experimental altamente especializada, não me dei ao trabalho de passar pelos obstáculos para publicá-la na App Store. Mas se você tiver um Mac com Xcode, pode facilmente compilá-la e implantá-la localmente em seus próprios dispositivos.

Todo o código-fonte, incluindo o aplicativo para relogio e o companion para smartphone, está aberto e disponível no GitHub:
[Repositório do SwimDataStreamer](https://github.com/hvini/SwimDataStreamer)

Isso preenche a lacuna entre o rastreamento básico de condicionamento físico e a ciência esportiva real. O próximo passo é redesenhar o aplicativo companion do smartphone para incluir este painel de visualização de dados diretamente no aplicativo, para que eu não tenha que depender de um script Python separado para a análise. Mais para frente, talvez eu até adicione feedback háptico em tempo real no relógio se a taxa de braçadas cair abaixo de um certo limite!
