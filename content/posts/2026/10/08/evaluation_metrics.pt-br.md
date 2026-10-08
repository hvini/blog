---
title: "Métricas de Avaliação: Medindo os Acertos de um Modelo de Machine Learning"
date: 2026-10-08T13:00:00-03:00
draft: false
math: true
tags: ["machine-learning"]
components:
    - type: classification_metrics
---

Um modelo de machine learning só é útil se tiver um bom desempenho na tarefa que foi projetado para resolver. Mas o que *ter um bom desempenho* realmente significa?

Um modelo produz previsões. Para avaliar essas previsões, precisamos de uma maneira de compará-las com algo significativo. É aqui que entram as **métricas de avaliação**.

No post [Minimização de Risco Empírico e Deslocamento de Distribuição](/posts/2026/02/02/empirical-risk-minimization-and-distribution-shift), introduzi a ideia de medir o erro de previsão. Vimos que o **risco verdadeiro** (true risk) de um modelo pode ser escrito como a perda esperada sobre a distribuição de dados:

$$
R(h)=\mathbb{E}_{(x,y)\sim\mathcal{P}}[L(y,h(x))]
$$

onde $h$ é o modelo, $\mathcal{P}$ é a distribuição dos dados e $L$ é uma função de perda (loss function) que mede quão ruim é uma previsão.

Na prática, não temos acesso a toda a distribuição de dados. Em vez disso, trabalhamos com um conjunto de dados finito e estimamos o risco usando o **risco empírico**:

$$
\hat{R}(h) = \frac{1}{n}\sum_{i=1}^{n}L(f(x_i),y_i)
$$

As métricas de avaliação são, de muitas maneiras, formas práticas de responder à pergunta por trás dessas equações:

> Quão bem este modelo se sai no problema com o qual realmente nos importamos?

A parte importante é que não existe uma única métrica que seja sempre apropriada. A métrica certa depende da tarefa, dos dados e o mais importante, de quais tipos de erros importam na aplicação.

## Por que a avaliação é mais difícil do que parece

Considere um problema de classificação binária onde um modelo prevê se uma imagem contém um determinado objeto.

Suponha que o conjunto de dados de avaliação contenha 1.000 imagens, mas apenas uma delas contenha o objeto.

Um modelo que prevê **"sem objeto" para todas as imagens** estará correto em 999 dos 1.000 exemplos.

Sua acurácia é:

$$
\text{Acurácia} = \frac{999}{1000} = 99.9\%
$$

Isso parece excelente.

Mas se o propósito do modelo é encontrar o objeto, o modelo falhou completamente: ele nunca detecta o único exemplo positivo.

Este é um exemplo de por que **um valor alto de métrica não significa necessariamente que um modelo é útil**.

Em um exemplo ainda mais extremo, imagine um conjunto de dados onde nenhum dos exemplos de avaliação contém o objeto. Um modelo que sempre prevê "sem objeto" alcançaria 100% de acurácia.

É possível, portanto, que um modelo alcance **100% de acurácia e ainda assim seja 100% um fracasso para a tarefa**.

A métrica não está errada. A acurácia está medindo corretamente a proporção de previsões corretas. O problema é que a acurácia não captura tudo com o que nos importamos.

É por isso que a avaliação de modelos requer mais do que simplesmente procurar o maior número.

## Dados de Referência (Ground truth)

A maioria das avaliações supervisionadas começa com **dados de referência** (ground truth): exemplos para os quais sabemos a resposta correta.

Para um problema de classificação, isso pode significar imagens anotadas com sua classe correta. Para regressão, pode significar medições com valores-alvo conhecidos.

Podemos então comparar as previsões do modelo com esses valores de referência.

Por exemplo:

| Exemplo | Ground truth (Real) | Previsão | Correto? |
| --- | --- | --- | --- |
| 1 | Gato | Gato | Sim |
| 2 | Cachorro | Gato | Não |
| 3 | Gato | Gato | Sim |
| 4 | Cachorro | Cachorro | Sim |

Sem os dados de referência, geralmente não podemos medir diretamente se uma previsão individual está correta.

Criar dados de referência pode, portanto, ser uma das partes mais caras de um projeto de machine learning. Pode exigir que humanos anotem imagens, classifiquem documentos, transcrevam áudio, verifiquem medições ou forneçam as respostas esperadas de alguma outra forma.

Ainda assim, dados de referência não necessariamente são perfeitos. Diferentes anotadores podem discordar, rótulos podem conter erros e alguns problemas podem não ter uma única resposta objetivamente correta.

## Quando não há dados de referência

Nem todo problema de machine learning tem dados de avaliação rotulados.

