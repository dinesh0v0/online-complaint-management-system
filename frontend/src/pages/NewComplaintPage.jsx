import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function NewComplaintPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    incident_date: ''
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      // Opt 1: Upload evidence if exist
      let evidence_path = null;
      if (file && supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('complaint-evidence')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error('Failed to upload evidence: ' + uploadError.message);
        }
        evidence_path = filePath;
      }

      // Opt 2: Submit to backend API
      const body = {
        ...payload,
        evidence_bucket: 'complaint-evidence',
        evidence_path
      };

      return api.createComplaint(session?.access_token, body);
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['myComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['myStats'] });
      setTimeout(() => navigate('/portal'), 2500);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold font-display text-text">Complaint Submitted Successfully</h2>
        <p className="text-text-muted text-center max-w-sm">
          Your complaint has been securely transmitted. You will be redirected to your dashboard shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text">File a New Complaint</h1>
        <p className="text-text-muted mt-2">
          Provide as much detail as possible. Evidence is highly recommended.
        </p>
      </div>

      <Card hover={false} className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Complaint Title" 
            placeholder="e.g. Traffic Signal Malfunction on 5th Ave"
            required
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            maxLength={160}
            disabled={createMutation.isPending}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select 
              label="Category"
              options={[
                { value: '', label: 'Select a category...' },
                { value: 'traffic', label: 'Traffic & Roads' },
                { value: 'nuisance', label: 'Public Nuisance' },
                { value: 'theft', label: 'Theft / Vandalism' },
                { value: 'infrastructure', label: 'Infrastructure Damage' },
                { value: 'other', label: 'Other / Misc' }
              ]}
              required
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
              disabled={createMutation.isPending}
            />
            <Input 
              label="Incident Date"
              type="date"
              required
              value={form.incident_date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({...form, incident_date: e.target.value})}
              disabled={createMutation.isPending}
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-text">Detailed Description</label>
            <textarea
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[120px]"
              placeholder="Please describe what happened, when, and who was involved..."
              required
              minLength={20}
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              disabled={createMutation.isPending}
            ></textarea>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-text">Supporting Evidence (Optional)</label>
            <label className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center bg-bg/50 hover:bg-bg transition-colors cursor-pointer relative overflow-hidden">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" disabled={createMutation.isPending} />
              {file ? (
                <div className="text-primary font-medium">{file.name}</div>
              ) : (
                <>
                  <UploadCloud size={28} className="text-text-muted mb-2" />
                  <p className="text-sm font-medium text-text">Click to upload or drag and drop</p>
                  <p className="text-xs text-text-muted mt-1">Images or PDF (max. 10MB)</p>
                </>
              )}
            </label>
          </div>

          {createMutation.isError && (
             <div className="p-3 text-sm bg-red-100 text-red-800 rounded-md">
               Error: {createMutation.error.message}
             </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-8">
            <Button variant="ghost" type="button" onClick={() => navigate('/portal')} disabled={createMutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
