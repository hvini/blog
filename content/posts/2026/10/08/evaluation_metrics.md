---
title: "Evaluation Metrics: Measuring What a Machine Learning Model Gets Right"
date: 2026-10-08T13:00:00-03:00
draft: false
math: true
tags: ["machine-learning"]
components:
    - type: classification_metrics
---

A machine learning model is useful only if it performs well on the task it was designed to solve. But what does *perform well* actually mean?

A model produces predictions. To evaluate those predictions, we need a way to compare them against something meaningful. This is where **evaluation metrics** come in.

Into the, [Empirical Risk Minimization and Distribution Shift](/posts/2026/02/02/empirical-risk-minimization-and-distribution-shift) post, i introduced the idea of measuring prediction error. We saw that the **true risk** of a model can be written as the expected loss over the data distribution:

$$
R(h)=\mathbb{E}_{(x,y)\sim\mathcal{P}}[L(y,h(x))]
$$

where $h$ is the model, $P$ is the distribution of the data, and $L$ is a loss function that measures how bad a prediction is.

In practice, we do not have access to the entire data distribution. Instead, we work with a finite dataset and estimate the risk using the **empirical risk**:

$$
\hat{R}(h) = \frac{1}{n}\sum_{i=1}^{n}L(f(x_i),y_i)
$$

Evaluation metrics are, in many ways, practical ways of answering the question behind these equations:

> How well does this model perform on the problem we actually care about?

The important part is that there is no single metric that is always appropriate. The right metric depends on the task, the data, and most importantly, what kind of errors matter in the application.

## Why evaluation is harder than it looks

Consider a binary classification problem where a model predicts whether an image contains a particular object.

Suppose the evaluation dataset contains 1,000 images, but only one of them contains the object.

A model that predicts **"no object" for every image** will be correct on 999 out of 1,000 examples.

Its accuracy is:

$$
\text{Accuracy} = \frac{999}{1000} = 99.9\%
$$

That sounds excellent.

But if the purpose of the model is to find the object, the model has completely failed: it never detects the single positive example.

This is an example of why **a high metric value does not necessarily mean that a model is useful**.

In an even more extreme example, imagine a dataset where none of the evaluation examples contains the object. A model that always predicts "no object" would achieve 100% accuracy.

It is possible, therefore, for a model to achieve **100% accuracy and still be a 100% failure for the task**.

The metric is not wrong. Accuracy is correctly measuring the proportion of correct predictions. The problem is that accuracy does not capture everything we care about.

This is why model evaluation requires more than simply looking for the largest number.

## Ground truth

Most supervised evaluation starts with **ground truth**: examples for which we know the correct answer.

For a classification problem, this might mean images annotated with their correct class. For regression, it might mean measurements with known target values.

We can then compare the model's predictions with these reference values.

For example:

| Example | Ground truth | Prediction | Correct? |
| --- | --- | --- | --- |
| 1 | Cat | Cat | Yes |
| 2 | Dog | Cat | No |
| 3 | Cat | Cat | Yes |
| 4 | Dog | Dog | Yes |

Without ground truth, we generally cannot directly measure whether an individual prediction is correct.

Creating ground truth can therefore be one of the most expensive parts of a machine learning project. It may require humans to annotate images, classify documents, transcribe audio, verify measurements, or otherwise provide the expected answers.

And even ground truth is not necessarily perfect. Different annotators can disagree, labels can contain mistakes, and some problems may not have a single objectively correct answer.

## When there is no ground truth

Not every machine learning problem has labeled evaluation data.

This is common in **unsupervised learning**, such as clustering. If we ask an algorithm to divide customers into groups, there may be no predefined "correct" grouping to compare against.

In these cases, other metrics can sometimes help. For clustering, for example, measures such as silhouette score can describe properties of the resulting clusters.

But these metrics answer a somewhat different question. They can tell us whether clusters are compact or well separated, but they cannot necessarily tell us whether the clusters are **useful for the business or scientific problem**.

Ultimately, evaluation may require domain expertise and qualitative inspection.

A clustering algorithm can produce mathematically well-separated groups that have no useful interpretation. Conversely, groups that overlap somewhat may still correspond to meaningful categories for a domain expert.

This leads to an important principle:

> **A metric measures a property of a model. It does not automatically measure whether the model is useful.**

Metrics should support evaluation, not replace understanding of the problem.

## Classification

Classification models predict discrete categories.

For example:

- Is this email spam or not?
- Is this image a cat, dog, or bird?
- Is this transaction fraudulent?
- Which category does this document belong to?

Different classification metrics emphasize different types of errors.

