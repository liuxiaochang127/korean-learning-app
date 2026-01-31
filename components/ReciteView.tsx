import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { supabase } from '../lib/supabaseClient';
import { Eye, EyeOff, Check, ChevronLeft, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type MaskMode = 'none' | 'hide-korean' | 'hide-chinese';

export const ReciteView: React.FC = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [maskMode, setMaskMode] = useState<MaskMode>('none');
  const [userId, setUserId] = useState<string | null>(null);
  const [revealedItems, setRevealedItems] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset revealed items when mask mode changes
    setRevealedItems(new Set());
  }, [maskMode]);

  const toggleReveal = (id: string, type: 'korean' | 'chinese') => {
    if (maskMode === 'none') return;
    // We only reveal if it matches the hidden type
    if ((type === 'korean' && maskMode === 'hide-korean') ||
      (type === 'chinese' && maskMode === 'hide-chinese')) {
      const key = `${id}-${type}`;
      setRevealedItems(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }
  };

  const isRevealed = (id: string, type: 'korean' | 'chinese') => {
    if (maskMode === 'none') return true;
    if (type === 'korean' && maskMode !== 'hide-korean') return true;
    if (type === 'chinese' && maskMode !== 'hide-chinese') return true;
    return revealedItems.has(`${id}-${type}`);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadWords(user.id, 0);
      }
    };
    getUser();
  }, []);

  const loadWords = async (uid: string, pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const newWords = await api.getVocabularyList(uid, pageNum, 20);
      if (newWords.length < 20) {
        setHasMore(false);
      }
      setWords(prev => pageNum === 0 ? newWords : [...prev, ...newWords]);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load words', error);
    } finally {
      setLoading(false);
    }
  };

  // Sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && userId) {
          loadWords(userId, page + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, userId, page]);

  // Remove handleScroll function

  const incrementCount = async (wordId: string, index: number) => {
    if (!userId) return;
    // Optimistic update
    const newWords = [...words];
    newWords[index].review_count = (newWords[index].review_count || 0) + 1;
    setWords(newWords);

    try {
      await api.incrementReviewCount(userId, wordId);
    } catch (err) {
      console.error("Failed to update count", err);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-background-light z-40">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm z-10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600">
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
              <BookOpen className="text-primary" size={24} />
              <span>单词背诵</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            已加载 {words.length} 个
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setMaskMode('none')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${maskMode === 'none' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
          >
            全部显示
          </button>
          <button
            onClick={() => setMaskMode('hide-chinese')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${maskMode === 'hide-chinese' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
          >
            遮挡中文
          </button>
          <button
            onClick={() => setMaskMode('hide-korean')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${maskMode === 'hide-korean' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
          >
            遮挡韩语
          </button>
        </div>
      </div>

      {/* List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {words.map((word, idx) => (
          <div key={word.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
            {/* Left: Korean */}
            <div
              className="flex-1 min-w-0 pr-4 relative cursor-pointer"
              onClick={() => toggleReveal(word.id, 'korean')}
            >
              <div className={`transition-opacity duration-300 ${!isRevealed(word.id, 'korean') ? 'opacity-0' : 'opacity-100'}`}>
                <h3 className="text-lg font-bold text-slate-800 font-korean">{word.korean}</h3>
                {word.romaja && <p className="text-xs text-slate-400 font-mono">{word.romaja}</p>}
              </div>
              {!isRevealed(word.id, 'korean') && (
                <div className="absolute inset-0 flex items-center text-slate-300 select-none">
                  <EyeOff size={20} />
                  <span className="ml-2 text-xs">点击显示</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-gray-100 mx-2"></div>

            {/* Right: Chinese (Definition) */}
            <div
              className="flex-1 min-w-0 pl-4 relative text-right cursor-pointer"
              onClick={() => toggleReveal(word.id, 'chinese')}
            >
              <div className={`transition-opacity duration-300 ${!isRevealed(word.id, 'chinese') ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-sm font-medium text-slate-700">{word.definition || word.translation}</p>
                {word.pos && <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[10px] rounded border border-gray-100">{word.pos}</span>}
              </div>
              {!isRevealed(word.id, 'chinese') && (
                <div className="absolute inset-0 flex items-center justify-end text-slate-300 select-none">
                  <span className="mr-2 text-xs">点击显示</span>
                  <EyeOff size={20} />
                </div>
              )}
            </div>

            {/* Counter / Action */}
            <div className="ml-4 pl-4 border-l border-gray-100 flex flex-col items-center gap-1 shrink-0">
              <button
                onClick={() => incrementCount(word.id, idx)}
                className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 active:scale-90 transition-all shadow-sm"
              >
                <Check size={16} strokeWidth={3} />
              </button>
              <span className="text-[10px] text-slate-400 font-mono">
                {word.review_count || 0}次
              </span>
            </div>
          </div>
        ))}

        {/* Sentinel for Infinite Scroll */}
        <div ref={sentinelRef} className="h-4 w-full"></div>

        {loading && (
          <div className="py-4 text-center">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
          </div>
        )}

        {!hasMore && words.length > 0 && (
          <div className="py-8 text-center text-slate-400 text-xs text-center flex flex-col items-center gap-2">
            <AlertCircle size={16} className="opacity-50" />
            <span>没有更多单词了</span>
            <span className="text-[10px] opacity-70">继续加油复习吧！</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReciteView;
