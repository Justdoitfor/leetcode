import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ScatterData } from '../../types/index.js';
import { format, parseISO } from 'date-fns';

interface ScatterChartProps {
  data: ScatterData[];
}

const COLORS = {
  Easy: 'var(--color-easy)',
  Medium: 'var(--color-medium)',
  Hard: 'var(--color-hard)'
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-[var(--color-border)] p-3 rounded-[var(--radius-md)] shadow-sm text-sm">
        <p className="font-bold text-[var(--color-text-primary)] mb-1">{data.title_zh || data.title}</p>
        <p className="text-[var(--color-text-secondary)]">日期: <span className="font-medium text-[var(--color-text-primary)]">{data.date.split('T')[0]}</span></p>
        <p className="text-[var(--color-text-secondary)]">耗时: <span className="font-medium text-[var(--color-text-primary)]">{data.time} min</span></p>
        <p className="text-[var(--color-text-secondary)]">难度: <span className="font-medium" style={{ color: COLORS[data.difficulty as keyof typeof COLORS] }}>{data.difficulty}</span></p>
      </div>
    );
  }
  return null;
};

export function ScatterChartComponent({ data }: ScatterChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-[var(--color-text-muted)]">暂无耗时数据</div>;
  }

  // Format data: parse date string to timestamp for continuous XAxis
  const formattedData = data.map(d => ({
    ...d,
    timestamp: parseISO(d.date).getTime()
  }));

  const formatXAxis = (tickItem: number) => {
    return format(new Date(tickItem), 'MM-dd');
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
        <XAxis 
          dataKey="timestamp" 
          type="number"
          domain={['auto', 'auto']}
          tickFormatter={formatXAxis} 
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis 
          dataKey="time" 
          type="number" 
          name="耗时" 
          unit="m"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <ZAxis type="category" dataKey="difficulty" name="难度" />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={formattedData} name="打卡记录">
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.difficulty as keyof typeof COLORS]} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
