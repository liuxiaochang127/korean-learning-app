import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Flame, PlayCircle, Lock, Volume2, School } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { api, Course, GrammarPoint } from '../services/api';
import { supabase } from '../lib/supabaseClient';
import { speakKorean } from '../lib/tts';

const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<any>(null);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [grammarPoints, setGrammarPoints] = React.useState<GrammarPoint[]>([]); // New State
  // 加载状态
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loadingGrammar, setLoadingGrammar] = React.useState(true);
  const [loadingCourses, setLoadingCourses] = React.useState(true);

  React.useEffect(() => {
    // 1. 检查验证 & 加载个人资料
    const initData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // --- 加载个人资料 ---
          api.getProfile(user.id).then(data => {
            setProfile(prev => ({ ...prev, ...data }));
          }).catch(console.error).finally(() => setLoadingProfile(false));

          // --- 加载统计 ---
          api.getDictionaryStats(user.id).then(stats => {
            setProfile(prev => ({ ...prev, stats }));
          }).catch(console.error).finally(() => setLoadingStats(false));

          // --- 加载课程 ---
          api.getCourses(user.id).then(data => {
            setCourses(data);
          }).catch(console.error).finally(() => setLoadingCourses(false));

          // --- 加载每日计划触发器（后台） ---
          const todayStr = new Date().toLocaleDateString();
          const lastGeneratedDate = localStorage.getItem('daily_plan_generated_date');
          if (lastGeneratedDate !== todayStr) {
            api.getDailyStudySet(user.id, 100, false).then(() => {
              localStorage.setItem('daily_plan_generated_date', todayStr);
              window.dispatchEvent(new Event('study-progress-updated'));
            }).catch(console.error);
          }

          // --- 加载语法 ---
          const todayGrammarStr = localStorage.getItem('today_grammar_data');
          const lastGrammarDate = localStorage.getItem('today_grammar_date');
          if (lastGrammarDate === todayStr && todayGrammarStr) {
            setGrammarPoints(JSON.parse(todayGrammarStr));
            setLoadingGrammar(false);
          } else {
            api.getDailyGrammar(5).then(data => {
              setGrammarPoints(data);
              localStorage.setItem('today_grammar_data', JSON.stringify(data));
              localStorage.setItem('today_grammar_date', todayStr);
            }).catch(console.error).finally(() => setLoadingGrammar(false));
          }

        } else {
          console.log("No user logged in");
          setLoadingProfile(false);
          setLoadingStats(false);
          setLoadingGrammar(false);
        }
      } catch (err) {
        console.error(err);
        setLoadingProfile(false);
      }
    };

    initData();
  }, []);

  // 头部个人资料的骨架屏
  const ProfileSkeleton = () => (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // 统计数据的骨架屏
  const StatsSkeleton = () => (
    <div className="flex flex-col gap-2 animate-pulse mt-4">
      <div className="flex justify-between items-end">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-4 w-8 bg-gray-200 rounded"></div>
      </div>
      <div className="h-4 w-full bg-gray-200 rounded-full"></div>
      <div className="flex justify-between mt-1">
        <div className="h-3 w-32 bg-gray-200 rounded"></div>
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 flex flex-col bg-background-light z-40">
      {/* 头部 */}
      <header className="bg-white px-6 pt-12 pb-6 rounded-b-[2rem] shadow-sm z-10 sticky top-0 shrink-0">
        <div className="flex items-center justify-between mb-6">
          {loadingProfile ? (
            <ProfileSkeleton />
          ) : (
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="relative">
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 ring-2 ring-primary/20"
                  style={{ backgroundImage: 'url("https://picsum.photos/200/200?random=1")' }}
                ></div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  Lv 3
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold leading-tight text-slate-800">
                  欢迎回来，<br /><span className="text-primary">{profile?.username || '游客'}</span>
                </h1>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!loadingProfile && !profile && (
              <button
                onClick={() => navigate('/auth')}
                className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors animate-fade-in"
              >
                登录
              </button>
            )}
            <button className="p-2 rounded-full bg-background-light text-slate-600 hover:bg-gray-200 transition-colors">
              <Bell size={24} />
            </button>
          </div>
        </div>

        {/* 统计行 */}
        {loadingStats ? (
          <StatsSkeleton />
        ) : (
          <div className="flex flex-col gap-2 cursor-pointer animate-slide-up" onClick={() => navigate('/practice')}>
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-slate-500">每日目标 (100词)</span>
              <span className="text-sm font-bold text-primary">
                {profile?.stats ? Math.max(0, Math.min(100, 100 - (profile.stats.due || 0))) : 0}%
              </span>
            </div>

            <div className="h-4 w-full relative bg-gray-100 rounded-full overflow-hidden flex items-center">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${profile?.stats ? Math.max(0, Math.min(100, 100 - (profile.stats.due || 0))) : 0}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-slate-500">
                {profile?.stats ? (
                  <>待复习 <span className="text-orange-500 font-bold">{profile.stats.due}</span> 个单词</>
                ) : '请先登录查看进度'}
              </span>
              <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
                <Flame size={16} fill="currentColor" />
                <span>连续打卡 1 天</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="shrink-0 px-6 pt-2 pb-2">
        <div className="flex items-center justify-between mt-2 mb-2 cursor-pointer" onClick={() => navigate('/lesson/grammar', { state: { grammar: grammarPoints[0] } })}>
          <h2 className="text-lg font-bold text-slate-800">今日语法</h2>
          <span className="text-xs text-slate-400">每日5句</span>
        </div>
      </div>

      {/* 底部可滚动区域 */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 pt-2 no-scrollbar">
        {/* 每日语法小组件 */}
        <section className="">


          <div className="flex flex-col gap-3">
            {grammarPoints.length > 0 ? (
              grammarPoints.map((grammar, idx) => (
                <div
                  key={grammar.id}
                  onClick={() => navigate('/lesson/grammar', { state: { grammar } })}
                  className="bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] rounded-2xl p-4 relative overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  {idx === 0 && <School size={80} className="absolute -right-2 -top-2 text-white opacity-20" />}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-1">
                      <span className="bg-white/60 backdrop-blur-sm text-primary text-[10px] font-bold px-2 py-0.5 rounded opacity-80">{grammar.level || '基础'}</span>
                      <button
                        className="size-6 rounded-full bg-white flex items-center justify-center shadow-sm text-primary hover:bg-gray-50 active:scale-95 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakKorean(grammar.example_korean);
                        }}
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 font-korean mb-0.5">{grammar.title}</h3>
                    <p className="text-xs text-slate-600 mb-2 italic line-clamp-1">{grammar.description}</p>

                    <div className="bg-white/50 rounded-lg p-2.5 backdrop-blur-sm border border-white/20">
                      <p className="text-sm text-slate-800 font-korean mb-0.5">
                        {grammar.example_korean}
                      </p>
                      <p className="text-xs text-slate-500">{grammar.example_translation}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl">加载语法中...</div>
            )}
          </div>
        </section >

      </main >
    </div >
  );
};

export default HomeView;