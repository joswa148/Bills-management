/**
 * Reusable skeleton loader for cards and stats
 */
export const CardSkeleton = () => (
  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 animate-pulse">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-8 w-32 bg-slate-200 rounded" />
      <div className="h-4 w-full bg-slate-100 rounded" />
      <div className="h-4 w-3/4 bg-slate-100 rounded" />
    </div>
  </div>
);

/**
 * Skeleton loader for lists/tables
 */
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 animate-pulse">
    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
      <div className="h-6 w-32 bg-slate-200 rounded" />
      <div className="h-10 w-24 bg-slate-200 rounded-xl" />
    </div>
    <div className="p-6 space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 h-12 border-b border-slate-50 last:border-0">
          <div className="w-8 h-8 bg-slate-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-slate-200 rounded" />
            <div className="h-3 w-1/4 bg-slate-100 rounded" />
          </div>
          <div className="w-24 h-4 bg-slate-100 rounded" />
          <div className="w-16 h-4 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for the dashboard stats
 */
export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="w-10 h-10 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-8 w-24 bg-slate-200 rounded mt-2" />
        <div className="h-3 w-32 bg-slate-100 rounded mt-4" />
      </div>
    ))}
  </div>
);
