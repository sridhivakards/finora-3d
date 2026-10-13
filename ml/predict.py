import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

def train_and_predict_expenses(historical_expenses):
    """
    Given a list or array of monthly expense values, trains
    Linear Regression, Random Forest, and Gradient Boosting models,
    evaluates them, and returns predicted next-month expenses along with metrics.
    """
    if len(historical_expenses) < 3:
        # Default fallback for few points
        avg = float(np.mean(historical_expenses)) if len(historical_expenses) > 0 else 20000.0
        return {
            "predicted_next_month": round(avg * 1.05, 2),
            "best_model": "Moving Average (Limited Data)",
            "models": {
                "linear_regression": {"prediction": round(avg * 1.05, 2), "mae": 0, "rmse": 0},
                "random_forest": {"prediction": round(avg * 1.04, 2), "mae": 0, "rmse": 0},
                "gradient_boosting": {"prediction": round(avg * 1.06, 2), "mae": 0, "rmse": 0},
            },
            "recommendation": "Track at least 4-6 months of transactions for refined machine learning predictions."
        }

    n = len(historical_expenses)
    X = np.arange(n).reshape(-1, 1)
    y = np.array(historical_expenses, dtype=float)

    # Train 3 models
    lr = LinearRegression()
    lr.fit(X, y)
    pred_lr_train = lr.predict(X)
    pred_lr_next = float(lr.predict([[n]])[0])

    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X, y)
    pred_rf_train = rf.predict(X)
    pred_rf_next = float(rf.predict([[n]])[0])

    gb = GradientBoostingRegressor(n_estimators=50, random_state=42)
    gb.fit(X, y)
    pred_gb_train = gb.predict(X)
    pred_gb_next = float(gb.predict([[n]])[0])

    models = {
        "linear_regression": {
            "prediction": max(0.0, round(pred_lr_next, 2)),
            "mae": round(float(mean_absolute_error(y, pred_lr_train)), 2),
            "rmse": round(float(np.sqrt(mean_squared_error(y, pred_lr_train))), 2)
        },
        "random_forest": {
            "prediction": max(0.0, round(pred_rf_next, 2)),
            "mae": round(float(mean_absolute_error(y, pred_rf_train)), 2),
            "rmse": round(float(np.sqrt(mean_squared_error(y, pred_rf_train))), 2)
        },
        "gradient_boosting": {
            "prediction": max(0.0, round(pred_gb_next, 2)),
            "mae": round(float(mean_absolute_error(y, pred_gb_train)), 2),
            "rmse": round(float(np.sqrt(mean_squared_error(y, pred_gb_train))), 2)
        }
    }

    # Pick best model based on lowest MAE
    best_model_name = min(models.keys(), key=lambda k: models[k]["mae"])
    best_pred = models[best_model_name]["prediction"]

    return {
        "predicted_next_month": best_pred,
        "best_model": best_model_name.replace("_", " ").title(),
        "models": models,
        "confidence_level": "High" if models[best_model_name]["mae"] < 2000 else "Moderate",
        "historical_count": n
    }

if __name__ == "__main__":
    sample_data = [14200, 16500, 15800, 17900, 18400]
    res = train_and_predict_expenses(sample_data)
    print("Expense Prediction Result:", res)
