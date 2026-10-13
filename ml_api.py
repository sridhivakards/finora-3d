import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from ml.predict import train_and_predict_expenses
from ml.anomaly import detect_unusual_transactions
from ml.insights import generate_financial_insights

app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "Finora AI Machine Learning Service",
        "version": "1.0.0"
    })

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        historical_expenses = data.get("expenses", [])
        
        if not isinstance(historical_expenses, list):
            return jsonify({"error": "expenses must be a list of numbers"}), 400

        result = train_and_predict_expenses(historical_expenses)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/anomaly", methods=["POST"])
def anomaly():
    try:
        data = request.get_json(force=True)
        transactions = data.get("transactions", [])
        
        if not isinstance(transactions, list):
            return jsonify({"error": "transactions must be a list"}), 400

        result = detect_unusual_transactions(transactions)
        return jsonify({"transactions": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/insights", methods=["POST"])
def insights():
    try:
        data = request.get_json(force=True)
        transactions = data.get("transactions", [])
        budgets = data.get("budgets", [])
        goals = data.get("goals", [])

        result = generate_financial_insights(transactions, budgets, goals)
        return jsonify({"insights": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"Finora ML API starting on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
