import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Wallet, IndianRupee, ArrowUpRight, ArrowDownLeft, 
  Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown,
  Coins, RotateCcw, Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import GlassCard from '../components/ui/GlassCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import GradientText from '../components/ui/GradientText';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const typeConfig = {
  credit: { icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sign: '+' },
  debit: { icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-500/10', sign: '-' },
  penalty: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', sign: '-' },
  refund: { icon: RotateCcw, color: 'text-cyan-500', bg: 'bg-cyan-500/10', sign: '+' },
  consultation: { icon: Coins, color: 'text-amber-500', bg: 'bg-amber-500/10', sign: '' },
  referral_bonus: { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sign: '+' },
  subscription: { icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10', sign: '-' },
};

const WalletPage = () => {
  const { user } = useContext(AuthContext);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isDoctor = user?.role === 'doctor';
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/wallet/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWalletData(res.data);
      } catch (err) {
        // Fallback to old API for backwards compatibility
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${backendUrl}/api/doctors/wallet`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWalletData({
            balance: res.data.balance || 0,
            transactions: res.data.transactions || [],
            total_credits: 0,
            total_debits: 0,
            total_penalties: 0,
          });
        } catch (e) {
          toast.error("Failed to load wallet data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <SkeletonLoader type="text" count={1} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <SkeletonLoader type="stat" count={1} />
            <div className="lg:col-span-2"><SkeletonLoader type="table-row" count={4} /></div>
          </div>
        </div>
      </div>
    );
  }

  const balance = walletData?.balance || 0;
  const transactions = walletData?.transactions || [];
  const isNegative = balance < 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest glass border border-cyan-500/20 text-cyan-500 mb-4">
            <Wallet className="h-3 w-3" /> Financial Registry
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
            {isDoctor ? 'Earnings' : 'Wallet'} <GradientText gradient="primary">Dashboard</GradientText>
          </h1>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <GlassCard hover={false} variant={isNegative ? 'red' : 'cyan'} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-8 -mt-8 bg-cyan-500/5" />
            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isNegative ? 'bg-red-500/10 text-red-500' : 'gradient-primary text-white'}`}>
                <IndianRupee className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Balance</p>
              <p className={`text-2xl font-display font-bold ${isNegative ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                <AnimatedCounter value={Math.abs(balance)} prefix={isNegative ? '-₹' : '₹'} />
              </p>
              {isNegative && <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">DEBT — PENALTY APPLIED</p>}
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Credits</p>
            <p className="text-xl font-display font-bold text-emerald-500">
              <AnimatedCounter value={walletData?.total_credits || 0} prefix="+₹" />
            </p>
          </GlassCard>

          <GlassCard hover={false}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
              <TrendingDown className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Total Debits</p>
            <p className="text-xl font-display font-bold text-[var(--text-primary)]">
              <AnimatedCounter value={walletData?.total_debits || 0} prefix="₹" />
            </p>
          </GlassCard>

          <GlassCard hover={false} variant={walletData?.total_penalties > 0 ? 'red' : 'default'}>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Penalties</p>
            <p className={`text-xl font-display font-bold ${walletData?.total_penalties > 0 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
              <AnimatedCounter value={walletData?.total_penalties || 0} prefix="₹" />
            </p>
          </GlassCard>
        </div>

        {/* Transactions */}
        <GlassCard hover={false} padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl glass"><Clock className="h-5 w-5 text-cyan-500" /></div>
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Transaction History</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold glass border border-[var(--border-primary)] text-[var(--text-muted)]">
              {transactions.length} entries
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hidden">
            {transactions.length > 0 ? transactions.map((tx) => {
              const config = typeConfig[tx.type] || typeConfig.debit;
              const Icon = config.icon;
              const isPositive = parseFloat(tx.amount) > 0;
              
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-xl border flex items-center justify-between group transition-all hover:bg-[var(--bg-tertiary)] border-[var(--border-subtle)] ${
                    tx.type === 'penalty' ? 'bg-red-500/5 border-red-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${tx.type === 'penalty' ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                        {tx.description || tx.type}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                          {new Date(tx.created_at || tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)]">
                          {tx.type}
                        </span>
                        {tx.reversed && (
                          <span className="text-[10px] font-bold text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10">
                            REVERSED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold font-mono-code ${isPositive ? 'text-emerald-500' : tx.type === 'penalty' ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                      {isPositive ? '+' : ''}₹{Math.abs(parseFloat(tx.amount)).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] flex items-center justify-end gap-1">
                      <CheckCircle2 className="h-3 w-3 text-cyan-500" /> bal: ₹{parseFloat(tx.balance_after || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="text-center py-16">
                <Wallet className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                <p className="text-[var(--text-muted)]">No transactions yet</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default WalletPage;