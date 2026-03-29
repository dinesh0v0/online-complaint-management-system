import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, LogIn, UserPlus, Lock, Mail, User } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { signIn, signUp, session, profile } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  // If already authenticated, redirect
  if (session && profile) {
    const from = location.state?.from?.pathname || (profile.role === 'admin' ? '/admin' : '/portal');
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn({ email: form.email, password: form.password });
        if (signInError) throw signInError;
      } else {
        const { error: authError } = await signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.fullName } },
        });
        if (authError) throw authError;
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg w-full">
      {/* Left Splash Screen - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary/90 z-0"></div>
        {/* Abstract shapes matching modern Stitch layout depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-black/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-lg px-12 text-white">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-xl border border-white/20">
            <ShieldCheck size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold leading-tight mb-4 tracking-tight">
            Secure Citizen Complaint Portal
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Report issues, track progress, and help maintain the integrity of our community services with real-time updates directly from the administrator board.
          </p>
          
          <div className="mt-12 flex items-center gap-4 text-sm font-medium text-white/60">
            <div className="h-px w-8 bg-white/20"></div>
            <span>Stitch Secure Implementation</span>
          </div>
        </div>
      </div>

      {/* Right Form Screen */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[420px]">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
             <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShieldCheck size={32} />
             </div>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-display font-bold text-text mb-2 tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-text-muted text-sm sm:text-base">
              {isLogin 
                ? 'Enter your credentials to securely access your portal.' 
                : 'Enter your details to register as a citizen.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  <label className="text-sm font-semibold text-text">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <Input
                      type="text"
                      required
                      placeholder="John Doe"
                      className="pl-10 h-11"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-text">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="pl-10 h-11"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-text">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold transition-all mt-4 hover:shadow-lg hover:shadow-primary/20" 
              disabled={loading}
            >
              {loading ? (
                 <span className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                   Processing...
                 </span>
              ) : isLogin ? (
                <span className="flex items-center gap-2 justify-center w-full">
                  Sign In <LogIn size={18} />
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center w-full">
                  Create Account <UserPlus size={18} />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-text-muted">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-primary hover:text-primary-600 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
