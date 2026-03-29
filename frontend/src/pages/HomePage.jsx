import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { motion } from 'framer-motion';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck size={28} />
          <span className="font-bold font-display uppercase tracking-wider text-sm">C.M.S</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        {/* Background Decorative Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="z-10 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-8 mx-auto">
            <span>Official City Management Portal</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-[1.1] tracking-tight text-ink mb-6">
            Report issues. <br/> Secure the community.
          </h1>
          
          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            The modern, transparent way to file civic complaints, track resolutions in real-time, and help administrators maintain public order and safety.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={() => navigate('/auth')} className="px-8 py-4 text-lg rounded-full shadow-panel shadow-primary/20 w-full sm:w-auto">
              Access Portal <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="ghost" onClick={() => navigate('/auth')} className="px-8 py-4 text-lg rounded-full w-full sm:w-auto text-text-muted hover:text-text">
              Track Status
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
