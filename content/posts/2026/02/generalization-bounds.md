---
title: "Generalization Bounds: When Does Low Training Error Matter?"
date: 2026-02-11T09:00:00-03:00
draft: false
tags: ["Machine Learning", "Distribution Shift", "AI Theory"]
math: true
---

## 1 Introduction

In the [previous post](/posts/2026/02/empirical-risk-minimization-and-distribution-shift), we discussed Empirical Risk Minimization (ERM), the strategy of choosing the predictor that performs best on our training data. We assumed that if the training error $\hat{R}(h)$ is low, the true risk $R(h)$ (performance on future data) should also be low.

But is this always true?

Imagine 2 students preparing for an exam. One student understands the concepts, another purely memorizes the practice questions. Both might get 100% on the practice test (zero empirical risk), but the memorizer will fail the actual exam (high true risk).

This gap between the training error and the true error is called the **Generalization Gap**. To trust our models, we need **Generalization Bounds**: mathematical guarantees that the gap won't be too large.

## 2 The Generalization Bound

Mathematically, we want to bound the difference between the true risk and the empirical risk with high probability. A typical generalization bound looks like this:

$$
R(h) \leq \hat{R}(h) + \text{Complexity}(H)
$$

This equation tells a crucial story:
1.  **$\hat{R}(h)$**: How well we did on training data.
2.  **$\text{Complexity}(H)$**: A penalty for how "complicated" our hypothesis class $H$ is.

If our model class is too complex (too capable of memorization), the penalty term grows, and the bound becomes loose, meaning our training performance tells us nothing about future performance.

## 3 Measuring Complexity: VC Dimension

How do we measure the "complexity" of a model class? One of the classical measures is the **Vapnik-Chervonenkis (VC) Dimension**. It measures the combinatorial power of a hypothesis class, specifically, its ability to assign any label to a set of points.

![vc-dimension-shattering](https://storage.googleapis.com/blog-images-southamerica-east1/2026/02/generalization-bounds/vc-dimension-shattering.png)

### 3.1 Shattering

To understand VC dimension, we need the concept of **shattering**.
A hypothesis class $H$ *shatters* a set of data points if, no matter how we assign binary labels ($+$ or $-$) to those points, there exists a function in $H$ that can perfectly separate them.

* **Example:** Imagine 3 points in a triangle on a 2D plane. Can a straight line separate them for *every* possible labeling (e.g., all positive, two positive and one negative, etc.)? Yes. Therefore, a linear classifier can shatter 3 points.

However, if we add a 4th point (specifically in an XOR configuration), a linear classifier **cannot** separate positive from negative for all label combinations.

### 3.2 The Definition

The VC Dimension of a hypothesis class $H$, denoted as $VC(H)$, is the **size of the largest set of points** that can be shattered by $H$.

* Linear classifiers in 2D have $VC = 3$.
* Linear classifiers in $d$ dimensions have $VC = d+1$.
* Neural Networks can have a massive VC dimension, implying high capacity for memorization.

## 4 Measuring Complexity: Rademacher Complexity

While VC dimension looks at the "worst-case" arrangement of points, **Rademacher Complexity** offers a more data-dependent view. It measures how well a hypothesis class can fit **random noise**.

Imagine we take our dataset and flip a coin to assign a random label $\sigma_i \in \{-1, +1\}$ to every data point $x_i$. Since the labels are pure noise, no model *should* be able to predict them based on the input $x$.

$$
\hat{\mathfrak{R}}\_S(H) = \mathbb{E}\_{\sigma} \left[ \sup_{h \in H} \frac{1}{n} \sum_{i=1}^n \sigma_i h(x_i) \right]
$$

* If your model can achieve low error even on these random labels, the Rademacher complexity is high. It means the model is "hallucinating" patterns in noise.
* If the model fails to fit the random labels (which is good!), the complexity is low.

Rademacher complexity provides tighter bounds than VC dimension in many modern applications because it accounts for the actual distribution of the data, not just the worst-case geometry.

## 5 The Bias-Variance Tradeoff

These complexity measures lead us to the fundamental tension in machine learning: the **Bias-Variance Tradeoff**.

We want to minimize the True Risk, which roughly decomposes into:

$$
\text{Error} = \text{Bias}^2 + \text{Variance} + \text{Noise}
$$

![bias-variance-tradeof](https://storage.googleapis.com/blog-images-southamerica-east1/2026/02/generalization-bounds/bias-variance-tradeoff.jpg)

1.  **Low Complexity (High Bias):**
    * The model is too simple (e.g., fitting a line to a curve).
    * It has high training error (underfitting) and high test error.
    * *Example:* A linear classifier trying to learn image recognition.

2.  **High Complexity (High Variance):**
    * The model is too powerful (e.g., a massive neural network on a tiny dataset).
    * It has zero training error (memorization) but fluctuates wildly with different training sets.
    * *Example:* A polynomial of degree 100 fitting 10 data points.

3.  **The Sweet Spot:**
    * We want a model complex enough to capture the signal (low bias) but simple enough to ignore the noise (low variance).
    * Generalization bounds help us theoretically locate this spot by penalizing complexity.

## 6 Conclusion

Generalization bounds tell us that **low training error is not enough**. To guarantee learning, we must balance data fit (ERM) with model simplicity (VC Dim / Rademacher).

However, all these bounds rely on one critical assumption: **The test data comes from the same distribution as the training data.**

What happens when this assumption fails? What if we train on CT scans from a hospital in London but deploy the model in a hospital in Brazil? The bounds we discussed today break down. In the next post, we will finally tackle **Distribution Shift** and the specific math of "Domain Adaptation."

---

### References

* <span id="ref-1"></span>[[1](#ref-1)] Shalev-Shwartz, S., & Ben-David, S. (2014). *Understanding Machine Learning: From Theory to Algorithms*. Cambridge University Press.
* <span id="ref-2"></span>[[2](#ref-2)] Mohri, M., Rostamizadeh, A., & Talwalkar, A. (2018). *Foundations of Machine Learning*. MIT Press.