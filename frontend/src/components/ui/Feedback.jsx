import { motion } from 'framer-motion';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { PrimaryButton } from './Button';

/* ── Spinner ─────────────────────────────────────────────── */
export const Spinner = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`animate-spin ${className}`}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

/* ── Page-level loader ───────────────────────────────────── */
export const PageLoader = ({ text = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted">
    <Spinner size={40} className="text-primary" />
    <p className="text-sm">{text}</p>
  </div>
);

/* ── Skeleton line / block ───────────────────────────────── */
export const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => (
  <div className={`skeleton ${rounded} ${className}`} aria-hidden="true" />
);

export const SkeletonCard = () => (
  <div className="bg-surface rounded-2xl overflow-hidden border border-white/5">
    <Skeleton className="h-48 w-full" rounded="rounded-none" />
    <div className="p-4 flex flex-col gap-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 5 }) => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-surface rounded-xl p-4 flex gap-4 border border-white/5">
        <Skeleton className="h-16 w-16 shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Empty state ─────────────────────────────────────────── */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 px-6 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-5 border border-white/5">
      <Icon size={32} className="text-subtle" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    {description && <p className="text-sm text-muted max-w-xs mb-6">{description}</p>}
    {action && action}
  </motion.div>
);

/* ── Error state ─────────────────────────────────────────── */
export const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 px-6 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mb-5 border border-danger/20">
      <AlertCircle size={32} className="text-danger" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
    <p className="text-sm text-muted max-w-xs mb-6">{message}</p>
    {onRetry && (
      <PrimaryButton variant="secondary" leftIcon={<RefreshCw size={15} />} onClick={onRetry}>
        Try again
      </PrimaryButton>
    )}
  </motion.div>
);

/* ── Inline loading dots ─────────────────────────────────── */
export const LoadingDots = () => (
  <span className="inline-flex gap-1" aria-label="Loading">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </span>
);
