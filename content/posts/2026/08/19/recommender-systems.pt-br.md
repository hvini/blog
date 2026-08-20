---
title: "Sistemas de Recomendação: Descobrindo qual Odisseia ler"
date: 2026-08-19T21:00:00-03:00
draft: false
math: true
tags: ["recommender-systems", "machine-learning", "odyssey"]
---

![Odisseia](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/recommender-systems/Odysseus_from_Schwab_book_1.jpg)

### Introdução

Apesar de algumas críticas em relação à releitura da Odisseia de Homero feita por Christopher Nolan, é indiscutível que o filme tem o potencial de despertar a curiosidade do público em ir atrás da obra original, especialmente por parte daqueles que talvez não conhecessem a história a fundo (incluindo eu). A Odisseia é um épico que possui inúmeras traduções, adaptações e releituras, abrangendo desde versões mais fiéis em verso e prosa, até quadrinhos e livros voltados para jovens leitores. Diante de tantas opções, a pergunta que surge é: qual versão do livro devo ler?

Os sistemas de recomendação são uma aplicação prática do aprendizado de máquina (machine learning), uma subárea da Inteligência Artificial. O objetivo principal desses sistemas é prever as preferências ou avaliações de um usuário sobre um determinado item, seja ele um produto, um filme ou uma música. Convivemos diariamente com essa tecnologia ao usar as recomendações de filmes da Netflix, as playlists do Spotify ou as sugestões de compras da Amazon.

Aproveitando este momento oportuno, decidi explorar os conceitos por trás desses algoritmos, entender como eles funcionam na prática e, de quebra, construir um sistema para me ajudar a descobrir qual versão da Odisseia é a mais indicada para mim.

### O Dataset: Analisando as Versões da Odisseia

Para este projeto, foi criada uma base de dados contendo 7 versões diferentes da Odisseia. A lista inclui traduções consagradas em verso (como as de Emily Wilson, Robert Fagles e Richmond Lattimore), adaptações gráficas (Gareth Hinds) e releituras modernas (como "Circe", de Madeline Miller). 

Cada obra foi classificada com notas de 1 a 5 em quatro características principais: **modernidade**, **dificuldade**, **fidelidade** e **acessibilidade**. 

Aqui está uma amostra da base de livros (`odyssey_annotated.csv`):

| id | translator | format | modernity | difficulty | fidelity | accessibility |
|---|---|---|---|---|---|---|
| 1 | Emily Wilson | verse | 5 | 2 | 5 | 5 |
| 2 | Robert Fagles | verse | 3 | 3 | 5 | 4 |
| 5 | Richmond Lattimore | verse | 1 | 5 | 5 | 2 |
| 7 | Gareth Hinds | graphic_novel | 5 | 1 | 4 | 5 |

Além disso, uma tabela com avaliações fictícias de usuários foi simulada, dando notas de 1 a 5 estrelas para os livros que já leram (`user_ratings.csv`):

| user_id | item_id | rating |
|---|---|---|
| 1 | 1 | 5 |
| 1 | 2 | 5 |
| 1 | 5 | 1 |
| 2 | 1 | 5 |
| 2 | 6 | 5 |

### A Engenharia por Trás das Recomendações

#### 1. Recomendação por Popularidade

**O que é?**
Este é o método mais simples e direto, atuando como uma excelente base de comparação (*baseline*). O algoritmo simplesmente recomenda os itens com a maior média de avaliações gerais, descartando os que possuem poucas avaliações. Por exemplo, se a média do item 1 for 4.66, e do item 5 for 2.1, o item 1 fica no topo da recomendação para todos.

**Prós:**
- Fácil de implementar, entender e auditar.
- Ótimo para lidar com o *cold start* (quando um usuário novo entra no sistema e ainda não temos dados sobre suas preferências, recomendamos o que é mais popular).

**Contras:**
- Nenhuma personalização. Todos os usuários recebem exatamente a mesma recomendação.
- Tendência de reforçar o viés de popularidade, escondendo itens excelentes porém de nicho (a "cauda longa").

#### 2. Filtragem Baseada em Conteúdo

