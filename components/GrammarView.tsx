import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bookmark, ArrowRightLeft, Info, Users, Volume2 } from 'lucide-react';

const GrammarView: React.FC = () => {
  const navigate = useNavigate();

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

      <main className="flex-1 max-w-md mx-auto p-4 flex flex-col gap-6 pb-32">
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="flex h-7 items-center justify-center gap-x-2 rounded-full bg-primary/10 px-3">
            <span className="text-primary text-xs font-semibold uppercase tracking-wide">第3级 • 第4课</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-center font-korean">
            <span className="text-primary">-거든요</span> vs <span className="text-primary">-잖아요</span>
          </h1>
          <p className="text-slate-500 text-sm text-center max-w-[90%]">
            理解“提供理由”与“唤起共同认知”之间的细微差别。
          </p>
        </div>

        {/* Tabs */}
        <div className="flex w-full">
          <div className="flex h-10 flex-1 items-center rounded-lg bg-gray-200 p-1">
            <button className="flex-1 flex items-center justify-center h-full rounded-[4px] bg-white shadow-sm text-slate-900 text-sm font-medium transition-all">
              对比
            </button>
            <button className="flex-1 flex items-center justify-center h-full rounded-[4px] text-slate-500 hover:text-slate-900 text-sm font-medium transition-all">
              例句
            </button>
            <button className="flex-1 flex items-center justify-center h-full rounded-[4px] text-slate-500 hover:text-slate-900 text-sm font-medium transition-all">
              对话
            </button>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="flex flex-col relative gap-4">
          
          {/* Card 1 */}
          <div className="flex flex-col rounded-2xl bg-blue-50/50 border border-blue-100 overflow-hidden">
            <div className="p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-korean text-2xl font-bold text-slate-900">-거든요</h3>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">新信息</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                用于陈述<span className="font-bold text-blue-600">听话者不知道</span>的理由或事实。通常带有解释的语气。
              </p>
              <div className="mt-2 pt-3 border-t border-blue-100 flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                <span className="text-xs text-blue-600 font-medium">重点：对方完全未知</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-blue-400/20"></div>
          </div>

          {/* Floating 'Vs' Badge */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center pointer-events-none">
            <div className="bg-white shadow-md border border-gray-100 rounded-full py-1.5 px-4 flex items-center gap-2 pointer-events-auto transform hover:scale-105 transition-transform">
              <ArrowRightLeft size={16} className="text-orange-500" />
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">关键区别：信息差</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col rounded-2xl bg-indigo-50/50 border border-indigo-100 overflow-hidden mt-2">
            <div className="p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-korean text-2xl font-bold text-slate-900">-잖아요</h3>
                <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">共有信息</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                 用于假设<span className="font-bold text-indigo-600">听话者已经知道</span>该事实时。意为“不是...嘛”。
              </p>
              <div className="mt-2 pt-3 border-t border-indigo-100 flex items-center gap-2">
                <Users size={18} className="text-indigo-500" />
                <span className="text-xs text-indigo-600 font-medium">重点：唤起共同记忆</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-indigo-500/20"></div>
          </div>
        </div>

        {/* Examples */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-slate-900">示范例句</h3>
            <span className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer hover:text-primary">
              点击收听 <Volume2 size={14} />
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">场景：买车</div>
            
            <div className="flex items-start gap-3">
              <button className="mt-0.5 flex items-center justify-center size-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 shrink-0 transition-colors">
                <Volume2 size={18} />
              </button>
              <div className="flex flex-col">
                <p className="text-base font-korean font-medium text-slate-900 leading-snug">
                  지난 주에 차를 샀<span className="text-blue-500 font-bold">거든요</span>.
                </p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  我上周买了车。<span className="text-xs bg-gray-100 px-1 py-0.5 rounded ml-1 text-slate-600">你不知道这件事</span>
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-gray-100 my-1"></div>

            <div className="flex items-start gap-3">
              <button className="mt-0.5 flex items-center justify-center size-8 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100 shrink-0 transition-colors">
                <Volume2 size={18} />
              </button>
              <div className="flex flex-col">
                <p className="text-base font-korean font-medium text-slate-900 leading-snug">
                  지난 주에 차를 샀<span className="text-indigo-500 font-bold">잖아요</span>.
                </p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  我上周不是买了车嘛。<span className="text-xs bg-gray-100 px-1 py-0.5 rounded ml-1 text-slate-600">你知道/记得这件事</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GrammarView;