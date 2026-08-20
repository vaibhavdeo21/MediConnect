import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bot, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import AIHealthAssistant from './AIHealthAssistant';

const Chatbot = () => {
  const { user, isPremium } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* AI Panel */}
      <AIHealthAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} isPremium={isPremium} user={user} />

      {/* Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[999] h-14 w-14 rounded-2xl shadow-2xl flex items-center justify-center text-white"
        style={{ background: isPremium ? 'linear-gradient(135deg, #d4a76a, #b8860b)' : 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
      >
        <Bot className="h-6 w-6" />
        {!isPremium && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
            <Lock className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </motion.button>
    </>
  );
};

export default Chatbot;