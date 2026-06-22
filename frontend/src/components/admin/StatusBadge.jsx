const config = {
  // Order statuses
  processing: { label: 'Processing', cls: 'bg-primary/15 text-primary-light border-primary/30' },
  completed:  { label: 'Completed',  cls: 'bg-success/15 text-success border-success/30' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-subtle/30 text-muted border-subtle/30' },
  refunded:   { label: 'Refunded',   cls: 'bg-accent/15 text-accent border-accent/30' },
  // Payment statuses
  paid:       { label: 'Paid',       cls: 'bg-success/15 text-success border-success/30' },
  pending:    { label: 'Pending',    cls: 'bg-warning/15 text-warning border-warning/30' },
  failed:     { label: 'Failed',     cls: 'bg-danger/15 text-danger border-danger/30' },
  initiated:  { label: 'Initiated',  cls: 'bg-primary/15 text-primary-light border-primary/30' },
  verified:   { label: 'Verified',   cls: 'bg-success/15 text-success border-success/30' },
  // Game statuses
  active:     { label: 'Active',     cls: 'bg-success/15 text-success border-success/30' },
  inactive:   { label: 'Inactive',   cls: 'bg-subtle/30 text-muted border-subtle/30' },
  deleted:    { label: 'Deleted',    cls: 'bg-danger/15 text-danger border-danger/30' },
  // User statuses
  banned:     { label: 'Banned',     cls: 'bg-danger/15 text-danger border-danger/30' },
  // Roles
  user:        { label: 'User',        cls: 'bg-primary/15 text-primary-light border-primary/30' },
  admin:       { label: 'Admin',       cls: 'bg-accent/15 text-accent border-accent/30' },
  super_admin: { label: 'Super Admin', cls: 'bg-warning/15 text-warning border-warning/30' },
};

export default function StatusBadge({ status = 'pending', className = '' }) {
  const cfg = config[status?.toLowerCase()] ?? { label: status, cls: 'bg-subtle/30 text-muted border-subtle/30' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls} ${className}`}>
      {cfg.label}
    </span>
  );
}
