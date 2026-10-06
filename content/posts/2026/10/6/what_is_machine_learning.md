---
title: "Machine Learning Fundamentals: From Data to Predictions"
date: 2026-10-06T17:00:00-03:00
draft: false
math: false
tags: ["machine-learning"]
components:
  - type: quiz
    title: "What kind of Machine Learning problem is this?"
    questions:
      - question: "Predicting whether an email is spam or not"
        options: ["Regression", "Classification", "Clustering"]
        answer: 1
      - question: "Predicting tomorrow's temperature"
        options: ["Regression", "Classification", "Clustering"]
        answer: 0
      - question: "Grouping customers by behavior"
        options: ["Regression", "Classification", "Clustering"]
        answer: 2
---

### What is Machine Learning?

Before diving into academic definitions, think about your daily life. When Netflix suggests the perfect movie for your Friday night, when Spotify curates your "Discover Weekly" playlist, when Waze recalculates the fastest route to avoid traffic, or when your bank instantly blocks a suspicious credit card transaction, you are interacting directly with machine learning. In all these cases, there isn't a human writing rules for every possible situation, there are algorithms working behind the scenes, analyzing a vast history of past data to predict future behaviors.

Machine learning is formally defined by:

> "A computer program is said to learn from experience *E* with respect to some class of tasks *T* and performance measure *P*, if its performance at tasks in *T*, as measured by *P*, improves with experience *E*." — Tom Mitchell

Where:

-   **Task (*T*):** Represents what the computer must do (e.g., classify an email as spam or calculate the price of a house).
-   **Experience (*E*):** Represents the historical data the system interacts with (e.g., the training dataset containing thousands of old emails).
-   **Performance (*P*):** Represents the quantitative metric that evaluates whether the machine is improving (e.g., the accuracy rate of predictions or the reduction of the error margin *e*).

Machine learning is a subfield of artificial intelligence that allows computers to learn from data and improve autonomously, without being explicitly programmed for every rule.

At this point, it is very common for people to confuse the trending acronyms: Artificial Intelligence (AI), Machine Learning (ML), and Deep Learning (DL). To make it easier, imagine them as Russian nesting dolls (Matryoshkas), one inside the other:
*   **Artificial Intelligence (AI):** It is the broadest field of study, the "largest doll". It represents the concept of creating machines or systems capable of simulating human intelligence and behavior to perform tasks.
*   **Machine Learning (ML):** It is the "middle doll", a subfield of AI. Here, instead of programming fixed rules, we feed data to the machine so it can learn the patterns on its own (which is the focus of this post).
*   **Deep Learning (DL):** It is the "smallest doll", a specific subfield within Machine Learning. It uses complex mathematical structures inspired by the human brain, called Deep Neural Networks, to handle extremely difficult tasks, such as generating images, translating text in real-time, and guiding self-driving cars.

### Types of Machine Learning

The way we provide data to the algorithm defines its category. In practice, we divide machine learning into four main approaches:

**1. Supervised Learning**
Here, the model is trained using a labeled dataset. This means the algorithm already receives the "answer key" during training, learning to map inputs to these outputs. It is divided into two subtasks:
*   **Classification:** When the goal is to predict a specific, discrete category (e.g., identifying whether a photo is of a "cat" or "dog").
*   **Regression:** When the goal is to predict a continuous numerical value (e.g., estimating the price of a house or tomorrow's temperature).

**2. Unsupervised Learning**
In this case, the data provided to the model has no labels (there are no pre-defined correct answers). The algorithm is left on its own to discover hidden patterns, structures, and relationships in the data. Its most common applications are:
*   **Clustering:** Groups data with similar characteristics. It is a widely used technique in marketing to segment customer profiles based on behavior.
*   **Dimensionality Reduction:** Compresses data to remove noise and redundancies, preserving only the most crucial information to simplify the machine's work.

**3. Semi-supervised Learning**
As the name suggests, it is a hybrid approach. The model is trained using a small amount of labeled data mixed with a massive amount of unlabeled data. It is extremely useful when getting the "correct answer" is an expensive or time-consuming process (like hiring doctors to manually classify thousands of medical scans), but raw data is abundant.

**4. Reinforcement Learning**
In this type, the model (called an agent) learns to make decisions by actively interacting with an environment. It performs actions and receives *feedback* in the form of rewards (if it gets it right) or punishments (if it gets it wrong). The agent's goal is to maximize the cumulative reward over time. It is the exact same principle as training a dog with treats, and it is the core technology behind self-driving cars and AIs that play chess and video games at a professional level.

### Features and Labels

In machine learning, **Features** are the input data for the model and represent the characteristics of your problem. They can be numerical (age, salary), categorical (eye color, marital status), or even complex data like text and the pixels of an image. 

**Labels** represent the target variable, meaning what you want the model to learn to predict. For example, when creating a model to predict the price of a property, the *Features* would be the square footage, number of bedrooms, and location, while the *Label* would be the sale value in dollars.

As seen in the previous section, depending on the type of learning (supervised vs. unsupervised), you may or may not have labels available. The lack of labels, or the low quality of these labels (incorrect or biased data), drastically affects the model's performance. The oldest computing jargon applies perfectly here: *"Garbage in, garbage out"*.

### The Machine Learning Lifecycle

To transform raw data into useful predictions, a Machine Learning project generally follows a structured lifecycle:

1.  **Data Collection:** Where it all begins. Capturing the right data from databases, APIs, or spreadsheets.
2.  **Preprocessing and Cleaning:** The step that, in practice, consumes the most time for data scientists. It involves handling missing values, removing anomalies (*outliers*), and transforming text categories into numbers that the machine can process.
3.  **Model Training:** Choosing the appropriate algorithm (e.g., Decision Trees, Neural Networks) and feeding it with the training data so it learns the patterns.
4.  **Evaluation:** Testing the model using a portion of data it has never seen before to ensure it actually learned the general rules of the problem, and didn't just "memorize" the answers (a phenomenon we call *overfitting*).
5.  **Deployment:** Putting the model into production (on a server or application) so real users can send new data and receive predictions in real-time.

Understanding these fundamentals is the first step to stop seeing Artificial Intelligence as unfathomable "magic" and start using it as a logical and powerful tool, based purely on statistics and data. 

But an inevitable question arises: now that we know how to provide *features* and *labels* for a machine to learn, how can we be sure that it actually learned correctly and isn't just tricking us by "memorizing" the training data?

That is exactly what we will explore in the **next article of our series, where we will dive into the world of Evaluation Metrics**. We will see how to fairly judge the performance of our models. See you then!