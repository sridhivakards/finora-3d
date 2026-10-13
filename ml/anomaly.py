import numpy as np
from sklearn.ensemble import IsolationForest

def detect_unusual_transactions(transactions, contamination=0.1):
    """
    Given a list of transaction dicts:
    [{ 'id': '...', 'amount': 4500, 'category': 'Food', 'description': '...', 'transaction_type': 'expense' }, ...]
    Fits an IsolationForest on amounts grouped by category, flags outliers,
    and returns transactions with is_unusual and anomaly_reason.
    """
    expenses = [t for t in transactions if t.get("transaction_type") == "expense"]
    if len(expenses) < 5:
        # Not enough data for robust unsupervised anomaly detection
        # Use simple 2.5x mean threshold heuristic
        avg = np.mean([t["amount"] for t in expenses]) if expenses else 1000
        annotated = []
        for t in transactions:
            is_unusual = False
            reason = None
            if t.get("transaction_type") == "expense" and t.get("amount", 0) > avg * 2.5:
                is_unusual = True
                reason = f"Amount ₹{t['amount']} is significantly higher than your typical average (₹{int(avg)})."
            annotated.append({**t, "is_unusual": is_unusual, "anomaly_reason": reason})
        return annotated

    amounts = np.array([t.get("amount", 0) for t in expenses]).reshape(-1, 1)
    
    # Train Isolation Forest
    iso = IsolationForest(contamination=contamination, random_state=42)
    predictions = iso.fit_predict(amounts) # -1 is anomaly, 1 is normal
    
    # Calculate category averages for contextual explanations
    category_means = {}
    for t in expenses:
        cat = t.get("category", "Other")
        category_means.setdefault(cat, []).append(t.get("amount", 0))
    category_avgs = {k: np.mean(v) for k, v in category_means.items()}

    expense_idx = 0
    annotated = []
    for t in transactions:
        if t.get("transaction_type") == "expense":
            is_anomaly = predictions[expense_idx] == -1
            expense_idx += 1
            cat = t.get("category", "Other")
            cat_avg = category_avgs.get(cat, t["amount"])

            # Only flag if it's on the high side (Isolation Forest can also detect unusually tiny values)
            if is_anomaly and t["amount"] > cat_avg * 1.5:
                ratio = round(t["amount"] / max(1, cat_avg), 1)
                reason = f"Amount ₹{t['amount']} is {ratio}x higher than your usual {cat} spending (avg ₹{int(cat_avg)})."
                annotated.append({**t, "is_unusual": True, "anomaly_reason": reason})
            else:
                annotated.append({**t, "is_unusual": False, "anomaly_reason": None})
        else:
            annotated.append({**t, "is_unusual": False, "anomaly_reason": None})

    return annotated

if __name__ == "__main__":
    txs = [
        {"id": "1", "amount": 250, "category": "Food", "transaction_type": "expense"},
        {"id": "2", "amount": 320, "category": "Food", "transaction_type": "expense"},
        {"id": "3", "amount": 180, "category": "Food", "transaction_type": "expense"},
        {"id": "4", "amount": 400, "category": "Food", "transaction_type": "expense"},
        {"id": "5", "amount": 4900, "category": "Food", "transaction_type": "expense"}, # Outlier!
    ]
    res = detect_unusual_transactions(txs)
    print("Detected anomalies:", [x for x in res if x["is_unusual"]])
