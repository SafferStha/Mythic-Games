import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-light hover:shadow-[0_0_24px_rgba(108,92,231,0.5)] active:scale-[0.98]',
  secondary:
    'bg-surface text-[#CBD5E1] border border-white/10 hover:bg-surface-hover hover:text-white active:scale-[0.98]',
  danger:
    'bg-danger text-white hover:bg-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-[0.98]',
  ghost:
    'text-[#CBD5E1] hover:bg-white/5 hover:text-white active:scale-[0.98]',
  outline:
    'border border-primary text-primary hover:bg-primary/10 active:scale-[0.98]',
  success:
    'bg-success text-white hover:bg-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-[0.98]',
};

const sizes = {
  xs: 'h-7 px-3 text-xs',
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
  xl: 'h-14 px-8 text-lg',
  icon: 'h-10 w-10 p-0',
  'icon-sm': 'h-8 w-8 p-0',
};

const PrimaryButton = forwardRef(function PrimaryButton(
  {
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    animate = true,
    ...props
  },
  ref,
) {
  const classes = `${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`;

  const content = (
    <>
      {loading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </>
  );

  if (animate) {
    return (
      <motion.button
        ref={ref}
        className={classes}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        disabled={loading || props.disabled}
        {...props}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button ref={ref} className={classes} disabled={loading || props.disabled} {...props}>
      {content}
    </button>
  );
});

export default PrimaryButton;
export { PrimaryButton };

export const SecondaryButton = forwardRef((props, ref) => (
  <PrimaryButton ref={ref} variant="secondary" {...props} />
));

export const DangerButton = forwardRef((props, ref) => (
  <PrimaryButton ref={ref} variant="danger" {...props} />
));

export const GhostButton = forwardRef((props, ref) => (
  <PrimaryButton ref={ref} variant="ghost" {...props} />
));

export const OutlineButton = forwardRef((props, ref) => (
  <PrimaryButton ref={ref} variant="outline" {...props} />
));

export const IconButton = forwardRef(({ size = 'icon', variant = 'ghost', ...props }, ref) => (
  <PrimaryButton ref={ref} size={size} variant={variant} {...props} />
));
