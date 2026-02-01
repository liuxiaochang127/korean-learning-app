import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, RotateCcw, RotateCw, Pause, Play, FileText, Check, Mic, Activity, Volume2 } from 'lucide-react';
import * as d3 from 'd3';

const LessonAudioView: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  // D3 波形可视化
  useEffect(() => {
    if (!waveformRef.current) return;

    // 清除之前的渲染
    d3.select(waveformRef.current).selectAll("*").remove();

    const width = waveformRef.current.clientWidth;
    const height = 64; // h-16
    const barCount = 30;
    const barWidth = 4;
    const gap = (width - (barCount * barWidth)) / (barCount - 1);

    const svg = d3.select(waveformRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // 生成条形图的随机数据
    const data = Array.from({ length: barCount }, () => Math.random() * 40 + 10);

    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (barWidth + gap))
      .attr("y", d => (height - d) / 2)
      .attr("width", barWidth)
      .attr("height", d => d)
      .attr("rx", 2)
      .attr("fill", "#2C097F")
      .attr("opacity", (d, i) => i % 2 === 0 ? 0.8 : 0.4)
      .each(function () {
        // 简单的 D3 动画模拟
        if (isPlaying) {
          d3.select(this)
            .append("animate")
            .attr("attributeName", "height")
            .attr("values", (d: any) => `${d};${d * 1.2};${d}`)
            .attr("dur", "1s")
            .attr("repeatCount", "indefinite");
        }
      });

  }, [isPlaying]);

  return (
    <div className="flex flex-col min-h-screen bg-background-light">
      {/* 头部 */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center px-4 py-3 justify-between">
          <button onClick={() => navigate(-1)} className="text-slate-800 flex size-10 items-center justify-center rounded-full hover:bg-gray-100">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">听力与口语</span>
            <h2 className="text-slate-900 text-base font-bold leading-tight">第四章：经济</h2>
          </div>
          <button className="text-slate-800 flex size-10 items-center justify-center rounded-full hover:bg-gray-100">
            <Settings size={24} />
          </button>
        </div>
        <div className="w-full h-1 bg-gray-200">
          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: '65%' }}></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 pb-32">
        {/* 音频部分 */}
        <section className="flex flex-col gap-4 px-4 pt-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">首尔的经济</h1>
            <p className="text-sm text-gray-500 font-medium">延世韩国语 高级 • 第 4.2 课</p>
          </div>

          <div className="relative w-full h-32 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden">
            {/* D3 容器 */}
            <div ref={waveformRef} className="w-3/4 h-16 flex items-center"></div>

            <div className="absolute bottom-2 left-4 text-[10px] font-bold text-gray-400">01:17</div>
            <div className="absolute bottom-2 right-4 text-[10px] font-bold text-gray-400">03:45</div>
          </div>

          {/* 控制栏 */}
          <div className="flex items-center justify-between px-2">
            <button className="text-xs font-bold text-gray-500 hover:text-primary bg-gray-200 px-3 py-1.5 rounded-lg">1.0x</button>
            <div className="flex items-center gap-6">
              <button className="text-gray-400 hover:text-slate-600 transition-colors">
                <RotateCcw size={32} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-primary hover:bg-primary-dark text-white rounded-full size-14 flex items-center justify-center shadow-lg shadow-primary/30 transition-all active:scale-95"
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>
              <button className="text-gray-400 hover:text-slate-600 transition-colors">
                <RotateCw size={32} strokeWidth={1.5} />
              </button>
            </div>
            <button onClick={() => navigate('/lesson/reading')} className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
              <FileText size={14} />
              原文
            </button>
          </div>
        </section>

        <hr className="border-gray-200 mx-4" />

        {/* 测验部分 */}
        <section className="flex flex-col gap-4 px-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="bg-primary/20 text-primary p-1 rounded text-sm"><Check size={16} /></span>
              理解测试
            </h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">第 2 题 / 共 5 题</span>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <p className="text-slate-800 text-base font-medium leading-relaxed mb-4">
              说话者为什么对新的经济政策提案表示担忧？
            </p>
            <div className="flex flex-col gap-3">
              {[
                "因为预算不足。",
                "它会对小企业产生负面影响。",
                "时间表过于激进。"
              ].map((option, idx) => (
                <label key={idx} className={`group flex items-center gap-4 rounded-lg border p-3 cursor-pointer transition-all ${selectedOption === idx ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="quiz"
                    className="h-5 w-5 border-2 border-gray-400 text-primary focus:ring-primary"
                    checked={selectedOption === idx}
                    onChange={() => setSelectedOption(idx)}
                  />
                  <span className="text-slate-700 text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="w-full py-3 bg-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-300 transition-colors text-sm">
            检查答案
          </button>
        </section>
      </main>

      {/* 交互式底部面板（口语挑战） */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-2xl z-40">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1"></div>
        <div className="p-5 pt-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Mic className="text-primary" size={20} />
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">跟读挑战</h4>
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-600 font-bold text-xs">匹配度 88%</span>
            </div>
          </div>

          <div className="text-center py-2">
            <p className="font-korean text-xl md:text-2xl font-bold text-slate-900 leading-relaxed">
              <span className="text-green-500">경제 상황이</span> <span className="text-green-500">좋아질</span> 것이라고 <span className="text-yellow-500 underline decoration-yellow-500/50 underline-offset-4">생각하지</span> 않습니다.
            </p>
            <p className="text-gray-500 text-sm mt-2 font-medium">"我不认为经济状况会好转。"</p>
          </div>

          <div className="flex items-center justify-center gap-8 mt-1">
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary">
              <div className="size-10 rounded-full border border-gray-300 flex items-center justify-center">
                <Volume2 size={20} />
              </div>
              <span className="text-[10px] font-medium">听音</span>
            </button>

            <button className="relative size-20 flex items-center justify-center group">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div className="relative size-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-white transition-transform active:scale-95">
                <Mic size={32} className="text-white" fill="currentColor" />
              </div>
            </button>

            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary">
              <div className="size-10 rounded-full border border-gray-300 flex items-center justify-center">
                <Activity size={20} />
              </div>
              <span className="text-[10px] font-medium">分析</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonAudioView;