import { useState } from 'react';
import type { AppType, ApplicationCreatePayload } from '../../types';

interface Props {
  initialData?: Partial<ApplicationCreatePayload>;
  onSubmit: (data: ApplicationCreatePayload) => void;
  isLoading?: boolean;
}

const APP_TYPES: AppType[] = [
  "Recordation",
  "Renewal",
  "Change of Ownership",
  "Change of Name",
  "Discontinuation"
];

export function ApplicationForm({ initialData, onSubmit, isLoading }: Props) {
  const [formData, setFormData] = useState<ApplicationCreatePayload>({
    applicant_name: initialData?.applicant_name || '',
    applicant_email: initialData?.applicant_email || '',
    company_name: initialData?.company_name || '',
    application_type: initialData?.application_type || 'Recordation',
    description: initialData?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Applicant Name */}
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase tracking-wider">Applicant Name</label>
          <input 
            required
            name="applicant_name"
            value={formData.applicant_name}
            onChange={handleChange}
            className="input-editorial"
            placeholder="e.g. John Doe"
          />
        </div>

        {/* Applicant Email */}
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase tracking-wider">Email</label>
          <input 
            required
            type="email"
            name="applicant_email"
            value={formData.applicant_email}
            onChange={handleChange}
            className="input-editorial"
            placeholder="john@example.com"
          />
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase tracking-wider">Company</label>
          <input 
            required
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className="input-editorial"
            placeholder="Acme Corp"
          />
        </div>

        {/* Application Type */}
        <div className="space-y-2">
          <label className="block text-sm font-bold uppercase tracking-wider">Type</label>
          <select 
            name="application_type"
            value={formData.application_type}
            onChange={handleChange}
            className="input-editorial bg-surface appearance-none"
          >
            {APP_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-bold uppercase tracking-wider">Description</label>
        <textarea 
          required
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className="input-editorial resize-none"
          placeholder="Provide the details of your application..."
        />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="btn-primary w-full md:w-auto"
      >
        {isLoading ? 'Saving...' : 'Save Draft'}
      </button>
    </form>
  );
}