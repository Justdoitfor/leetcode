import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAppStore } from '../../stores/index.js';

export function Topbar() {
  const location = useLocation();
  const { reviews, fetchTodayReviews } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTodayReviews();
  }, [fetchTodayReviews]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        
        <div className="relative" ref={notifRef}>
          <button 
            className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            {reviews.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-[var(--color-border)] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[var(--color-border)] flex justify-between items-center bg-gray-50">
                <span className="font-bold text-sm text-[var(--color-text-primary)]">通知</span>
                {reviews.length > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    {reviews.length} 未读
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {reviews.length > 0 ? (
                  <div className="p-2">
                    <Link 
                      to="/review" 
                      onClick={() => setShowNotifications(false)}
                      className="block p-3 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-review-bg)] flex items-center justify-center shrink-0">
                          <Bell size={14} className="text-[var(--color-review)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                            今日有 {reviews.length} 道题目待复习
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            艾宾浩斯记忆曲线提醒你，及时复习能大幅提升记忆留存率。
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">
                    暂无新通知
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
