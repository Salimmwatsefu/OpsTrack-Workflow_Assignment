import { useState } from 'react';
import type { AppType, ApplicationCreatePayload } from '../../types';

interface Props {
  initialData?: Partial<ApplicationCreatePayload>;
  onSubmit: (data: ApplicationCreatePayload) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const APP_TYPES: AppType[] = [
  'Recordation',
  'Renewal',
  'Change of Ownership',
  'Change of Name',
  'Discontinuation',
];

export function ApplicationForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Save draft',
}: Props) {
  const [formData, setFormData] = useState<ApplicationCreatePayload>({
    applicant_name:   initialData?.applicant_name   || '',
    applicant_email:  initialData?.applicant_email  || '',
    company_name:     initialData?.company_name     || '',
    application_type: initialData?.application_type || 'Recordation',
    description:      initialData?.description      || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Contact */}
      <div>
        <p className="form-section-label">Contact details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="field-label" htmlFor="applicant_name">Full name</label>
            <input
              id="applicant_name"
              required
              name="applicant_name"
              value={formData.applicant_name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Salim Mwarika"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="applicant_email">Email address</label>
            <input
              id="applicant_email"
              required
              type="email"
              name="applicant_email"
              value={formData.applicant_email}
              onChange={handleChange}
              className="input-field"
              placeholder="salim@example.com"
            />
          </div>
        </div>
      </div>

      {/* Application */}
      <div>
        <p className="form-section-label">Application details</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="field-label" htmlFor="company_name">Company name</label>
            <input
              id="company_name"
              required
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="input-field"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="application_type">Type</label>
            <select
              id="application_type"
              name="application_type"
              value={formData.application_type}
              onChange={handleChange}
              className="input-field"
            >
              {APP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="input-field"
            placeholder="Describe your application in detail…"
          />
        </div>
      </div>

      <div>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Saving…' : submitLabel}
        </button>
      </div>

    </form>
  );
}