import React, { useState } from 'react';
import { aiApi } from '../api/ai.api';
import { Bot, Send, Sparkles, User, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I am your LifeOS AI Assistant. I have full read access to your PostgreSQL database tasks and deadlines. Ask me anything or choose a quick action prompt below!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const quickPrompts = [
    'What should I work on today?',
    'Which deadlines are most urgent?',
    'Create a plan for this week.',
    'Which tasks are at risk?',
    'How can I finish my upcoming assignments?',
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat(prompt, conversationId);
      setConversationId(res.conversationId);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to receive response from AI backend.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-400" />
          AI Life & Deadline Assistant
        </h1>
        <p className="text-sm text-slate-400">Contextual intelligence analyzing your live database schedule</p>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-300 hover:text-white transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Messages Window */}
      <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
                msg.role === 'user'
                  ? 'bg-blue-600'
                  : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>AI is querying your database tasks...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI about your deadlines or schedule..."
          className="flex-1 px-4 py-2 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
