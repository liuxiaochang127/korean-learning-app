import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Heart, Book, GraduationCap, Volume2 } from 'lucide-react';

import { api, DictionaryEntry } from '../services/api';
import { supabase } from '../lib/supabaseClient';
import { speakKorean } from '../lib/tts';

const FavoritesView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadFavorites = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const data = await api.getFavorites(user.id);
          // 将字典条目映射为视图格式
          const mapped = data.map(entry => ({
            type: entry.pos === 'Noun' || entry.pos === 'Verb' || entry.pos === 'Adjective' || entry.pos === '名词' || entry.pos === '动词' || entry.pos === '形容词' ? 'word' : 'grammar',
            korean: entry.korean,
            english: entry.definition,
            meaning: entry.definition,
            time: 'Just now',
            date: '今天',
            color: 'blue',
            id: entry.id,
            // 如果 API 缺少示例，则使用模拟数据
            exampleK: '예문이 없습니다.',
            exampleC: '暂无例句'
          }));
          setFavorites(mapped);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background-light text-slate-900">
      {/* 头部 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-center flex-1 tracking-tight">我的收藏</h1>
        <div className="w-10"></div>
      </header>

      {/* 选项卡 */}
      <div className="px-4 py-4 z-40">
        <div className="flex p-1 bg-gray-200 rounded-xl">
          {['all', 'word', 'grammar', 'lesson'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 capitalize ${activeTab === tab ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-slate-900'
                }`}
            >
              {tab === 'all' ? '全部' : tab === 'word' ? '单词' : tab === 'grammar' ? '语法' : '课程'}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
        {['今天', '昨天'].map(dateGroup => (
          <section key={dateGroup}>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">{dateGroup}</h2>
            <div className="space-y-3">
              {favorites.filter(f => f.date === dateGroup && (activeTab === 'all' || activeTab === f.type)).map((item, idx) => (
                <div key={idx} className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-primary/10">

                  {item.type === 'word' && (
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-primary uppercase tracking-wide">单词</span>
                          <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-slate-900 font-korean tracking-tight">
                            {item.korean} <span className="text-base font-normal text-gray-400 font-sans">{item.english}</span>
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakKorean(item.korean);
                            }}
                            className="p-1 rounded-full text-slate-300 hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-slate-500">{item.meaning}</p>
                      </div>
                      <button className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                        <Heart size={20} fill="currentColor" />
                      </button>
                    </div>
                  )}

                  {item.type === 'grammar' && (
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-600 uppercase tracking-wide">语法</span>
                          <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-primary font-korean">{item.korean}</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakKorean(item.korean);
                            }}
                            className="p-1 rounded-full text-slate-300 hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed mb-2">{item.meaning}</p>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-slate-600 font-korean">{item.exampleK}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.exampleC}</p>
                        </div>
                      </div>
                      <button className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}

                  {item.type === 'lesson' && (
                    <div className="flex gap-4 items-center">
                      <div className="relative shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 overflow-hidden">
                        <GraduationCap size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 truncate font-korean">{item.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{item.subtitle}</p>
                          </div>
                          <button className="shrink-0 text-gray-300 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 ml-2">
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${item.progress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-medium text-orange-600">{item.progress}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </section>
        ))}
      </main >
    </div >
  );
};

export default FavoritesView;