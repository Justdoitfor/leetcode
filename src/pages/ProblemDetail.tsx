import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../stores/index.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Clock, PlayCircle, ExternalLink, CalendarDays } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

export function ProblemDetail() {
  const { id } = useParams();
  const { currentProblem, fetchProblem, loading } = useAppStore();

  useEffect(() => {
    if (id) {
      fetchProblem(parseInt(id));
    }
  }, [id, fetchProblem]);

  if (loading || !currentProblem) {
    return <div className="animate-pulse p-4">Loading...</div>;
  }

  const p = currentProblem;

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--color-surface)] shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {p.leetcode_id && `#${p.leetcode_id} `}{p.title_zh || p.title}
            </span>
            <Badge variant={p.difficulty}>{p.difficulty}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
            {p.url && (
              <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors">
                <ExternalLink size={14} /> 原题链接
              </a>
            )}
            <div className="flex items-center gap-1">
              <PlayCircle size={14} /> {p.checkins.length} 次打卡
            </div>
          </div>
          {p.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {p.tags.map(t => (
                <span key={t} className="text-[11px] px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-medium">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link to={`/problems/${p.id}/checkin`}>
          <Button variant="primary" size="lg" className="w-full md:w-auto shadow-sm gap-2">
            <PlayCircle size={18} /> 立即打卡
          </Button>
        </Link>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] px-2">历次打卡笔记</h2>
          {p.checkins.filter(c => c.note).length === 0 ? (
            <div className="text-center text-[var(--color-text-muted)] py-10 bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)]">暂无笔记记录</div>
          ) : (
            p.checkins.filter(c => c.note).map(c => (
              <Card key={c.id} className="prose prose-sm max-w-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
                <div className="flex items-center justify-between mb-4 border-b pb-2 text-[var(--color-text-muted)] text-xs">
                  <span className="flex items-center gap-1 font-mono">
                    <CalendarDays size={14} /> {c.checked_at.substring(0, 10)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {c.duration_min || '-'} min
                  </span>
                </div>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {c.note || ''}
                </ReactMarkdown>
              </Card>
            ))
          )}
        </div>
        
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] px-2">打卡历史</h2>
          <Card noPadding>
            <ul className="divide-y divide-[var(--color-border)]">
              {p.checkins.length === 0 ? (
                <li className="px-5 py-4 text-center text-sm text-[var(--color-text-muted)]">暂无历史</li>
              ) : (
                p.checkins.map(c => (
                  <li key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{c.checked_at.substring(0, 10)}</span>
                      <span className="text-[11px] text-[var(--color-text-secondary)] font-mono">{c.duration_min} min</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                        c.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                        c.status === 'WrongAnswer' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {c.status === 'Accepted' ? 'AC' : c.status === 'WrongAnswer' ? 'WA' : 'TLE'}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {c.rating === 3 ? '掌握' : c.rating === 2 ? '模糊' : c.rating === 1 ? '忘记' : '未评分'}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
