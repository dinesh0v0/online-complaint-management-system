import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockComplaints, mockStats } from '../lib/mockData';
import { FileText, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export function CitizenDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text">Your Dashboard</h1>
          <p className="text-text-muted mt-1">Track the status of your reported complaints.</p>
        </div>
        <Button onClick={() => navigate('/portal/new')} className="gap-2">
          <Plus size={18} /> File a New Complaint
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Filled', value: mockStats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Resolved', value: mockStats.resolved, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'In Progress', value: mockStats.inProgress, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Pending', value: mockStats.pending, icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stat.value}</p>
                <p className="text-sm font-medium text-text-muted">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold font-display text-text mb-4">Recent Complaints</h2>
        <motion.div 
          variants={staggerContainer} 
          initial="hidden" 
          animate="show"
          className="grid gap-4"
        >
          {mockComplaints.map(complaint => (
            <motion.div key={complaint.id} variants={itemVariant}>
              <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold font-mono text-text-muted">{complaint.id}</span>
                    <Badge variant={
                      complaint.priority === 'High' ? 'danger' : 
                      complaint.priority === 'Medium' ? 'warning' : 'default'}
                    >
                      {complaint.priority} Priority
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-text">{complaint.title}</h3>
                  <p className="text-sm text-text-muted mt-1 max-w-2xl line-clamp-1">{complaint.description}</p>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-sm text-right">
                    <p className="text-text-muted">{complaint.date}</p>
                    <p className="font-semibold text-text">{complaint.category}</p>
                  </div>
                  <Badge variant={
                    complaint.status === 'Resolved' ? 'success' :
                    complaint.status === 'In Progress' ? 'primary' : 'default'
                  } className="px-3 py-1">
                    {complaint.status}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
