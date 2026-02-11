---
title: "Limites de Generalização: Quando o Baixo Erro de Treino Realmente Importa?"
date: 2026-02-11T09:00:00-03:00
draft: false
tags: ["Machine Learning", "Distribution Shift", "AI Theory"]
math: true
---

## 1 Introdução

No [post anterior](/pt-br/posts/2026/02/minimização-do-risco-empírico-e-mudança-de-distribuição), discutimos a Minimização do Risco Empírico (ERM), a estratégia de escolher o preditor que apresenta o melhor desempenho nos nossos dados de treinamento. Assumimos que, se o erro de treinamento $\hat{R}(h)$ for baixo, o risco real $R(h)$ (desempenho em dados futuros) também deveria ser baixo.

Mas isso é sempre verdade?

Imagine 2 alunos estudando para uma prova. Um aluno entende os conceitos, o outro apenas memoriza as questões do simulado. Ambos podem tirar 100% no simulado (risco empírico zero), mas o que memorizou irá falhar na prova real (risco real alto).

Essa diferença entre o erro de treinamento e o erro real é chamada de **Lacuna de Generalização** (*Generalization Gap*). Para confiar em nossos modelos, precisamos de **Limites de Generalização**: garantias matemáticas de que essa lacuna não será muito grande.

## 2 O Limite de Generalização

Matematicamente, queremos limitar a diferença entre o risco real e o risco empírico com alta probabilidade. Um limite de generalização típico se parece com isto:

$$
R(h) \leq \hat{R}(h) + \text{Complexidade}(H)
$$

Esta equação conta uma história crucial:
1.  **$\hat{R}(h)$**: O quão bem nos saímos nos dados de treinamento.
2.  **$\text{Complexidade}(H)$**: Uma penalidade para o quão "complicada" é a nossa classe de hipóteses $H$.

Se nossa classe de modelo for muito complexa (muito capaz de memorização), o termo de penalidade cresce e o limite se torna frouxo, o que significa que nosso desempenho no treinamento não nos diz nada sobre o desempenho futuro.

## 3 Medindo a Complexidade: Dimensão VC

Como medimos a "complexidade" de uma classe de modelos? Uma das medidas clássicas é a **Dimensão Vapnik-Chervonenkis (VC)**. Ela mede o poder combinatório de uma classe de hipóteses, especificamente, sua capacidade de atribuir qualquer rótulo a um conjunto de pontos.

