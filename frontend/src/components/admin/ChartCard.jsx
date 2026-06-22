import { motion } from 'framer-motion';

export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface border border-white/8 rounded-xl p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-foreground font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-subtle text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}
