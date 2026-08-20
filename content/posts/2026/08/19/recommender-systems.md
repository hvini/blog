---
title: "Recommender Systems: Discovering which Odyssey to read"
date: 2026-08-19T21:00:00-03:00
draft: false
math: true
tags: ["recommender-systems", "machine-learning", "odyssey"]
---

![Odyssey](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/recommender-systems/Odysseus_from_Schwab_book_1.jpg)

### Introduction

Despite some criticisms regarding Christopher Nolan's retelling of Homer's *Odyssey*, it is undeniable that the film has the potential to spark public curiosity to seek out the original work, especially among those who might not know the story in depth (including me). The *Odyssey* is an epic that has countless translations, adaptations, and retellings, ranging from more faithful versions in verse and prose to graphic novels and books aimed at young readers. Given so many options, the question arises: which version of the book should I read?

Recommender systems are a practical application of machine learning, a subfield of Artificial Intelligence. The main goal of these systems is to predict a user's preferences or ratings for a given item, be it a product, a movie, or a song. We interact with this technology daily when using Netflix's movie recommendations, Spotify's playlists, or Amazon's shopping suggestions.

Taking advantage of this timely moment, the decision was made to explore the concepts behind these algorithms, understand how they work in practice, and, as a bonus, build a system to help discover which version of the *Odyssey* is the most suitable for me.

### The Dataset: Analyzing the Odyssey Versions

For this project, a database was created containing 7 different versions of the *Odyssey*. The list includes acclaimed verse translations (such as those by Emily Wilson, Robert Fagles, and Richmond Lattimore), graphic adaptations (Gareth Hinds), and modern retellings (like "Circe" by Madeline Miller).

Each work was rated on a scale of 1 to 5 across four main characteristics: **modernity**, **difficulty**, **fidelity**, and **accessibility**.

Here is a sample of the book database (`odyssey_annotated.csv`):

| id | translator | format | modernity | difficulty | fidelity | accessibility |
|---|---|---|---|---|---|---|
| 1 | Emily Wilson | verse | 5 | 2 | 5 | 5 |
| 2 | Robert Fagles | verse | 3 | 3 | 5 | 4 |
| 5 | Richmond Lattimore | verse | 1 | 5 | 5 | 2 |
| 7 | Gareth Hinds | graphic_novel | 5 | 1 | 4 | 5 |

Additionally, a table with fictional user ratings was simulated, assigning 1 to 5 stars to the books they have already read (`user_ratings.csv`):

| user_id | item_id | rating |
|---|---|---|
| 1 | 1 | 5 |
| 1 | 2 | 5 |
| 1 | 5 | 1 |
| 2 | 1 | 5 |
| 2 | 6 | 5 |

### The Engineering Behind the Recommendations

#### 1. Popularity-Based Recommendation

**What is it?**
This is the simplest and most straightforward method, acting as an excellent baseline. The algorithm simply recommends the items with the highest overall average ratings, discarding those with few reviews. For example, if the average for item 1 is 4.66 and for item 5 is 2.1, item 1 sits at the top of the recommendation list for everyone.

**Pros:**
- Easy to implement, understand, and audit.
- Great for handling the *cold start* problem (when a new user enters the system and there is no data on their preferences yet, the most popular items are recommended).

**Cons:**
- No personalization. All users receive exactly the same recommendations.
- Tendency to reinforce popularity bias, hiding excellent but niche items (the "long tail").

#### 2. Content-Based Filtering

**What is it?**
Content-based filtering analyzes the attributes of the items and compares them with the ideal search profile. The user defines what they want, generating a preference vector.

To find the ideal book, a mathematical calculation called **cosine similarity** is used. It measures the cosine of the angle between two vectors in a multidimensional space. The smaller the angle (cosine closer to 1), the more similar they are. The mathematical formula is:

$$ \text{similarity} = \cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} $$

**Practical calculation example:**
Imagine a search for something very modern (5), easy (1), moderately faithful (3), and very accessible (5). The generated vector will be: $U = [5, 1, 3, 5]$.
This can be compared with the characteristics of two books from the table:
- **Emily Wilson (Item 1)**: $I_1 = [5, 2, 5, 5]$
- **Richmond Lattimore (Item 5)**: $I_5 = [1, 5, 5, 2]$

First, the dot product $U \cdot I_1$ is calculated: $(5\times5) + (1\times2) + (3\times5) + (5\times5) = 25 + 2 + 15 + 25 = 67$.
Next, the norms (lengths) of the vectors:
Norm of $U$: $\sqrt{5^2 + 1^2 + 3^2 + 5^2} = \sqrt{60} \approx 7.74$
Norm of $I_1$: $\sqrt{5^2 + 2^2 + 5^2 + 5^2} = \sqrt{79} \approx 8.88$
Similarity with $I_1$: $67 / (7.74 \times 8.88) \approx \mathbf{0.974}$

