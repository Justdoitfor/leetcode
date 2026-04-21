import React, { useEffect, useState } from 'react';
import { useAppStore } from '../stores/index.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { ThumbsDown, Meh, ThumbsUp, PartyPopper } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

export function Review() {
  const { reviews, fetchTodayReviews, respondReview, loading } = useAppStore();
  const [showNote, setShowNote] = useState(false);
  const [currentNote, setCurrentNote] = useState<string | null>(null);

  useEffect(() => {
    fetchTodayReviews();
  }, [fetchTodayReviews]);

  useEffect(() => {
    // Reset note visibility when moving to the next review
    setShowNote(false);
    if (reviews.length > 0) {
      // Fetch the last note for the current problem
      // Ideally, the API would include the last note in the review object
      // But for now, we'll fetch the problem details if needed
      useAppStore.getState().fetchProblem(reviews[0].problem_id).then(() => {
        const p = useAppStore.getState().currentProblem;
        if (p) {
          const checkinsWithNote = p.checkins.filter(c => c.note);
          if (checkinsWithNote.length > 0) {
            setCurrentNote(checkinsWithNote[0].note);
          } else {
            setCurrentNote(null);
          }
        }
      });
    }
  }, [reviews]);

  const handleRespond = async (rating: number) => {
    if (reviews.length > 0) {
      await respondReview(reviews[0].id, rating);
    }
  };

  if (loading && reviews.length === 0) {
    return <div className="animate-pulse p-4 text-center">Loading...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center gap-6">
        <PartyPopper size={64} className="text-orange-400" />
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">太棒了！</h2>
        <p className="text-[var(--color-text-secondary)]">你已经完成了今天的全部复习任务</p>
      </div>
    );
  }

  const r = reviews[0];

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col pt-10">
      <div className="mb-4 flex items-center justify-between text-sm font-medium text-[var(--color-text-muted)] px-2">
        <span>今日复习</span>
        <span>剩余: {reviews.length} 题</span>
      </div>
      
      <Card className="flex-1 flex flex-col p-8 relative overflow-hidden shadow-sm border-[var(--color-review-border)]">
        <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-review)]" />
        
        <div className="flex flex-col items-center justify-center py-8">
          <Badge variant={r.difficulty} className="mb-4 text-sm px-3 py-1">{r.difficulty}</Badge>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] text-center mb-6">
            {r.title_zh || r.title}
          </h2>
          <div className="flex gap-2">
            {r.tags && r.tags.map(t => (
              <span key={t} className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">{t}</span>
            ))}
          </div>
          <div className="mt-8 text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full border border-orange-100">
            <span>第 {r.repetitions + 1} 次复习</span>
            <span className="w-1 h-1 rounded-full bg-orange-300" />
            <span>上次评分: {r.last_rating === 3 ? '掌握' : r.last_rating === 2 ? '模糊' : '忘记'}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 border-t border-[var(--color-border)] mt-4 pt-6">
          {!showNote ? (
            <div className="flex-1 flex items-center justify-center">
              <Button variant="ghost" onClick={() => setShowNote(true)} className="text-[var(--color-text-secondary)] border border-dashed border-gray-300 w-full max-w-sm py-8 hover:bg-gray-50 hover:border-gray-400">
                查看上次笔记 (如有)
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto prose prose-sm max-w-none bg-gray-50 p-6 rounded-[var(--radius-md)] border border-[var(--color-border)] prose-pre:bg-white prose-pre:border prose-pre:border-gray-200">
              {currentNote ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {currentNote}
                </ReactMarkdown>
              ) : (
                <div className="text-center text-gray-400 py-10 italic">没有找到笔记记录</div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)] grid grid-cols-3 gap-4">
          <button 
            onClick={() => handleRespond(1)}
            className="flex flex-col items-center justify-center p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors group"
          >
            <ThumbsDown size={24} className="mb-2 text-gray-400 group-hover:text-red-500" />
            <span className="font-bold">忘记了</span>
            <span className="text-[10px] text-gray-400 mt-1">1 分钟后重现</span>
          </button>
          
          <button 
            onClick={() => handleRespond(2)}
            className="flex flex-col items-center justify-center p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors group"
          >
            <Meh size={24} className="mb-2 text-gray-400 group-hover:text-orange-500" />
            <span className="font-bold">有些模糊</span>
            <span className="text-[10px] text-gray-400 mt-1">短间隔复习</span>
          </button>

          <button 
            onClick={() => handleRespond(3)}
            className="flex flex-col items-center justify-center p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors group bg-[var(--color-primary)] text-white border-transparent hover:bg-[var(--color-primary-hover)] hover:text-white"
          >
            <ThumbsUp size={24} className="mb-2 text-white/80 group-hover:text-white" />
            <span className="font-bold">已掌握</span>
            <span className="text-[10px] text-white/70 mt-1">拉长复习间隔</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