Isso é comum no **aprendizado não supervisionado**, como clusterização (agrupamento). Se pedirmos a um algoritmo para dividir clientes em grupos, pode não haver um agrupamento "correto" predefinido para comparação.

Nesses casos, outras métricas às vezes podem ajudar. Para clusterização, por exemplo, medidas como o *silhouette score* (coeficiente de silhueta) podem descrever as propriedades dos clusters resultantes.

Mas essas métricas respondem a uma pergunta um tanto diferente. Elas podem nos dizer se os clusters são compactos ou bem separados, mas não podem necessariamente nos dizer se os clusters são **úteis para o negócio ou problema científico**.

Neste caso, a avaliação pode exigir conhecimento do domínio e inspeção qualitativa.

Um algoritmo de clusterização pode produzir grupos matematicamente bem separados que não têm interpretação útil. Por outro lado, grupos que se sobrepõem um pouco ainda podem corresponder a categorias significativas para um especialista no domínio.

Isso nos leva a um princípio importante:

> **Uma métrica mede uma propriedade de um modelo. Ela não mede automaticamente se o modelo é útil.**

As métricas devem apoiar a avaliação, não substituir a compreensão do problema.

## Classificação

Modelos de classificação preveem categorias discretas.

Por exemplo:

- Este e-mail é spam ou não?
- Esta imagem é de um gato, cachorro ou pássaro?
- Esta transação é fraudulenta?
- A qual categoria este documento pertence?

Diferentes métricas de classificação enfatizam diferentes tipos de erros.

### Matriz de confusão

Antes de apresentar as métricas individuais, é útil olhar para a **matriz de confusão**.

Para classificação binária, as previsões podem ser divididas em quatro grupos:

| | Previsto Positivo | Previsto Negativo |
| --- | ---: | ---: |
| **Real Positivo** | Verdadeiro Positivo (TP) | Falso Negativo (FN) |
| **Real Negativo** | Falso Positivo (FP) | Verdadeiro Negativo (TN) |

Essas quatro quantidades formam a base para muitas métricas de classificação.

**Verdadeiro positivo (TP)**: O modelo prevê como positivo, e o exemplo é realmente positivo. (ex: Prever que uma imagem contém um tumor, e ela realmente contém.)

**Falso positivo (FP)**: O modelo prevê como positivo, mas o exemplo é na verdade negativo. (ex: Prever um tumor onde não há nenhum, um alarme falso.)

**Verdadeiro negativo (TN)**: O modelo prevê como negativo, e o exemplo é realmente negativo.

**Falso negativo (FN)**: O modelo prevê como negativo, mas o exemplo é na verdade positivo. (ex: Deixar passar um tumor real.)

A matriz de confusão torna essas diferenças visíveis.

### Acurácia

A **Acurácia** mede a fração das previsões que estão corretas:

$$
\text{Acurácia} =
\frac{TP + TN}
{TP + TN + FP + FN}
$$

A acurácia é intuitiva e útil quando as classes são razoavelmente balanceadas e os custos dos diferentes erros são semelhantes.

No entanto, a acurácia pode ser enganosa quando as classes são altamente desbalanceadas.

Suponha que 99% das transações sejam legítimas e apenas 1% seja fraudulenta. Um modelo que prevê todas as transações como legítimas alcança 99% de acurácia, mas não detecta nenhuma fraude.

A acurácia responde:

> Com que frequência o modelo acerta?

Ela não responde:

> Quão bem o modelo encontra os casos que importam?

### Precisão

A **Precisão** mede quantos dos exemplos previstos como positivos são realmente positivos:

$$
\text{Precisão} =
\frac{TP}{TP + FP}
$$

Uma alta precisão significa que, quando o modelo diz "positivo", ele geralmente está correto.

Por exemplo, imagine um sistema que sinaliza transações como potencialmente fraudulentas. Se quisermos evitar sobrecarregar os investigadores com alarmes falsos, a precisão se torna importante.

A precisão responde:

> Quando o modelo prevê como positivo, com que frequência ele acerta?

### Recall (Revocação)

O **Recall** (também chamado de revocação, sensibilidade ou taxa de verdadeiros positivos) mede quantos dos exemplos reais positivos o modelo encontra com sucesso:

$$
\text{Recall} =
\frac{TP}{TP + FN}
$$

Um alto recall significa que o modelo deixa passar relativamente poucos exemplos positivos.

Por exemplo, em uma aplicação de triagem médica, não detectar um caso positivo real pode ser muito mais problemático do que investigar alguns falsos positivos adicionais.

O recall responde:

> De todos os casos reais positivos, quantos o modelo encontrou?

Portanto, precisão e recall descrevem dois aspectos diferentes das previsões positivas.

