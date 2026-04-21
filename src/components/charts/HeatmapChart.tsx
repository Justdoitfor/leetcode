import React from 'react';
import { format, parseISO, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

interface HeatmapChartProps {
  data: { date: string; count: number }[];
}

export function HeatmapChart({ data }: HeatmapChartProps) {
  const today = new Date();
  const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 0 }); // start from Sunday
  const days = eachDayOfInterval({ start: startDate, end: today });
  
  const dateMap = new Map<string, number>();
  data.forEach(d => dateMap.set(d.date, d.count));

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  days.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getColor = (count: number) => {
    if (count === 0) return '#F1EFE8';
    if (count <= 2) return '#C0DD97';
    if (count <= 4) return '#97C459';
    if (count <= 6) return '#639922';
    return '#3B6D11';
  };

  return (
    <div className="w-full">
      <div className="flex gap-1">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((day, j) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const count = dateMap.get(dateStr) || 0;
              return (
                <div
                  key={j}
                  className="w-3 h-3 rounded-[2px] transition-colors"
                  style={{ backgroundColor: getColor(count) }}
                  title={`${dateStr}: ${count}题`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-[var(--color-text-muted)]">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[2px] bg-[#F1EFE8]" />
        <div className="w-3 h-3 rounded-[2px] bg-[#C0DD97]" />
        <div className="w-3 h-3 rounded-[2px] bg-[#97C459]" />
        <div className="w-3 h-3 rounded-[2px] bg-[#639922]" />
        <div className="w-3 h-3 rounded-[2px] bg-[#3B6D11]" />
        <span>More</span>
      </div>
    </div>
  );
}