Repeating for Lattimore:
Dot product $U \cdot I_5$: $(5\times1) + (1\times5) + (3\times5) + (5\times2) = 5 + 5 + 15 + 10 = 35$.
Norm of $I_5$: $\sqrt{1^2 + 5^2 + 5^2 + 2^2} = \sqrt{55} \approx 7.41$
Similarity with $I_5$: $35 / (7.74 \times 7.41) \approx \mathbf{0.610}$

The system will conclude that Emily Wilson's work ($0.974$) is much more aligned with the search than Lattimore's ($0.610$).

**Weights:** A refinement of this technique is the application of weights. Imagine that fidelity is considered 5 times more important than modernity. The fidelity score can be multiplied by 5 at the time of calculation, "stretching" that axis in the vector space and forcing the system to prioritize books that strongly meet that requirement.

**Pros:**
- Highly personalized to the user's declared tastes.
- Does not depend on ratings from other users (resolves the *cold start* for newly released books).

**Cons:**
- Depends on feature engineering that is very well executed and rigorously classified.
- Tends to always recommend "more of the same", failing to surprise the user.

#### 3. Collaborative Filtering (User Behavior)

**What is it?**
Instead of analyzing the characteristics of the books, this method analyzes the behavior of the users. The core idea is simple: if two users agreed on their ratings in the past, it is highly likely they will agree in the future. The ratings table is transformed into a **User-Item matrix**:

| User | Item 1 | Item 2 | Item 3 | Item 5 | Item 6 |
|---|---|---|---|---|---|
| User 1 | 5 | 5 | ? | 1 | 4 |
| User 2 | 5 | ? | ? | 1 | 5 |
| User 4 | ? | ? | 5 | 5 | ? |

The main objective here is to generate a list of **recommendations**: finding "neighbors" with similar tastes (like *User 1* and *User 2* in the table above) and suggesting items to the target user that their neighbors have already read and rated positively.

**The impact of unrated items:**
In the matrix, unread items (`?`) are usually filled with zeros so that the full vector calculation is possible. However, in traditional cosine similarity, this zero would be interpreted as a "zero rating", drastically pulling the degree of similarity down between users who simply read different books, even if they have the same taste pattern.

To overcome this limitation, **mean-centered cosine similarity** is used:
1. The average of the ratings is calculated considering only the **rated items** for each user individually.
2. For each **rated item**, the respective average is subtracted from the original rating value.
3. The cosine similarity between users is calculated based on the centered vectors of only these **rated items**.

With this, the rating reflects how much the user liked the book above or below their own standard pattern. After defining the most similar neighbors ($N$), the system scans the catalog for works that the neighbors read and the target user did not. The algorithm generates a *Recommendation Score* weighted by the similarity of the neighbors to rank and suggest the best works.

**Pros:**
- Does not require any prior knowledge about the content of the items (eliminates the need to create attributes like "modernity").
- Can discover niches and generate surprises (*serendipity*), finding hidden patterns in tastes.

**Cons:**
- Again, the *cold start*: if a user just created an account, or a book was just released (no ratings), the system does not know what to recommend.
- Sparsity: if the matrix is huge and mostly empty (each user read very few books in a catalog of millions), it becomes very difficult to find consistent neighbors.

#### 4. The Hybrid Approach (AI and Textual Semantics)

**What is it?**
A more robust approach aims precisely at combining different strategies. In this project, a hybrid system was built that merges structured data (the manual attribute ratings) with **text embeddings** generated by Artificial Intelligence.

A natural language processing model (*SentenceTransformers*) is used to transform the textual description of each book (the synopsis or notes on the translation) into a complex vector that captures the meaning and context of the work. Then, the cosine similarity is calculated between a free-text search written by the user (e.g., *"I want a contemporary translation focused on drama"*) and the descriptions of the books.

The final score is a weighted average of the two parts:

$$ \text{Hybrid Score} = (\text{Structured Score} \times 0.5) + (\text{Semantic Score} \times 0.5) $$

**Pros:**
- Brings together the best of both worlds, mitigating the weaknesses of individual approaches.
- Allows for a much more organic interaction with the user using natural language.

**Cons:**
- Much more complex to implement, calibrate (what is the ideal weight for each model?), and put into production.
- Requires greater computational power, especially to process sentence *embeddings* in real-time.

### Conclusion

The journey to discover which version of the *Odyssey* to read serves as an excellent backdrop for demystifying recommender systems. As seen, there is no "perfect" algorithm for all cases. While popularity-based recommendation ensures a safe path, content-based filtering offers precise control over desired characteristics. Collaborative filtering, on the other hand, surprises by finding hidden human connections in rating patterns, and the hybrid approach elevates accuracy by integrating Artificial Intelligence to interpret natural language.

In practice, the choice of the ideal model depends fundamentally on the maturity of the system, the amount of available data, and the project's goal. Often, the best solution is to start with simple and well-established algorithms to overcome the *cold start* problem and gradually evolve towards hybrid architectures as the user base grows.

Ultimately, whether opting for a dense and literal translation or a modern retelling, the true magic of recommendation lies in connecting the right work to the right person, transforming raw data into valuable discoveries.
