/* Status and label badges */

const statusConfig = {
  pending:    { label: 'Pending',    class: 'bg-warning/15 text-warning border-warning/30' },
  processing: { label: 'Processing', class: 'bg-primary/15 text-primary-light border-primary/30' },
  completed:  { label: 'Completed',  class: 'bg-success/15 text-success border-success/30' },
  paid:       { label: 'Paid',       class: 'bg-success/15 text-success border-success/30' },
  failed:     { label: 'Failed',     class: 'bg-danger/15 text-danger border-danger/30' },
  cancelled:  { label: 'Cancelled',  class: 'bg-[#475569]/30 text-[#94A3B8] border-[#475569]/30' },
  refunded:   { label: 'Refunded',   class: 'bg-accent/15 text-accent border-accent/30' },
};

export const StatusBadge = ({ status = 'pending', className = '' }) => {
  const cfg = statusConfig[status?.toLowerCase()] ?? statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.class} ${className}`}
    >
      {cfg.label}
    </span>
  );
};

export const DiscountBadge = ({ percent, className = '' }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-danger text-white ${className}`}
  >
    -{percent}%
  </span>
);

export const NewBadge = ({ className = '' }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-success text-white ${className}`}
  >
    NEW
  </span>
);

export const GenreBadge = ({ label, className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface border border-white/8 text-[#CBD5E1] ${className}`}
  >
    {label}
  </span>
);
