# FINORA (3D Financial Intelligence Platform)

> **"A bank statement that talks back."**

Finora is a production-grade, AI-powered personal finance intelligence platform designed primarily for Indian users. It transforms raw transactions into clear financial insights, machine learning predictions, 3D interactive visualizations, and conversational financial guidance.

All financial metrics are natively formatted in Indian Rupees (**₹ INR** with Lakhs/Crores convention).

---

## 🌟 Key Features

### 1. 3D WebGL Experiences (Three.js & React Three Fiber)
- **Interactive 3D Earth Globe (Hero)**: Interactive procedural 3D Earth Globe on the landing page with 360° mouse drag/rotation, inertia physics, glowing cybernetic continent matrices, latitude/longitude graticules, atmospheric Fresnel rim lighting, pulsing financial hub pins, animated 3D flight arcs with moving photons, and scroll-driven cinematic camera zoom.
- **Your Money Universe (`/universe`)**: A 3D spatial financial cosmos. Traces cash flow between a central **Financial Health Core** and 6 interactive 3D nodes:
  - Total Income (₹90,000 - Emerald)
  - Total Expenses (₹18,400 - Rose)
  - Net Savings (₹71,600 - Cyan)
  - Investments (₹3,32,300 - Violet)
  - Recurring Bills (₹4,849 - Amber)
  - Financial Goals (₹87,000 - Indigo)

### 2. Main Financial Dashboard (`/dashboard`)
- **5 Dynamic Financial Cards**: Total Income, Total Expenses, Current Balance, Savings Rate, Next Month Prediction.
- **Data Visualizations (Recharts)**: Income vs Expenses Bar Chart & Category Breakdown Donut Chart.
- **Financial Health Diagnostic**: Dynamic 0-100 score (e.g. 78/100) calculated from savings rate, budget adherence, spending spikes, and emergency reserves with explainable factors.
- **Empty State Support**: Built-in empty state handling if all records are cleared.

### 3. Machine Learning Predictions (`/predictions`)
- **Python scikit-learn Engine**: Compares 3 regression algorithms:
  - **Linear Regression**
  - **Random Forest Regressor**
  - **Gradient Boosting Regressor**
- **Loss Benchmarking**: Computes Mean Absolute Error (**MAE**) and Root Mean Squared Error (**RMSE**) to pick the winning model.
- **Unusual Transaction Detection**: Unsupervised **Isolation Forest** flags anomalous transactions (e.g. Zara Shopping at ₹5,600) without false fraud alarms.

### 4. Ask Finora AI (`/ai`)
- **Conversational Financial Copilot**: Asks natural language questions grounded strictly in the user's real database facts (Zero hallucinated financial numbers).
- **Suggested Quick Prompts**:
  - *"Where am I spending the most?"*
  - *"How much did I spend this month?"*
  - *"How much did I save?"*
  - *"What will my expenses look like next month?"*
  - *"Which transactions look unusual?"*
  - *"Can I reduce my food expenses?"*

### 5. Complete Wealth Modules
- **Transactions Ledger (`/transaction`)**: Search, filter by type/category, sort by newest/oldest/highest/lowest, CSV export, and anomaly flags.
- **Monthly Budgets (`/budgets`)**: Category budget caps with dynamic progress bars and *On Track* / *Over Budget* status indicators.
- **Financial Reports (`/reports`)**: 6-Month cashflow trajectory, largest transactions, average ticket size, and algorithmic insights.
- **Financial Goals (`/goals`)**: Emergency Fund, Laptop upgrade, Ladakh trip with visual progress bars and contribution deposit modals.
- **Bills & Subscriptions (`/bills`)**: OTT platforms, broadband, BESCOM power, due date countdowns, and quick "Mark as Paid" toggles.
- **Investments (`/investments`)**: Manual tracker for Mutual Funds, Stocks (TCS), SGB Gold Bonds, and Fixed Deposits with unrealized gains/losses.
- **Settings (`/settings`)**: Currency settings, Supabase connection status, JSON backup export, and demo reset controls.
- **Authentication (`/login` & `/signup`)**: Supabase Auth support with 1-Click Instant Demo login.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`
- **Charts**: Recharts
- **Machine Learning**: Python 3.10+, scikit-learn, NumPy, Pandas, Flask (`ml_api.py`)
- **Database**: Supabase PostgreSQL with Row-Level Security (`supabase/schema.sql`)
- **AI**: OpenAI API with grounded local hybrid fallback engine

---

## 🚀 Getting Started

### 1. Run the Next.js Frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the website.

### 2. (Optional) Run the Python ML API Server
```bash
npm run ml-server
# Runs ml_api.py on port 5001
```
*Note: The Next.js frontend has built-in regression fallback engines, so the app functions smoothly even if the Python service is offline.*

### 3. Database Setup (Supabase)
Run the SQL queries from `supabase/schema.sql` in your Supabase SQL Editor to initialize tables, foreign keys, triggers, and Row-Level Security (RLS) policies.
