import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, CalendarClock, BarChart3 } from 'lucide-react';
import { useAppStore } from '../../stores/index.js';
import iconSvg from '../../assets/icon.svg';

export function Sidebar() {
  const { reviews } = useAppStore();
  const reviewsCount = reviews.length;

  return (
    <aside className="w-[200px] bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col h-full shrink-0 hidden md:flex">
      {/* Logo */}
      <div className="h-[52px] flex items-center px-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <img src={iconSvg} alt="logo" className="w-6 h-6 object-contain" />
          <span className="font-bold text-[var(--color-text-primary)] text-sm tracking-wide">fkLeetcode</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        <NavItem to="/" icon={<LayoutDashboard size={18} />} label="仪表盘" />
        <NavItem to="/problems" icon={<ListTodo size={18} />} label="题目列表" />
        <NavItem 
          to="/review" 
          icon={<CalendarClock size={18} />} 
          label="今日复习" 
          badge={reviewsCount > 0 ? reviewsCount : undefined} 
        />
        <NavItem to="/stats" icon={<BarChart3 size={18} />} label="数据分析" />

        {/* Quick filters */}
        <div className="mt-8 mb-2 px-2 text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          快速筛选
        </div>
        <NavItem to="/problems?difficulty=Easy" label="简单" icon={<div className="w-2 h-2 rounded-full bg-[var(--color-easy)]" />} />
        <NavItem to="/problems?difficulty=Medium" label="中等" icon={<div className="w-2 h-2 rounded-full bg-[var(--color-medium)]" />} />
        <NavItem to="/problems?difficulty=Hard" label="困难" icon={<div className="w-2 h-2 rounded-full bg-[var(--color-hard)]" />} />
      </nav>

      {/* Footer Streak Badge */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="bg-[var(--color-streak-bg)] text-[var(--color-streak)] rounded-md p-3 flex items-center justify-between">
          <span className="text-xs font-medium">连续打卡</span>
          <span className="text-sm font-bold flex items-center gap-1">
            🔥 1 天
          </span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ to, icon, label, badge }: { to: string, icon: React.ReactNode, label: string, badge?: number }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium transition-colors
        ${isActive 
          ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]' 
          : 'text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]'}
      `}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
