import React, { useEffect } from 'react';
import { useAppStore } from '../stores/index.js';
import { Card } from '../components/ui/Card.js';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export function Stats() {
  const { stats, tagsStats, fetchStats, loading } = useAppStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return <div className="animate-pulse p-4">Loading...</div>;
  }

  if (!stats) return null;

  // Prepare radar data
  const radarData = tagsStats.slice(0, 6).map(t => ({
    subject: t.name,
    A: t.count,
    fullMark: tagsStats[0]?.count || 10,
  }));

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Row 1: 指标卡 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex flex-col items-center justify-center py-6">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">总题数</span>
          <span className="text-3xl font-bold text-[var(--color-text-primary)]">{stats.total}</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">本月完成</span>
          <span className="text-3xl font-bold text-[var(--color-primary)]">{stats.monthly}</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">平均耗时</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[var(--color-text-primary)]">~25</span>
            <span className="text-sm font-medium text-[var(--color-text-muted)]">min</span>
          </div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">复习完成率</span>
          <span className="text-3xl font-bold text-[var(--color-text-primary)]">100%</span>
        </Card>
      </div>

      {/* Row 2: 图表区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-[350px] flex flex-col">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">技能雷达图</h2>
          <div className="flex-1 min-h-0">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                  <Radar name="技能" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">暂无数据</div>
            )}
          </div>
        </Card>
        
        <Card className="h-[350px] flex flex-col">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">耗时分布散点图</h2>
          <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-50 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)]">
            <span className="text-sm text-[var(--color-text-muted)]">功能开发中...</span>
          </div>
        </Card>
      </div>

      {/* Row 3: 完整标签列表 */}
      <Card>
        <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-6">全部标签统计</h2>
        <div className="flex flex-wrap gap-3">
          {tagsStats.map(t => (
            <div key={t.name} className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-sm)] overflow-hidden">
              <span className="bg-gray-50 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] border-r border-[var(--color-border)]">
                {t.name}
              </span>
              <span className="px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] bg-white">
                {t.count}
              </span>
            </div>
          ))}
          {tagsStats.length === 0 && <span className="text-sm text-[var(--color-text-muted)]">暂无数据</span>}
        </div>
      </Card>
    </div>
  );
}
