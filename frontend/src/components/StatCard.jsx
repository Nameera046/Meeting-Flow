import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendType = 'neutral' }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-card flex items-center justify-between">
      <div className="space-y-2">
        <span className="text-sm font-medium text-secondary">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-text tracking-tight">{value}</span>
          {trend && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                trendType === 'positive'
                  ? 'bg-green-50 text-success'
                  : trendType === 'negative'
                  ? 'bg-red-50 text-danger'
                  : 'bg-slate-100 text-secondary'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
      <div className="p-3 bg-slate-50 text-accent rounded-xl border border-border">
        <Icon size={22} />
      </div>
    </div>
  );
};

export default StatCard;
