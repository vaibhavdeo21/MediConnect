import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const { user, theme } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Hello! I am your AI Health Assistant. Ask me anything.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const backendUrl = import.meta.env.VITE_API_URL;

  // Colors based on theme
  const isPremium = theme === 'premium';
  const bgColor = isPremium ? 'bg-slate-900 border-yellow-500/50' : 'bg-white border-slate-200';
  const headerColor = isPremium ? 'bg-gradient-to-r from-yellow-600 to-yellow-800' : 'bg-primary';
  const textColor = isPremium ? 'text-yellow-50' : 'text-slate-800';

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/api/ai/chat`, 
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', text: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Only for logged in users

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`w-80 h-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${bgColor} mb-4`}
          >
            {/* Header */}
            <div className={`${headerColor} p-4 text-white flex justify-between items-center`}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-bold">AI Health Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></button>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isPremium ? 'bg-slate-800' : 'bg-slate-50'}`}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    msg.role === 'user' 
                      ? (isPremium ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white') 
                      : (isPremium ? 'bg-slate-700 text-yellow-100' : 'bg-white border border-slate-200 text-slate-700')
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs text-slate-400 animate-pulse">Thinking...</div>}
            </div>

            {/* Input */}
            <div className={`p-3 border-t ${isPremium ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-white'} flex gap-2`}>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about symptoms..."
                className={`flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none ${isPremium ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-slate-100 text-slate-900'}`}
              />
              <button onClick={handleSend} className={`${isPremium ? 'text-yellow-500' : 'text-primary'}`}>
                <Send className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${
          isPremium 
          ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white ring-2 ring-yellow-400/50' 
          : 'bg-primary text-white'
        }`}
      >
        <MessageSquare className="h-7 w-7" />
      </button>
    </div>
  );
};

export default Chatbot;