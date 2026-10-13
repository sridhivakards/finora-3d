export type TransactionCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Bills"
  | "Health"
  | "Education"
  | "Salary"
  | "Investment"
  | "Other";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id?: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  transaction_type: TransactionType;
  transaction_date: string;
  is_unusual?: boolean;
  anomaly_reason?: string;
  created_at?: string;
}

export interface Budget {
  id: string;
  user_id?: string;
  category: TransactionCategory;
  amount: number;
  month: string; // e.g. "2026-09"
  created_at?: string;
}

export interface FinancialGoal {
  id: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category?: string;
  created_at?: string;
}

export interface Bill {
  id: string;
  user_id?: string;
  title: string;
  amount: number;
  due_date: string;
  status: "Upcoming" | "Paid" | "Overdue";
  recurring_frequency: "Monthly" | "Quarterly" | "Yearly";
  category?: string;
  created_at?: string;
}

export interface Investment {
  id: string;
  user_id?: string;
  name: string;
  category: "Stocks" | "Mutual Funds" | "Fixed Deposits" | "Gold" | "Crypto" | "Other";
  invested_amount: number;
  current_value: number;
  notes?: string;
  created_at?: string;
}

export interface FinancialHealthScore {
  score: number; // 0 to 100
  rating: "Poor" | "Fair" | "Good" | "Excellent";
  explanation: string;
  factors: {
    name: string;
    score: number;
    impact: "positive" | "neutral" | "warning";
    detail: string;
  }[];
}

export interface PredictionModelResult {
  prediction: number;
  mae: number;
  rmse: number;
}

export interface PredictionData {
  predicted_next_month: number;
  best_model: string;
  confidence_level: string;
  models: {
    linear_regression: PredictionModelResult;
    random_forest: PredictionModelResult;
    gradient_boosting: PredictionModelResult;
  };
  historical: { month: string; amount: number }[];
}

export interface FinancialInsight {
  type: string;
  title: string;
  description: string;
  importance: "positive" | "neutral" | "warning" | "high";
}
