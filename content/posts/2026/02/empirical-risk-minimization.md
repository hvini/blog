---
title: "Empirical Risk Minimization and Distribution Shift"
date: 2026-02-02T08:10:00-03:00
draft: false
tags: ["Machine Learning", "Distribution Shift", "AI Theory"]
math: true
---

## 1 Introduction

Consider a prediction problem where an algorithm observes an input-output pair $(x,y)$, such as measurements and their associated outcomes. The goal of learning is to construct a function $h(x)$ that predicts $y$ from $x$ with small error.

## 2 How Do We Measure Error?

To quantify prediction quality, we introduce a loss function $L(y,h(x))$, which measures how different a prediction $h(x)$ is from the true outcome $y$. Since the true data-generation process is unknown, learning algorithms rely on a finite training sample $\{(x_{i},y_{i})\}_{i=1}^{n}$.

## 3 Empirical Risk Minimization (ERM)

The most common learning principle consists of minimizing the average error observed on the training data, known as the empirical risk:

$$
\hat{R}(h)=\frac{1}{n}\sum_{i=1}^{n}L(y_{i},h(x_{i}))
$$

This principle, called Empirical Risk Minimization (ERM), selects the predictor $h$ that performs best on the observed data [[4](#ref-4), [2](#ref-2)].

### 3.1 True Risk vs Empirical Risk

The quantity we ultimately care about is the expected error on future data, known as the true risk:

$$
R(h)=\mathbb{E}_{(x,y)\sim\mathcal{P}}[L(y,h(x))]
$$

where, $\mathcal{P}(x,y)$ is the (unknown) probability distribution generating the data.

ERM is justified when the training data are representative of future data, that is, when both are sampled independently and identically (i.i.d.) from the same distribution $\mathcal{P}$. In this case, the empirical risk $\hat{R}(h)$ provides a reliable approximation of the true risk $R(h)$, and minimizing one approximately minimizes the other [[4](#ref-4)].

## 4 Distribution Shift in the Real World

In many real-world scenarios, however, the distribution of data encountered at deployment differs from that observed during training. This phenomenon, known as distribution shift or domain shift, can be formally expressed as [[1](#ref-1), [3](#ref-3)]:

$$
\mathcal{P}\_{train}(x,y)\ne\mathcal{P}\_{test}(x,y)
$$

Under such conditions, the empirical risk computed on training data no longer estimates the true risk with respect to $\mathcal{P}_{test}$. Consequently, predictors obtained via ERM may exhibit low training error while performing poorly when applied to data from a new domain.

This limitation stems from the fact that ERM favors predictors that exploit statistical regularities specific to the training distribution, without enforcing robustness to changes in the data-generating process. As a result, ERM alone does not guarantee reliable generalization under distributional changes, motivating the study of learning methods explicitly designed to handle domain shift.

## 5 Conclusion

Empirical Risk Minimization succeeds when the future resembles the past; distribution shift precisely captures the situation in which this resemblance no longer holds. However, even when training and test data come from the same distribution, the empirical risk is only an estimate of the true risk.

In the next post, we will dive deeper into distribution shift, showing why empirical risk may fail and how models can be made more robust to changes in the data distribution.

---

### References

* <span id="ref-1"></span>[[1](#ref-1)] Shai Ben-David et al. "A theory of learning from different domains". In: Machine Learning 79.1-2 (2010), pp. 151-175.
* <span id="ref-2"></span>[[2](#ref-2)] Mehryar Mohri, Afshin Rostamizadeh, and Ameet Talwalkar. Foundations of Machine Learning. MIT Press, 2018.
* <span id="ref-3"></span>[[3](#ref-3)] Joaquin Quiñonero-Candela et al. Dataset shift in machine learning. Tech. rep. MIT Press, 2009.
* <span id="ref-4"></span>[[4](#ref-4)] Vladimir Vapnik. Statistical Learning Theory. Wiley, 1998.