import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Bookmark, Volume2, School, Loader } from 'lucide-react';
import { GrammarPoint, api } from '../services/api';
import { speakKorean } from '../lib/tts';

const GrammarView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [grammar, setGrammar] = useState<GrammarPoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrammar = async () => {
      // 1. Try to get from navigation state
      if (location.state?.grammar) {
        setGrammar(location.state.grammar);
        setLoading(false);
        return;
      }

      // 2. If no state, fetch a daily grammar (fallback)
      try {
        const daily = await api.getDailyGrammar(1);
        if (daily && daily.length > 0) {
          setGrammar(daily[0]);
        }
      } catch (error) {
        console.error("Failed to load grammar", error);
      } finally {
        setLoading(false);
      }
    };

    loadGrammar();
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Loader className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!grammar) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-4 text-slate-500">
        <p>未找到语法内容</p>
        <button onClick={() => navigate('/')} className="text-primary font-bold">返回首页</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-white/95 backdrop-blur-sm p-4 border-b border-gray-100 justify-between">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">语法详解</h2>
        <button className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 text-primary transition-colors">
          <Bookmark size={24} fill="currentColor" />
        </button>
      </div>

      <main className="flex-1 max-w-md mx-auto p-6 flex flex-col gap-6 pb-32">
        {/* Title Section */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="flex h-7 items-center justify-center gap-x-2 rounded-full bg-primary/10 px-4">
            <School size={14} className="text-primary" />
            <span className="text-primary text-xs font-bold uppercase tracking-wide">
              {grammar.level || '综合'}
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight text-center font-korean text-slate-900">
            {grammar.title}
          </h1>

          <p className="text-slate-600 text-base text-center leading-relaxed">
            {grammar.description}
          </p>
        </div>

        {/* Content Card */}
        <div className="flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden mt-2">
          <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 flex items-center gap-2">
            <School size={18} className="text-primary" />
            <span className="text-sm font-bold text-primary">学习重点</span>
          </div>
          <div className="p-5">
            <p className="text-slate-700 leading-7 text-sm">
              这个语法点非常重要。请仔细阅读下方的例句，并尝试跟读。
            </p>
          </div>
        </div>

        {/* Examples */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-slate-900">示范例句</h3>
            <span
              className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer hover:text-primary"
              onClick={() => speakKorean(grammar.example_korean)}
            >
              点击收听 <Volume2 size={14} />
            </span>
          </div>

          <div className="flex flex-col gap-0 rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">

            {/* Example 1 (From Data) */}
            <div className="p-4 flex items-start gap-4">
              <button
                className="mt-1 flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 shrink-0 transition-colors"
                onClick={() => speakKorean(grammar.example_korean)}
              >
                <Volume2 size={18} />
              </button>
              <div className="flex flex-col gap-1">
                <p className="text-lg font-korean font-bold text-slate-800 leading-snug">
                  {grammar.example_korean}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {grammar.example_translation}
                </p>
              </div>
            </div>

            {/* Placeholder for more examples if available in future */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GrammarView;