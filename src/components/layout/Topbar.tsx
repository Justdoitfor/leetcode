import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Topbar() {
  const location = useLocation();
  const titleMap: Record<string, string> = {
    '/': 'Dashboard 仪表盘',
    '/problems': '题目列表',
    '/problems/new': '新增题目',
    '/review': '今日复习',
    '/stats': '数据分析',
  };

  const getTitle = () => {
    if (location.pathname.startsWith('/problems/')) {
      if (location.pathname.endsWith('/checkin')) return '新增打卡记录';
      return '题目详情';
    }
    return titleMap[location.pathname] || 'fkLeetcode';
  };

  return (
    <header className="h-[52px] bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-[var(--color-text-secondary)]">
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-semibold text-[var(--color-text-primary)]">{getTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input 
            type="text" 
            placeholder="搜索题目名称或编号..." 
            className="h-8 w-64 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] pl-9 pr-4 text-xs focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <button className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
          <Bell size={18} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
}
