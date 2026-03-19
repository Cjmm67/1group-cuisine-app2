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

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.message }]);
      } else {
        setMessages([
          ...updatedMessages,
          { role: 'assistant', content: data.error || 'Sorry, something went wrong. Please try again.' },
        ]);
      }
    } catch {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: 'Network error. Please check your connection and try again.' },
      ]);
    } finally {
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
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
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
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-0 right-0 z-50 sm:bottom-6 sm:right-6 w-full sm:w-[400px] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up"
          style={{ height: 'min(600px, calc(100vh - 80px))' }}
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
              onClick={() => setIsOpen(false)}
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
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-md'
                      : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-md'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: '#C5A572' } : undefined}
                >
                  {msg.content.split('\n').map((line, j) => (
                    <React.Fragment key={j}>
                      {line}
                      {j < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
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
            className="px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0 flex items-center gap-2"
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
      `}</style>
    </>
  );
}
