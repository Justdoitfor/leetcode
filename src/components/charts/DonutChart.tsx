import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  easy: number;
  medium: number;
  hard: number;
}

const COLORS = ['#639922', '#BA7517', '#A32D2D'];

export function DonutChart({ easy, medium, hard }: DonutChartProps) {
  const data = [
    { name: 'Easy', value: easy },
    { name: 'Medium', value: medium },
    { name: 'Hard', value: hard },
  ].filter(d => d.value > 0);

  const total = easy + medium + hard;

  if (total === 0) {
    return <div className="h-[200px] flex items-center justify-center text-sm text-[var(--color-text-muted)]">暂无数据</div>;
  }

  return (
    <div className="h-[200px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px' }}
            itemStyle={{ color: 'var(--color-text-primary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-[var(--color-text-primary)]">{total}</span>
        <span className="text-xs text-[var(--color-text-muted)] uppercase">Total</span>
      </div>
    </div>
  );
}
