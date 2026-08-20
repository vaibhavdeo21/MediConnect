import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, User, Send, X, Plus, Search, MessageSquare, MoreVertical,
  Edit2, Pin, Trash2, Check, Copy, Menu, Sparkles, Lock, ArrowDown
} from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SUGGESTED_PROMPTS = [
  "What are common cold remedies?",
  "Explain my blood pressure reading",
  "Diet tips for diabetes management",
  "How to prepare for a doctor visit",
  "Mental wellness exercises",
  "Side effects of paracetamol"
];

const AIHealthAssistant = ({ isOpen, onClose, isPremium, user }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 5, isPremium: false, remaining: 5 });
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const themeAccent = isPremium ? 'var(--gold-accent, #d4a76a)' : 'var(--cyan-accent, #06b6d4)';

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      fetchUsage();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ai/conversations`, getHeaders());
      setConversations(res.data || []);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  const fetchUsage = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/ai/usage`, getHeaders());
      setUsage(res.data);
    } catch (error) {
      console.error("Failed to fetch usage stats", error);
    }
  };

  const loadConversation = async (conv) => {
    setActiveConversation(conv);
    try {
      const res = await axios.get(`${API_URL}/api/ai/conversations/${conv.id || conv._id}`, getHeaders());
      setMessages(res.data || []);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (error) {
      console.error("Failed to fetch messages", error);
      toast.error("Could not load conversation");
    }
  };

  const createNewChat = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/ai/conversations`, { title: "New Conversation" }, getHeaders());
      const newConv = res.data;
      setConversations([newConv, ...conversations]);
      setActiveConversation(newConv);
      setMessages([]);
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (error) {
      console.error("Failed to create conversation", error);
      toast.error("Could not create a new chat");
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    if (!isPremium && usage.remaining <= 0) {
      toast.warning("You have reached your daily limit. Upgrade to Premium for unlimited AI access.");
      return;
    }

    let currentConvId = activeConversation?.id || activeConversation?._id;
    if (!currentConvId) {
      try {
        const res = await axios.post(`${API_URL}/api/ai/conversations`, { title: text.substring(0, 30) }, getHeaders());
        currentConvId = res.data.id || res.data._id;
        setActiveConversation(res.data);
        setConversations([res.data, ...conversations]);
      } catch (err) {
        toast.error("Failed to initialize conversation");
        return;
      }
    }

    const userMessage = { role: 'user', content: text, id: Date.now().toString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/ai/chat`, { message: text, conversationId: currentConvId }, getHeaders());
      
      const aiMessage = { role: 'assistant', content: res.data.reply, id: Date.now().toString() + 'ai' };
      setMessages(prev => [...prev, aiMessage]);
      fetchUsage();
      
      if (res.data.title) {
        setConversations(prev => prev.map(c => 
          (c.id === currentConvId || c._id === currentConvId) ? { ...c, title: res.data.title } : c
        ));
      }
    } catch (error) {
      console.error("Failed to send message", error);
      const errMsg = error.response?.data?.error || "Failed to get response from AI";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/api/ai/conversations/${id}`, getHeaders());
      setConversations(conversations.filter(c => (c.id || c._id) !== id));
      if (activeConversation && (activeConversation.id === id || activeConversation._id === id)) {
        setActiveConversation(null);
        setMessages([]);
      }
      setMenuOpenId(null);
      toast.success("Conversation deleted");
    } catch (err) {
      toast.error("Failed to delete conversation");
    }
  };

  const togglePin = async (conv, e) => {
    e.stopPropagation();
    const id = conv.id || conv._id;
    try {
      await axios.put(`${API_URL}/api/ai/conversations/${id}/pin`, {}, getHeaders());
      setConversations(conversations.map(c => (c.id || c._id) === id ? { ...c, isPinned: !c.isPinned } : c));
      setMenuOpenId(null);
    } catch (err) {
      toast.error("Failed to pin conversation");
    }
  };

  const renameConversation = async (id, newTitle) => {
    if (!newTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await axios.put(`${API_URL}/api/ai/conversations/${id}`, { title: newTitle }, getHeaders());
      setConversations(conversations.map(c => (c.id || c._id) === id ? { ...c, title: newTitle } : c));
      setEditingId(null);
    } catch (err) {
      toast.error("Failed to rename conversation");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    setShowScrollBottom(!bottom && e.target.scrollTop > 0);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const filteredConversations = conversations.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  const pinnedConvs = filteredConversations.filter(c => c.isPinned);
  const recentConvs = filteredConversations.filter(c => !c.isPinned);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full md:w-[60%] h-full bg-[var(--bg-primary)] border-l border-[var(--border-primary)] shadow-2xl flex flex-col md:flex-row overflow-hidden text-[var(--text-primary)]"
          style={{ backgroundColor: 'var(--bg-primary, #ffffff)', color: 'var(--text-primary, #111827)' }}
        >
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'w-full md:w-[280px]' : 'w-0'} flex-shrink-0 border-r border-[var(--border-primary)] flex flex-col transition-all duration-300 overflow-hidden bg-[var(--bg-secondary)] glass-card`}>
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <button 
                onClick={createNewChat}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-opacity-20 transition-all font-medium text-sm"
                style={{ backgroundColor: isPremium ? 'rgba(212,167,106,0.1)' : 'rgba(6,182,212,0.1)', color: themeAccent, border: `1px solid ${themeAccent}` }}
              >
                <Plus size={18} /> New Chat
              </button>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-2 p-2 rounded-lg hover:bg-[var(--hover-bg)]">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-[var(--border-primary)]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:outline-none focus:border-[var(--brand-primary)] text-sm glass-input"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {pinnedConvs.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Pinned</h3>
                  {pinnedConvs.map(conv => (
                    <ConversationItem 
                      key={conv.id || conv._id} conv={conv} active={activeConversation}
                      onClick={() => loadConversation(conv)} onMenuToggle={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === (conv.id || conv._id) ? null : (conv.id || conv._id)); }}
                      menuOpen={menuOpenId === (conv.id || conv._id)}
                      onPin={(e) => togglePin(conv, e)} onDelete={(e) => deleteConversation(conv.id || conv._id, e)}
                      editing={editingId === (conv.id || conv._id)} editTitle={editTitle} setEditTitle={setEditTitle}
                      onStartEdit={(e) => { e.stopPropagation(); setEditingId(conv.id || conv._id); setEditTitle(conv.title); setMenuOpenId(null); }}
                      onSaveEdit={() => renameConversation(conv.id || conv._id, editTitle)}
                    />
                  ))}
                </div>
              )}
              
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Recent</h3>
                {recentConvs.length === 0 ? (
                  <p className="text-sm text-gray-500 px-2 py-4 text-center">No recent chats</p>
                ) : (
                  recentConvs.map(conv => (
                    <ConversationItem 
                      key={conv.id || conv._id} conv={conv} active={activeConversation}
                      onClick={() => loadConversation(conv)} onMenuToggle={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === (conv.id || conv._id) ? null : (conv.id || conv._id)); }}
                      menuOpen={menuOpenId === (conv.id || conv._id)}
                      onPin={(e) => togglePin(conv, e)} onDelete={(e) => deleteConversation(conv.id || conv._id, e)}
                      editing={editingId === (conv.id || conv._id)} editTitle={editTitle} setEditTitle={setEditTitle}
                      onStartEdit={(e) => { e.stopPropagation(); setEditingId(conv.id || conv._id); setEditTitle(conv.title); setMenuOpenId(null); }}
                      onSaveEdit={() => renameConversation(conv.id || conv._id, editTitle)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col relative h-full">
            {/* Header */}
            <div className="h-16 border-b border-[var(--border-primary)] flex items-center justify-between px-4 glass-card z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                {!sidebarOpen && (
                  <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[var(--hover-bg)]">
                    <Menu size={20} />
                  </button>
                )}
                <h2 className="font-semibold text-lg truncate max-w-[200px] md:max-w-[400px]">
                  {activeConversation ? activeConversation.title : "New Chat"}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--hover-bg)] transition-colors text-gray-500">
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[var(--bg-primary)] scroll-smooth relative"
            >
              {!activeConversation && messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl"
                    style={{ background: isPremium ? 'linear-gradient(135deg, #d4a76a, #b8860b)' : 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                    <Bot size={40} className="text-white" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">How can I help you today?</h1>
                  <p className="text-gray-500 mb-8 max-w-md">I can answer health questions, explain medical terms, or provide general wellness advice.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="text-left p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--hover-bg)] transition-colors text-sm shadow-sm glass-card"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id || index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full group`}
                  >
                    <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0 mt-1">
                        {msg.role === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                            <User size={18} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ background: isPremium ? 'linear-gradient(135deg, #d4a76a, #b8860b)' : 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                            <Bot size={18} />
                          </div>
                        )}
                      </div>
                      
                      {/* Bubble */}
                      <div className="relative group">
                        <div 
                          className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            msg.role === 'user' 
                              ? 'text-white rounded-tr-none font-medium' 
                              : 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-tl-none glass-card prose prose-sm max-w-none dark:prose-invert'
                          }`}
                          style={msg.role === 'user' ? { 
                            background: isPremium ? 'linear-gradient(135deg, #d4a76a, #b8860b)' : 'linear-gradient(135deg, #06b6d4, #0891b2)' 
                          } : {}}
                        >
                          {msg.role === 'user' ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <ReactMarkdown
                              components={{
                                strong: ({ node, ...props }) => <strong className="font-bold text-amber-500 dark:text-amber-400" {...props} />,
                                b: ({ node, ...props }) => <b className="font-bold text-amber-500 dark:text-amber-400" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-base font-bold my-2 text-[var(--text-primary)]" {...props} />,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          )}
                        </div>
                        
                        {msg.role === 'assistant' && (
                          <button 
                            onClick={() => copyToClipboard(msg.content)}
                            className="absolute -right-10 top-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy to clipboard"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
                  <div className="flex gap-3 max-w-[75%] flex-row">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ background: isPremium ? 'linear-gradient(135deg, #d4a76a, #b8860b)' : 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                      <Bot size={18} />
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-tl-none flex items-center gap-2 glass-card">
                      <div className="flex gap-1">
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-gray-400" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-gray-400" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-gray-400" />
                      </div>
                      <span className="text-sm text-gray-500 ml-2">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Scroll to bottom button */}
            <AnimatePresence>
              {showScrollBottom && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-24 right-1/2 transform translate-x-1/2 p-2 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-50 z-20"
                >
                  <ArrowDown size={20} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-primary)] glass-card flex-shrink-0 z-10">
              {!isPremium && usage.remaining <= 0 ? (
                <div className="w-full p-4 rounded-xl border border-amber-200 bg-amber-50 text-center flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold">
                    <Lock size={18} /> Daily limit reached
                  </div>
                  <p className="text-sm text-amber-600">Upgrade to Premium for unlimited AI health assistance.</p>
                  <button className="mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all">
                    Upgrade Now
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="relative flex items-center">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Ask about symptoms, medications, health tips..."
                      className="w-full min-h-[56px] max-h-[120px] py-4 pl-4 pr-14 rounded-xl border border-[var(--border-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] bg-[var(--bg-secondary)] resize-none custom-scrollbar glass-input"
                      style={{ border: `1px solid var(--border-primary)` }}
                      rows={1}
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      className="absolute right-2 p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ background: isPremium ? 'linear-gradient(135deg, #d4a76a, #b8860b)' : 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  
                  {/* Usage Counter */}
                  {!isPremium && (
                    <div className="flex items-center justify-between px-1 mt-1">
                      <span className="text-xs text-gray-500">{usage.used}/{usage.limit} messages today</span>
                      <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const ConversationItem = ({ conv, active, onClick, onMenuToggle, menuOpen, onPin, onDelete, editing, editTitle, setEditTitle, onStartEdit, onSaveEdit }) => {
  const isActive = active && (active.id === conv.id || active._id === conv._id);
  
  return (
    <div 
      onClick={onClick}
      className={`relative group flex items-center p-3 my-1 rounded-xl cursor-pointer transition-colors ${
        isActive ? 'bg-[var(--hover-bg)]' : 'hover:bg-[var(--bg-primary)]'
      }`}
    >
      <MessageSquare size={18} className={`mr-3 ${isActive ? 'text-[var(--brand-primary)]' : 'text-gray-400'}`} />
      
      <div className="flex-1 overflow-hidden">
        {editing ? (
          <input
            autoFocus
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={onSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
            className="w-full bg-transparent border-b border-gray-400 focus:outline-none text-sm text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="truncate text-sm font-medium text-[var(--text-primary)]">{conv.title}</div>
        )}
      </div>

      <button 
        onClick={onMenuToggle}
        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700 ${menuOpen ? 'opacity-100' : ''}`}
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-8 top-8 w-36 bg-[var(--bg-primary)] rounded-lg shadow-xl border border-[var(--border-primary)] z-50 overflow-hidden py-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={onPin} className="w-full flex items-center px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)]">
            <Pin size={14} className="mr-2" /> {conv.isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button onClick={onStartEdit} className="w-full flex items-center px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)]">
            <Edit2 size={14} className="mr-2" /> Rename
          </button>
          <button onClick={onDelete} className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600">
            <Trash2 size={14} className="mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default AIHealthAssistant;
