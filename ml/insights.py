def generate_financial_insights(transactions, budgets=None, goals=None):
    """
    Generates rule-based financial insights from real transaction, budget, and goal data.
    Ensures zero fabricated financial facts.
    """
    if not transactions:
        return [
            {
                "type": "welcome",
                "title": "Welcome to Finora",
                "description": "Add your first transaction to unlock your AI financial insights and behavioral intelligence.",
                "importance": "high"
            }
        ]

    insights = []
    
    total_income = sum(t["amount"] for t in transactions if t.get("transaction_type") == "income")
    total_expense = sum(t["amount"] for t in transactions if t.get("transaction_type") == "expense")
    balance = total_income - total_expense
    
    # 1. Savings rate insight
    if total_income > 0:
        savings_rate = round(((total_income - total_expense) / total_income) * 100, 1)
        if savings_rate >= 30:
            insights.append({
                "type": "savings_positive",
                "title": f"Strong Savings Rate: {savings_rate}%",
                "description": f"You are saving ₹{int(balance):,} out of ₹{int(total_income):,} earned. That surpasses the recommended 20% benchmark!",
                "importance": "positive"
            })
        elif savings_rate > 0:
            insights.append({
                "type": "savings_moderate",
                "title": f"Moderate Savings: {savings_rate}%",
                "description": f"You're currently retaining {savings_rate}% of your income. Trimming top discretionary categories could push this above 25%.",
                "importance": "neutral"
            })
        else:
            insights.append({
                "type": "savings_negative",
                "title": "Negative Cashflow Warning",
                "description": f"Expenses (₹{int(total_expense):,}) currently exceed income (₹{int(total_income):,}). Review high-impact categories immediately.",
                "importance": "warning"
            })

    # 2. Category Breakdown & Dominant Expense
    cat_expenses = {}
    for t in transactions:
        if t.get("transaction_type") == "expense":
            cat = t.get("category", "Other")
            cat_expenses[cat] = cat_expenses.get(cat, 0) + t["amount"]

    if cat_expenses and total_expense > 0:
        highest_cat = max(cat_expenses.keys(), key=lambda c: cat_expenses[c])
        highest_amt = cat_expenses[highest_cat]
        pct = round((highest_amt / total_expense) * 100, 1)

        insights.append({
            "type": "category_dominant",
            "title": f"{highest_cat} is Your Largest Expense",
            "description": f"{highest_cat} accounts for ₹{int(highest_amt):,} ({pct}%) of your total monthly expenditures.",
            "importance": "neutral"
        })

    # 3. Unusual Transactions
    unusual_txs = [t for t in transactions if t.get("is_unusual")]
    if unusual_txs:
        sample_unusual = unusual_txs[0]
        insights.append({
            "type": "anomaly_alert",
            "title": "Unusual Transaction Flagged",
            "description": f"₹{int(sample_unusual['amount']):,} for '{sample_unusual.get('description', 'Expense')}' was identified as higher than your historical pattern.",
            "importance": "warning"
        })

    # 4. Budget Adherence (if budgets provided)
    if budgets:
        for b in budgets:
            cat = b.get("category")
            limit = b.get("amount", 0)
            spent = cat_expenses.get(cat, 0)
            if limit > 0:
                usage_pct = (spent / limit) * 100
                if usage_pct > 100:
                    over = spent - limit
                    insights.append({
                        "type": "budget_exceeded",
                        "title": f"Budget Exceeded in {cat}",
                        "description": f"You have spent ₹{int(spent):,} against a ₹{int(limit):,} budget (₹{int(over):,} over limit).",
                        "importance": "warning"
                    })
                elif usage_pct >= 85:
                    insights.append({
                        "type": "budget_near_limit",
                        "title": f"{cat} Budget Near Threshold",
                        "description": f"You've consumed {round(usage_pct, 1)}% of your {cat} budget with ₹{int(limit - spent):,} remaining.",
                        "importance": "neutral"
                    })

    return insights
