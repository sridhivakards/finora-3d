import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

def generate_synthetic_training_data(n_samples=500):
    """
    Generates synthetic realistic Indian personal finance spending records
    with monthly trend, seasonality (festivals like Diwali, rent, utility spikes).
    """
    np.random.seed(42)
    # Months 1 to 24
    months = np.random.randint(1, 25, size=n_samples)
    base_salaries = np.random.choice([45000, 75000, 95000, 140000, 200000], size=n_samples)
    
    # Expense is typically 40-75% of salary with seasonal variations
    ratios = np.random.uniform(0.40, 0.72, size=n_samples)
    expenses = base_salaries * ratios
    
    # Add festival/holiday surge in months 10-11
    surge_mask = np.isin(months % 12, [10, 11])
    expenses[surge_mask] *= np.random.uniform(1.15, 1.35, size=np.sum(surge_mask))

    df = pd.DataFrame({
        "month_index": months,
        "base_salary": base_salaries,
        "monthly_expense": np.round(expenses, 2)
    })
    return df

def train_and_export_base_model():
    df = generate_synthetic_training_data()
    X = df[["month_index", "base_salary"]]
    y = df["monthly_expense"]
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    os.makedirs("ml/models", exist_ok=True)
    model_path = "ml/models/base_expense_model.joblib"
    joblib.dump(model, model_path)
    print(f"Base model trained and saved to {model_path}")
    return model_path

if __name__ == "__main__":
    train_and_export_base_model()
