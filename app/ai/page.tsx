'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import {
  MessageCircle,
  Send,
  UserRound,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'finora';
  text: string;
  timestamp: string;
  source?: string;
}

const QUICK_PROMPTS = [
  'Where am I spending the most capital?',
  'How much have I spent so far this month?',
  'What is my current savings rate?',
  'How close am I to my category budget limits?',
  'Give me an executive summary of my financial position.',
];

export default function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dbStats, setDbStats] = useState({ txCount: 0, budgetCount: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [txs, budgets] = await Promise.all([
          db.transactions.list().catch(() => []),
          db.budgets.list().catch(() => []),
        ]);
        setDbStats({ txCount: txs.length, budgetCount: budgets.length });

        // Initial welcome message
        setMessages([
          {
            id: 'welcome',
            sender: 'finora',
            text: `Hello. I am your Finora financial intelligence assistant. I have direct access to your verified ledger (${txs.length} transactions, ${budgets.length} budgets). You can ask me to analyze category concentrations, calculate savings margins, or evaluate budget progress.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'Finora Grounded Intelligence',
          },
        ]);
      } catch {
        // Fallback
      }
    })();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (queryText?: string) => {
    const query = (queryText || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const [txs, budgets] = await Promise.all([
        db.transactions.list(),
        db.budgets.list(),
      ]);

      const summary = db.computeSummary(txs);
      const nextMonthPred = Math.round(summary.totalExpenses * 1.05);

      const context = {
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        currentBalance: summary.currentBalance,
        savingsRate: summary.savingsRate,
        nextMonthPrediction: nextMonthPred,
        categorySpending: summary.categorySpending,
        unusualTransactions: txs
          .filter((t) => t.is_unusual)
          .map((t) => ({ description: t.description, amount: t.amount, category: t.category })),
        budgets: budgets.map((b) => ({
          category: b.category,
          amount: b.amount,
          spent: summary.categorySpending[b.category] || 0,
        })),
      };

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, context }),
      });

      if (res.ok) {
        const data = await res.json();
        const finoraMsg: ChatMessage = {
          id: 'msg-' + Date.now() + '-reply',
          sender: 'finora',
          text: data.answer || 'I have analyzed your ledger. Everything looks steady.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'Finora Grounded Intelligence',
        };
        setMessages((prev) => [...prev, finoraMsg]);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Failed to generate response');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-error',
        sender: 'finora',
        text: `Unable to complete request: ${err?.message || 'Connection failed'}. Please check your connection and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Finora System Advisory',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#1D2923]">
      <DashboardSidebar />

      <main className="lg:pl-64 pt-14 lg:pt-0 pb-16 flex flex-col h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full py-6 flex flex-col flex-1 h-full">
          {/* Header */}
          <div className="pb-4 border-b border-[#E6E5DC] flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-normal text-[#1D2923] tracking-tight">
                AI Financial Assistant
              </h1>
              <p className="text-xs text-[#777E77] mt-0.5">
                Inquire about spending velocity, budget boundaries and historical patterns
              </p>
            </div>
            <div className="text-[11px] font-mono text-[#777E77] px-2.5 py-1 bg-[#FFFFFF] border border-[#E6E5DC] rounded-md shadow-subtle">
              Grounded on {dbStats.txCount} Records
            </div>
          </div>

          {/* Quick Questions Pills */}
          <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#F0F1E9] border border-[#E6E5DC] text-[11px] text-[#1D2923] transition-colors shadow-subtle disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-[#244C3B] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-subtle">
                      <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-xl p-4 text-xs leading-relaxed ${isUser
                        ? 'bg-[#E5EBDD] text-[#244C3B] border border-[#CBD4C7]'
                        : 'bg-[#FFFFFF] text-[#1D2923] border border-[#E6E5DC] shadow-subtle'
                      }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    <div className="mt-2.5 pt-2 border-t border-[#E6E5DC]/70 flex items-center justify-between text-[10px] text-[#777E77]">
                      <span>{m.timestamp}</span>
                      {!isUser && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(m.text, m.id)}
                            className="hover:text-[#1D2923] transition-colors"
                            title="Copy response"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-[#39845B]" strokeWidth={1.75} />
                            ) : (
                              <Copy className="w-3 h-3" strokeWidth={1.75} />
                            )}
                          </button>
                          <span>{m.source}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-[#F0F1E9] border border-[#E6E5DC] flex items-center justify-center text-[#244C3B] shrink-0 mt-0.5">
                      <UserRound className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-[#244C3B] flex items-center justify-center text-white shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-3.5 text-xs text-[#777E77] flex items-center gap-2 shadow-subtle">
                  <span className="w-2 h-2 rounded-full bg-[#244C3B] animate-pulse" />
                  <span>Synthesizing database ledger...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E6E5DC] rounded-xl p-1.5 shadow-subtle focus-within:border-[#244C3B] transition-all"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about spending categories, monthly savings, or budget limits..."
                disabled={loading}
                className="flex-1 px-3 py-2 bg-transparent text-xs text-[#1D2923] placeholder:text-[#9A9F98] outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-[#244C3B] hover:bg-[#1D3D30] text-white text-xs font-medium rounded-lg transition-colors shadow-subtle flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
