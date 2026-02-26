import joblib
import os
from typing import Optional

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "categorizer.pkl")

_model = None

def _load_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            # Model not trained yet — return default
            return None
    return _model

def predict_category(description: str) -> str:
    """Predict spending category from transaction description."""
    model = _load_model()
    if model is None:
        return _rule_based_fallback(description)
    try:
        result = model.predict([description])[0]
        return result
    except Exception:
        return _rule_based_fallback(description)

def _rule_based_fallback(description: str) -> str:
    """Simple keyword-based fallback when model isn't available."""
    desc = description.lower()

    food_kw = ["restaurant", "cafe", "coffee", "food", "pizza", "burger", "grocery", "uber eats", "doordash"]
    transport_kw = ["uber", "lyft", "gas", "parking", "transit", "airline", "train"]
    shopping_kw = ["amazon", "walmart", "target", "store", "shop", "buy", "purchase"]
    entertainment_kw = ["netflix", "spotify", "hulu", "cinema", "movie", "concert", "game"]
    bills_kw = ["bill", "utility", "electric", "water", "internet", "phone", "rent", "mortgage", "insurance"]
    health_kw = ["pharmacy", "doctor", "medical", "gym", "fitness", "health", "hospital"]
    income_kw = ["deposit", "payroll", "salary", "income", "payment received", "refund"]

    for kw in income_kw:
        if kw in desc: return "Income"
    for kw in food_kw:
        if kw in desc: return "Food"
    for kw in transport_kw:
        if kw in desc: return "Transport"
    for kw in bills_kw:
        if kw in desc: return "Bills"
    for kw in health_kw:
        if kw in desc: return "Health"
    for kw in entertainment_kw:
        if kw in desc: return "Entertainment"
    for kw in shopping_kw:
        if kw in desc: return "Shopping"

    return "Other"
