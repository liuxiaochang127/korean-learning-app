import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Pause, School, X } from 'lucide-react';

const TextReadingView: React.FC = () => {
  const navigate = useNavigate();
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleWordClick = (word: string) => {
    setActiveTooltip(activeTooltip === word ? null : word);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light text-slate-900">
      {/* 头部 */}
      <header className="sticky top-0 z-30 flex items-center bg-white/95 backdrop-blur-sm border-b border-gray-100 p-4 pb-3 justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:bg-gray-100 rounded-full p-2 -ml-2 transition-colors">
            <ChevronLeft size={24} />
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight flex-1 truncate px-2 text-center">
          第4册 第1单元
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">中</span>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showTranslation ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTranslation ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </header>

      {/* 音频播放器悬浮栏 */}
      <div className="sticky top-[61px] z-20 bg-white shadow-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex shrink-0 items-center justify-center rounded-full size-10 bg-primary text-white hover:bg-primary-dark shadow-sm transition-colors active:scale-95"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          <div className="flex-1 flex flex-col justify-center gap-1">
            <div className="flex items-center justify-between text-[10px] font-medium text-gray-500">
              <span>0:42</span>
              <span>2:23</span>
            </div>
            <div className="relative h-1.5 w-full rounded-full bg-gray-200">
              <div className="absolute top-0 left-0 h-full w-[30%] rounded-full bg-primary"></div>
              <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 size-3 rounded-full bg-white shadow border border-gray-200 cursor-pointer"></div>
            </div>
          </div>
          <div className="shrink-0">
            <div className="flex h-8 items-center rounded-lg bg-gray-100 p-0.5">
              <button className="px-2 py-1 h-full text-[10px] font-bold text-gray-500 hover:text-primary">0.8x</button>
              <button className="px-2 py-1 h-full bg-white shadow-sm rounded-md text-[10px] font-bold text-primary">1.0x</button>
              <button className="px-2 py-1 h-full text-[10px] font-bold text-gray-500 hover:text-primary">1.2x</button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-6 pb-24 relative">
        <div className="mb-8 border-l-4 border-primary pl-4">
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-1">제1과: 자기소개</h1>
          <p className="text-sm text-gray-500 font-medium">第1课：自我介绍</p>
        </div>

        <div className="space-y-8">
          {/* 第一段 */}
          <div className="group relative">
            <p className="text-xl leading-[2.2] font-normal font-korean">
              <span className="cursor-pointer hover:bg-gray-100 rounded px-0.5 transition-colors">안녕하세요</span>.
              <span className="cursor-pointer hover:bg-gray-100 rounded px-0.5 transition-colors"> 저는</span>{' '}

              {/* 带提示框的交互单词 */}
              <span className="relative inline-block">
                <span
                  onClick={() => handleWordClick('yonsei')}
                  className={`cursor-pointer px-0.5 rounded font-medium border-b border-dashed border-primary transition-colors ${activeTooltip === 'yonsei' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                >
                  연세대학교
                </span>
                {activeTooltip === 'yonsei' && (
                  <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl animate-bounce-slight">
                    <div className="flex justify-between items-start mb-1">
                      <span className="block font-bold text-sm">延世大学 (名词)</span>
                      <button onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); }}><X size={12} /></button>
                    </div>
                    <span className="block opacity-90 leading-relaxed">Yonsei University; 位于首尔的一所私立研究型大学。</span>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
                  </span>
                )}
              </span>{' '}

              <span className="cursor-pointer hover:bg-gray-100 rounded px-0.5 transition-colors">학생</span>
              <span className="underline decoration-primary decoration-2 underline-offset-4 cursor-pointer hover:bg-blue-50 rounded px-0.5" title="语法: 是 (敬语)">입니다</span>.
            </p>
            {showTranslation && (
              <p className="mt-2 text-sm text-gray-500 leading-relaxed pl-2 border-l-2 border-gray-200">
                大家好。我是延世大学的学生。
              </p>
            )}
          </div>

          {/* 第二段 */}
          <div className="group relative">
            <p className="text-xl leading-[2.2] font-normal font-korean">
              <span className="cursor-pointer hover:bg-gray-100 rounded px-0.5">한국어</span>를
              <span className="cursor-pointer hover:bg-gray-100 rounded px-0.5"> 전공하고</span>{' '}
              <span className="underline decoration-primary decoration-2 underline-offset-4 cursor-pointer hover:bg-blue-50 rounded px-0.5" title="语法: 正在进行">있습니다</span>.
              <span className="cursor-pointer hover:bg-gray-100 rounded px-0.5"> 취미는</span>{' '}
              <span className="cursor-pointer hover:bg-gray-100 rounded px-0.5">음악</span>{' '}
              <span className="cursor-pointer hover:bg-gray-100 rounded px-0.5">감상입니다</span>.
            </p>
            {showTranslation && (
              <p className="mt-2 text-sm text-gray-500 leading-relaxed pl-2 border-l-2 border-gray-200">
                我主修韩语。我的爱好是欣赏音乐。
              </p>
            )}
          </div>
        </div>

        {/* 内容底部的语法总结 */}
        <div className="mt-12 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 p-1.5 rounded-full text-primary shrink-0">
              <School size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">重点语法</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span><strong>-입니다</strong>: 是 (格式体敬语)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span><strong>-고 있습니다</strong>: 正在 (现在进行时)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TextReadingView;