import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Bot, Send, Trash2, AlertOctagon, User, Loader2 } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AIAssistant = () => {
  const { i18n, t } = useTranslation('ai');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: t('assistantTitle') + ': ' + t('placeholder'),
      disclaimer: t('disclaimer'),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/assistant', {
        message: textToSend,
        language: i18n.language || 'en',
      });

      const aiMsg = {
        sender: 'ai',
        text: res.data.text,
        disclaimer: res.data.disclaimer,
        isEmergency: res.data.isEmergency,
        suggestedQuestions: res.data.suggestedQuestions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Apologies, I encountered an issue connecting to the AI Service.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Chat history cleared. How may I assist you with healthcare services today?',
        disclaimer: t('disclaimer'),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-600 text-white rounded-2xl shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('assistantTitle')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multilingual Healthcare Navigation Assistant (English, हिन्दी, मराठी)
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" icon={Trash2} onClick={clearChat}>
          Clear History
        </Button>
      </div>

      {/* Main Chat Body */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md h-[550px] flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  msg.sender === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-900 text-brand-400'
                }`}
              >
                {msg.sender === 'user' ? 'You' : 'AI'}
              </div>

              <div
                className={`max-w-lg p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : msg.isEmergency
                    ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-tl-none'
                    : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Suggested Questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">{t('suggested')}:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(q)}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] hover:border-brand-500 hover:text-brand-600 font-medium transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
              <span>SWASTH AI is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('placeholder')}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100"
          />
          <Button variant="primary" onClick={() => handleSend()} loading={loading} icon={Send}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