![Três pontos de dados arranjados em um triângulo em um plano, mostrando como um classificador linear pode distinguir entre todas as atribuições de rótulos possíveis (shattering).](https://storage.googleapis.com/blog-images-southamerica-east1/2026/02/generalization-bounds/vc-dimension-shattering.png "Exemplo de Fragmentação na Dimensão VC")

### 3.1 Shattering (Fragmentação)

Para entender a dimensão VC, precisamos do conceito de **shattering** (ou fragmentação).
Uma classe de hipóteses $H$ *fragmenta* (*shatters*) um conjunto de pontos de dados se, não importa como atribuímos rótulos binários ($+$ ou $-$) a esses pontos, existe uma função em $H$ que pode separá-los perfeitamente.

* **Exemplo:** Imagine 3 pontos formando um triângulo em um plano 2D. Uma linha reta consegue separá-los para *todas* as rotulações possíveis (ex: todos positivos, dois positivos e um negativo, etc.)? Sim. Portanto, um classificador linear pode fragmentar (*shatter*) 3 pontos.

No entanto, se adicionarmos um 4º ponto (especificamente em uma configuração XOR), um classificador linear **não consegue** separar os positivos dos negativos para todas as combinações de rótulos.

### 3.2 A Definição

A Dimensão VC de uma classe de hipóteses $H$, denotada como $VC(H)$, é o **tamanho do maior conjunto de pontos** que pode ser fragmentado (*shattered*) por $H$.

* Classificadores lineares em 2D têm $VC = 3$.
* Classificadores lineares em $d$ dimensões têm $VC = d+1$.
* Redes Neurais podem ter uma dimensão VC massiva, implicando alta capacidade de memorização.

## 4 Medindo a Complexidade: Complexidade de Rademacher

Enquanto a dimensão VC olha para o arranjo de pontos no "pior caso", a **Complexidade de Rademacher** oferece uma visão mais dependente dos dados. Ela mede o quão bem uma classe de hipóteses consegue se ajustar a **ruído aleatório**.

Imagine que pegamos nosso conjunto de dados e jogamos uma moeda para atribuir um rótulo aleatório $\sigma_i \in \{-1, +1\}$ para cada ponto de dados $x_i$. Como os rótulos são puro ruído, nenhum modelo *deveria* ser capaz de prevê-los com base na entrada $x$.

$$
\hat{\mathfrak{R}}\_S(H) = \mathbb{E}\_{\sigma} \left[ \sup_{h \in H} \frac{1}{n} \sum_{i=1}^n \sigma_i h(x_i) \right]
$$

* Se o seu modelo consegue atingir um erro baixo mesmo nesses rótulos aleatórios, a complexidade de Rademacher é alta. Isso significa que o modelo está "alucinando" padrões no ruído.
* Se o modelo falha em ajustar os rótulos aleatórios (o que é bom!), a complexidade é baixa.

A complexidade de Rademacher fornece limites mais justos do que a dimensão VC em muitas aplicações modernas porque leva em conta a distribuição real dos dados, não apenas a geometria do pior caso.

## 5 O Tradeoff Viés-Variância

Essas medidas de complexidade nos levam à tensão fundamental no aprendizado de máquina: o **Tradeoff Viés-Variância** (ou Compromisso Viés-Variância).

Queremos minimizar o Risco Real, que se decompõe aproximadamente em:

$$
\text{Erro} = \text{Viés}^2 + \text{Variância} + \text{Ruído}
$$

![Gráfico de linha ilustrando o Compromisso Viés-Variância: O viés diminui e a variância aumenta à medida que a complexidade do modelo cresce, enquanto o erro total é minimizado em uma complexidade intermediária.](https://storage.googleapis.com/blog-images-southamerica-east1/2026/02/generalization-bounds/bias-variance-tradeoff.jpg "Gráfico do Tradeoff Viés-Variância")

1.  **Baixa Complexidade (Alto Viés):**
    * O modelo é muito simples (ex: ajustar uma reta a uma curva).
    * Tem alto erro de treinamento (subajuste/underfitting) e alto erro de teste.
    * *Exemplo:* Um classificador linear tentando aprender reconhecimento de imagem.

2.  **Alta Complexidade (Alta Variância):**
    * O modelo é muito poderoso (ex: uma rede neural massiva em um conjunto de dados minúsculo).
    * Tem erro de treinamento zero (memorização), mas flutua violentamente com diferentes conjuntos de treinamento.
    * *Exemplo:* Um polinômio de grau 100 ajustando 10 pontos de dados.

3.  **O Ponto Ideal (Sweet Spot):**
    * Queremos um modelo complexo o suficiente para capturar o sinal (baixo viés), mas simples o suficiente para ignorar o ruído (baixa variância).
    * Os limites de generalização nos ajudam a localizar teoricamente esse ponto penalizando a complexidade.

## 6 Conclusão

Os limites de generalização nos dizem que **baixo erro de treinamento não é suficiente**. Para garantir o aprendizado, devemos equilibrar o ajuste aos dados (ERM) com a simplicidade do modelo (Dimensão VC / Rademacher).

No entanto, todos esses limites dependem de uma suposição crítica: **Os dados de teste vêm da mesma distribuição que os dados de treinamento.**

O que acontece quando essa suposição falha? E se treinarmos com tomografias de um hospital em Londres, mas implantarmos o modelo em um hospital no Brasil? Os limites que discutimos hoje se quebram. No próximo post, finalmente abordaremos o **Distribution Shift** (Mudança de Distribuição) e a matemática específica da "Adaptação de Domínio".

---

### Referências

* <span id="ref-1"></span>[[1](#ref-1)] Shalev-Shwartz, S., & Ben-David, S. (2014). *Understanding Machine Learning: From Theory to Algorithms*. Cambridge University Press.
* <span id="ref-2"></span>[[2](#ref-2)] Mohri, M., Rostamizadeh, A., & Talwalkar, A. (2018). *Foundations of Machine Learning*. MIT Press.