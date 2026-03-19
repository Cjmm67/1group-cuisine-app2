'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  ChefHat, Flame, UtensilsCrossed, BookOpen, RefreshCw, Palette, FlaskConical,
  Send, Loader2, ArrowLeft, Sparkles, X, Upload, FileText, Image as ImageIcon,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  fileName?: string;
}

interface AttachedFile {
  name: string;
  type: 'pdf' | 'image' | 'text';
  textContent?: string;
  base64?: string;
  mediaType?: string;
}

const MODES = [
  {
    id: 'menu-intelligence',
    title: 'Menu Intelligence',
    subtitle: 'Upload Menu → Brand DNA & Benchmarking',
    description: 'Upload or paste your menu for instant Brand DNA analysis, competitive benchmarking against Singapore and international restaurants, gap identification, and dish concepts inspired by the world\'s best.',
    icon: BookOpen,
    colour: 'from-gold-500 to-gold-700',
    prompt: 'I want to analyse a menu. I\'ll paste or describe the menu contents now. Run the full Brand DNA Analysis, competitive benchmarking, and opportunity map.',
    mode: 'Menu Intelligence Engine',
  },
  {
    id: 'dish-builder',
    title: 'Dish Builder',
    subtitle: 'Idea → Complete Recipe',
    description: 'Turn a spark — an ingredient, a memory, a technique — into a fully developed, production-ready dish with costing, allergens, and plating. References comparable dishes from restaurants globally.',
    icon: Flame,
    colour: 'from-orange-500 to-red-600',
    prompt: 'I want to create a new dish. Help me develop it from concept to a complete kitchen recipe card with global restaurant references.',
    mode: 'Dish Builder',
  },
  {
    id: 'flavour-explorer',
    title: 'Flavour Explorer',
    subtitle: 'Ingredient → Pairing Ideas',
    description: 'Explore what works with a given ingredient through molecular science, classical tradition, and progressive combinations — grounded in real restaurant examples.',
    icon: Sparkles,
    colour: 'from-amber-500 to-yellow-600',
    prompt: 'I want to explore flavour pairings for an ingredient. Give me molecular, classical, and progressive pairing ideas with real restaurant references.',
    mode: 'Flavour Explorer',
  },
  {
    id: 'menu-architect',
    title: 'Menu Architect',
    subtitle: 'Brief → Complete Menu',
    description: 'Build a tasting menu, à la carte section, banquet set, or seasonal rotation — benchmarked against comparable restaurants with narrative arc and costing.',
    icon: UtensilsCrossed,
    colour: 'from-emerald-500 to-teal-600',
    prompt: 'I need to build a menu. Help me design the full sequence benchmarked against comparable restaurants globally.',
    mode: 'Menu Architect',
  },
  {
    id: 'adaptation-engine',
    title: 'Adaptation Engine',
    subtitle: 'Existing Dish → Transformed',
    description: 'Adapt a dish for dietary needs, seasonal changes, cost reduction, scaling to banquet, or translating between venues — with references to how top restaurants handle the same.',
    icon: RefreshCw,
    colour: 'from-blue-500 to-indigo-600',
    prompt: 'I have an existing dish that needs to be adapted. Help me transform it with references to how other restaurants approach this.',
    mode: 'Adaptation Engine',
  },
  {
    id: 'plating-coach',
    title: 'Plating Coach',
    subtitle: 'Description → Actionable Feedback',
    description: 'Get specific, actionable plating feedback — composition, colour, height, sauce work, garnish, vessel — referencing plating from benchmark restaurants.',
    icon: Palette,
    colour: 'from-purple-500 to-pink-600',
    prompt: 'I want feedback on a dish presentation. I\'ll describe the plating or share what I have.',
    mode: 'Plating & Presentation Coach',
  },
  {
    id: 'rd-lab',
    title: 'R&D Lab',
    subtitle: 'Technique → Test Protocol',
    description: 'Experiment with fermentation, smoking, curing, hydrocolloids, or any technique — with food science, test protocols, HACCP notes, and who\'s leading globally.',
    icon: FlaskConical,
    colour: 'from-cyan-500 to-blue-600',
    prompt: 'I want to experiment with a technique or process. Help me design a test protocol with food science and references to who\'s leading in this space.',
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
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large — max 10MB');
      return;
    }

    if (file.type === 'application/pdf') {
      // Read PDF as base64 for Anthropic API document type
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAttachedFile({
          name: file.name,
          type: 'pdf',
          base64,
          mediaType: 'application/pdf',
        });
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      // Read image as base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const mediaType = file.type as string;
        setAttachedFile({
          name: file.name,
          type: 'image',
          base64,
          mediaType,
        });
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      const text = await file.text();
      setAttachedFile({
        name: file.name,
        type: 'text',
        textContent: text,
      });
    } else {
      alert('Supported formats: PDF, images (JPG, PNG), or text files');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    const currentFile = attachedFile;
    setAttachedFile(null);

    // Build the display message
    const displayText = currentFile
      ? userMsg
        ? `📎 ${currentFile.name}\n\n${userMsg}`
        : `📎 ${currentFile.name}\n\nAnalyse this menu — run the full Brand DNA Analysis, competitive benchmarking, and opportunity map.`
      : userMsg;

    // Build the API content blocks
    let apiContent: any;
    if (currentFile) {
      const blocks: any[] = [];

      if (currentFile.type === 'pdf' && currentFile.base64) {
        blocks.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: currentFile.base64,
          },
        });
      } else if (currentFile.type === 'image' && currentFile.base64) {
        blocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: currentFile.mediaType,
            data: currentFile.base64,
          },
        });
      } else if (currentFile.type === 'text' && currentFile.textContent) {
        blocks.push({
          type: 'text',
          text: `[UPLOADED MENU FILE: ${currentFile.name}]\n\n${currentFile.textContent}`,
        });
      }

      // Add user text instruction
      blocks.push({
        type: 'text',
        text: userMsg || `This is a menu from a 1-Group venue. Run the full Menu Intelligence Engine: Brand DNA Analysis, competitive benchmarking against comparable restaurants in Singapore and internationally, gap analysis, and opportunity map with specific dish concepts. Be specific with restaurant references and actionable ideas.`,
      });

      apiContent = blocks;
    } else {
      apiContent = userMsg;
    }

    // Build message history for API (previous messages as text-only, new message may be multimodal)
    const prevApiMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const newDisplayMessages: Message[] = [...messages, { role: 'user' as const, content: displayText, fileName: currentFile?.name }];
    setMessages(newDisplayMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...prevApiMessages, { role: 'user', content: apiContent }],
          mode: activeMode?.mode,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages([...newDisplayMessages, { role: 'assistant', content: data.message }]);
      }
    } catch {
      setMessages([...newDisplayMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
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
    setAttachedFile(null);
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
              Upload your menu for instant Brand DNA analysis and competitive benchmarking, or dive into dish development, flavour exploration, and culinary R&D.
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
                Paste a menu for instant Brand DNA analysis, describe a dish idea, share an ingredient, or tell me what you're working on.
                I'll figure out the best way to help.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'I want to do something with crab',
                  'Analyse our current Kaarla menu',
                  'Build a 7-course tasting menu',
                  'Explore pairings for yuzu',
                  'Make my lobster dish gluten-free',
                  'What are Singapore\'s top fire restaurants doing?',
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
      <div
        className="flex-shrink-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-gold-50'); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove('bg-gold-50'); }}
        onDrop={(e) => { e.currentTarget.classList.remove('bg-gold-50'); handleFileDrop(e); }}
      >
        <div className="max-w-screen-lg mx-auto">
          {/* Attached file preview */}
          {attachedFile && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-gold-50 border border-gold-200 rounded-lg text-sm">
              {attachedFile.type === 'pdf' ? <FileText size={16} className="text-gold-600 flex-shrink-0" /> : <ImageIcon size={16} className="text-gold-600 flex-shrink-0" />}
              <span className="text-gold-800 font-medium truncate flex-1">{attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="text-gold-400 hover:text-gold-600 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 flex-shrink-0 border border-gray-200"
              title="Upload menu (PDF, image, or text file)"
            >
              <Upload size={18} className="text-gray-500" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = '';
              }}
            />

            {/* Text input */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachedFile ? "Add notes about this menu (optional)..." : "Describe your idea, paste a menu, or drop a file..."}
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

            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={(!input.trim() && !attachedFile) || isLoading}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 hover:opacity-90 active:scale-95 flex-shrink-0 bg-gray-900 hover:bg-gray-800"
            >
              <Send size={16} className="text-white ml-0.5" />
            </button>
          </div>

          <p className="text-[10px] text-gray-400 mt-1.5 text-center">Drop a PDF or image of your menu, or paste the text directly</p>
        </div>
      </div>
    </div>
  );
}
