import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { useNavigate, useParams } from 'react-router-dom';

export function NewProblem() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { createProblem, updateProblem, fetchProblem, currentProblem } = useAppStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leetcode_id: '',
    title: '',
    title_zh: '',
    difficulty: 'Easy',
    tags: '',
    url: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchProblem(parseInt(id));
    }
  }, [isEditing, id, fetchProblem]);

  useEffect(() => {
    if (isEditing && currentProblem && currentProblem.id === parseInt(id!)) {
      setFormData({
        leetcode_id: currentProblem.leetcode_id?.toString() || '',
        title: currentProblem.title || '',
        title_zh: currentProblem.title_zh || '',
        difficulty: currentProblem.difficulty || 'Easy',
        tags: currentProblem.tags ? currentProblem.tags.join(', ') : '',
        url: currentProblem.url || ''
      });
    }
  }, [isEditing, currentProblem, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        leetcode_id: formData.leetcode_id ? parseInt(formData.leetcode_id) : null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      
      if (isEditing && id) {
        await updateProblem(parseInt(id), data as any);
        navigate(`/problems/${id}`);
      } else {
        const result = await createProblem(data as any);
        navigate(`/problems/${result.id}`);
      }
    } catch (error) {
      alert('保存失败，请检查填写内容');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-6">
          {isEditing ? '编辑题目' : '新增题目'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">LeetCode 编号</label>
            <Input 
              type="number" 
              value={formData.leetcode_id} 
              onChange={e => setFormData({ ...formData, leetcode_id: e.target.value })}
              placeholder="例如：1" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">英文名称 <span className="text-red-500">*</span></label>
            <Input 
              required
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="例如：Two Sum" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">中文名称</label>
            <Input 
              value={formData.title_zh} 
              onChange={e => setFormData({ ...formData, title_zh: e.target.value })}
              placeholder="例如：两数之和" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">难度 <span className="text-red-500">*</span></label>
            <select 
              required
              className="flex h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]"
              value={formData.difficulty} 
              onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">标签 (逗号分隔)</label>
            <Input 
              value={formData.tags} 
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              placeholder="例如：数组, 哈希表" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">题目链接</label>
            <Input 
              type="url"
              value={formData.url} 
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://leetcode.cn/..." 
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)] mt-6">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>取消</Button>
            <Button type="submit" variant="primary">保存</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