Aumentar o limiar (threshold) de decisão geralmente torna um classificador mais conservador: ele pode produzir menos previsões positivas, o que pode aumentar a precisão e, ao mesmo tempo, reduzir o recall. Diminuir o limiar pode ter o efeito oposto.

### F1 score (Pontuação F1)

Às vezes, queremos uma única métrica que combine precisão e recall.

O **F1 score** é a média harmônica deles:

$$
F_1 =
2\frac{\text{Precisão}\cdot\text{Recall}}
{\text{Precisão}+\text{Recall}}
$$

A média harmônica é útil aqui porque uma precisão ou um recall muito baixos puxarão o F1 score para baixo.

Por exemplo, um modelo com precisão de 1,0 e recall de 0,01 não recebe um F1 score próximo a 1. Em vez disso:

$$
F_1 \approx 0.0198
$$

Isso reflete o fato de que o modelo está tendo um bom desempenho em uma dimensão, mas ruim na outra.

O F1 score é particularmente útil quando tanto os falsos positivos quanto os falsos negativos importam e queremos um único número resumido.

No entanto, ainda é um resumo. Olhar para a precisão e o recall separadamente pode fornecer mais informações sobre o que o modelo realmente está fazendo.

### Curva ROC e AUC

Muitos classificadores não produzem diretamente apenas "positivo" ou "negativo". Em vez disso, eles produzem uma pontuação ou probabilidade, como:

$$
P(Y=1\mid X)
$$

Podemos então escolher um limiar (threshold) para transformar essa pontuação em uma classificação.

Mudar o limiar altera o *trade-off* (compromisso) entre verdadeiros positivos e falsos positivos.

A **curva ROC (Receiver Operating Characteristic)** mostra esse *trade-off* traçando a taxa de verdadeiros positivos contra a taxa de falsos positivos em diferentes limiares.

A **Área sob a Curva ROC (AUC - Area Under the Curve)** resume a área abaixo dessa curva.

Uma AUC de 1,0 representa um ranqueamento perfeito, enquanto uma AUC em torno de 0,5 corresponde a um desempenho semelhante ao ranqueamento aleatório na configuração usual de classificação binária.

Uma interpretação útil da ROC AUC é que ela mede quão bem o modelo tende a classificar (ranquear) exemplos positivos acima dos negativos.

No entanto, a AUC não deve ser tratada automaticamente como a melhor métrica de classificação. Em problemas altamente desbalanceados, por exemplo, as curvas de precisão-recall (Precision-Recall curves) podem fornecer uma visão mais informativa do desempenho.

A questão importante permanece:

> **Qual comportamento importa para a aplicação?**

## Regressão

A classificação prevê categorias. A **Regressão** prevê valores numéricos.

Exemplos incluem:

- prever preços de casas;
- estimar a temperatura;
- prever a demanda;
- prever a medição de um paciente;
- estimar o tempo necessário para concluir uma tarefa.

As métricas de regressão medem a diferença entre o valor previsto $\hat{y}$ e o valor observado $y$.

### Erro Quadrático Médio (MSE)

O **Erro Quadrático Médio (MSE - Mean Squared Error)** é a média dos erros elevados ao quadrado:

$$
\text{MSE} =
\frac{1}{n}
\sum_{i=1}^{n}(y_i-\hat{y}_i)^2
$$

Como os erros são elevados ao quadrado, erros grandes recebem um peso desproporcionalmente maior.

Por exemplo, um erro de 10 contribui com 100 para o erro quadrático, enquanto um erro de 2 contribui com apenas 4.

Isso torna o MSE útil quando erros grandes devem ser fortemente penalizados.

Uma consequência é que o MSE é sensível a *outliers* (valores atípicos). Um pequeno número de erros muito grandes pode ter uma influência substancial na métrica.

### Raiz do Erro Quadrático Médio (RMSE)

A **Raiz do Erro Quadrático Médio (RMSE - Root Mean Squared Error)** é simplesmente a raiz quadrada do MSE:

$$
\text{RMSE} =
\sqrt{
\frac{1}{n}
\sum_{i=1}^{n}(y_i-\hat{y}_i)^2
}
$$

Tirar a raiz quadrada retorna a métrica para as mesmas unidades da variável-alvo.

Se estivermos prevendo preços de casas em reais, por exemplo, o RMSE também é expresso em reais.

O RMSE ainda penaliza erros grandes de forma mais forte do que erros pequenos, mas muitas vezes é mais fácil de interpretar do que o MSE porque é expresso na unidade original.

### Erro Absoluto Médio (MAE)

O **Erro Absoluto Médio (MAE - Mean Absolute Error)** mede a diferença absoluta média entre as previsões e os valores reais:

