import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Wallet, IndianRupee, ArrowUpRight, ArrowDownLeft, 
  Clock, CheckCircle2, Filter, Download 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const WalletPage = () => {
  const { user, theme } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isDoctor = user?.role === 'doctor';
  const backendUrl = import.meta.env.VITE_API_URL;

  // UNIVERSAL THEME SYNC
  const isDark = theme === 'dark';
  const pageBg = isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900";
  const cardBase = isDark 
    ? "bg-slate-900 border-white/5 shadow-2xl shadow-black/20" 
    : "bg-white border-blue-100 shadow-xl shadow-blue-900/5";
  const accentText = isDark ? "text-cyan-400" : "text-blue-700";
  const subText = isDark ? "text-slate-400" : "text-slate-500";

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/doctors/wallet`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBalance(res.data.balance || 0);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        toast.error("Failed to sync wallet data");
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, [backendUrl]);

  return (
    <div className={`min-h-screen ${pageBg} py-24 px-4 sm:px-6 lg:px-8 text-left transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest mb-4 border ${
                isDark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
                Financial Registry
            </div>
            <h1 className={`text-4xl font-serif font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Earnings Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-1 rounded-[2.5rem] p-10 relative overflow-hidden border ${cardBase}`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-10 -mt-10 ${isDark ? 'bg-cyan-500/10' : 'bg-blue-500/5'}`}></div>
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-700'}`}>
                    <IndianRupee className="h-6 w-6" />
                </div>
                <p className={`${subText} text-sm font-medium mb-1`}>Total Balance</p>
                <h2 className={`text-5xl font-serif font-bold mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{balance.toLocaleString()}</h2>
                
                <button className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isDark ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/10'
                }`}>
                    Withdraw Funds <ArrowUpRight className="h-4 w-4" />
                </button>
            </div>
          </motion.div>

          {/* Transactions List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`lg:col-span-2 rounded-[2.5rem] p-8 flex flex-col border ${cardBase}`}
          >
            <div className="flex items-center justify-between mb-8">
                <h3 className={`text-xl font-serif font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Clock className={`h-5 w-5 ${accentText}`} /> Recent Payouts
                </h3>
                <div className="flex gap-2">
                    <button className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Filter className="h-4 w-4" /></button>
                    <button className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><Download className="h-4 w-4" /></button>
                </div>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className={`h-20 w-full rounded-2xl animate-pulse ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`}></div>)
                ) : transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <div key={tx.id} className={`p-5 rounded-2xl border flex items-center justify-between group transition-all ${
                            isDark ? 'bg-slate-800/30 border-white/5 hover:bg-slate-800/50' : 'bg-slate-50 border-slate-100 hover:bg-blue-50/50'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {tx.type === 'credit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{tx.description}</p>
                                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${tx.type === 'credit' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-white' : 'text-slate-900')}`}>
                                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                </p>
                                <p className="flex items-center justify-end gap-1 text-[10px] text-slate-500">
                                    <CheckCircle2 className={`h-3 w-3 ${isDark ? 'text-cyan-500' : 'text-blue-500'}`} /> Settled
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-500 italic">No transaction history found.</p>
                    </div>
                )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default WalletPage;