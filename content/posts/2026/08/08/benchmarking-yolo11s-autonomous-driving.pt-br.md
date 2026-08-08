---
title: "Benchmarking do YOLO11s para Direção Autônoma: Do Edge ao Data Center"
date: 2026-08-08T10:00:00-03:00
draft: false
tags: ["YOLO11", "Visão Computacional", "TensorRT", "Direção Autônoma", "Edge Computing", "CUDA"]
---

Na direção autônoma, a percepção é tudo. Mas detectar veículos e pedestres com precisão é apenas o começo; fazer isso de forma determinística, com baixíssima latência e dentro de um orçamento rigoroso de energia, é o que realmente torna um sistema viável. Um frame atrasado ou um grande pico de energia em um dispositivo de borda (edge) pode comprometer a segurança e a autonomia do veículo.

Para entender a situação atual do hardware e das stacks de inferência, executei uma matriz massiva de benchmarks no **YOLO11s**. Eu queria ver exatamente como diferentes ambientes de execução se comportam, desde a fase de prototipagem em Python até as implantações nativas em C++.

A lista de testes incluiu uma ampla variedade de hardware: RTX 4060 Ti, 4090, 5060 Ti, 5090, A6000, L40 e o Jetson Orin. Avaliei PyTorch, ONNX e TensorRT nas precisões FP32, FP16 e INT8. Para isolar o desempenho de computação, configurei a execução para se repetir 3 vezes com 1.000 iterações cada, fazendo inferência em uma única imagem estática.

Aqui está o que os dados realmente revelam sobre o escalonamento de pipelines de percepção.

### O Muro do Escalonamento: De 640p a 1920p

Nas implantações padrão de edge (borda) hoje, 640p é a linha de base. No entanto, os modernos Sistemas Avançados de Assistência ao Motorista (ADAS) estão migrando rapidamente para câmeras de alta resolução (8MP+) para detectar objetos distantes, como um pedestre atravessando uma rodovia a centenas de metros de distância.

Eu queria ilustrar o que acontece quando forçamos o hardware a processar grades (grids) cada vez maiores.

![Figura 1: Degradação de FPS à medida que a resolução aumenta nos backends TensorRT, ONNX e PyTorch.](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/benchmarking-yolo11s-autonomous-driving/fps_degrad.png)
*Figura 1: Degradação de FPS à medida que a resolução aumenta nos backends TensorRT, ONNX e PyTorch.*

Como você pode ver no gráfico acima, o desempenho cai agressivamente à medida que escalonamos de 640p para 1280p, e finalmente para 1920p. Isso separa visualmente o hardware que atinge um limite de memória (memory wall) do hardware com largura de banda de memória suficiente para forçar a barra (brute-force) nas resoluções mais altas, como a RTX 5090. Isso serve como um forte lembrete de que, enquanto 640p é gerenciável, a percepção em alta resolução exige considerações arquitetônicas sérias.

### O Custo do Python: Um Teste de Estresse em 1920p

Prototipar em Python é o padrão da indústria, mas implantar Python em um ambiente de sistema operacional de tempo real é um grande risco. Em 640p, a sobrecarga (overhead) do Python é ruim, mas potencialmente contornável em hardware de ponta. No entanto, quando aumentamos a resolução para 1920p, nosso teste de estresse absoluto, a sobrecarga se torna catastrófica.

![Figura 2: Aceleração multiplicativa alcançada simplesmente trocando o Python por C++ Nativo na resolução de 1920p.](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/benchmarking-yolo11s-autonomous-driving/native_speedup.png)
*Figura 2: Aceleração multiplicativa alcançada simplesmente trocando o Python por C++ Nativo na resolução de 1920p.*

Este mapa de calor (heatmap) é possivelmente a descoberta mais impressionante do experimento. Sob carga pesada em 1920p, migrar para C++ Nativo gera um aumento massivo de velocidade de 7.64x em uma 6000 Ada Generation rodando ONNX, e um aumento de 7.01x em uma RTX 5090. Traduzindo isso para frames brutos, abandonar o Python pelo C++ Nativo em uma 5090 rodando TensorRT garante 1.093 frames adicionais por segundo. Você está literalmente deixando a maior parte do potencial do seu hardware na mesa ao não compilar o código.

