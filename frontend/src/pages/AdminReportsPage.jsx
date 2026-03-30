import { Card } from '../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { LoaderCircle, FileText } from 'lucide-react';

export function AdminReportsPage() {
  const { session } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.getAdminStats(session?.access_token),
    enabled: !!session?.access_token
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoaderCircle className="animate-spin text-primary w-14 h-14" />
      </div>
    );
  }

  const complaintsOverTimeData = stats?.submissions_over_time?.map(s => ({
    name: s.label, complaints: s.count
  })) || [];

  const topCategoriesData = stats?.categories?.map(c => ({
    name: c.label, count: c.count
  })) || [];

  return (
    <div className="flex flex-col space-y-6 md:space-y-8 max-w-[1440px] mx-auto pb-12 w-full px-2 sm:px-0">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20 shrink-0">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text tracking-tight">System Reports</h1>
          <p className="text-text-muted mt-2 text-sm md:text-base">Comprehensive analytical breakdowns of reported issues and categories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        
        {/* Timeline Chart */}
        <Card hover={false} className="p-5 md:p-8 border border-border shadow-sm w-full">
          <h2 className="text-lg md:text-xl font-bold font-display text-text mb-6">Submission Timeline</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complaintsOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTimeline" x1="0" y1="0" x2="0" y2="1">
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
                />
                <Area type="monotone" dataKey="complaints" stroke="#CC0000" strokeWidth={3} fillOpacity={1} fill="url(#colorTimeline)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Categories Bar Chart */}
        <Card hover={false} className="p-5 md:p-8 border border-border shadow-sm w-full">
          <h2 className="text-lg md:text-xl font-bold font-display text-text mb-6">Top Categories</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategoriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} dx={-5} allowDecimals={false} />
                <ChartTooltip 
                  cursor={{ fill: 'rgba(204,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }}
                  itemStyle={{ color: 'var(--color-text)', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#CC0000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
