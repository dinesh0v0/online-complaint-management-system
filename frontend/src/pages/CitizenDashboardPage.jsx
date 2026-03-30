import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FileText, CheckCircle, Clock, AlertTriangle, Plus, LoaderCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export function CitizenDashboardPage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['myStats'],
    queryFn: () => api.getMyComplaintStats(session?.access_token),
    enabled: !!session?.access_token
  });

  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['myComplaints'],
    queryFn: () => api.getMyComplaints(session?.access_token),
    enabled: !!session?.access_token
  });

  const safeStats = {
    total: stats?.counts?.total || 0,
    resolved: stats?.counts?.resolved || 0,
    inProgress: stats?.counts?.under_investigation || 0,
    pending: stats?.counts?.pending || 0
  };

  const activeComplaints = complaints || [];
  const isLoading = statsLoading || complaintsLoading;

  // Compute Chart Data
  const categoryDataMap = {};
  const statusDataMap = { pending: 0, under_investigation: 0, resolved: 0 };
  
  activeComplaints.forEach(c => {
    categoryDataMap[c.category] = (categoryDataMap[c.category] || 0) + 1;
    if (statusDataMap[c.status] !== undefined) {
      statusDataMap[c.status]++;
    }
  });

  const barData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    count: categoryDataMap[key]
  }));

  const pieData = [
    { name: 'Pending', value: statusDataMap.pending, color: '#9ca3af' },
    { name: 'In Progress', value: statusDataMap.under_investigation, color: '#f59e0b' },
    { name: 'Resolved', value: statusDataMap.resolved, color: '#10b981' }
  ].filter(d => d.value > 0);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoaderCircle className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto pb-12 w-full">
      
      {/* Header matching Stitch Portal */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text tracking-tight">Personal Dashboard</h1>
          <p className="text-text-muted mt-2 text-sm md:text-base">Track the status of your reported complaints.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="ghost" onClick={() => window.open('/track', '_blank')} className="gap-2 shrink-0 py-2.5 px-5 shadow-sm border border-border bg-surface text-text-muted hover:text-text">
            <Search size={18} /> Tracking
          </Button>
          <Button onClick={() => navigate('/portal/new')} className="gap-2 shrink-0 py-2.5 px-5 shadow-sm">
            <Plus size={18} /> File Complaint
          </Button>
        </div>
      </div>

      {/* Metrics Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {[
          { label: 'Total Filled', value: safeStats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900' },
          { label: 'Resolved', value: safeStats.resolved, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-900' },
          { label: 'In Progress', value: safeStats.inProgress, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-900' },
          { label: 'Pending', value: safeStats.pending, icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card hover={false} className={`flex flex-col md:flex-row items-start md:items-center gap-3 p-4 md:p-5 border ${stat.border}`}>
              <div className={`p-3 md:p-4 rounded-xl ${stat.bg} ${stat.color} shadow-sm shrink-0`}>
                 <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="mt-1 md:mt-0">
                <p className="text-2xl md:text-3xl font-display font-bold text-text mb-0.5 leading-none">{stat.value}</p>
                <p className="text-xs md:text-sm font-medium text-text-muted">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold font-display text-text mb-6 tracking-tight">Complaints by Category</h2>
          <div className="h-64 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(204,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#CC0000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted text-sm">No data available</div>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-bold font-display text-text mb-6 tracking-tight">Status Distribution</h2>
          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted text-sm">No data available</div>
            )}
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm font-medium text-text-muted">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span> {d.name}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity List */}
      <div className="mt-8">
        <h2 className="text-xl md:text-2xl font-bold font-display text-text mb-4 tracking-tight">Recent History</h2>
        {activeComplaints.length === 0 ? (
          <Card className="p-10 text-center flex flex-col items-center justify-center border border-dashed border-border shadow-none bg-surface/50">
            <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center text-text-muted mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-text mb-1">No Complaints Found</h3>
            <p className="text-text-muted text-sm max-w-sm mb-6">
              You haven't submitted any complaints to the network yet. When you do, they will appear here.
            </p>
            <Button variant="outline" onClick={() => navigate('/portal/new')}>Start a Report</Button>
          </Card>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-3 md:gap-4">
            {activeComplaints.map(complaint => (
              <motion.div key={complaint.id} variants={itemVariant}>
                <Card hover={true} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 group cursor-default transition-all duration-300">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded tracking-wide">
                        #{complaint.id.split('-').pop()}
                      </span>
                      <span className="text-xs text-text-muted font-medium">
                        {new Date(complaint.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-text truncate group-hover:text-primary transition-colors">
                      {complaint.title}
                    </h3>
                    <p className="text-sm text-text-muted mt-1 max-w-2xl line-clamp-2 md:line-clamp-1">{complaint.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 mt-2 sm:mt-0">
                    <div className="text-sm text-right hidden lg:block">
                      <p className="font-semibold text-text">{complaint.category}</p>
                      <p className="text-xs text-text-muted">Category</p>
                    </div>
                    <Badge variant={
                      complaint.status === 'resolved' ? 'success' :
                      complaint.status === 'under_investigation' ? 'warning' : 'default'
                    } className="px-3 py-1.5 capitalize text-xs md:text-sm font-semibold shadow-sm">
                      {complaint.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
