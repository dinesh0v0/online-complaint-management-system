import { LogOut, Plus, Shield, UserRound, Menu, ChevronLeft, Home, FileText, Sun, Moon } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PageTransition } from './layout/PageTransition';

const shellConfig = {
  citizen: {
    title: 'Citizen Portal',
    icon: UserRound,
    links: [
      { to: '/portal', label: 'Dashboard', icon: Home },
      { to: '/portal/new', label: 'New Complaint', icon: Plus },
    ],
  },
  admin: {
    title: 'Police Admin',
    icon: Shield,
    links: [
      { to: '/admin', label: 'Operations Board', icon: FileText },
    ],
  },
};

export function AppShell({ portal }) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const config = shellConfig[portal];
  const Icon = config.icon;

  const handleSignOut = async () => {
    // try to sign out. if authcontext doesn't have it fully implemented, catch it.
    try {
      if (signOut) await signOut();
    } catch(e) {}
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex bg-bg text-text">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        className="flex flex-col bg-surface border-r border-border h-screen sticky top-0 overflow-hidden shrink-0 z-20"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
          <AnimatePresence mode="popLayout">
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 font-bold text-lg text-primary overflow-hidden whitespace-nowrap"
              >
                <Icon className="w-6 h-6 shrink-0" />
                <span>{config.title}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -mr-2 rounded-md hover:bg-bg transition-colors shrink-0"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-3">
          {config.links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/portal' || link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors overflow-hidden whitespace-nowrap ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-muted hover:bg-bg hover:text-text'
                }`
              }
            >
              <link.icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, w: 0 }}
                    animate={{ opacity: 1, w: 'auto' }}
                    exit={{ opacity: 0, w: 0 }}
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-bg text-text-muted hover:text-text overflow-hidden whitespace-nowrap"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-bg text-red-600 hover:text-red-700 overflow-hidden whitespace-nowrap"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-semibold">
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 flex items-center px-8 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium">Hello, {profile?.full_name || 'User'}</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
              {(profile?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
