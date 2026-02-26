"""
Train a TF-IDF + Logistic Regression model to categorize transactions.
Run once: python ml/train_model.py
"""

import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

# ── Training data (expand this with your own data) ──
TRAINING_DATA = [
    # Food & Dining
    ("starbucks coffee", "Food"), ("mcdonald's", "Food"), ("uber eats", "Food"),
    ("doordash", "Food"), ("pizza hut", "Food"), ("chipotle", "Food"),
    ("whole foods", "Food"), ("trader joe's", "Food"), ("safeway grocery", "Food"),
    ("restaurant meal", "Food"), ("lunch cafe", "Food"), ("dinner bistro", "Food"),
    ("coffee shop", "Food"), ("bakery", "Food"), ("sushi restaurant", "Food"),
    ("grocery store", "Food"), ("aldi supermarket", "Food"), ("kroger", "Food"),

    # Transport
    ("uber ride", "Transport"), ("lyft", "Transport"), ("gas station", "Transport"),
    ("shell gas", "Transport"), ("bp fuel", "Transport"), ("parking fee", "Transport"),
    ("metro transit", "Transport"), ("bus pass", "Transport"), ("amtrak", "Transport"),
    ("delta airlines", "Transport"), ("united airlines", "Transport"), ("car rental", "Transport"),
    ("toll booth", "Transport"), ("auto repair", "Transport"), ("jiffy lube", "Transport"),

    # Shopping
    ("amazon purchase", "Shopping"), ("walmart", "Shopping"), ("target", "Shopping"),
    ("best buy electronics", "Shopping"), ("h&m clothing", "Shopping"), ("zara", "Shopping"),
    ("nordstrom", "Shopping"), ("ebay", "Shopping"), ("etsy", "Shopping"),
    ("apple store", "Shopping"), ("nike shoes", "Shopping"), ("ikea furniture", "Shopping"),
    ("costco", "Shopping"), ("online order", "Shopping"), ("department store", "Shopping"),

    # Entertainment
    ("netflix subscription", "Entertainment"), ("spotify music", "Entertainment"),
    ("hulu streaming", "Entertainment"), ("cinema tickets", "Entertainment"),
    ("movie theater", "Entertainment"), ("concert tickets", "Entertainment"),
    ("steam games", "Entertainment"), ("playstation store", "Entertainment"),
    ("disney plus", "Entertainment"), ("apple tv", "Entertainment"),
    ("bowling alley", "Entertainment"), ("escape room", "Entertainment"),
    ("museum tickets", "Entertainment"), ("sports event", "Entertainment"),

    # Bills & Utilities
    ("electric bill", "Bills"), ("water utility", "Bills"), ("internet provider", "Bills"),
    ("comcast cable", "Bills"), ("phone bill", "Bills"), ("at&t wireless", "Bills"),
    ("rent payment", "Bills"), ("mortgage payment", "Bills"), ("insurance premium", "Bills"),
    ("health insurance", "Bills"), ("car insurance", "Bills"), ("gas utility", "Bills"),
    ("netflix annual", "Bills"), ("subscription fee", "Bills"),

    # Health
    ("cvs pharmacy", "Health"), ("walgreens", "Health"), ("doctor visit", "Health"),
    ("dentist appointment", "Health"), ("gym membership", "Health"), ("planet fitness", "Health"),
    ("medical copay", "Health"), ("urgent care", "Health"), ("hospital bill", "Health"),
    ("prescription medication", "Health"), ("yoga class", "Health"), ("optometrist", "Health"),

    # Income
    ("direct deposit payroll", "Income"), ("salary deposit", "Income"), ("freelance payment", "Income"),
    ("transfer from", "Income"), ("paycheck", "Income"), ("client invoice", "Income"),
    ("dividend payment", "Income"), ("interest earned", "Income"), ("refund received", "Income"),

    # Other
    ("atm withdrawal", "Other"), ("bank fee", "Other"), ("transfer to", "Other"),
    ("venmo payment", "Other"), ("zelle payment", "Other"), ("cash withdrawal", "Other"),
    ("charitable donation", "Other"), ("tax payment", "Other"),
]

def train():
    df = pd.DataFrame(TRAINING_DATA, columns=["description", "category"])

    # Augment with lowercase/uppercase variants
    augmented = []
    for desc, cat in TRAINING_DATA:
        augmented.append((desc.upper(), cat))
        augmented.append((desc.title(), cat))
    df = pd.concat([df, pd.DataFrame(augmented, columns=["description", "category"])], ignore_index=True)

    X, y = df["description"], df["category"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, analyzer="word")),
        ("clf", LogisticRegression(max_iter=500, C=5.0, multi_class="multinomial")),
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    print("\n📊 Model Performance:")
    print(classification_report(y_test, y_pred))

    os.makedirs("ml/models", exist_ok=True)
    joblib.dump(pipeline, "ml/models/categorizer.pkl")
    print("✅ Model saved to ml/models/categorizer.pkl")

if __name__ == "__main__":
    train()