**O que é?**
A filtragem baseada em conteúdo analisa os atributos dos itens e os compara com o perfil ideal de busca. O usuário define o que deseja, gerando um vetor de preferências. 

Para encontrar o livro ideal, utiliza-se um cálculo matemático chamado **similaridade de cosseno** (*Cosine Similarity*). Ele mede o cosseno do ângulo entre dois vetores no espaço multidimensional. Quanto menor o ângulo (cosseno mais próximo de 1), mais similares eles são. A fórmula matemática é:

$$ \text{similaridade} = \cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} $$

**Exemplo prático de cálculo:**
Imagine a busca por algo muito moderno (5), fácil (1), medianamente fiel (3) e muito acessível (5). O vetor gerado será: $U = [5, 1, 3, 5]$.
Pode-se compará-lo com as características de dois livros da tabela:
- **Emily Wilson (Item 1)**: $I_1 = [5, 2, 5, 5]$
- **Richmond Lattimore (Item 5)**: $I_5 = [1, 5, 5, 2]$

Primeiro, calcula-se o produto escalar $U \cdot I_1$: $(5\times5) + (1\times2) + (3\times5) + (5\times5) = 25 + 2 + 15 + 25 = 67$.
Em seguida, as normas dos vetores:
Norma de $U$: $\sqrt{5^2 + 1^2 + 3^2 + 5^2} = \sqrt{60} \approx 7.74$
Norma de $I_1$: $\sqrt{5^2 + 2^2 + 5^2 + 5^2} = \sqrt{79} \approx 8.88$
Similaridade com $I_1$: $67 / (7.74 \times 8.88) \approx \mathbf{0.974}$

Repetindo para Lattimore:
Produto escalar $U \cdot I_5$: $(5\times1) + (1\times5) + (3\times5) + (5\times2) = 5 + 5 + 15 + 10 = 35$.
Norma de $I_5$: $\sqrt{1^2 + 5^2 + 5^2 + 2^2} = \sqrt{55} \approx 7.41$
Similaridade com $I_5$: $35 / (7.74 \times 7.41) \approx \mathbf{0.610}$

O sistema concluirá que a obra de Emily Wilson ($0.974$) está muito mais alinhada à busca do que a de Lattimore ($0.610$).

**Pesos:** Um refinamento dessa técnica é a aplicação de pesos. Imagine que a fidelidade seja considerada 5 vezes mais importante que a modernidade. Pode-se multiplicar a nota de fidelidade por 5 no momento do cálculo, "esticando" esse eixo no espaço vetorial e forçando o sistema a priorizar livros que atendam fortemente a esse requisito.

**Prós:**
- Altamente personalizado aos gostos declarados do usuário.
- Não depende de avaliações de outros usuários (resolve o *cold start* para livros recém-lançados).

**Contras:**
- Depende de uma engenharia de atributos muito bem feita e classificada de forma rigorosa.
- Tende a recomendar sempre "mais do mesmo", não surpreendendo o usuário.

#### 3. Filtragem Colaborativa (O Comportamento do Usuário)

**O que é?**
Ao invés de analisar as características dos livros, este método analisa o comportamento dos usuários. A ideia central é simples: se dois usuários concordaram nas avaliações no passado, é altamente provável que concordem no futuro. Transforma-se a tabela de avaliações em uma **matriz Usuário-Item**:

| Usuário | Item 1 | Item 2 | Item 3 | Item 5 | Item 6 |
|---|---|---|---|---|---|
| User 1 | 5 | 5 | ? | 1 | 4 |
| User 2 | 5 | ? | ? | 1 | 5 |
| User 4 | ? | ? | 5 | 5 | ? |

O objetivo principal aqui é gerar uma lista de **recomendações**: encontrar "vizinhos" com gostos semelhantes (como o *User 1* e o *User 2* na tabela acima) e sugerir ao usuário alvo os itens que os seus vizinhos já leram e avaliaram positivamente.

**O impacto dos itens não avaliados:**
Na matriz, os itens não avaliados (`?`) costumam ser preenchidos com zeros para que o cálculo vetorial completo seja possível. Contudo, na similaridade de cosseno tradicional, esse zero seria interpretado como uma "nota zero", puxando drasticamente o grau de similaridade para baixo entre usuários que apenas leram livros diferentes, mesmo que possuam o mesmo padrão de gosto.

