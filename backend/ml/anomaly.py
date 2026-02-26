import numpy as np
from typing import List

def detect_anomaly(amount: float, history: List[float], threshold: float = 2.5) -> bool:
    """
    Detect if a transaction amount is anomalous using Z-score.
    Falls back to IQR method for small samples.
    Returns True if the amount is unusual for the user.
    """
    if len(history) < 5:
        return False

    amounts = np.array([abs(a) for a in history])
    new_amount = abs(amount)

    # Z-score method
    mean = np.mean(amounts)
    std = np.std(amounts)

    if std == 0:
        return False

    z_score = abs(new_amount - mean) / std
    if z_score > threshold:
        return True

    # IQR method for extra safety
    q1, q3 = np.percentile(amounts, 25), np.percentile(amounts, 75)
    iqr = q3 - q1
    upper_fence = q3 + 2.0 * iqr

    return new_amount > upper_fence

def get_anomaly_score(amount: float, history: List[float]) -> float:
    """Return a 0-1 anomaly score (higher = more unusual)."""
    if len(history) < 3:
        return 0.0

    amounts = np.array([abs(a) for a in history])
    new_amount = abs(amount)
    mean = np.mean(amounts)
    std = np.std(amounts) or 1.0

    z = abs(new_amount - mean) / std
    # Sigmoid-normalize z-score to [0, 1]
    score = 1 / (1 + np.exp(-0.5 * (z - 2)))
    return round(float(score), 3)
