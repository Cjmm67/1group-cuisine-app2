'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, X, ExternalLink, MessageCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

const TELEGRAM_BOT_URL = 'https://t.me/onegroupculinary_bot';

const QUICK_PROMPTS = [
  'Best wood for Parrilla?',
  'Sous vide temps for duck',
  'Kitchen tech news',
];

export function TelegramChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' && sessionStorage.getItem('telegram-chat-interacted');
    if (stored) setHasInteracted(true);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasInteracted) {
      setHasInteracted(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('telegram-chat-interacted', 'true');
      }
    }
  };

  const handleClose = () => setIsOpen(false);

  const openTelegram = (prompt?: string) => {
    const url = prompt
      ? `${TELEGRAM_BOT_URL}?start=${encodeURIComponent(prompt)}`
      : TELEGRAM_BOT_URL;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Only show for authenticated users
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

          {/* Pulse badge */}
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

      {/* Slide-up Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 sm:bottom-6 sm:right-6 w-full sm:w-[380px] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up"
          style={{ maxHeight: 'min(580px, calc(100vh - 100px))' }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between flex-shrink-0"
            style={{ backgroundColor: '#2D2D2D' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#C5A572' }}
              >
                <ChefHat size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">
                  1-Group Culinary Agent
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">AI Kitchen Assistant</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-5 space-y-4">
            {/* Welcome message */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                Welcome to the <strong>1-Group Culinary Agent</strong>. I can help you with:
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  { icon: '🔥', text: 'Cooking techniques & food science' },
                  { icon: '📋', text: 'SOPs & training content' },
                  { icon: '🤖', text: 'Kitchen tech & AI news' },
                  { icon: '🇸🇬', text: 'Singapore F&B industry updates' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-base leading-5 flex-shrink-0">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Prompts */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => openTelegram(prompt)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 hover:shadow-sm"
                    style={{
                      borderColor: '#C5A572',
                      color: '#C5A572',
                    }}
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

          {/* Footer CTA */}
          <div className="px-5 py-4 bg-white border-t border-gray-100 flex-shrink-0 space-y-3">
            <button
              onClick={() => openTelegram()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#0088cc' }}
            >
              <MessageCircle size={18} />
              Open in Telegram
              <ExternalLink size={14} className="opacity-60" />
            </button>
            <p className="text-[11px] text-gray-400 text-center leading-tight">
              Chat privately via Telegram. Your conversations are personal.
            </p>
          </div>
        </div>
      )}

      {/* Animation style */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
