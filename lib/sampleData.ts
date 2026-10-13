import { Transaction, Budget, FinancialGoal, Bill, Investment } from "./types";

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    description: "Monthly Tech Salary",
    amount: 90000,
    category: "Salary",
    transaction_type: "income",
    transaction_date: "2026-09-01",
    created_at: "2026-09-01T09:00:00Z"
  },
  {
    id: "tx-2",
    description: "Swiggy Gourmet Dinner",
    amount: 450,
    category: "Food",
    transaction_type: "expense",
    transaction_date: "2026-09-12",
    is_unusual: false,
    created_at: "2026-09-12T20:30:00Z"
  },
  {
    id: "tx-3",
    description: "Zara Weekend Shopping Spree",
    amount: 5600,
    category: "Shopping",
    transaction_type: "expense",
    transaction_date: "2026-09-14",
    is_unusual: true,
    anomaly_reason: "Amount ₹5,600 is 2.8x higher than your usual shopping ticket (avg ₹2,000).",
    created_at: "2026-09-14T17:15:00Z"
  },
  {
    id: "tx-4",
    description: "Nature's Basket Organic Groceries",
    amount: 3200,
    category: "Food",
    transaction_type: "expense",
    transaction_date: "2026-09-05",
    is_unusual: false,
    created_at: "2026-09-05T11:20:00Z"
  },
  {
    id: "tx-5",
    description: "Uber Rides to Koramangala Hub",
    amount: 1400,
    category: "Transport",
    transaction_type: "expense",
    transaction_date: "2026-09-08",
    is_unusual: false,
    created_at: "2026-09-08T09:40:00Z"
  },
  {
    id: "tx-6",
    description: "Metro Smart Card Recharge",
    amount: 1700,
    category: "Transport",
    transaction_type: "expense",
    transaction_date: "2026-09-03",
    is_unusual: false,
    created_at: "2026-09-03T08:15:00Z"
  },
  {
    id: "tx-7",
    description: "ACT Fibernet Broadband Bill",
    amount: 999,
    category: "Bills",
    transaction_type: "expense",
    transaction_date: "2026-09-07",
    is_unusual: false,
    created_at: "2026-09-07T14:00:00Z"
  },
  {
    id: "tx-8",
    description: "Airtel Postpaid 5G Family",
    amount: 1001,
    category: "Bills",
    transaction_type: "expense",
    transaction_date: "2026-09-10",
    is_unusual: false,
    created_at: "2026-09-10T10:00:00Z"
  },
  {
    id: "tx-9",
    description: "Cult.fit Monthly Membership",
    amount: 1500,
    category: "Health",
    transaction_type: "expense",
    transaction_date: "2026-09-04",
    is_unusual: false,
    created_at: "2026-09-04T07:00:00Z"
  },
  {
    id: "tx-10",
    description: "Blinkit Fast Groceries & Dairy",
    amount: 2550,
    category: "Food",
    transaction_type: "expense",
    transaction_date: "2026-09-18",
    is_unusual: false,
    created_at: "2026-09-18T19:10:00Z"
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: "bg-1",
    category: "Food",
    amount: 8000,
    month: "2026-09"
  },
  {
    id: "bg-2",
    category: "Transport",
    amount: 4000,
    month: "2026-09"
  },
  {
    id: "bg-3",
    category: "Shopping",
    amount: 5000,
    month: "2026-09"
  },
  {
    id: "bg-4",
    category: "Bills",
    amount: 4000,
    month: "2026-09"
  },
  {
    id: "bg-5",
    category: "Health",
    amount: 3000,
    month: "2026-09"
  }
];

export const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: "gl-1",
    name: "Emergency Fund (6 Months Buffer)",
    target_amount: 100000,
    current_amount: 42000,
    target_date: "2026-12-31",
    category: "Savings"
  },
  {
    id: "gl-2",
    name: "MacBook Pro M4 Tech Upgrade",
    target_amount: 85000,
    current_amount: 30000,
    target_date: "2026-11-30",
    category: "Gadgets"
  },
  {
    id: "gl-3",
    name: "Ladakh Bike Expedition 2027",
    target_amount: 50000,
    current_amount: 15000,
    target_date: "2027-05-15",
    category: "Travel"
  }
];

export const INITIAL_BILLS: Bill[] = [
  {
    id: "bl-1",
    title: "ACT High-Speed Fiber Internet",
    amount: 999,
    due_date: "2026-09-30",
    status: "Upcoming",
    recurring_frequency: "Monthly",
    category: "Utilities"
  },
  {
    id: "bl-2",
    title: "Netflix 4K Ultra HD Premium",
    amount: 649,
    due_date: "2026-10-05",
    status: "Upcoming",
    recurring_frequency: "Monthly",
    category: "Entertainment"
  },
  {
    id: "bl-3",
    title: "BESCOM Home Electricity",
    amount: 2200,
    due_date: "2026-10-10",
    status: "Upcoming",
    recurring_frequency: "Monthly",
    category: "Utilities"
  },
  {
    id: "bl-4",
    title: "Airtel 5G Postpaid Bill",
    amount: 1001,
    due_date: "2026-09-10",
    status: "Paid",
    recurring_frequency: "Monthly",
    category: "Mobile"
  }
];

export const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: "inv-1",
    name: "UTI Nifty 50 Index Mutual Fund",
    category: "Mutual Funds",
    invested_amount: 120000,
    current_value: 148500,
    notes: "Monthly SIP of ₹10,000"
  },
  {
    id: "inv-2",
    name: "Tata Consultancy Services (TCS) Equity",
    category: "Stocks",
    invested_amount: 65000,
    current_value: 78200,
    notes: "Bluechip IT equity holdings"
  },
  {
    id: "inv-3",
    name: "RBI Sovereign Gold Bond (SGB Series IV)",
    category: "Gold",
    invested_amount: 50000,
    current_value: 62400,
    notes: "2.5% annual sovereign coupon payout"
  },
  {
    id: "inv-4",
    name: "HDFC 1-Year Tax Saver Fixed Deposit",
    category: "Fixed Deposits",
    invested_amount: 40000,
    current_value: 43200,
    notes: "7.2% fixed interest return"
  }
];

export const HISTORICAL_MONTHLY_EXPENSES = [
  { month: "Apr 2026", amount: 14200 },
  { month: "May 2026", amount: 15800 },
  { month: "Jun 2026", amount: 16400 },
  { month: "Jul 2026", amount: 17900 },
  { month: "Aug 2026", amount: 17200 },
  { month: "Sep 2026", amount: 18400 }
];
