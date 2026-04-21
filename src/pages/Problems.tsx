import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/index.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';

export function Problems() {
  const { problems, fetchProblems, loading } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    fetchProblems({ search, difficulty });
  }, [fetchProblems, search, difficulty]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <Input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索题目名称或编号..." 
              className="pl-9"
            />
          </div>
          <select 
            className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            <option value="">全部难度</option>
            <option value="Easy">简单</option>
            <option value="Medium">中等</option>
            <option value="Hard">困难</option>
          </select>
        </div>
        <Button onClick={() => navigate('/problems/new')} className="gap-2">
          <Plus size={16} /> 添加题目
        </Button>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-[#FAFAFA] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-medium">编号</th>
                <th className="px-6 py-4 font-medium">题目名称</th>
                <th className="px-6 py-4 font-medium">难度</th>
                <th className="px-6 py-4 font-medium">标签</th>
                <th className="px-6 py-4 font-medium">打卡次数</th>
                <th className="px-6 py-4 font-medium">最近打卡</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading && problems.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-muted)]">加载中...</td></tr>
              ) : problems.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-muted)]">暂无题目</td></tr>
              ) : (
                problems.map(p => (
                  <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-6 py-4 font-mono text-[var(--color-text-muted)]">
                      {p.leetcode_id ? `#${p.leetcode_id}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/problems/${p.id}`} className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors">
                        {p.title_zh || p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.difficulty}>{p.difficulty}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {p.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 truncate max-w-[60px]" title={t}>{t}</span>
                        ))}
                        {p.tags.length > 3 && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">+{p.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                      {p.checkins_count || 0}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)] font-mono text-xs">
                      {p.last_checkin ? p.last_checkin.substring(0, 10) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/problems/${p.id}/checkin`}>
                        <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          打卡
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