### Determinismo dita a Distância de Frenagem

Em um pipeline de veículo autônomo, o FPS médio é uma métrica de vaidade. O que realmente dita as margens de segurança da distância de frenagem do seu sistema é a latência P99, o pior tempo de execução.

![Figura 3: Gráficos de violino (Violin plots) comparando a consistência da latência entre Python e C++ Nativo.](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/benchmarking-yolo11s-autonomous-driving/latency_dist.png)
*Figura 3: Gráficos de violino (Violin plots) comparando a consistência da latência entre Python e C++ Nativo.*

A distribuição de latência acima conta a verdadeira história sobre segurança. Observe as caudas de latência (P95 e P99) massivas e imprevisíveis nos gráficos em Python. Em contraste, as execuções em C++ Nativo estão fortemente agrupadas, mostrando tempos de execução determinísticos e previsíveis. Em um veículo se movendo em velocidades de rodovia, um pico de latência causado pelo Global Interpreter Lock (GIL) do Python ou pela coleta de lixo (garbage collection) poderia significar a diferença entre parar com segurança e uma colisão.

### Eficiência do TensorRT em Escala

Quando olhamos estritamente para o caminho de implantação mais otimizado, TensorRT FP16, podemos ver como o C++ Nativo escala em relação ao hardware.

![Figura 4: Como a tendência de aceleração do C++ Nativo muda nas diferentes resoluções para TensorRT FP16.](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/benchmarking-yolo11s-autonomous-driving/speedup_trend_tensorrt_fp16.png)
*Figura 4: Como a tendência de aceleração do C++ Nativo muda nas diferentes resoluções para TensorRT FP16.*

Este gráfico detalhado mostra que a aceleração relativa do C++ Nativo sobre o Python não é estática; ela muda dinamicamente dependendo da arquitetura da GPU à medida que a resolução aumenta. O TensorRT gerencia a memória com alta eficiência, permitindo que placas como a 6000 Ada Generation e a L40S mantenham múltiplos enormes de desempenho sobre suas contrapartes em Python, mesmo em 1920p.

### Eficiência Energética: A Realidade da Edge Computing

Finalmente, temos que falar sobre as realidades físicas da computação de borda (edge computing). Para a rotulagem automática offline em um data center, a energia é menos limitante do que a taxa de transferência (throughput) bruta. Mas em um veículo, um grande pico de energia pode degradar a autonomia e sobrecarregar os sistemas de resfriamento.

![Figura 5: Consumo médio de energia em relação ao FPS médio para implantações em C++ Nativo.](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/benchmarking-yolo11s-autonomous-driving/power_draw_native.png)
*Figura 5: Consumo médio de energia em relação ao FPS médio para implantações em C++ Nativo.*

Este gráfico separa perfeitamente o hardware de processamento offline do hardware de edge. As placas 4090 e 5090 ficam no canto superior direito, alcançando taxas de quadros astronômicas, mas exigindo um consumo médio de energia significativamente maior para isso.

No extremo completamente oposto do espectro, a Jetson Orin está agrupada sozinha no canto inferior esquerdo. Isso representa o orçamento restrito e ultrabaixo de energia exigido para dispositivos de edge. Ao implantar na borda, o *FPS por Watt* é a métrica predominante, e os dados confirmam que o C++ Nativo supera universalmente o Python em eficiência energética em absolutamente todas as GPUs testadas.

### Trabalhos Futuros: Ambientes Dinâmicos

Embora a inferência em uma única imagem estática forneça uma linha de base extremamente sólida da eficiência teórica de computação do YOLO11s nos hardwares modernos, as condições de direção no mundo real introduzem variáveis adicionais.

Em um veículo autônomo implantado, o sistema de percepção processa fluxos contínuos de vídeo, lida com processamento em lote dinâmico (dynamic batching) em várias câmeras e enfrenta condições flutuantes de iluminação e clima. Esses fatores podem influenciar a esparsidade das ativações e o comportamento do cache.

Este benchmark isola e avalia com sucesso o desempenho principal de inferência e os limites de escalonamento do hardware. A Fase 2 deste estudo expandirá essa base ao introduzir fluxos contínuos de vídeo e condições ambientais variadas para avaliar como essas métricas de base se traduzem em cenários dinâmicos.
