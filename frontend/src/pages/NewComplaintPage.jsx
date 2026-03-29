import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle } from 'lucide-react';

export function NewComplaintPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/portal');
    }, 2000);
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
          Provide as much detail as possible. The information will be routed to the appropriate department for triage.
        </p>
      </div>

      <Card hover={false} className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Complaint Title" 
            placeholder="e.g. Traffic Signal Malfunction on 5th Ave"
            required
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
            />
            <Select 
              label="Priority Level"
              options={[
                { value: 'low', label: 'Low - Information Only' },
                { value: 'medium', label: 'Medium - Needs Action Soon' },
                { value: 'high', label: 'High - Immediate Attention Required' }
              ]}
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-text">Detailed Description</label>
            <textarea
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[120px]"
              placeholder="Please describe what happened, when, and who was involved..."
              required
            ></textarea>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-medium text-text">Supporting Evidence (Optional)</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center bg-bg/50 hover:bg-bg transition-colors cursor-pointer">
              <UploadCloud size={28} className="text-text-muted mb-2" />
              <p className="text-sm font-medium text-text">Click to upload or drag and drop</p>
              <p className="text-xs text-text-muted mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-8">
            <Button variant="ghost" onClick={() => navigate('/portal')}>Cancel</Button>
            <Button type="submit">Submit Complaint</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