### Confusion matrix

Before introducing the individual metrics, it helps to look at the **confusion matrix**.

For binary classification, predictions can be divided into four groups:

| | Predicted Positive | Predicted Negative |
| --- | ---: | ---: |
| **Actual Positive** | True Positive (TP) | False Negative (FN) |
| **Actual Negative** | False Positive (FP) | True Negative (TN) |

These four quantities form the basis for many classification metrics.

**True positive (TP)**: The model predicts positive, and the example is actually positive. (e.g., Predicting an image contains a tumor, and it really does.)

**False positive (FP)**: The model predicts positive, but the example is actually negative. (e.g., Predicting a tumor where there is none, a false alarm.)

**True negative (TN)**: The model predicts negative, and the example is actually negative.

**False negative (FN)**: The model predicts negative, but the example is actually positive. (e.g., Missing a real tumor.)

The confusion matrix makes those differences visible.

### Accuracy

**Accuracy** measures the fraction of predictions that are correct:

$$
\text{Accuracy} =
\frac{TP + TN}
{TP + TN + FP + FN}
$$

Accuracy is intuitive and useful when the classes are reasonably balanced and the costs of different errors are similar.

However, accuracy can be misleading when the classes are highly imbalanced.

Suppose 99% of transactions are legitimate and only 1% are fraudulent. A model that predicts every transaction as legitimate achieves 99% accuracy while detecting no fraud at all.

Accuracy answers:

> How often is the model correct?

It does not answer:

> How well does the model find the cases that matter?

### Precision

**Precision** measures how many of the examples predicted as positive are actually positive:

$$
\text{Precision} =
\frac{TP}{TP + FP}
$$

A high precision means that when the model says "positive", it is usually correct.

For example, imagine a system that flags transactions as potentially fraudulent. If we want to avoid overwhelming investigators with false alarms, precision becomes important.

Precision answers:

> When the model predicts positive, how often is it right?

### Recall

**Recall**, also called sensitivity or true positive rate, measures how many of the actual positive examples the model successfully finds:

$$
\text{Recall} =
\frac{TP}{TP + FN}
$$

A high recall means that the model misses relatively few positive examples.

For example, in a medical screening application, missing a real positive case may be much more problematic than investigating some additional false positives.

Recall answers:

> Of all the actual positive cases, how many did the model find?

Precision and recall therefore describe two different aspects of positive predictions.

Increasing the decision threshold often makes a classifier more conservative: it may produce fewer positive predictions, which can increase precision while reducing recall. Lowering the threshold can have the opposite effect.

### F1 score

Sometimes we want a single metric that combines precision and recall.

The **F1 score** is their harmonic mean:

$$
F_1 =
2\frac{\text{Precision}\cdot\text{Recall}}
{\text{Precision}+\text{Recall}}
$$

The harmonic mean is useful here because a very low precision or recall will pull the F1 score down.

For example, a model with precision of 1.0 but recall of 0.01 does not receive an F1 score close to 1. Instead:

$$
F_1 \approx 0.0198
$$

This reflects the fact that the model is performing well on one dimension but poorly on the other.

F1 is particularly useful when both false positives and false negatives matter and we want a single summary number.

However, it is still a summary. Looking at precision and recall separately can provide more information about what the model is actually doing.

### ROC curve and AUC

Many classifiers do not directly produce only "positive" or "negative". Instead, they produce a score or probability, such as:

$$
P(Y=1\mid X)
$$

We can then choose a threshold to turn that score into a classification.

Changing the threshold changes the trade-off between true positives and false positives.

The **Receiver Operating Characteristic (ROC) curve** shows this trade-off by plotting the true positive rate against the false positive rate at different thresholds.

The **Area Under the ROC Curve (AUC)** summarizes the area under this curve.

An AUC of 1.0 represents perfect ranking, while an AUC around 0.5 corresponds to performance similar to random ranking in the usual binary classification setting.

A useful interpretation of ROC AUC is that it measures how well the model tends to rank positive examples above negative examples.

However, AUC should not automatically be treated as the best classification metric. In highly imbalanced problems, for example, precision-recall curves can provide a more informative view of performance.

The important question remains:

> **Which behavior matters for the application?**

## Regression

Classification predicts categories. **Regression** predicts numerical values.

Examples include:

- predicting house prices;
- estimating temperature;
- forecasting demand;
- predicting a patient's measurement;
- estimating the time required to complete a task.

Regression metrics measure the difference between the predicted value $\hat{y}$ and the observed value $y$.

### Mean Squared Error

**Mean Squared Error (MSE)** is the average squared error:

