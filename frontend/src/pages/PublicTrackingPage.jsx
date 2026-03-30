import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, LoaderCircle, MapPin, Calendar, Clock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ThemeToggle } from '../components/ThemeToggle';
import { api } from '../lib/api';

export function PublicTrackingPage() {
  const [refId, setRefId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!refId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await api.trackComplaint(refId);
      setResult(data);
    } catch (err) {
      setError(err.message || 'No complaint found with this Reference ID. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg w-full flex flex-col items-center">
      <header className="w-full p-6 flex justify-between items-center z-10 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-text-muted hover:text-text">
          <ArrowLeft size={20} /> Back
        </Button>
        <ThemeToggle />
      </header>

      <main className="flex-1 w-full max-w-3xl px-6 py-12 flex flex-col items-center">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/20"
          >
            <Search size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-bold text-text mb-4 tracking-tight"
          >
            Track Status
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-muted text-lg max-w-xl mx-auto"
          >
            Enter your secure Complaint Reference ID to check real-time updates and current investigation status.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <Card className="p-2 md:p-3 shadow-lg border border-border/60 bg-surface/80 backdrop-blur-xl">
            <form onSubmit={handleSearch} className="flex gap-2 isolate">
              <Input
                type="text"
                placeholder="e.g. CMP-8X9Y2"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                className="flex-1 h-14 bg-transparent border-none text-lg lg:text-xl font-mono tracking-widest placeholder:tracking-normal focus:ring-0 px-4"
              />
              <Button type="submit" disabled={loading} className="h-14 px-6 md:px-10 rounded-xl shadow-md gap-2 font-bold shrink-0">
                {loading ? <LoaderCircle className="animate-spin" size={20} /> : <><Search size={20} /> Search</>}
              </Button>
            </form>
          </Card>
        </motion.div>

        <div className="w-full mt-10">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-center border border-red-100 dark:border-red-900/30">
              <AlertTriangle className="mx-auto mb-2" size={24} />
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden shadow-lg border-border/50">
                <div className="bg-surface p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50">
                  <div>
                    <h2 className="text-sm font-bold text-primary mb-1 tracking-wider uppercase">Reference: {result.id}</h2>
                    <h3 className="text-2xl font-display font-bold text-text">{result.title}</h3>
                  </div>
                  <Badge variant={
                    result.status === 'resolved' ? 'success' :
                    result.status === 'under_investigation' ? 'warning' : 'default'
                  } className="px-4 py-2 text-sm uppercase self-start md:self-auto shadow-sm">
                    {result.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="bg-bg/50 p-6 md:p-8 space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase mb-1 flex items-center gap-1.5"><Calendar size={14}/> Date Filed</p>
                      <p className="font-semibold text-text">{new Date(result.submitted_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase mb-1 flex items-center gap-1.5"><MapPin size={14}/> Category</p>
                      <p className="font-semibold text-text">{result.category}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Clock size={16} className="text-primary" /> Tracking Timeline
                    </h4>
                    <div className="space-y-6 border-l-2 border-primary/20 ml-3 pl-6 relative">
                      {result.updates.map((update, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-surface ${update.type === 'success' ? 'bg-green-500' : 'bg-primary'} shadow-sm`}></div>
                          <p className="text-sm font-bold text-text-muted mb-1">{new Date(update.date).toLocaleString()}</p>
                          <p className="text-base text-text">{update.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
