'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  ChefHat, Flame, UtensilsCrossed, BookOpen, RefreshCw, Palette, FlaskConical,
  Send, Loader2, ArrowLeft, Sparkles, X,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MODES = [
  {
    id: 'dish-builder',
    title: 'Dish Builder',
    subtitle: 'Idea → Complete Recipe',
    description: 'Turn a spark — an ingredient, a memory, a technique — into a fully developed, production-ready dish with costing, allergens, and plating.',
    icon: Flame,
    colour: 'from-orange-500 to-red-600',
    prompt: 'I want to create a new dish. Help me develop it from concept to a complete kitchen recipe card.',
    mode: 'Dish Builder',
  },
  {
    id: 'flavour-explorer',
    title: 'Flavour Explorer',
    subtitle: 'Ingredient → Pairing Ideas',
    description: 'Explore what works with a given ingredient through molecular science, classical tradition, and progressive unexpected combinations.',
    icon: Sparkles,
    colour: 'from-amber-500 to-yellow-600',
    prompt: 'I want to explore flavour pairings for an ingredient. Give me molecular, classical, and progressive pairing ideas.',
    mode: 'Flavour Explorer',
  },
  {
    id: 'menu-architect',
    title: 'Menu Architect',
    subtitle: 'Brief → Complete Menu',
    description: 'Build a tasting menu, à la carte section, banquet set, or seasonal rotation with narrative arc, pressure-testing, and costing.',
    icon: BookOpen,
    colour: 'from-emerald-500 to-teal-600',
    prompt: 'I need to build a menu. Help me design the full sequence with narrative arc, costing, and kitchen feasibility.',
    mode: 'Menu Architect',
  },
  {
    id: 'adaptation-engine',
    title: 'Adaptation Engine',
    subtitle: 'Existing Dish → Transformed',
    description: 'Adapt a dish for dietary needs, seasonal changes, cost reduction, scaling to banquet, or translating between venues.',
    icon: RefreshCw,
    colour: 'from-blue-500 to-indigo-600',
    prompt: 'I have an existing dish that needs to be adapted. Help me transform it while keeping its identity.',
    mode: 'Adaptation Engine',
  },
  {
    id: 'plating-coach',
    title: 'Plating Coach',
    subtitle: 'Photo → Actionable Feedback',
    description: 'Get specific, actionable plating feedback — composition, colour, height, sauce work, garnish, vessel — plus alternative concepts.',
    icon: Palette,
    colour: 'from-purple-500 to-pink-600',
    prompt: 'I want feedback on a dish presentation. I\'ll describe the plating or share what I have.',
    mode: 'Plating & Presentation Coach',
  },
  {
    id: 'rd-lab',
    title: 'R&D Lab',
    subtitle: 'Technique → Test Protocol',
    description: 'Experiment with fermentation, smoking, curing, hydrocolloids, or any technique — with food science, test protocols, and HACCP notes.',
    icon: FlaskConical,
    colour: 'from-cyan-500 to-blue-600',
    prompt: 'I want to experiment with a technique or process. Help me design a test protocol with food science backing.',
    mode: 'R&D Lab',
  },
];

/** Simple markdown renderer */
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const Tag = listType;
      elements.push(
        <Tag key={`list-${elements.length}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} pl-5 my-2 space-y-1`}>
          {listItems.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed">{formatInline(item)}</li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  const formatInline = (str: string): React.ReactNode => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^[-•]\s/.test(trimmed)) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(trimmed.replace(/^[-•]\s+/, ''));
      continue;
    }
    if (/^\d+[.)]\s/.test(trimmed)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(trimmed.replace(/^\d+[.)]\s+/, ''));
      continue;
    }

    flushList();

    if (!trimmed) {
      if (elements.length > 0) elements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed">{formatInline(trimmed)}</p>
    );
  }
  flushList();
  return elements;
}

