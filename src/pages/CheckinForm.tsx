import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Clock, PlayCircle, ExternalLink, CalendarDays, ThumbsDown, Meh, ThumbsUp, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

export function CheckinForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProblem, fetchProblem, createCheckin, loading } = useAppStore();

  const [formData, setFormData] = useState({
    duration_min: '',
    status: 'Accepted' as any,
    rating: 3,
    note: ''
  });

  useEffect(() => {
    if (id) fetchProblem(parseInt(id));
  }, [id, fetchProblem]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        try {
          await createCheckin({
            problem_id: parseInt(id!),
            checked_at: new Date().toISOString().split('T')[0],
            duration_min: formData.duration_min ? parseInt(formData.duration_min) : null,
            status: formData.status,
            rating: formData.rating,
            note: formData.note
          });
          navigate(`/problems/${id}`);
        } catch (error) {
          alert('打卡失败，请检查填写内容');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, id, createCheckin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCheckin({
        problem_id: parseInt(id!),
        checked_at: new Date().toISOString().split('T')[0],
        duration_min: formData.duration_min ? parseInt(formData.duration_min) : null,
        status: formData.status,
        rating: formData.rating,
        note: formData.note
      });
      navigate(`/problems/${id}`);
    } catch (error) {
      alert('打卡失败，请检查填写内容');
    }
  };

  if (loading || !currentProblem) {
    return <div className="animate-pulse p-4">Loading...</div>;
  }

  const p = currentProblem;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          {p.leetcode_id && `#${p.leetcode_id} `}{p.title_zh || p.title} - 打卡记录
        </h2>
        <Button onClick={handleSubmit} variant="primary" className="gap-2">
          <Save size={16} /> 保存 (Ctrl+S)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 flex flex-col gap-4 overflow-y-auto">
          <Card className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">耗时 (分钟)</label>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <Input 
                  type="number" 
                  value={formData.duration_min} 
                  onChange={e => setFormData({ ...formData, duration_min: e.target.value })}
                  placeholder="例如：15" 
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">提交状态</label>
              <div className="flex flex-col gap-2 mt-2">
                {['Accepted', 'WrongAnswer', 'TimeLimitExceeded'].map(status => (
                  <label key={status} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="radio" 
                      name="status" 
                      value={status}
                      checked={formData.status === status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className={
                      status === 'Accepted' ? 'text-green-700 font-medium' :
                      status === 'WrongAnswer' ? 'text-red-700 font-medium' : 'text-orange-700 font-medium'
                    }>
                      {status === 'Accepted' ? 'Accepted (AC)' : status === 'WrongAnswer' ? 'Wrong Answer (WA)' : 'Time Limit Exceeded (TLE)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">自我评分 (掌握度)</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: 1 })}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] border transition-all ${
                    formData.rating === 1 ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-[var(--color-border)] hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <ThumbsDown size={20} className="mb-1" />
                  <span className="text-xs font-bold">忘记</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: 2 })}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] border transition-all ${
                    formData.rating === 2 ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-[var(--color-border)] hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <Meh size={20} className="mb-1" />
                  <span className="text-xs font-bold">模糊</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: 3 })}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] border transition-all ${
                    formData.rating === 3 ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-[var(--color-border)] hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <ThumbsUp size={20} className="mb-1" />
                  <span className="text-xs font-bold">掌握</span>
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-3 flex flex-col min-h-0 border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-white overflow-hidden shadow-sm">
          <div className="grid grid-cols-2 h-full divide-x divide-[var(--color-border)]">
            <div className="flex flex-col h-full bg-[#FAFAFA]">
              <div className="px-4 py-2 border-b border-[var(--color-border)] bg-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Markdown 笔记</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFormData(f => ({ ...f, note: f.note + '**加粗**' }))} className="text-gray-500 hover:text-black font-bold px-1">B</button>
                  <button type="button" onClick={() => setFormData(f => ({ ...f, note: f.note + '*斜体*' }))} className="text-gray-500 hover:text-black italic px-1">I</button>
                  <button type="button" onClick={() => setFormData(f => ({ ...f, note: f.note + '\n```javascript\n\n```' }))} className="text-gray-500 hover:text-black font-mono px-1">{'<>'}</button>
                </div>
              </div>
              <textarea
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
                placeholder="在这里记录你的解题思路、注意点和代码..."
                className="flex-1 w-full p-4 resize-none bg-transparent outline-none text-sm font-mono text-[var(--color-text-primary)]"
                spellCheck="false"
              />
            </div>
            <div className="flex flex-col h-full overflow-hidden bg-white">
              <div className="px-4 py-2 border-b border-[var(--color-border)] bg-gray-50 flex items-center">
                <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">实时预览</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 prose prose-sm max-w-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {formData.note || '*笔记预览区域*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
