import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
  const colorMap = {
    primary: 'text-primary-light bg-primary/15 border-primary/20',
    success: 'text-success bg-success/15 border-success/20',
    warning: 'text-warning bg-warning/15 border-warning/20',
    danger:  'text-danger bg-danger/15 border-danger/20',
    accent:  'text-accent bg-accent/15 border-accent/20',
  };

  const iconCls = colorMap[color] ?? colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-white/8 rounded-xl p-5 flex items-start gap-4"
    >
      {Icon && (
        <div className={`p-2.5 rounded-lg border ${iconCls} shrink-0`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-subtle text-xs font-medium uppercase tracking-wide truncate">{title}</p>
        <p className="text-foreground text-2xl font-bold mt-0.5 leading-tight">{value ?? '—'}</p>
        {subtitle && <p className="text-subtle text-xs mt-1">{subtitle}</p>}
        {trend != null && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
    </motion.div>
  );
}