export default function CreatePage() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<typeof MODES[number] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (activeMode && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [activeMode]);

  const startMode = async (mode: typeof MODES[number]) => {
    setActiveMode(mode);
    setMessages([]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: mode.prompt }],
          mode: mode.mode,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages([
          { role: 'user', content: mode.prompt },
          { role: 'assistant', content: data.message },
        ]);
      }
    } catch {
      setMessages([
        { role: 'user', content: mode.prompt },
        { role: 'assistant', content: 'Sorry, there was an error connecting to the creative assistant. Please try again.' },
      ]);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          mode: activeMode?.mode,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exitMode = () => {
    setActiveMode(null);
    setMessages([]);
    setInput('');
  };

  // ── Mode Selection View ──
  if (!activeMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gray-950 text-white">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-gold-600/20 border border-gold-500/30 rounded-full px-4 py-1.5 mb-5">
              <ChefHat size={16} className="text-gold-400" />
              <span className="text-gold-300 text-xs font-semibold tracking-wide uppercase">AI Creative Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4">
              Create Stunning Dishes
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Your AI creative partner for dish development, flavour exploration, menu design, and culinary R&D.
              Choose a mode to begin.
            </p>
          </div>
        </section>

        {/* Mode Cards */}
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 -mt-8 relative z-10 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => startMode(mode)}
                  className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 text-left hover:border-gold-300 hover:shadow-lg transition-all duration-200 active:scale-[0.98] group"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mode.colour} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-gold-700 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-xs font-medium text-gold-600 mb-2">{mode.subtitle}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{mode.description}</p>
                </button>
              );
            })}
          </div>

          {/* Quick start */}
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5 sm:p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">
              Or start with a freeform idea — the studio will detect the right mode automatically.
            </p>
            <button
              onClick={() => {
                setActiveMode({
                  id: 'freeform',
                  title: 'Creative Studio',
                  subtitle: 'Freeform',
                  description: '',
                  icon: ChefHat,
                  colour: 'from-gold-500 to-gold-700',
                  prompt: '',
                  mode: '',
                });
              }}
              className="inline-flex items-center gap-2 bg-gray-950 hover:bg-gray-800 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors active:scale-[0.97]"
            >
              <UtensilsCrossed size={16} />
              Start Freeform Session
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ── Active Chat View ──
  const ModeIcon = activeMode.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={exitMode}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
              title="Back to modes"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeMode.colour} flex items-center justify-center`}>
              <ModeIcon size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">{activeMode.title}</h2>
              <p className="text-xs text-gray-500">{activeMode.subtitle}</p>
            </div>
          </div>
          <button
            onClick={exitMode}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="max-w-screen-lg mx-auto space-y-4">
          {/* Welcome for freeform */}
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeMode.colour} flex items-center justify-center mx-auto mb-4`}>
                <ModeIcon size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Creative Studio</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Describe your idea, share an ingredient, or tell me what you're working on.
                I'll figure out the best way to help.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'I want to do something with crab',
                  'Explore pairings for yuzu',
                  'Build a 7-course tasting menu for Kaarla',
                  'Make my lobster dish gluten-free',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-gold-300 hover:text-gold-700 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, idx) => {
            // Hide the auto-generated first user message (mode prompt)
            if (idx === 0 && msg.role === 'user' && activeMode.prompt && msg.content === activeMode.prompt) {
              return null;
            }
            return (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${activeMode.colour} flex items-center justify-center flex-shrink-0 mr-2 mt-1`}>
                    <ModeIcon size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gray-900 text-white rounded-br-md'
                      : 'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${activeMode.colour} flex items-center justify-center flex-shrink-0 mr-2 mt-1`}>
                <ModeIcon size={14} className="text-white" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-gold-500" />
                <span className="text-sm text-gray-400">Creating...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-screen-lg mx-auto flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your idea, ingredient, technique, or challenge..."
            disabled={isLoading}
            rows={1}
            className="flex-1 px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none transition-colors focus:border-gold-400 focus:ring-1 focus:ring-gold-400 disabled:opacity-50 placeholder:text-gray-400 resize-none"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = '44px';
              el.style.height = Math.min(el.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 hover:opacity-90 active:scale-95 flex-shrink-0 bg-gray-900 hover:bg-gray-800"
          >
            <Send size={16} className="text-white ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
