import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockComplaints, mockStats, complaintsOverTimeData, complaintsByStatusData } from '../lib/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-text">Operations Board</h1>
        <p className="text-text-muted mt-1">Monitor, analyze, and manage active complaints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card hover={false} className="p-6">
            <h2 className="text-lg font-bold font-display text-text mb-6">Complaints Over Time (Past 7 Days)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complaintsOverTimeData}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CD0000" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#CD0000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dx={-10} />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                  <Area type="monotone" dataKey="complaints" stroke="#CD0000" strokeWidth={3} fillOpacity={1} fill="url(#colorComplaints)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Data Grid / Triage Board */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display text-text">Active Triage Queue</h2>
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-bg/50 text-text-muted uppercase font-semibold text-xs border-b border-border">
                    <tr>
                      <th className="px-6 py-4">ID / Priority</th>
                      <th className="px-6 py-4">Complaint Details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-bg/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs font-bold text-text mb-1">{c.id}</p>
                          <Badge variant={c.priority === 'High' ? 'danger' : c.priority === 'Medium' ? 'warning' : 'default'} className="text-[10px] uppercase">
                            {c.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 max-w-sm">
                          <p className="font-bold text-text truncate">{c.title}</p>
                          <p className="text-text-muted truncate mt-0.5">{c.description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-text">
                            {c.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge variant={c.status === 'Resolved' ? 'success' : c.status === 'In Progress' ? 'primary' : 'default'} className="px-3 py-1">
                            {c.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Stats & Pie Chart */}
        <div className="space-y-6">
          <Card hover={false} className="p-6">
            <h2 className="text-lg font-bold font-display text-text mb-4">Total By Status</h2>
            <div className="h-[240px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complaintsByStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {complaintsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col gap-3 mt-4">
              {complaintsByStatusData.map(stat => (
                <div key={stat.name} className="flex items-center gap-2 text-sm justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }}></div>
                    <span className="text-text-muted">{stat.name}</span>
                  </div>
                  <span className="font-bold text-text">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-primary text-white border-none p-6">
            <h3 className="font-bold font-display text-lg mb-2">Needs Immediate Attention</h3>
            <p className="text-3xl font-bold font-mono">12</p>
            <p className="text-primary-200 text-sm mt-1">High priority unassigned cases.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
