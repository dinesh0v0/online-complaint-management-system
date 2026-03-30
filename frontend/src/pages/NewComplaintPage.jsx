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
    incident_date: '',
    mail_id: '',
    location: '',
    accused_names: '',
    witness_details: ''
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-5">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/10">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold font-display text-text">Complaint Logged</h2>
        <p className="text-text-muted text-center max-w-sm text-lg">
          We have properly recorded your report. Redirecting you...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 w-full">
      <div className="mb-6 md:mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text tracking-tight">Citizen Portal</h1>
        <p className="text-text-muted mt-2 text-sm md:text-base max-w-xl">
          Use the form below to lodge an official complaint. Attach clear evidence to expedite the review by the Administrator Board.
        </p>
      </div>

      <Card hover={false} className="p-6 md:p-10 shadow-sm border border-border">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          <div className="space-y-1.5 w-full">
            <label className="text-sm font-bold text-text">Complaint Title</label>
            <Input 
              placeholder="e.g. Broken Traffic Signal on Broadway"
              required
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              maxLength={160}
              disabled={createMutation.isPending}
              className="h-12 border-border focus:border-primary shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-1.5 w-full">
              <label className="text-sm font-bold text-text">Mail ID</label>
              <Input 
                type="email"
                placeholder="Alternative contact email (optional)"
                value={form.mail_id}
                onChange={(e) => setForm({...form, mail_id: e.target.value})}
                disabled={createMutation.isPending}
                className="h-12 border-border focus:border-primary shadow-sm"
              />
            </div>
            <div className="space-y-1.5 w-full">
              <label className="text-sm font-bold text-text">Location of Occurrence</label>
              <Input 
                type="text"
                placeholder="Exact address or landmark"
                required
                value={form.location}
                onChange={(e) => setForm({...form, location: e.target.value})}
                disabled={createMutation.isPending}
                className="h-12 border-border focus:border-primary shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-1.5 w-full">
               <label className="text-sm font-bold text-text">Classification</label>
               <Select 
                 options={[
                   { value: '', label: 'Select a category...' },
                   { label: 'Violent & Physical Crimes', options: [
                       { value: 'murder_attempt', label: 'Murder / Attempt to Murder' },
                       { value: 'assault', label: 'Assault / Beaten / Hurt' },
                       { value: 'kidnapping', label: 'Kidnapping / Abduction' },
                       { value: 'threat', label: 'Threat to Life / Criminal Intimidation' },
                       { value: 'blackmail', label: 'Blackmail' },
                       { value: 'abetment_suicide', label: 'Abetment to Suicide' },
                       { value: 'dispute_quarrel', label: 'Dispute with Neighbour / Physical Quarrel' },
                       { value: 'domestic_violence', label: 'Domestic Violence' },
                       { value: 'acid_attack', label: 'Acid Attack' }
                   ]},
                   { label: 'Crimes Against Women & Children', options: [
                       { value: 'sexual_harassment', label: 'Sexual Harassment / Eve Teasing (Sec 354/509 IPC)' },
                       { value: 'rape', label: 'Rape / Attempt to Rape / Gang Rape' },
                       { value: 'dowry', label: 'Dowry Death / Demand of Dowry' },
                       { value: 'voyeurism_stalking', label: 'Voyeurism / Stalking / Obscene Calls/SMS' },
                       { value: 'child_abuse', label: 'Child Labour / Child Marriage / Child Abuse' }
                   ]},
                   { label: 'Theft & Robbery', options: [
                       { value: 'theft', label: 'Theft (General / Household)' },
                       { value: 'vehicle_theft', label: 'Vehicle Theft' },
                       { value: 'robbery_dacoity', label: 'Robbery / Dacoity' },
                       { value: 'snatching', label: 'Mobile / Chain Snatching' },
                       { value: 'trespass', label: 'House Trespass / Land Trespass / Forceful Occupation' }
                   ]},
                   { label: 'Fraud & Cybercrime', options: [
                       { value: 'fraud_forgery', label: 'Forgery / Cheating / Fraud' },
                       { value: 'online_banking_fraud', label: 'Online Banking / ATM Fraud' },
                       { value: 'cyberbullying', label: 'Cyberbullying / Stalking / Blackmailing' },
                       { value: 'fake_profile', label: 'Fake Profile on Social Media / Impersonation' },
                       { value: 'hacking', label: 'Hacking' },
                       { value: 'chitfund_counterfeit', label: 'Chitfund Fraud / Counterfeit Currency' }
                   ]},
                   { label: 'Public Order & Traffic', options: [
                       { value: 'vandalism', label: 'Property Damage / Vandalism' },
                       { value: 'hit_and_run', label: 'Hit and Run' },
                       { value: 'rash_driving', label: 'Rash Driving / Drink and Drive' },
                       { value: 'illegal_parking', label: 'Illegal Parking / Road Blockage' },
                       { value: 'noise_pollution', label: 'Noise Pollution' },
                       { value: 'gambling', label: 'Gambling' },
                       { value: 'vulgarity', label: 'Vulgarity at Public Place' },
                       { value: 'communal_violence', label: 'Hurting Religious Sentiments / Communal Violence' },
                       { value: 'scst_violations', label: 'SC/ST Act Violations' },
                       { value: 'arms_act', label: 'Arms Act Violations' },
                       { value: 'drugs', label: 'Drug Related (Supply/Possession)' }
                   ]},
                   { label: 'Police Accountability', options: [
                       { value: 'no_action', label: 'No Action by Police / Refusal to Register FIR' },
                       { value: 'misbehaviour', label: 'Misbehaviour by Police Official' },
                       { value: 'delay_investigation', label: 'Delay in Enquiry and Investigation' },
                       { value: 'torture', label: 'Torture by Police / Violation of Human Rights' }
                   ]},
                   { label: 'Other', options: [
                       { value: 'other', label: 'Other' }
                   ]}
                 ]}
                 required
                 value={form.category}
                 onChange={(e) => setForm({...form, category: e.target.value})}
                 disabled={createMutation.isPending}
                 className="h-12 border-border shadow-sm focus:border-primary"
               />
            </div>
            
            <div className="space-y-1.5 w-full">
               <label className="text-sm font-bold text-text">Date of Incident</label>
               <Input 
                 type="date"
                 required
                 value={form.incident_date}
                 max={new Date().toISOString().split("T")[0]}
                 onChange={(e) => setForm({...form, incident_date: e.target.value})}
                 disabled={createMutation.isPending}
                 className="h-12 border-border shadow-sm focus:border-primary w-full"
               />
            </div>
          </div>

          <div className="space-y-1.5 w-full">
            <label className="text-sm font-bold text-text">Detailed Description</label>
            <textarea
              className="resize-none w-full rounded-lg border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[160px] shadow-sm"
              placeholder="Please describe what happened sequentially..."
              required
              minLength={20}
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              disabled={createMutation.isPending}
            ></textarea>
          </div>

          <div className="space-y-1.5 w-full">
            <label className="text-sm font-bold text-text">Names of Accused</label>
            <Input 
              type="text"
              placeholder="Leave blank if unknown"
              value={form.accused_names}
              onChange={(e) => setForm({...form, accused_names: e.target.value})}
              disabled={createMutation.isPending}
              className="h-12 border-border focus:border-primary shadow-sm"
            />
          </div>

          <div className="space-y-1.5 w-full">
            <label className="text-sm font-bold text-text">Witness Details</label>
            <textarea
              className="resize-none w-full rounded-lg border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] shadow-sm"
              placeholder="Names and contact details of any witnesses"
              value={form.witness_details}
              onChange={(e) => setForm({...form, witness_details: e.target.value})}
              disabled={createMutation.isPending}
            ></textarea>
          </div>

          <div className="space-y-1.5 w-full">
            <label className="text-sm font-bold text-text">Visual Evidence (Optional)</label>
            <label className="group border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden bg-bg/50">
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" disabled={createMutation.isPending} />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                   <div className="p-3 bg-primary/10 rounded-full text-primary">
                     <UploadCloud size={32} />
                   </div>
                   <div className="font-bold text-text mt-2">{file.name}</div>
                   <div className="text-xs text-text-muted">Will be securely sent to Admin Ops</div>
                </div>
              ) : (
                <>
                  <UploadCloud size={40} className="text-text-muted group-hover:text-primary transition-colors mb-3" />
                  <p className="text-base font-bold text-text">Click to upload or drag and drop</p>
                  <p className="text-sm text-text-muted mt-1">Image or PDF. Must not exceed 10MB.</p>
                </>
              )}
            </label>
          </div>

          {createMutation.isError && (
             <div className="p-4 text-sm font-medium bg-red-50 text-red-700 rounded-lg border border-red-200">
               Submission failed: {createMutation.error.message}
             </div>
          )}

          <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 border-t border-border mt-10">
            <Button variant="ghost" type="button" onClick={() => navigate('/portal')} disabled={createMutation.isPending} className="h-12 sm:w-auto w-full font-bold">Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending} className="h-12 shadow-md sm:w-auto w-full px-8 font-bold">
              {createMutation.isPending ? 'Encrypting & Submitting...' : 'Submit Official Report'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
