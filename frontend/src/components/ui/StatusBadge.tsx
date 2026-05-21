import { type AppStatus } from '../../types';

export function StatusBadge({ status }: { status: AppStatus }) {
  const cls = (() => {
    switch (status) {
      case 'Approved':              return 'badge badge-approved';
      case 'Rejected':              return 'badge badge-rejected';
      case 'Under Review':          return 'badge badge-review';
      case 'Need More Information': return 'badge badge-info';
      case 'Submitted':             return 'badge badge-submitted';
      default:                      return 'badge badge-draft';
    }
  })();

  return <span className={cls}>{status}</span>;
}