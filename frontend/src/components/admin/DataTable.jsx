import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
  columns = [],
  data    = [],
  loading = false,
  page    = 1,
  total   = 0,
  limit   = 20,
  onPage,
  emptyMessage = 'No records found.',
}) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-surface border border-white/8 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/3">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-subtle text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-subtle">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-subtle">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-foreground whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/8">
          <p className="text-subtle text-xs">
            Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPage?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => onPage?.(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? 'bg-primary text-white'
                      : 'text-subtle hover:text-foreground hover:bg-white/8'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => onPage?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
