import { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const { user, theme } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I am your **MediConnect AI Assistant**. How can I help you with your health queries today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const isPremium = theme === 'premium';
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

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
      setMessages(prev => [...prev, { role: 'ai', text: "I'm experiencing a high volume of queries. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isPremium) return null; // Exclusive for Premium Users

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-[380px] h-[550px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-yellow-500/20 bg-slate-950 mb-6"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Sparkles className="h-5 w-5 text-yellow-200" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm tracking-wide">Elite AI Assistant</h3>
                  <p className="text-[10px] text-yellow-200 uppercase font-black tracking-tighter">Powered by Gemini Pro</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-black/20 p-1 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-lg ${msg.role === 'user'
                      ? 'bg-yellow-600 text-white rounded-tr-none'
                      : 'bg-slate-900 text-yellow-50 border border-yellow-500/10 rounded-tl-none'
                    }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-bold uppercase">
                      {msg.role === 'user' ? <><User className="h-3 w-3" /> You</> : <><Bot className="h-3 w-3" /> MediConnect AI</>}
                    </div>
                    <div className="prose prose-invert prose-sm">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-900 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-inner">
                    <div className="flex gap-1">
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 bg-yellow-500 rounded-full"></motion.span>
                    </div>
                    <span className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest">Analyzing Symptoms</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-slate-900 border-t border-yellow-500/10 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about symptoms or health tips..."
                className="flex-1 bg-slate-800 border-0 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-yellow-500/30 outline-none transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                className="bg-yellow-600 p-3 rounded-xl text-white shadow-lg shadow-yellow-600/20"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl shadow-2xl flex items-center justify-center text-white relative group"
      >
        <div className="absolute inset-0 bg-yellow-400 rounded-2xl animate-ping opacity-20 group-hover:opacity-40"></div>
        {isOpen ? <X className="h-8 w-8 relative z-10" /> : <MessageSquare className="h-8 w-8 relative z-10" />}
      </motion.button>
    </div>
  );
};

export default Chatbot;