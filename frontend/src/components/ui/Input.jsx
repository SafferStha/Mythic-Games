import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';

const baseInput =
  'w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-[#F8FAFC] placeholder-[#64748B] text-sm transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50';

export const Input = forwardRef(function Input(
  { label, error, helper, className = '', leftIcon, rightIcon, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={`${baseInput} ${leftIcon ? 'pl-11' : ''} ${rightIcon ? 'pr-11' : ''} ${
            error ? 'border-danger focus:ring-danger/20' : ''
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {helper && !error && <p className="text-xs text-subtle">{helper}</p>}
    </div>
  );
});

export const PasswordInput = forwardRef(function PasswordInput({ label, error, className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      label={label}
      error={error}
      type={visible ? 'text' : 'password'}
      className={className}
      rightIcon={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-subtle hover:text-white transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      }
      {...props}
    />
  );
});

export const SearchInput = forwardRef(function SearchInput(
  { className = '', placeholder = 'Search…', ...props },
  ref,
) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
      />
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={`${baseInput} pl-10`}
        {...props}
      />
    </div>
  );
});

export const Select = forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-muted">{label}</label>}
      <select
        ref={ref}
        className={`${baseInput} ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});

export const TextArea = forwardRef(function TextArea(
  { label, error, rows = 4, className = '', ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-muted">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={`${baseInput} resize-none ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});
