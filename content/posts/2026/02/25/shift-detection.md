---
title: "Identifying Distribution Shift"
date: 2026-02-25T11:00:00-03:00
draft: false
tags: ["Machine Learning", "Distribution Shift", "AI Theory"]
math: true
---

## 1. Introduction

After understanding the different types of distribution shifts, the next critical step in a machine learning lifecycle is **identification**. Detecting these changes early is fundamental to maintaining the reliability of predictions. Below, we will cover how to identify these phenomena through statistical and analytical methods tailored to each shift scenario.

## 2. Covariate Shift

Covariate shift occurs when the distribution of input variables (features) changes between the training phase and real-world operation. Depending on the complexity of the model, we can use approaches focused on individual variables or the entire dataset.

### 2.1. Univariate Methods
These methods evaluate the shift of a single variable in isolation:

* **2.1.1. Kolmogorov-Smirnov (K-S) Test:** A non-parametric statistical test that quantifies the distance between the cumulative distribution functions of two samples. It is ideal for identifying if new data belongs to the same original distribution.
* **2.1.2. Population Stability Index (PSI):** A metric that measures how much the distribution of a variable has shifted between two time periods. A low PSI indicates stability, while high values suggest the need for model reassessment.
* **2.1.3. Kullback-Leibler (KL) Divergence:** Measures the difference between two probability distributions. In practical terms, it indicates how much information is lost when using the training distribution to represent current production data.



### 2.2. Multivariate Methods
Used when the change does not occur in a specific variable, but in the joint relationship between several of them:

* **2.2.1. Discriminator Approach:** Consists of training an auxiliary binary classifier to distinguish between reference samples (training) and production samples. If the classifier achieves high performance (for example, a Phi coefficient greater than 0.2), it confirms that production data has become distinguishable from the original data, indicating a shift.
* **2.2.2. PCA Reconstruction Error:** Uses Principal Component Analysis (PCA) trained on initial data. A significant increase in reconstruction error when applying the model to new data suggests that the fundamental structure of the features has been altered.

## 3. Label Shift

Label shift manifests when the distribution of output classes (dependent variable) changes. The identification strategy depends on the immediate availability of ground truth results:

* **Direct Comparison:** If ground truth labels are available quickly, we monitor the distribution of classes in production and compare it with the training distribution using statistical hypothesis tests.
* **Model Prediction Analysis:** In the absence of immediate labels, we track the distribution of probabilities predicted by the model. Abrupt changes in the frequency of certain predictions can be an indirect indicator of label shift.



## 4. Concept Shift

Concept shift is the most challenging scenario, where the mathematical relationship between inputs and outputs changes. To identify it accurately, access to ground truth labels is necessary for auditing purposes:

* **Performance Monitoring:** The most robust way to detect concept shift is to track model effectiveness metrics (such as accuracy, precision, or recall) over time. A persistent degradation in performance usually points to a change in the underlying concept.
* **Model Comparison:** Involves periodically training a new model using only recent data. If the mapping learned by the new model diverges significantly from the production model (evaluated via predictions on a common test set), it is highly likely that concept shift has occurred.

## 5. Conclusion

Proactive identification of data changes is the foundation of AI model monitoring. While univariate methods offer a quick and simple view, multivariate approaches and performance tracking are essential for complex systems. The success of a Machine Learning solution in production lies in the ability to differentiate natural statistical fluctuations from structural changes that require technical intervention.

### References

* <span id="ref-1"></span>[[1](#ref-1)] Shai Ben-David et al. "A theory of learning from different domains". In: Machine Learning 79.1-2 (2010), pp. 151–175.
* <span id="ref-2"></span>[[2](#ref-2)] Mehryar Mohri, Afshin Rostamizadeh, and Ameet Talwalkar. *Foundations of Machine Learning*. MIT Press, 2018.
* <span id="ref-3"></span>[[3](#ref-3)] Joaquin Quiñonero-Candela et al. *Dataset shift in machine learning*. Tech. rep. MIT Press, 2009.
* <span id="ref-4"></span>[[4](#ref-4)] Vladimir Vapnik. *Statistical Learning Theory*. Wiley, 1998.