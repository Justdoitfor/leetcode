import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: { date: string; Easy: number; Medium: number; Hard: number }[];
}

export function BarChartComponent({ data }: BarChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-[var(--color-text-muted)]">暂无数据</div>;
  }

  const formatXAxis = (tickItem: string) => {
    const parts = tickItem.split('-');
    if (parts.length >= 3) return `${parts[1]}-${parts[2]}`;
    return tickItem;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <XAxis 
          dataKey="date" 
          tickFormatter={formatXAxis} 
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} 
          axisLine={false} 
          tickLine={false}
          dy={10}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} 
          axisLine={false} 
          tickLine={false} 
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px' }}
        />
        <Bar dataKey="Hard" stackId="a" fill="var(--color-hard)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="Medium" stackId="a" fill="var(--color-medium)" />
        <Bar dataKey="Easy" stackId="a" fill="var(--color-easy)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
