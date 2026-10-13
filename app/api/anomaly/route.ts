import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { transactions } = await req.json();
    const list = Array.isArray(transactions) ? transactions : [];

    // Try Python Flask ML service if running
    try {
      const pyRes = await fetch('http://127.0.0.1:5001/anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: list }),
        signal: AbortSignal.timeout(1500)
      });
      if (pyRes.ok) {
        const pyData = await pyRes.json();
        return NextResponse.json({ ...pyData, provider: 'python-isolation-forest' });
      }
    } catch {
      // Fallback
    }

    // Heuristic outlier detection
    const expenses = list.filter((t: any) => t.transaction_type === 'expense');
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    expenses.forEach((t: any) => {
      const cat = t.category || 'Other';
      if (!categoryTotals[cat]) categoryTotals[cat] = { sum: 0, count: 0 };
      categoryTotals[cat].sum += t.amount;
      categoryTotals[cat].count += 1;
    });

    const annotated = list.map((t: any) => {
      if (t.transaction_type === 'expense') {
        const cat = t.category || 'Other';
        const stats = categoryTotals[cat];
        const avg = stats ? stats.sum / stats.count : t.amount;
        if (t.amount > avg * 2.2 && stats.count >= 2) {
          return {
            ...t,
            is_unusual: true,
            anomaly_reason: `Amount ₹${t.amount.toLocaleString('en-IN')} is higher than your usual ${cat} expenses (avg ₹${Math.round(avg).toLocaleString('en-IN')}).`
          };
        }
      }
      return { ...t, is_unusual: false, anomaly_reason: null };
    });

    return NextResponse.json({ transactions: annotated, provider: 'finora-statistical-detector' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
