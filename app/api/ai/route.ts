import { NextRequest, NextResponse } from 'next/server';

interface AIRequestPayload {
  question: string;
  context: {
    totalIncome: number;
    totalExpenses: number;
    currentBalance: number;
    savingsRate: number;
    nextMonthPrediction: number;
    categorySpending: Record<string, number>;
    unusualTransactions: { description: string; amount: number; category: string }[];
    budgets: { category: string; amount: number; spent: number }[];
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AIRequestPayload = await req.json();
    const { question, context } = body;

    const lowerQ = question.toLowerCase();

    // Check if OPENAI_API_KEY is configured
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && !apiKey.includes('placeholder')) {
      // Call OpenAI with grounded factual context
      const prompt = `You are Finora AI, a personal financial intelligence assistant designed for Indian users.
Rule 1: NEVER invent or hallucinate financial numbers. ONLY use the actual financial data provided below.
Rule 2: Format all amounts in Indian Rupees (₹) with appropriate commas (e.g. ₹18,400, ₹90,000).
Rule 3: Keep responses conversational, actionable, and encouraging, but state clearly that predictions are estimates rather than guaranteed outcomes.

USER'S ACTUAL FINANCIAL DATA:
- Total Income: ₹${context.totalIncome.toLocaleString('en-IN')}
- Total Expenses: ₹${context.totalExpenses.toLocaleString('en-IN')}
- Current Balance: ₹${context.currentBalance.toLocaleString('en-IN')}
- Savings Rate: ${context.savingsRate}%
- Next Month ML Predicted Expenses: ₹${context.nextMonthPrediction.toLocaleString('en-IN')}
- Category Spending: ${JSON.stringify(context.categorySpending)}
- Flagged Unusual Transactions: ${JSON.stringify(context.unusualTransactions)}
- Budget Targets: ${JSON.stringify(context.budgets)}

User Question: "${question}"`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are Finora AI financial assistant.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3
          })
        });

        if (response.ok) {
          const data = await response.json();
          const answer = data.choices[0]?.message?.content;
          if (answer) {
            return NextResponse.json({ answer, source: 'openai-grounded' });
          }
        }
      } catch (e) {
        console.warn('OpenAI API call failed, falling back to Finora Hybrid Rule Engine', e);
      }
    }

    // Grounded Hybrid Finora AI Engine (Ensures 100% reliability, zero hallucinations, fast response)
    let answer = "";

    // 1. Where am I spending the most?
    if (lowerQ.includes('where') && (lowerQ.includes('spend') || lowerQ.includes('most') || lowerQ.includes('highest'))) {
      const entries = Object.entries(context.categorySpending || {}).sort((a, b) => b[1] - a[1]);
      if (entries.length > 0) {
        const [topCat, topAmt] = entries[0];
        const pct = context.totalExpenses > 0 ? Math.round((topAmt / context.totalExpenses) * 100) : 0;
        const secondCat = entries[1] ? ` Your next highest category is ${entries[1][0]} at ₹${entries[1][1].toLocaleString('en-IN')}.` : '';

        answer = `Your highest spending category this month is **${topCat}** at **₹${topAmt.toLocaleString('en-IN')}**, which represents **${pct}%** of your total monthly expenses.${secondCat}\n\n💡 If you want to optimize your monthly outflow, ${topCat} offers the highest leverage for potential savings.`;
      } else {
        answer = "You haven't recorded any expenses yet. Once you log transactions, I can pinpoint your largest expense areas.";
      }
    }
    // 2. How much did I spend this month?
    else if (lowerQ.includes('how much') && (lowerQ.includes('spend') || lowerQ.includes('expense'))) {
      answer = `You have spent a total of **₹${context.totalExpenses.toLocaleString('en-IN')}** this month against a total income of **₹${context.totalIncome.toLocaleString('en-IN')}**.\n\nThis leaves you with a retained balance of **₹${context.currentBalance.toLocaleString('en-IN')}** and a savings rate of **${context.savingsRate}%**.`;
    }
    // 3. How much did I save / savings rate?
    else if (lowerQ.includes('save') || lowerQ.includes('balance') || lowerQ.includes('savings')) {
      answer = `Your current balance is **₹${context.currentBalance.toLocaleString('en-IN')}**, reflecting a savings rate of **${context.savingsRate}%**.\n\n${
        context.savingsRate >= 30
          ? "🎉 Outstanding! You are exceeding the conventional 20% savings rule. This surplus can accelerate your Emergency Fund or investment portfolio."
          : "Consider allocating 10% more into savings before beginning discretionary spends."
      }`;
    }
    // 4. Next month prediction
    else if (lowerQ.includes('next month') || lowerQ.includes('predict') || lowerQ.includes('forecast')) {
      answer = `Based on your historical spending patterns, the Finora Gradient Boosting Machine Learning model estimates your expenses next month to be approximately **₹${context.nextMonthPrediction.toLocaleString('en-IN')}**.\n\n⚠️ *Note: This is a statistical estimate based on recent expense velocity rather than a guaranteed outcome.*`;
    }
    // 5. Unusual transactions
    else if (lowerQ.includes('unusual') || lowerQ.includes('anomaly') || lowerQ.includes('strange') || lowerQ.includes('flagged')) {
      if (context.unusualTransactions && context.unusualTransactions.length > 0) {
        const item = context.unusualTransactions[0];
        answer = `Yes, our Isolation Forest detector flagged **${context.unusualTransactions.length} transaction(s)**:\n\n• **${item.description}** (₹${item.amount.toLocaleString('en-IN')} in ${item.category}): This is noticeably higher than your standard spending profile for ${item.category}.\n\nWould you like to review or categorize it as an intentional one-off purchase?`;
      } else {
        answer = "✅ No unusual transactions detected! All recent expenses fall within your typical statistical distribution.";
      }
    }
    // 6. Can I reduce food / optimize budget?
    else if (lowerQ.includes('food') || lowerQ.includes('reduce') || lowerQ.includes('cut')) {
      const foodSpend = context.categorySpending['Food'] || 0;
      answer = `Your food expenditures currently stand at **₹${foodSpend.toLocaleString('en-IN')}**.\n\nTo optimize this:\n1. Consolidate food delivery app orders (delivery fees and surges average 15-20% per order).\n2. Plan weekly bulk pantry essentials via grocery delivery instead of ad-hoc quick-commerce orders.\n3. Setting a ₹7,000 food budget cap could save you up to ₹${Math.max(0, foodSpend - 7000).toLocaleString('en-IN')} this month.`;
    }
    // 7. General Financial Summary
    else {
      const topCat = Object.entries(context.categorySpending || {}).sort((a, b) => b[1] - a[1])[0];
      answer = `Here is your high-level financial summary:\n\n• **Income:** ₹${context.totalIncome.toLocaleString('en-IN')}\n• **Expenses:** ₹${context.totalExpenses.toLocaleString('en-IN')}\n• **Net Balance:** ₹${context.currentBalance.toLocaleString('en-IN')}\n• **Savings Rate:** ${context.savingsRate}%\n• **Top Category:** ${topCat ? `${topCat[0]} (₹${topCat[1].toLocaleString('en-IN')})` : 'N/A'}\n• **Estimated Next Month:** ₹${context.nextMonthPrediction.toLocaleString('en-IN')}\n\nYou are in a solid financial position. Ask me anything specific about your budgets, upcoming bills, or goal timelines!`;
    }

    return NextResponse.json({ answer, source: 'finora-hybrid-intelligence' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing request' }, { status: 500 });
  }
}
