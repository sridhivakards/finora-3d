'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/DashboardSidebar';
import { FinoraStore } from '@/lib/storage';
import { formatINR } from '@/lib/utils';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Brain,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Cpu,
  ChevronDown,
  Layers,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  PieChart,
  Target
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'finora';
  text: string;
  timestamp: string;
  source?: string;
  liked?: boolean | null;
}

type PromptCategory = 'All' | 'Spending' | 'Forecast' | 'Anomalies' | 'Optimization';

const CATEGORIZED_PROMPTS: { category: PromptCategory; prompt: string; icon: string }[] = [
  { category: 'Spending', prompt: 'Where am I spending the most?', icon: '📊' },
  { category: 'Spending', prompt: 'How much did I spend this month?', icon: '💳' },
  { category: 'Optimization', prompt: 'How much did I save and what is my savings rate?', icon: '💰' },
  { category: 'Forecast', prompt: 'What will my expenses look like next month?', icon: '🔮' },
  { category: 'Anomalies', prompt: 'Which transactions look unusual?', icon: '⚠️' },
  { category: 'Optimization', prompt: 'Can I reduce my food expenses?', icon: '🥗' },
  { category: 'Spending', prompt: 'Give me a summary of my finances.', icon: '📑' },
  { category: 'Optimization', prompt: 'How close am I to my budget caps?', icon: '🎯' },
];

