---
title: "Minimização do Risco Empírico e Mudança de Distribuição"
date: 2026-02-02T08:10:00-03:00
draft: false
tags: ["Machine Learning", "Distribution Shift", "AI Theory"]
math: true
---

## 1 Introdução

Considere um problema de predição no qual um algoritmo observa um par entrada–saída $(x,y)$, como medições e seus respectivos resultados. O objetivo do aprendizado é construir uma função $h(x)$ que prediga $y$ a partir de $x$ com erro pequeno.

## 2 Como Medimos o Erro?

Para quantificar a qualidade das predições, introduzimos uma função de perda $L(y,h(x))$, que mede o quão diferente uma predição $h(x)$ é do valor verdadeiro $y$. Como o verdadeiro processo gerador dos dados é desconhecido, os algoritmos de aprendizado dependem de uma amostra finita de treinamento $\{(x_{i},y_{i})\}_{i=1}^{n}$.

## 3 Minimização do Risco Empírico (ERM)

O princípio de aprendizado mais comum consiste em minimizar o erro médio observado nos dados de treinamento, conhecido como risco empírico:

$$
\hat{R}(h)=\frac{1}{n}\sum_{i=1}^{n}L(y_{i},h(x_{i}))
$$

Esse princípio, chamado de Minimização do Risco Empírico (Empirical Risk Minimization — ERM), seleciona o preditor $h$ que apresenta o melhor desempenho nos dados observados [[4](#ref-4), [2](#ref-2)].

### 3.1 Risco Verdadeiro vs. Risco Empírico

A quantidade que realmente nos interessa é o erro esperado em dados futuros, conhecido como risco verdadeiro:

$$
R(h)=\mathbb{E}_{(x,y)\sim\mathcal{P}}[L(y,h(x))]
$$

onde $\mathcal{P}(x,y)$ é a distribuição de probabilidade (desconhecida) que gera os dados.

O ERM é justificado quando os dados de treinamento são representativos dos dados futuros, isto é, quando ambos são amostrados de forma independente e identicamente distribuída (i.i.d.) a partir da mesma distribuição $\mathcal{P}$. Nesse caso, o risco empírico $\hat{R}(h)$ fornece uma boa aproximação do risco verdadeiro $R(h)$, e minimizar um implica, aproximadamente, minimizar o outro [[4](#ref-4)].

## 4 Mudança de Distribuição no Mundo Real

Em muitos cenários do mundo real, no entanto, a distribuição dos dados encontrados em produção difere daquela observada durante o treinamento. Esse fenômeno, conhecido como mudança de distribuição (*distribution shift*) ou mudança de domínio (*domain shift*), pode ser formalmente expresso como [[1](#ref-1), [3](#ref-3)]:

$$
\mathcal{P}\_{train}(x,y)\ne\mathcal{P}\_{test}(x,y)
$$

Nessas condições, o risco empírico calculado sobre os dados de treinamento deixa de estimar corretamente o risco verdadeiro em relação à distribuição $\mathcal{P}_{test}$. Como consequência, preditores obtidos via ERM podem apresentar baixo erro no treinamento, mas desempenho insatisfatório quando aplicados a dados de um novo domínio.

Essa limitação decorre do fato de que o ERM favorece preditores que exploram regularidades estatísticas específicas da distribuição de treinamento, sem impor robustez a mudanças no processo gerador dos dados. Como resultado, o ERM, por si só, não garante uma generalização confiável sob mudanças distribucionais, o que motiva o estudo de métodos de aprendizado explicitamente projetados para lidar com mudança de domínio.

## 5 Conclusão

A Minimização do Risco Empírico funciona bem quando o futuro se assemelha ao passado; a mudança de distribuição captura exatamente a situação em que essa semelhança deixa de existir. No entanto, mesmo quando os dados de treinamento e teste provêm da mesma distribuição, o risco empírico ainda é apenas uma estimativa do risco verdadeiro.

No próximo post, vamos nos aprofundar na mudança de distribuição, mostrando por que o risco empírico pode falhar e como modelos podem se tornar mais robustos a mudanças na distribuição dos dados.

---

### Referências

* <span id="ref-1"></span>[[1](#ref-1)] Shai Ben-David et al. "A theory of learning from different domains". In: Machine Learning 79.1-2 (2010), pp. 151–175.
* <span id="ref-2"></span>[[2](#ref-2)] Mehryar Mohri, Afshin Rostamizadeh, and Ameet Talwalkar. *Foundations of Machine Learning*. MIT Press, 2018.
* <span id="ref-3"></span>[[3](#ref-3)] Joaquin Quiñonero-Candela et al. *Dataset shift in machine learning*. Tech. rep. MIT Press, 2009.
* <span id="ref-4"></span>[[4](#ref-4)] Vladimir Vapnik. *Statistical Learning Theory*. Wiley, 1998.
