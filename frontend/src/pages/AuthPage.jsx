import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, ArrowRight, LockKeyhole } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { routeForRole } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ThemeToggle } from '../components/ThemeToggle';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  
  const [mode, setMode] = useState('sign-in');
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nextPath = useMemo(() => location.state?.from?.pathname, [location.state]);

  const handleChange = (e) => {
    setForm((curr) => ({ ...curr, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'sign-in') {
        const response = await signIn({ email: form.email, password: form.password });
        navigate(nextPath || routeForRole(response.profile.role), { replace: true });
        return;
      }
      const response = await signUp(form);
      if (response.profile && response.session) {
        navigate(routeForRole(response.profile.role), { replace: true });
        return;
      }
      setMessage(response.message || 'Check your email for confirmation.');
      setMode('sign-in');
      setForm((curr) => ({ ...curr, password: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg">
      {/* Branding Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 bg-primary text-white p-12 flex flex-col justify-between hidden md:flex"
      >
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-10 h-10" />
            <span className="text-2xl font-bold font-display tracking-wide uppercase">C.M.S</span>
          </div>
          <h1 className="mt-12 text-5xl font-display font-bold leading-tight max-w-lg">
            Online <br/> Complaint Management System.
          </h1>
          <p className="mt-6 text-lg text-primary-200 opacity-90 max-w-md">
            A secure gateway for citizens to file complaints and for administrators to manage city-wide operations.
          </p>
        </div>
        <div className="text-sm opacity-80">
          © {new Date().getFullYear()} Official Government Portal.
        </div>
      </motion.div>

      {/* Form Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative"
      >
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8 text-primary">
            <ShieldCheck className="w-8 h-8" />
            <span className="text-xl font-bold font-display uppercase">C.M.S</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text font-display">
              {mode === 'sign-in' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-text-muted mt-2">
              {mode === 'sign-in' ? 'Enter your credentials to access your portal.' : 'Sign up to submit and track your complaints securely.'}
            </p>
          </div>

          <Card hover={false} className="p-8 shadow-panel border-none">
            <div className="flex bg-bg rounded-lg p-1 mb-8 overflow-hidden">
              <button 
                onClick={() => { setMode('sign-in'); setError(''); setMessage(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'sign-in' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMode('sign-up'); setError(''); setMessage(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'sign-up' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'sign-up' && (
                <Input 
                  label="Full Name" 
                  name="full_name" 
                  value={form.full_name} 
                  onChange={handleChange} 
                  placeholder="John Doe" 
                  required 
                />
              )}
              <Input 
                label="Email Address" 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="name@example.com" 
                required 
              />
              <Input 
                label="Password" 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="At least 8 characters" 
                required 
                minLength={8}
              />

              {!isSupabaseConfigured && (
                <div className="p-3 text-sm bg-red-100 text-red-800 rounded-md">
                  <strong>Warning:</strong> Missing Supabase configuration.
                </div>
              )}
              
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {message && (
                <div className="p-3 text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-md">
                  {message}
                </div>
              )}

              <Button type="submit" disabled={submitting || !isSupabaseConfigured} className="w-full mt-4 py-3 text-base">
                {submitting ? 'Please Wait...' : mode === 'sign-in' ? 'Sign In Securely' : 'Create Account'}
                {!submitting && <ArrowRight size={18} className="ml-2" />}
              </Button>
            </form>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
