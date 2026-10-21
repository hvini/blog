---
title: "Quebrando Criptografia Legada de Arquivos ZIP"
date: 2026-10-21T09:00:00-03:00
draft: false
math: false
tags: ["Security", "Legacy", "ZIP", "Reverse Engineering"]
---

***Arquivos ZIP protegidos por senhas estão realmente protegidos?***

### Introducão

Recentemente, estive diante de um desafio onde precisava converter alguns arquivos de telemetria em formato CSV. Uma tarefa trivial, não?  
Porém, ao olhar os arquivos, percebi que não seria resolvido apenas com um simples ***pd.read_csv()***.

Foi aí então que começou a minha saga para descobrir: que tipo de arquivo era aquele, de qual software vinha, se havia algum conversor disponibilizado pela comunidade e, caso contrário, quais seriam as minhas possibilidades.

Neste artigo, tanto o software quanto as extensões dos arquivos originais serão fictícios para não expor a ferramenta. O objetivo aqui é compartilhar o conhecimento básico sobre criptografias legadas em arquivos ZIP e como estruturei a resolução desse problema em etapas.

### A Saga

Inicialmente, fiz uma busca simples no navegador pelo nome da extensão do arquivo que eu queria converter, algo como: `".tmx filetype telemetry"`. Logo de início, descobri que o arquivo pertencia a um software proprietário, vamos chamá-lo de **Telemetrix Pro**, amplamente utilizado por profissionais da área. 

O software funciona sob um sistema de licença, então eu não teria a possibilidade de utilizá-lo apenas para exportar os arquivos. Além disso, a proposta era **automatizar o processo** via script, sem precisar de interações manuais com interfaces gráficas.

Nessa busca inicial, também descobri que a estrutura do arquivo se assemelhava muito à de um arquivo `.zip`. Foi então que iniciei a primeira tentativa de acesso. Ao tentar descompactá-lo, esbarrei na minha primeira limitação:

> *"Password Required: file.tmx is password-protected"*

Agora ferrou. *"O que eu faço?"*, pensei. O primeiro instinto foi chutar algumas senhas óbvias. O que eu perderia? Apenas tempo.

#### Força Bruta

Comecei criando um dicionário de senhas com base em todas as informações e contextos que eu tinha (nome da pasta, nome do projeto, datas, etc.). Após criar esse dicionário, escrevi um *loop* simples em Python para tentar descompactar o arquivo iterando sobre ele. Resultado? **Nada**. Todas as senhas falharam.

A próxima tentativa lógica foi testar uma ferramenta de *brute force* mais robusta do que o meu *script* caseiro. Recorri ao **John The Ripper**, uma famosa ferramenta de código aberto para auditoria e recuperação de senhas que roda *offline*. Instalei, configurei e deixei rodando por longos 40 minutos. Novamente, nada.

Nesse momento, percebi que o caminho não seria tão simples. Decidi retroceder e fazer o que deveria ter feito desde o início: **inspecionar o arquivo profundamente** antes de tentar bater de frente com a barreira da senha.

### A Vulnerabilidade

Usando o 7-Zip, inspecionei o arquivo via linha de comando com 7z l -slt file.tmx. O resultado foi interessante. A saída do terminal me retornou uma lista com metadados de todos os arquivos internos, semelhante a isso:

Folder = -  
Size = 20188  
Packed Size = 7912  
Modified = 2026-09-12 12:11:02  
Created =   
Accessed =   
Attributes = A  
Encrypted = +  
Comment =   
CRC =   
Method = ZipCrypto Deflate:Fastest  
Characteristics = Encrypt Descriptor  
Host OS = FAT  
Version = 20  
Volume Index = 0  
Offset = 0  

Nesse momento, surgiu a minha primeira grande oportunidade.

### ZipCrypto

Olhando para a linha Method retornada pelo 7-Zip, notei a string ***"ZipCrypto"***. Ao pesquisar sobre isso utilizando uma LLM para resumir o contexto, tive a seguinte confirmação:

> No contexto de computação, o ***ZipCrypto*** é o método de criptografia original e padrão usado para proteger arquivos .zip com senha. Foi criado na década de 1990 pelo programa PKZIP.
>
> ***O problema:*** Pelos padrões atuais de segurança, o ZipCrypto é considerado muito fraco e obsoleto. É vulnerável a ataques (como o ataque de "texto simples conhecido") e ferramentas de recuperação de senha conseguem quebrar a proteção de um arquivo ZipCrypto rapidamente.
>
> ***A solução:*** Hoje em dia, para proteger um arquivo ZIP com senha, a recomendação absoluta é usar o padrão ***AES-256***.

Aí estava o que eu procurava. Mas o que seria esse tal "Ataque de texto simples conhecido"?

De forma simplificada: se você conhece uma pequena fração (cerca de 13 a 40 bytes) do conteúdo não criptografado que está dentro do arquivo ZIP, é possível utilizar esse "texto conhecido" para deduzir as chaves de criptografia e desbloquear o arquivo inteiro. Essa falha fatal foi matematicamente provada e revelada pelos criptógrafos Eli Biham e Paul C. Kocher em 1994.