$$
\text{MSE} =
\frac{1}{n}
\sum_{i=1}^{n}(y_i-\hat{y}_i)^2
$$

Because the errors are squared, large errors receive disproportionately more weight.

For example, an error of 10 contributes 100 to the squared error, while an error of 2 contributes only 4.

This makes MSE useful when large errors should be penalized strongly.

One consequence is that MSE is sensitive to outliers. A small number of very large errors can have a substantial influence on the metric.

### Root Mean Squared Error

**Root Mean Squared Error (RMSE)** is simply the square root of MSE:

$$
\text{RMSE} =
\sqrt{
\frac{1}{n}
\sum_{i=1}^{n}(y_i-\hat{y}_i)^2
}
$$

Taking the square root returns the metric to the same units as the target variable.

If we are predicting house prices in dollars, for example, RMSE is also expressed in dollars.

RMSE still penalizes large errors more strongly than small errors, but it is often easier to interpret than MSE because it is expressed in the original unit.

### Mean Absolute Error

**Mean Absolute Error (MAE)** measures the average absolute difference between predictions and actual values:

$$
\text{MAE} =
\frac{1}{n}
\sum_{i=1}^{n}|y_i-\hat{y}_i|
$$

Unlike MSE, MAE does not square the errors.

An error of 10 contributes 10, while an error of 2 contributes 2.

As a result, MAE is less sensitive to large outliers than MSE and RMSE.

MAE answers a relatively intuitive question:

> On average, how far away are the predictions from the actual values?

### R²

The **coefficient of determination**, usually written as $R^2$, compares the model against a simple baseline that always predicts the mean of the target values:

$$
R^2 =
1 -
\frac{\sum_i(y_i-\hat{y}_i)^2}
{\sum_i(y_i-\bar{y})^2}
$$

where $\bar{y}$ is the mean of the observed target values.

An $R^2$ of 1 means that the predictions perfectly match the observations.

An $R^2$ of 0 means that the model performs, in terms of squared error, like the baseline that always predicts the mean.

Importantly, $R^2$ can also be negative. This can happen when the model performs worse than that baseline on the evaluated data.

Unlike MAE and RMSE, $R^2$ is not expressed in the units of the target variable. It is therefore often useful to report it alongside an error metric such as MAE or RMSE.

## Choosing a metric

There is no universally best evaluation metric.

The appropriate choice depends on what the model is supposed to accomplish and which mistakes are important.

For classification, we might ask:

- Are the classes balanced?
- Are false positives expensive?
- Are false negatives expensive?
- Do we care about finding as many positive examples as possible?
- Do we need a good ranking rather than a particular classification threshold?

For regression, we might ask:

- Should large errors be heavily penalized?
- Are outliers meaningful or should they have less influence?
- Do we want an error expressed in the original units?
- Is comparison against a simple baseline useful?

A good evaluation usually does not depend on a single number.

For example, a classification experiment might report accuracy, precision, recall, F1, a confusion matrix, and ROC AUC. A regression experiment might report MAE, RMSE, and $R^2$.

Looking at multiple metrics helps reveal different failure modes.

## Evaluation is part of the problem definition

Evaluation should not be an afterthought.

The metric we choose influences how we understand whether a model is successful. More importantly, it can influence how models are selected, tuned, and deployed.

If we optimize the wrong metric, we can build a model that is excellent according to our evaluation procedure but poor at the actual task.

This is closely related to the distinction between **true risk** and **empirical risk**.

The empirical metric calculated on our evaluation dataset is only an estimate of how the model behaves on the broader data distribution. If the evaluation dataset is not representative, the number can be misleading.

This is especially important when the data distribution changes.

A model might achieve excellent results on historical data but perform poorly after deployment because the real-world inputs are different. This is one of the problems discussed in the previous post on empirical risk minimization and distribution shift.

Therefore, a meaningful evaluation requires more than choosing a formula.

We need to consider:

1. **The task** — What are we actually trying to predict?
2. **The data** — Does the evaluation dataset represent the data the model will encounter?
3. **The ground truth** — How reliable are the labels or measurements?
4. **The errors** — Which mistakes matter most?
5. **The metric** — Does it capture the behavior we care about?
6. **The domain** — Does a good metric value correspond to a useful result in the real world?

Ultimately, evaluation metrics are tools for measuring model behavior. They turn predictions and observations into quantities that we can compare, analyze, and track.

But a metric is only useful when it measures something that matters.

A model does not become good because it has a high accuracy, a low RMSE, or a large AUC. It becomes useful when its predictions are sufficiently reliable **for the problem it is intended to solve**.