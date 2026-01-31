import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Flame, PlayCircle, Lock, Volume2, School } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { api, Course, GrammarPoint } from '../services/api';
import { supabase } from '../lib/supabaseClient';

const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<any>(null);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [grammarPoints, setGrammarPoints] = React.useState<GrammarPoint[]>([]); // New State
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 1. 并行获取基础数据
          // 优化：检查本地标记，如果今天已经生成过计划，就不再触发 getDailyStudySet 写入操作
          const todayStr = new Date().toLocaleDateString();
          const lastGeneratedDate = localStorage.getItem('daily_plan_generated_date');

          const promises: Promise<any>[] = [
            api.getProfile(user.id),
            api.getCourses(user.id)
          ];

          if (lastGeneratedDate !== todayStr) {
            // 只有日期变更或未生成时，才触发任务生成
            // 传递 false 以跳过详情拉取，只做生成动作，大幅优化性能
            promises.push(api.getDailyStudySet(user.id, 100, false).then(() => {
              localStorage.setItem('daily_plan_generated_date', todayStr);
              window.dispatchEvent(new Event('study-progress-updated'));
            }));
          }

          // Grammar Fetch (Cached)
          const todayGrammarStr = localStorage.getItem('today_grammar_data');
          const lastGrammarDate = localStorage.getItem('today_grammar_date');

          if (lastGrammarDate === todayStr && todayGrammarStr) {
            setGrammarPoints(JSON.parse(todayGrammarStr));
          } else {
            promises.push(api.getDailyGrammar(5).then(data => {
              setGrammarPoints(data);
              localStorage.setItem('today_grammar_data', JSON.stringify(data));
              localStorage.setItem('today_grammar_date', todayStr);
            }));
          }

          const [profileData, coursesData] = await Promise.all(promises);

          // 2. 获取依赖于上述计划的统计数据
          const stats = await api.getDictionaryStats(user.id);

          setProfile({ ...profileData, stats });
          setCourses(coursesData);
        } else {
          // Demo/Fallback Data if no user logged in
          console.log("No user logged in, using fallback data");
        }
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  return (
    <div className="h-screen bg-background-light flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 rounded-b-[2rem] shadow-sm z-10 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-2">
            {!profile && (
              <button
                onClick={() => navigate('/auth')}
                className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"
              >
                登录
              </button>
            )}
            <button className="p-2 rounded-full bg-background-light text-slate-600 hover:bg-gray-200 transition-colors">
              <Bell size={24} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-col gap-2 cursor-pointer" onClick={() => navigate('/practice')}>
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
              ) : '加载中...'}
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
              <Flame size={16} fill="currentColor" />
              <span>连续打卡 1 天</span>
            </div>
          </div>
        </div>
      </header>

      <div className="shrink-0 px-6 pt-2 pb-2">
        {/* Continue Learning Card */}
        {/* <section>
          <div className="flex items-center gap-2 mb-3">
            <School className="text-primary" size={20} />
            <h2 className="text-lg font-bold text-slate-800">继续学习</h2>
          </div>

          <div
            onClick={() => navigate('/lesson/audio')}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer transition-transform active:scale-[0.98]"
          >
            <div className="relative h-32 w-full bg-blue-50">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
              <div className="flex h-full items-center justify-between px-5">
                <div className="flex flex-col z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1">第 4 章</span>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">大学生活</h3>
                  <p className="text-sm text-slate-500 font-korean">대학 생활</p>
                </div>
                <div
                  className="w-20 h-20 bg-contain bg-no-repeat bg-center opacity-90 drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundImage: 'url("https://cdn-icons-png.flaticon.com/512/3389/3389081.png")' }}
                ></div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">延世韩国语 3</span>
                <div className="h-1.5 w-24 bg-gray-100 rounded-full mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <button className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                <span>继续</span>
                <PlayCircle size={18} fill="currentColor" className="text-white" />
              </button>
            </div>
          </div>
        </section> */}

        {/* Course List */}
        {/* <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-bold text-slate-800">我的课程</h2>
            <button className="text-sm font-medium text-primary hover:text-primary-dark">查看全部</button>
          </div>

          <div className="flex flex-col gap-4">
            {courses.length > 0 ? (
              courses.map(course => (
                <div key={course.id} className={`flex p-3 bg-white rounded-2xl shadow-sm border border-gray-100 items-center gap-4 ${course.status === 'locked' ? 'opacity-70' : ''}`}>
                  <div className="w-16 h-20 shrink-0 bg-gray-200 rounded-lg bg-cover bg-center shadow-inner relative overflow-hidden" style={{ backgroundImage: course.cover_url ? `url("${course.cover_url}")` : undefined }}>
                    {!course.cover_url && <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-500 text-xs">No Cover</div>}
                    {course.status === 'locked' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Lock size={20} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base truncate text-slate-800">{course.title}</h4>
                        <p className="text-xs text-slate-500">{course.level_category || 'General'}</p>
                      </div>
                      {course.status === 'in_progress' && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">进行中</span>
                      )}
                    </div>
                    {course.status !== 'locked' ? (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress || 0}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-slate-400">{course.progress || 0}%</span>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Lock size={12} />
                          解锁课程
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">暂无课程</div>
            )}
          </div>
        </section> */}
        <div className="flex items-center justify-between mt-2 mb-2 cursor-pointer" onClick={() => navigate('/lesson/grammar')}>
          <h2 className="text-lg font-bold text-slate-800">今日语法</h2>
          <span className="text-xs text-slate-400">每日5句</span>
        </div>
      </div>

      {/* Scrollable Bottom Section */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 pt-2">
        {/* Daily Grammar Widget */}
        <section onClick={() => navigate('/lesson/grammar')} className="cursor-pointer">


          <div className="flex flex-col gap-3">
            {grammarPoints.length > 0 ? (
              grammarPoints.map((grammar, idx) => (
                <div key={grammar.id} className="bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] rounded-2xl p-4 relative overflow-hidden shadow-sm">
                  {idx === 0 && <School size={80} className="absolute -right-2 -top-2 text-white opacity-20" />}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-1">
                      <span className="bg-white/60 backdrop-blur-sm text-primary text-[10px] font-bold px-2 py-0.5 rounded opacity-80">{grammar.level || '基础'}</span>
                      <button className="size-6 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
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