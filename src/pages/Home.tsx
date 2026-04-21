import React, { useEffect } from 'react';
import { useAppStore } from '../stores/index.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { HeatmapChart } from '../components/charts/HeatmapChart.js';
import { DonutChart } from '../components/charts/DonutChart.js';
import { BarChartComponent } from '../components/charts/BarChartComponent.js';
import { CheckCircle2, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { stats, fetchStats, heatmap, tagsStats, weeklyStats, reviews, fetchTodayReviews, error } = useAppStore();

  useEffect(() => {
    fetchStats();
    fetchTodayReviews();
  }, [fetchStats, fetchTodayReviews]);

  if (!stats) return (
    <div className="flex flex-col items-center justify-center p-10 space-y-4">
      <div className="animate-pulse">Loading data...</div>
      {error && <div className="text-red-500 bg-red-50 p-4 rounded-md max-w-md break-words text-sm">
        <p className="font-bold mb-2">API Error:</p>
        {error}
      </div>}
    </div>
  );

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <div className="flex flex-col gap-6">
        {/* 指标卡区 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col justify-center">
            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">已完成题数</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--color-primary)]">{stats.completed}</span>
              <span className="text-sm font-medium text-[var(--color-text-muted)]">/ {stats.total}</span>
            </div>
          </Card>
          <Card className="flex flex-col justify-center">
            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">通过率</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--color-text-primary)]">{completionRate}%</span>
            </div>
          </Card>
          <Card className="flex flex-col justify-center bg-[var(--color-streak-bg)] border-[var(--color-streak)]">
            <span className="text-xs font-medium text-[var(--color-streak)] uppercase tracking-wide">连续打卡天数</span>
            <div className="mt-2 flex items-baseline gap-2 text-[var(--color-streak)]">
              <Flame size={28} className="text-orange-500 fill-orange-500" />
              <span className="text-3xl font-bold">{stats.streak}</span>
              <span className="text-sm font-medium">天</span>
            </div>
          </Card>
        </div>

        {/* 热力图卡 */}
        <Card className="overflow-x-auto">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">打卡记录</h2>
          <HeatmapChart data={heatmap} />
        </Card>

        {/* 最近记录卡 */}
        <Card>
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">最近打卡</h2>
          <div className="space-y-3">
            {/* mock data since we don't have recent checkins in store yet, 
                ideally fetch from problems API with history, but here we just show empty state */}
            <div className="text-sm text-[var(--color-text-muted)] text-center py-4">
              请通过 "题目列表" 查看详细记录
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        {/* 复习队列卡 */}
        <Card className="bg-[#FAFAFA]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">今日复习</h2>
            <span className="bg-[var(--color-review)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {reviews.length} 待复习
            </span>
          </div>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              <div className="p-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-sm text-[var(--color-text-primary)] leading-tight">{reviews[0].title}</div>
                  <Badge variant={reviews[0].difficulty}>{reviews[0].difficulty}</Badge>
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mb-4">第 {reviews[0].repetitions + 1} 次复习</div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => useAppStore.getState().respondReview(reviews[0].id, 1)}>忘记</Button>
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => useAppStore.getState().respondReview(reviews[0].id, 2)}>模糊</Button>
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => useAppStore.getState().respondReview(reviews[0].id, 3)}>掌握</Button>
                </div>
              </div>
              {reviews.length > 1 && (
                <div className="text-center text-xs text-[var(--color-text-muted)]">
                  还有 {reviews.length - 1} 题...
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-[var(--color-text-muted)]">
              <CheckCircle2 size={32} className="text-[var(--color-easy)] mb-2" />
              <p className="text-sm">今日复习已完成</p>
            </div>
          )}
        </Card>

        {/* 分布图卡 */}
        <Card>
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">难度分布</h2>
          <DonutChart easy={stats.easy} medium={stats.medium} hard={stats.hard} />
        </Card>

        {/* 本周图卡 */}
        <Card>
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">本周完成数</h2>
          <div className="h-[200px] w-full">
            <BarChartComponent data={weeklyStats} />
          </div>
        </Card>

        {/* 标签进度卡 */}
        <Card>
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">标签掌握度</h2>
          <div className="space-y-4">
            {tagsStats.slice(0, 5).map((tag, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-16 truncate font-medium text-[var(--color-text-secondary)]" title={tag.name}>{tag.name}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${Math.min(tag.count * 5, 100)}%` }} />
                </div>
                <span className="w-6 text-right text-[var(--color-text-muted)]">{tag.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