Nesse estudo, eles provaram que um invasor comum precisaria apenas de um trecho irrisório do arquivo original para calcular as chaves internas em questão de minutos (ou segundos) em um computador moderno. Foi essa descoberta que forçou a indústria a adotar, anos mais tarde, o padrão de criptografia militar ***AES-256***.

Com esse vetor de ataque em mente, fui em busca de ferramentas que explorassem a vulnerabilidade e esbarrei no ***BKCrack***.

### BKCrack

O [BKCrack](https://github.com/kimci86/bkcrack) é uma ferramenta de linha de comando open-source, desenvolvida por *kimci86*, projetada especificamente para quebrar a criptografia legada de arquivos ZIP implementando o ataque de Biham e Kocher (Known Plaintext Attack).

Instalei a ferramenta na minha máquina e comecei os testes. Como eu já possuía alguns arquivos de telemetria de exemplo (para saber o que esperar do formato final), abri eles em um editor hexadecimal para extrair os bytes do cabeçalho (nome das colunas). Com isso, gerei um arquivo que serviria como o meu texto conhecido.

Foi então que começaram as iterações:

1. ***Primeira tentativa:*** O ataque falhou. Retornando ao resultado do 7-Zip, observei que existiam múltiplos arquivos dentro do ZIP. O mais provável é que o arquivo específico que tentei atacar não compartilhasse os mesmos bytes de cabeçalho que eu havia deduzido.
2. ***Segunda tentativa:*** Notei que a maior parte dos arquivos internos compartilhava o exato mesmo checksum, com um tamanho de 9.824 bytes não comprimidos. Gerei um novo plaintext, mas ainda não foi suficiente para o algoritmo extrair as chaves.
3. ***Terceira tentativa:*** Foquei apenas no arquivo que era o "ponto fora da curva" entre os demais. Mapeei 28 bytes do seu cabeçalho. Novamente, sem sucesso.
4. ***Quarta tentativa (O Sucesso):*** Finalmente, prestando mais atenção na natureza dos dados, observei que algumas colunas eram padronizadas e preenchidas de forma idêntica. Havia uma seção contendo exatamente 98.240 bytes de zeros puros. Ao gerar o arquivo de texto conhecido com esses zeros e definir a compressão da ferramenta para o Nível 1, ***bingo!*** 

O BKCrack conseguiu derivar as três chaves internas com sucesso, que foram imediatamente utilizadas para descompactar o arquivo ZIP inteiro sem nunca precisarmos descobrir a senha original em texto plano.

"Seria esse o fim da saga?", pensei eu. Resposta: ***Não***.

### Pós-Exploração: Tratando os Dados Brutos

Após descompactar com sucesso, me deparei com dezenas de arquivos em um formato desconhecido, que pareciam representar cada uma das colunas de telemetria isoladas. A boa notícia? Não havia mais nenhuma camada de criptografia.

Analisando esses arquivos em um leitor hexadecimal (Hex Editor), notei que a estrutura dos dados era extremamente uniforme, indicando tratar-se de um array de dados numéricos em binário bruto. 

Fiz alguns testes rápidos de endianness, tipos de dados e pontos de precisão. Rapidamente cheguei à conclusão de que se tratavam de matrizes contínuas de pontos flutuantes de 64 bits (float64). 

Com o mistério finalmente desvendado, escrevi um script simples em Python usando a biblioteca struct e o pandas para ler esses binários, juntar todas as colunas e cuspir tudo no formato que eu desejava desde o início: ***um glorioso arquivo CSV***.

### Conclusão

Retomando a pergunta do início do artigo: ***Arquivos ZIP protegidos por senhas estão realmente protegidos?*** A resposta é: depende de quando e como foram criados.

Este desafio me trouxe duas lições fundamentais sobre segurança da informação:
1. ***Segurança por obscuridade não é segurança:*** Esconder um arquivo ZIP renomeando sua extensão para algo proprietário (como .tmx) apenas atrasa a análise, mas não impede a engenharia reversa.
2. ***Criptografia legada é uma porta aberta:*** O método ZipCrypto, embora exija uma senha, oferece uma falsa sensação de segurança. Se o invasor souber qualquer detalhe mínimo sobre o conteúdo do arquivo (mesmo que seja uma sequência de zeros), a proteção cai como um castelo de cartas.

Hoje, se você precisa trafegar ou armazenar dados sensíveis, certifique-se sempre de que a ferramenta de compactação está configurada para utilizar ***AES-256***. 

No fim das contas, a "tarefa trivial" de ler um CSV transformou-se em uma aula prática de criptografia clássica. Não foi o caminho mais fácil, mas a satisfação de ver os dados perfeitamente alinhados na tela depois de horas de investigação fez cada tentativa falha valer a pena.