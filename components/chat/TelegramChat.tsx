'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'Best wood for Parrilla?',
  'Sous vide temps for duck',
  'Kitchen tech news',
  'SFA food safety basics',
];

/** Simple markdown renderer for chat messages */
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const Tag = listType;
      elements.push(
        <Tag key={`list-${elements.length}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} pl-4 my-1.5 space-y-0.5`}>
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
    // Bold **text**
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

    // Bullet list
    if (/^[-•]\s/.test(trimmed)) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(trimmed.replace(/^[-•]\s+/, ''));
      continue;
    }

    // Numbered list
    if (/^\d+[.)]\s/.test(trimmed)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(trimmed.replace(/^\d+[.)]\s+/, ''));
      continue;
    }

    flushList();

    // Empty line
    if (!trimmed) {
      if (elements.length > 0) {
        elements.push(<div key={`br-${i}`} className="h-1.5" />);
      }
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed">{formatInline(trimmed)}</p>
    );
  }

  flushList();
  return elements;
}

export function CulinaryChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' && sessionStorage.getItem('culinary-chat-interacted');
    if (stored) setHasInteracted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasInteracted) {
      setHasInteracted(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('culinary-chat-interacted', 'true');
      }
    }
  };

  const sendMessage = async (text: string, attempt = 1) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.message }]);
      } else if ((res.status === 503 || res.status === 529) && attempt < 3) {
        // Overloaded — auto-retry after a short delay
        setIsLoading(false);
        await new Promise(r => setTimeout(r, 2000 * attempt));
        return sendMessage(text, attempt + 1);
      } else {
        setMessages([
          ...updatedMessages,
          { role: 'assistant', content: data.error || 'Something went wrong. Please try again.' },
        ]);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError') {
        // Timed out — retry once automatically
        if (attempt < 2) {
          setIsLoading(false);
          return sendMessage(text, attempt + 1);
        }
        setMessages([
          ...updatedMessages,
          { role: 'assistant', content: 'The response took too long. Please try a shorter question or try again.' },
        ]);
      } else {
        setMessages([
          ...updatedMessages,
          { role: 'assistant', content: 'Unable to reach the assistant. Please try again in a moment.' },
        ]);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Button with Label */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-lg shadow-md text-xs font-semibold text-white whitespace-nowrap animate-fade-in"
            style={{ backgroundColor: '#2D2D2D', border: '1px solid rgba(197, 165, 114, 0.3)' }}
          >
            <span style={{ color: '#C5A572' }}>1-Group</span> Culinary Assistant
          </div>
          <button
            onClick={handleOpen}
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
            style={{ backgroundColor: '#C5A572' }}
            aria-label="Open culinary chat"
          >
            <ChefHat size={26} className="text-white" />
            {!hasInteracted && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: '#C5A572' }}
                />
                <span
                  className="relative inline-flex rounded-full h-4 w-4 border-2 border-white"
                  style={{ backgroundColor: '#C5A572' }}
                />
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-0 right-0 z-50 sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-[100dvh] sm:h-[520px] sm:max-h-[80vh] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up"
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between flex-shrink-0"
            style={{ backgroundColor: '#2D2D2D' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#C5A572' }}
              >
                <ChefHat size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">
                  1-Group Culinary Agent
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">AI Kitchen Assistant</p>
              </div>
            </div>
            <button
              onClick={() => { setIsOpen(false); setMessages([]); }}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-3">
            {/* Welcome state */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Welcome to the <strong>1-Group Culinary Agent</strong>. I can help with:
                  </p>
                  <ul className="mt-3 space-y-2">
                    {[
                      { icon: '\u{1F525}', text: 'Cooking techniques & food science' },
                      { icon: '\u{1F4CB}', text: 'SOPs & training content' },
                      { icon: '\u{1F916}', text: 'Kitchen tech & AI news' },
                      { icon: '\u{1F1F8}\u{1F1EC}', text: 'Singapore F&B industry updates' },
                    ].map((item) => (
                      <li key={item.text} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-base leading-5 flex-shrink-0">{item.icon}</span>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Try asking
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 hover:shadow-sm"
                        style={{ borderColor: '#C5A572', color: '#C5A572' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#C5A572';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#C5A572';
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                    style={{ backgroundColor: '#C5A572' }}
                  >
                    <ChefHat size={12} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'text-white text-sm leading-relaxed rounded-br-md'
                      : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-md'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: '#C5A572' } : undefined}
                >
                  {msg.role === 'user' ? (
                    <span className="text-sm leading-relaxed">{msg.content}</span>
                  ) : (
                    <div className="space-y-1">{renderMarkdown(msg.content)}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                  style={{ backgroundColor: '#C5A572' }}
                >
                  <ChefHat size={12} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" style={{ color: '#C5A572' }} />
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white border-t border-gray-100 flex-shrink-0 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the culinary agent..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full outline-none transition-colors focus:border-gray-400 disabled:opacity-50 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 hover:opacity-90 active:scale-95 flex-shrink-0"
              style={{ backgroundColor: '#C5A572' }}
              aria-label="Send message"
            >
              <Send size={16} className="text-white ml-0.5" />
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out 0.3s both;
        }
      `}</style>
    </>
  );
}