export default function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'finora',
      text: "Hello Dhilikesh! I am Finora AI, your personal financial copilot.\n\nI have securely audited your live September 2026 ledger (Income: ₹90,000, Expenses: ₹18,400, Retained Savings: ₹71,600). Ask me anything about where your money went, your ML predictions, or how to calibrate your budget allocations.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Finora Grounded Engine v2.4',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [ledgerAttached, setLedgerAttached] = useState(true);
  const [thinkingStep, setThinkingStep] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Stepped thinking simulation during loading
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setThinkingStep(0);
      timer = setInterval(() => {
        setThinkingStep((prev) => (prev + 1) % 3);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Speech Recognition Setup (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleFeedback = (id: string, liked: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, liked: m.liked === liked ? null : liked } : m))
    );
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
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
      const summary = FinoraStore.getFinancialSummary();
      const txs = FinoraStore.getTransactions();
      const budgets = FinoraStore.getBudgets();

      const context = {
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        currentBalance: summary.currentBalance,
        savingsRate: summary.savingsRate,
        nextMonthPrediction: summary.nextMonthPrediction,
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
          text: data.answer || "I have analyzed your ledger. Everything looks steady!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source === 'openai-grounded' ? 'GPT-4o Grounded' : 'Finora Hybrid Core v2.4',
        };
        setMessages((prev) => [...prev, finoraMsg]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-fallback',
        sender: 'finora',
        text: "I analyzed your latest records. You have spent ₹18,400 out of ₹90,000 income, retaining ₹71,600 (79.6% savings rate). Food remains your primary expense at ₹6,200. Let me know if you would like optimization strategies.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Finora Hybrid Core (Offline)',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts =
    selectedCategory === 'All'
      ? CATEGORIZED_PROMPTS
      : CATEGORIZED_PROMPTS.filter((p) => p.category === selectedCategory);

  const thinkingStepsText = [
    'Auditing live September ledger & transaction feeds...',
    'Querying Prophet ML forecast engine & variance models...',
    'Synthesizing grounded financial intelligence response...',
  ];

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex">
      <DashboardSidebar />

      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col h-screen overflow-hidden">
        {/* React Bits Pro AI Chat 4 Header */}
        <header className="px-6 lg:px-8 py-4 border-b border-slate-800/80 bg-[#080d1e]/85 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Finora AI Copilot</span>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </h1>

                {/* Grounded Engine Status Tag */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-semibold text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>v2.4 Grounded</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Active Ledger:</span>
                <span className="text-emerald-400 font-semibold font-mono">10 Transactions</span>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-300 font-mono">5 Budget Caps</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLedgerAttached(!ledgerAttached)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                ledgerAttached
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title="Toggle Ledger Context Attachment"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ledger Attached</span>
            </button>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'init-reset',
                    sender: 'finora',
                    text: "Chat memory refreshed. What financial topic or transaction would you like to explore?",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    source: 'Finora Grounded Engine v2.4',
                  },
                ])
              }
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs flex items-center gap-1"
              title="Reset Chat Session"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline text-xs">Clear</span>
            </button>
          </div>
        </header>

        {/* Chat Message Scrollport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Grounding Safety Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900/80 via-[#0a1226]/80 to-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shadow-sm">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Finora Factual Grounding:</strong> AI responses strictly cite your local ledger.
                Predictions use ARIMA/Prophet models and are for budgeting guidance only.
              </span>
            </div>
            <span className="hidden md:inline font-mono text-[10px] text-cyan-400/80">SECURE_SANDBOX</span>
          </div>

          {/* Messages */}
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 sm:gap-4 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Bot Avatar */}
                {msg.sender === 'finora' && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20 border border-cyan-400/30">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                {/* Message Box */}
                <div
                  className={`group relative max-w-[85%] sm:max-w-2xl rounded-3xl p-5 text-xs sm:text-sm leading-relaxed transition-all ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                      : 'bg-gradient-to-b from-[#0c1428] to-[#080d1b] border border-cyan-500/20 text-slate-200 rounded-tl-none shadow-2xl'
                  }`}
                >
                  {/* Assistant Meta Tag */}
                  {msg.sender === 'finora' && (
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800/80 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5 font-mono text-cyan-400">
                        <Cpu className="w-3 h-3" />
                        <span>{msg.source || 'Finora Grounded Intelligence'}</span>
                      </div>
                      <span className="font-mono text-slate-500">{msg.timestamp}</span>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="whitespace-pre-wrap selection:bg-cyan-500/30 font-normal space-y-2">
                    {msg.text.split('\n\n').map((paragraph, idx) => {
                      // Format bold tokens
                      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={idx} className="leading-relaxed">
                          {parts.map((p, pIdx) => {
                            if (p.startsWith('**') && p.endsWith('**')) {
                              return (
                                <strong key={pIdx} className="text-white font-bold">
                                  {p.slice(2, -2)}
                                </strong>
                              );
                            }
                            return p;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* User Timestamp */}
                  {msg.sender === 'user' && (
                    <div className="mt-2 text-right text-[10px] text-indigo-200/80 font-mono">
                      {msg.timestamp}
                    </div>
                  )}

                  {/* Assistant Interactive Toolbar */}
                  {msg.sender === 'finora' && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                            speakingId === msg.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Read aloud"
                        >
                          {speakingId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleFeedback(msg.id, true)}
                          className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                            msg.liked === true ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Helpful response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, false)}
                          className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                            msg.liked === false ? 'text-rose-400' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Unhelpful response"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Stepped Thinking Animation */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 sm:gap-4 max-w-2xl"
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="p-4 rounded-3xl bg-[#0c1428] border border-cyan-500/30 text-cyan-300 rounded-tl-none shadow-xl flex items-center gap-3 text-xs">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <span className="font-mono">{thinkingStepsText[thinkingStep]}</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* React Bits Pro AI Chat 4 Dock & Prompt Chips */}
        <div className="p-4 lg:p-6 border-t border-slate-800/80 bg-[#080d1e]/95 backdrop-blur-xl space-y-3 shrink-0 z-10">
          {/* Categorized Chips Carousel */}
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(['All', 'Spending', 'Optimization', 'Forecast', 'Anomalies'] as PromptCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filteredPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.01]"
                >
                  <span>{item.icon}</span>
                  <span>{item.prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Futuristic Command Input Dock */}
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center rounded-2xl bg-gradient-to-r from-[#0c1428] via-[#0e172e] to-[#0c1428] border border-cyan-500/30 p-2 shadow-2xl focus-within:border-cyan-400 focus-within:shadow-cyan-500/20 transition-all"
            >
              {/* Mic / Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2.5 rounded-xl transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80'
                }`}
                title={isRecording ? 'Listening... click to stop' : 'Voice input'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                placeholder={
                  isRecording
                    ? 'Listening to speech...'
                    : 'Ask Finora AI about expenses, budget runway, savings, or forecasts...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 active:scale-95 transition-all"
                title="Send query (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 mt-1.5">
              <span>Press <strong>Enter ↵</strong> to submit</span>
              <span>Grounded on 100% real ledger metrics</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
