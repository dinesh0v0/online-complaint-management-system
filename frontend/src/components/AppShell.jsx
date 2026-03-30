import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Component, Menu, User, FileText, LayoutDashboard, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { PageTransition } from './layout/PageTransition';

export function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isAdmin = profile?.role === 'admin';

  const navLinks = isAdmin
    ? [
        { to: '/admin', label: 'Operations Board', icon: LayoutDashboard },
        { to: '/admin/update', label: 'Update Complaints', icon: FileText },
      ]
    : [
        { to: '/portal', label: 'My Dashboard', icon: LayoutDashboard },
        { to: '/portal/new', label: 'New Complaint', icon: Component },
      ];

  const sidebarContentJSX = (
    <>
      <div className="h-16 flex items-center px-6 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3 text-primary font-display font-bold text-xl tracking-tight">
          <ShieldCheck className="fill-primary/10" size={28} />
          OCMS
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col gap-2 overflow-y-auto">
        <div className="text-xs font-semibold text-text-muted mt-2 mb-2 px-2 uppercase tracking-wider">
          {isAdmin ? 'Administration' : 'Citizen Portal'}
        </div>
        
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/portal'}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:bg-surface hover:text-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon 
                  size={20} 
                  className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text'}`} 
                />
                <span>{link.label}</span>
                {isActive && (
                   <motion.div layoutId="activeNav" className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border/50 shrink-0">
        <div className="bg-surface rounded-xl p-3 border border-border shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              {profile?.full_name?.charAt(0) || <User size={18} />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-text truncate">{profile?.full_name}</p>
              <p className="text-xs text-text-muted truncate capitalize">{profile?.role}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800/30"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-bg overflow-hidden relative">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] h-full border-r border-border/60 bg-bg shrink-0 z-20">
        {sidebarContentJSX}
      </aside>

      {/* Mobile Header & Overlay */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-lg border-b border-border/60 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-primary font-display font-bold text-lg">
          <ShieldCheck size={24} className="fill-primary/10" /> OCMS
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-10 h-10 rounded-lg bg-bg text-text flex items-center justify-center border border-border focus:outline-none"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] bg-bg border-r border-border/60 z-50 flex flex-col shadow-2xl md:hidden"
            >
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md text-text-muted hover:bg-surface border border-transparent hover:border-border"
              >
                <X size={20} />
              </button>
              {sidebarContentJSX}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10 scroll-smooth">
           <PageTransition key={location.pathname}>
             <Outlet />
           </PageTransition>
        </div>
      </main>
      
    </div>
  );
}
