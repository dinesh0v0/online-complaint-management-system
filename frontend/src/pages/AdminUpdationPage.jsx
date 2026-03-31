import { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { LoaderCircle, FileText, Send, Clock, User, MapPin, Mail, Eye, Search, Paperclip, Download } from 'lucide-react';

export function AdminUpdationPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState(null);
  const [isEvidenceLoading, setIsEvidenceLoading] = useState(false);

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['adminComplaints'],
    queryFn: () => api.getAdminComplaints(session?.access_token, { sort: 'newest' }),
    enabled: !!session?.access_token
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.updateComplaint(session?.access_token, id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminComplaints'] });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ id, note }) => api.addComplaintNote(session?.access_token, id, { note }),
    onSuccess: () => {
      setNoteText('');
      queryClient.invalidateQueries({ queryKey: ['adminComplaints'] });
    }
  });

  const selectedComplaint = complaints?.find(c => c.id === selectedComplaintId);

  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];
    if (!searchQuery.trim()) return complaints;
    const lowerQuery = searchQuery.toLowerCase();
    return complaints.filter(c => 
      c.id.toLowerCase().includes(lowerQuery) || 
      c.title.toLowerCase().includes(lowerQuery) ||
      (c.citizen?.full_name || '').toLowerCase().includes(lowerQuery) ||
      c.category.toLowerCase().includes(lowerQuery)
    );
  }, [complaints, searchQuery]);

  useEffect(() => {
    if (selectedComplaint?.evidence_path) {
      setIsEvidenceLoading(true);
      const fetchEvidenceUrl = async () => {
        try {
          const { data, error } = await supabase.storage
            .from('complaint-evidence')
            .createSignedUrl(selectedComplaint.evidence_path, 3600);
          
          if (error) throw error;
          setEvidenceUrl(data.signedUrl);
        } catch (error) {
          console.error("Error fetching evidence:", error);
          setEvidenceUrl(null);
        } finally {
          setIsEvidenceLoading(false);
        }
      };
      fetchEvidenceUrl();
    } else {
      setEvidenceUrl(null);
      setIsEvidenceLoading(false);
    }
  }, [selectedComplaint?.evidence_path]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedComplaint) return;
    addNoteMutation.mutate({ id: selectedComplaint.id, note: noteText });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <LoaderCircle className="animate-spin text-primary w-14 h-14" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 md:space-y-8 max-w-[1440px] mx-auto pb-12 w-full px-2 sm:px-0 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20 shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text tracking-tight">Update Complaints</h1>
            <p className="text-text-muted mt-2 text-sm md:text-base">Review full submission details, assign statuses, and append tracking updates.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[600px] flex-1">
        
        {/* Left Column: Complaint List Tracker */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden h-[75vh]">
          <div className="p-4 border-b border-border bg-bg/50">
            <h3 className="font-bold font-display text-text mb-3">Active Submissions</h3>
            <div className="relative">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
               <Input 
                 placeholder="Search by ID, name, or title..." 
                 className="pl-9 h-9 text-sm" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {!filteredComplaints || filteredComplaints.length === 0 ? (
              <p className="text-center text-text-muted py-8 text-sm">No active complaints match your filter.</p>
            ) : (
              filteredComplaints.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedComplaintId(c.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedComplaintId === c.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent hover:bg-bg'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-mono text-xs font-bold text-text-muted">{c.id.split('-').pop()}</p>
                    <Badge variant={c.status === 'resolved' ? 'success' : c.status === 'under_investigation' ? 'warning' : 'default'} className="text-[10px] py-0.5 px-2">
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-text line-clamp-2">{c.title}</h4>
                  <div className="flex justify-between items-center mt-3 text-xs text-text-muted">
                    <span className="font-semibold uppercase tracking-wider">{c.category}</span>
                    <span>{new Date(c.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Interactive Updation Studio */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 h-[75vh]">
          {!selectedComplaint ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-surface/50 text-text-muted p-8">
              <Eye size={48} className="mb-4 text-border" />
              <p className="font-bold text-xl mb-1 text-text">Select a Complaint</p>
              <p className="text-sm">Click any submission on the left to view extended details and post updates.</p>
            </div>
          ) : (
            <Card hover={false} className="flex-1 flex flex-col overflow-hidden border-border shadow-md h-full">
              
              {/* Header Details */}
              <div className="p-6 border-b border-border bg-surface shrink-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-text mb-2">{selectedComplaint.title}</h2>
                    <p className="text-sm text-text-muted font-mono bg-bg py-1 px-2 rounded-md inline-block border border-border/50">Ref: {selectedComplaint.id}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                     <span className="text-sm font-bold text-text uppercase tracking-wider">Set Status:</span>
                     <Select
                        value={selectedComplaint.status}
                        disabled={updateStatusMutation.isPending}
                        onChange={(e) => updateStatusMutation.mutate({ id: selectedComplaint.id, status: e.target.value })}
                        className="text-sm font-bold focus:ring-primary focus:border-primary shadow-sm min-w-[160px]"
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'under_investigation', label: 'In Progress' },
                          { value: 'resolved', label: 'Resolved' }
                        ]}
                      />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1 flex items-center gap-1.5"><User size={12}/> Citizen</p>
                    <p className="font-semibold text-sm truncate">{selectedComplaint.citizen?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1 flex items-center gap-1.5"><Mail size={12}/> Mail ID</p>
                    <p className="font-semibold text-sm truncate">{selectedComplaint.mail_id || 'Not Provided'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1 flex items-center gap-1.5"><MapPin size={12}/> Location</p>
                    <p className="font-semibold text-sm truncate">{selectedComplaint.location || 'Not Provided'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1 flex items-center gap-1.5"><Clock size={12}/> Incident Date</p>
                    <p className="font-semibold text-sm truncate">{new Date(selectedComplaint.incident_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-bg/30 space-y-8">
                <div>
                   <h3 className="text-sm uppercase tracking-wider font-bold text-text-muted mb-3 border-b border-border/50 pb-2">Description of Event</h3>
                   <p className="text-text leading-relaxed whitespace-pre-wrap text-sm">{selectedComplaint.description}</p>
                </div>
                
                {selectedComplaint.evidence_path && (
                  <div>
                    <h3 className="text-sm uppercase tracking-wider font-bold text-text-muted mb-3 border-b border-border/50 pb-2 flex items-center gap-2">
                      <Paperclip size={16}/> Uploaded Evidence
                    </h3>
                    {isEvidenceLoading ? (
                      <div className="h-40 bg-surface/50 border border-border rounded-xl flex items-center justify-center text-text-muted">
                         <LoaderCircle className="animate-spin w-8 h-8" />
                      </div>
                    ) : evidenceUrl ? (
                      <div className="bg-surface p-4 border border-border rounded-xl">
                        {selectedComplaint.evidence_path.toLowerCase().endsWith('.pdf') ? (
                           <div className="flex flex-col items-center justify-center p-6 text-text-muted bg-bg/50 rounded-lg border border-border">
                             <FileText size={48} className="mb-3 text-red-500"/>
                             <p className="text-sm font-bold mb-3">{selectedComplaint.evidence_path.split('/').pop()}</p>
                             <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-600 transition-colors">
                               <Download size={16}/> Download PDF Evidence
                             </a>
                           </div>
                        ) : (
                           <div className="rounded-lg overflow-hidden border border-border max-h-[500px] flex items-center justify-center bg-black/5 dark:bg-white/5 relative">
                             <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                                <img src={evidenceUrl} alt="Attached Evidence" className="w-full h-auto max-h-[500px] object-contain" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm">
                                  <span className="flex items-center gap-2 font-bold"><Eye size={20}/> View Full Resolution</span>
                                </div>
                             </a>
                           </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 text-sm">
                        Failed to fetch secure evidence URL. It may have been deleted or expired.
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-text-muted mb-2">Accused Names</h3>
                    <p className="text-text text-sm font-medium">{selectedComplaint.accused_names || 'None reported'}</p>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-border">
                     <h3 className="text-xs uppercase tracking-wider font-bold text-text-muted mb-2">Witness Details</h3>
                     <p className="text-text text-sm font-medium">{selectedComplaint.witness_details || 'None reported'}</p>
                  </div>
                </div>

                <div>
                   <h3 className="text-sm uppercase tracking-wider font-bold text-text-muted mb-4 border-b border-border/50 pb-2 flex items-center gap-2">
                     Activity & Timeline Notes
                   </h3>
                   <div className="space-y-4">
                     {selectedComplaint.notes?.length === 0 ? (
                       <p className="text-sm text-text-muted italic">No timeline updates have been posted yet.</p>
                     ) : (
                       selectedComplaint.notes?.map(note => (
                         <div key={note.id} className="bg-surface border border-border/80 p-4 rounded-xl shadow-sm relative">
                           <div className="absolute left-[-2px] inset-y-4 w-1 bg-primary rounded-r"></div>
                           <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-bold uppercase tracking-wider text-primary">{note.author?.full_name || 'Admin Officer'}</span>
                             <span className="text-xs text-text-muted">{new Date(note.created_at).toLocaleString()}</span>
                           </div>
                           <p className="text-sm text-text">{note.note}</p>
                         </div>
                       ))
                     )}
                   </div>
                </div>
              </div>

              {/* Add Note Footer */}
              <div className="p-4 bg-surface border-t border-border shrink-0">
                <form onSubmit={handleAddNote} className="flex gap-3">
                  <Input 
                    placeholder="Type an official timeline update for the citizen..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!noteText.trim() || addNoteMutation.isPending} className="gap-2 font-bold px-6 shrink-0">
                    {addNoteMutation.isPending ? <LoaderCircle className="animate-spin" size={18} /> : <><Send size={18} /> Post Update</>}
                  </Button>
                </form>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