$$
\text{MAE} =
\frac{1}{n}
\sum_{i=1}^{n}|y_i-\hat{y}_i|
$$

Ao contrário do MSE, o MAE não eleva os erros ao quadrado.

Um erro de 10 contribui com 10, enquanto um erro de 2 contribui com 2.

Como resultado, o MAE é menos sensível a grandes *outliers* do que o MSE e o RMSE.

O MAE responde a uma pergunta relativamente intuitiva:

> Em média, a que distância as previsões estão dos valores reais?

### R²

O **coeficiente de determinação**, geralmente escrito como $R^2$, compara o modelo com uma linha de base (baseline) simples que sempre prevê a média dos valores-alvo:

$$
R^2 =
1 -
\frac{\sum_i(y_i-\hat{y}_i)^2}
{\sum_i(y_i-\bar{y})^2}
$$

onde $\bar{y}$ é a média dos valores-alvo observados.

Um $R^2$ de 1 significa que as previsões correspondem perfeitamente às observações.

Um $R^2$ de 0 significa que o modelo tem um desempenho, em termos de erro quadrático, igual à linha de base que sempre prevê a média.

O que é importante notar é que o $R^2$ também pode ser negativo. Isso pode acontecer quando o modelo tem um desempenho pior do que essa linha de base nos dados avaliados.

Ao contrário do MAE e do RMSE, o $R^2$ não é expresso nas unidades da variável-alvo. Portanto, muitas vezes é útil relatá-lo junto com uma métrica de erro, como MAE ou RMSE.

## Escolhendo uma métrica

Não existe uma métrica de avaliação universalmente melhor.

A escolha apropriada depende do que o modelo deve realizar e de quais erros são importantes.

Para classificação, podemos nos perguntar:

- As classes estão balanceadas?
- Falsos positivos são custosos?
- Falsos negativos são custosos?
- Nos importamos em encontrar o maior número possível de exemplos positivos?
- Precisamos de um bom ranqueamento em vez de um limiar de classificação específico?

Para regressão, podemos nos perguntar:

- Erros grandes devem ser fortemente penalizados?
- Outliers (valores atípicos) são significativos ou deveriam ter menos influência?
- Queremos um erro expresso nas unidades originais?
- A comparação com uma linha de base simples é útil?

Uma boa avaliação geralmente não depende de um único número.

Por exemplo, um experimento de classificação pode relatar acurácia, precisão, recall, F1, uma matriz de confusão e ROC AUC. Um experimento de regressão pode relatar MAE, RMSE e $R^2$.

Observar várias métricas ajuda a revelar diferentes modos de falha.

## A avaliação faz parte da definição do problema

A avaliação não deve ser um pensamento tardio.

A métrica que escolhemos influencia como entendemos se um modelo é bem-sucedido. Mais importante, ela pode influenciar como os modelos são selecionados, ajustados e implantados.

Se otimizarmos a métrica errada, podemos construir um modelo que é excelente de acordo com nosso procedimento de avaliação, mas ruim na tarefa real.

Isso está intimamente relacionado à distinção entre **risco verdadeiro** e **risco empírico**.

A métrica empírica calculada em nosso conjunto de dados de avaliação é apenas uma estimativa de como o modelo se comporta na distribuição de dados mais ampla. Se o conjunto de dados de avaliação não for representativo, o número pode ser enganoso.

Isso é especialmente importante quando a distribuição de dados muda.

Um modelo pode obter excelentes resultados em dados históricos, mas ter um desempenho ruim após a implantação porque as entradas do mundo real são diferentes. Este é um dos problemas discutidos no post anterior sobre minimização de risco empírico e deslocamento de distribuição.

Portanto, uma avaliação significativa requer mais do que escolher uma fórmula.

Precisamos considerar:

1. **A tarefa** — O que estamos realmente tentando prever?
2. **Os dados** — O conjunto de dados de avaliação representa os dados que o modelo encontrará?
3. **Os dados de referência (ground truth)** — Quão confiáveis são os rótulos ou medições?
4. **Os erros** — Quais erros importam mais?
5. **A métrica** — Ela captura o comportamento com o qual nos importamos?
6. **O domínio** — Um bom valor de métrica corresponde a um resultado útil no mundo real?

Para finalizar, as métricas de avaliação são ferramentas para medir o comportamento do modelo. Elas transformam previsões e observações em quantidades que podemos comparar, analisar e rastrear.

Mas uma métrica só é útil quando mede algo que importa.

Um modelo não se torna bom porque tem uma alta acurácia, um baixo RMSE ou uma grande AUC. Ele se torna útil quando suas previsões são suficientemente confiáveis **para o problema a ser resolvido**.