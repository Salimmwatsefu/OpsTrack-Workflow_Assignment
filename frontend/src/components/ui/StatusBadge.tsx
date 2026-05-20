import { type AppStatus } from '../../types';

export function StatusBadge({ status }: { status: AppStatus }) {
  const getStyles = () => {
    switch (status) {
      case 'Approved': 
        return 'bg-[#ccffcc] text-black border-black';
      case 'Rejected': 
        return 'bg-[#ffcccc] text-black border-black';
      case 'Under Review': 
        return 'bg-[#ffffcc] text-black border-black';
      case 'Need More Information': 
        return 'bg-[#e6ccff] text-black border-black';
      case 'Submitted': 
        return 'bg-[#cce5ff] text-black border-black';
      case 'Draft': 
      default: 
        return 'bg-[#f0f0f0] text-black border-black';
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 ${getStyles()}`}>
      {status}
    </span>
  );
}