Para superar essa limitação, utiliza-se a centralização pela média (*mean-centered cosine similarity*):
1. Calcula-se a média das notas considerando apenas os **itens avaliados** para cada usuário individualmente.
2. Para cada **item avaliado**, subtrai-se a respectiva média do valor original da nota.
3. Calcula-se a similaridade de cosseno entre os usuários com base nos vetores centralizados apenas desses **itens avaliados**.

Com isso, a avaliação passa a refletir o quanto o usuário gostou do livro acima ou abaixo do seu próprio padrão de notas. Após definir os vizinhos mais similares ($N$), o sistema varre o catálogo em busca de obras que os vizinhos leram e o usuário alvo não. O algoritmo gera um *Score de Recomendação* ponderado pela similaridade dos vizinhos para classificar e sugerir as melhores obras.

**Prós:**
- Não precisa de nenhum conhecimento prévio sobre o conteúdo dos itens (dispensa a criação de atributos como "modernidade").
- Consegue descobrir nichos e gerar surpresas (*serendipidade*), encontrando padrões ocultos nos gostos.

**Contras:**
- Novamente, o *cold start*: se um usuário acabou de criar a conta, ou um livro acabou de ser lançado (nenhuma avaliação), o sistema não sabe o que recomendar.
- Esparsidade: se a matriz for gigante e majoritariamente vazia (cada usuário leu muito poucos livros num catálogo de milhões), fica muito difícil encontrar vizinhos consistentes.

#### 4. A Abordagem Híbrida (IA e Semântica Textual)

**O que é?**
Uma abordagem mais robusta visa justamente combinar estratégias diferentes. Neste projeto, foi construído um sistema híbrido que mescla dados estruturados (as notas manuais de características) com **embeddings de texto** gerados por Inteligência Artificial.

Utiliza-se um modelo de processamento de linguagem natural (*SentenceTransformers*) para transformar a descrição textual de cada livro (a sinopse ou notas sobre a tradução) em um vetor complexo que captura o sentido e o contexto da obra. Em seguida, calcula-se a similaridade de cosseno entre uma busca escrita livremente pelo usuário (ex: *"Quero uma tradução contemporânea focada no drama"*) e as descrições dos livros. 

A pontuação final é uma média ponderada das duas partes:

$$ \text{Score Híbrido} = (\text{Score Estruturado} \times 0.5) + (\text{Score Semântico} \times 0.5) $$

**Prós:**
- Reúne o melhor dos dois mundos, mitigando as fraquezas de abordagens individuais.
- Permite uma interação muito mais orgânica do usuário utilizando linguagem natural.

**Contras:**
- Muito mais complexo de implementar, calibrar (qual o peso ideal de cada modelo?) e colocar em produção.
- Requer maior poder computacional, especialmente para processar *embeddings* de frases em tempo real.

### Conclusão

A jornada para descobrir qual versão da *Odisseia* ler serve como um excelente pano de fundo para desmistificar os sistemas de recomendação. Como visto, não existe um algoritmo "perfeito" para todos os casos. Enquanto a recomendação por popularidade garante um caminho seguro, a filtragem baseada em conteúdo oferece controle preciso sobre as características desejadas. Já a filtragem colaborativa surpreende ao encontrar conexões humanas ocultas nos padrões de avaliação, e a abordagem híbrida eleva a precisão ao integrar Inteligência Artificial para interpretar a linguagem natural.

Na prática, a escolha do modelo ideal depende fundamentalmente da maturidade do sistema, da quantidade de dados disponíveis e do objetivo do projeto. Muitas vezes, a melhor solução é iniciar com algoritmos simples e bem consolidados para superar o problema do *cold start* e, gradativamente, evoluir para arquiteturas híbridas à medida que a base de usuários cresce.

Ao final, seja optando por uma tradução densa e literal ou por uma releitura moderna, a verdadeira magia da recomendação está em conectar a obra certa à pessoa certa, transformando dados brutos em descobertas valiosas.
