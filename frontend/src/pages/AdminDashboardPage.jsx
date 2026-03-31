import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { LoaderCircle, TriangleAlert, Download } from 'lucide-react';

export function AdminDashboardPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.getAdminStats(session?.access_token),
    enabled: !!session?.access_token
  });
  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['adminComplaints'],
    queryFn: () => api.getAdminComplaints(session?.access_token, { sort: 'newest' }),
    enabled: !!session?.access_token
  });

  // Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.updateComplaint(session?.access_token, id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminComplaints'] });
    }
  });

  if (statsLoading || complaintsLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoaderCircle className="animate-spin text-primary w-14 h-14" />
      </div>
    );
  }

  /* Data Mapping */
  const complaintsOverTimeData = stats?.submissions_over_time?.map(s => ({
    name: s.label, complaints: s.count
  })) || [];

  const safeCounts = stats?.counts || { resolved: 0, pending: 0, under_investigation: 0 };
  const complaintsByStatusData = [
    { name: 'Resolved', value: safeCounts.resolved, color: '#15803d' },
    { name: 'Pending', value: safeCounts.pending, color: '#b45309' },
    { name: 'In Progress', value: safeCounts.under_investigation, color: '#CC0000' }
  ].filter(d => d.value > 0);

  const activeComplaints = complaints || [];

  const handleExportCSV = () => {
    if (!complaints || complaints.length === 0) return;
    const headers = ['Case ID', 'Title', 'Category', 'Status', 'Submitted At', 'Citizen Name', 'Mail ID'];
    const csvContent = [
      headers.join(','),
      ...complaints.map(c => [
        `"${c.id}"`,
        `"${c.title.replace(/"/g, '""')}"`,
        `"${c.category}"`,
        `"${c.status}"`,
        `"${new Date(c.submitted_at).toISOString()}"`,
        `"${c.citizen?.full_name || ''}"`,
        `"${c.mail_id || ''}"`
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `complaints_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-6 md:space-y-8 max-w-[1440px] mx-auto pb-12 w-full px-2 sm:px-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text tracking-tight">Operations Board</h1>
          <p className="text-text-muted mt-2 text-sm md:text-base">Command Center for triaging and tracking active citizen files.</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2 shrink-0 self-start md:self-auto px-4 !h-10 border-border text-text hover:bg-surface">
          <Download size={18} /> Export Queue
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Main Column - Charts and Grid */}
        <div className="xl:col-span-2 flex flex-col gap-6 md:gap-8 min-w-0">
          
          {/* Main Area Chart */}
          <Card hover={false} className="p-5 md:p-8 border border-border shadow-sm w-full relative z-0">
            <h2 className="text-lg md:text-xl font-bold font-display text-text mb-6">Traffic & Submissions (Past 10 Days)</h2>
            <div className="h-[250px] md:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complaintsOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorComplaintsMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CC0000" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#CC0000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} dx={-5} />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }}
                    itemStyle={{ color: 'var(--color-text)', fontWeight: 'bold' }}
                    labelStyle={{ color: 'var(--color-text-muted)' }}
                  />
                  <Area type="monotone" dataKey="complaints" stroke="#CC0000" strokeWidth={3} fillOpacity={1} fill="url(#colorComplaintsMain)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Active Triage Queue Table */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl md:text-2xl font-bold font-display text-text">Active Triage Queue</h2>
            <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-bg text-text-muted uppercase font-bold text-xs tracking-wider border-b border-border">
                    <tr>
                      <th className="px-5 py-4 w-[15%]">Case ID</th>
                      <th className="px-5 py-4 w-[40%]">Context</th>
                      <th className="px-5 py-4 w-[25%] hidden sm:table-cell">Area Class</th>
                      <th className="px-5 py-4 w-[20%] text-right font-bold text-primary">Status Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {activeComplaints.length === 0 ? (
                      <tr><td colSpan="4" className="px-5 py-8 text-center text-text-muted">Queue is completely resolved.</td></tr>
                    ) : (
                      activeComplaints.map((c) => (
                        <tr key={c.id} className="hover:bg-primary/5 transition-colors group">
                          <td className="px-5 py-4 align-top">
                            <p className="font-mono text-xs font-bold text-text bg-bg inline-block px-1.5 py-0.5 rounded mb-1.5">{c.id.split('-').pop()}</p>
                            <p className="text-xs text-text-muted">{new Date(c.submitted_at).toLocaleDateString()}</p>
                          </td>
                          <td className="px-5 py-4 max-w-[200px] md:max-w-sm overflow-hidden align-top">
                            <p className="font-bold text-text truncate group-hover:text-primary transition-colors">{c.title}</p>
                            <p className="text-xs text-text-muted truncate mt-1">Submitted by: <span className="font-semibold text-text/80">{c.citizen?.full_name}</span></p>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell align-top">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              {c.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right align-top">
                            <Select
                              id={`s-${c.id}`}
                              value={c.status}
                              disabled={updateStatusMutation.isPending}
                              className="text-xs py-1.5 px-3 h-auto w-auto inline-block border-border shadow-sm focus:border-primary font-semibold"
                              onChange={(e) => updateStatusMutation.mutate({ id: c.id, status: e.target.value })}
                              options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'under_investigation', label: 'In Progress' },
                                { value: 'resolved', label: 'Resolved' }
                              ]}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Lateral Actions Bar */}
        <div className="flex flex-col gap-6 md:gap-8">
          
          {/* Urgent Priority Module */}
          <Card className="bg-primary overflow-hidden text-white border-none shadow-lg relative p-8">
            <div className="absolute right-[-10px] top-[-10px] opacity-10">
               <TriangleAlert size={140} />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold font-display text-xl mb-3">Attention Required</h3>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-6xl font-bold font-mono leading-none tracking-tighter">{safeCounts.pending}</span>
              </div>
              <p className="text-primary-200 text-sm font-medium mt-1">Unassigned files sitting in the pending state. Action needed.</p>
            </div>
          </Card>

          {/* Allocation Breakdown Chart */}
          <Card hover={false} className="p-6 md:p-8 border border-border shadow-sm">
            <h2 className="text-lg md:text-xl font-bold font-display text-text mb-6">Status Overview</h2>
            <div className="h-[260px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                {complaintsByStatusData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={complaintsByStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {complaintsByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--color-text)', fontWeight: 'bold' }}
                    />
                  </PieChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm font-medium text-text-muted">System Baseline: 0 Actions</div>
                )}
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col gap-3.5 mt-6 border-t border-border pt-6">
              {complaintsByStatusData.map(stat => (
                <div key={stat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded bg-bg/50" style={{ backgroundColor: stat.color }}></div>
                    <span className="text-text-muted font-medium">{stat.name}</span>
                  </div>
                  <span className="font-bold text-text text-base">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
