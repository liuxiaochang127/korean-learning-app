
import React, { useState } from 'react';
import { Search, X, Volume2, ChevronRight, Book, Star, Plus, Pencil, ChevronDown, Check } from 'lucide-react';

import { api, DictionaryEntry } from '../services/api';
import { supabase } from '../lib/supabaseClient';
import { speakKorean } from '../lib/tts';

const CustomSelect = ({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: string[] }) => {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <div className="relative">
         <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none flex items-center justify-between transition-all group ${isOpen ? 'ring-2 ring-primary/20 border-primary bg-white' : 'hover:border-gray-300 hover:bg-gray-100/50'}`}
         >
            <span className={`font-medium ${value ? 'text-slate-800' : 'text-gray-400'}`}>{value}</span>
            <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:text-gray-600'}`} />
         </button>

         {isOpen && (
            <>
               <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
               <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 overflow-hidden animate-slide-up max-h-60 overflow-y-auto">
                  {options.map(opt => (
                     <div
                        key={opt}
                        onClick={() => { onChange(opt); setIsOpen(false); }}
                        className={`p-3 px-4 flex items-center justify-between cursor-pointer transition-all ${value === opt ? 'bg-primary/5 text-primary font-bold' : 'text-slate-600 hover:bg-gray-50'}`}
                     >
                        {opt}
                        {value === opt && <Check size={16} className="animate-fade-in" />}
                     </div>
                  ))}
               </div>
            </>
         )}
      </div>
   );
};

const DictionaryView: React.FC = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeCategory, setActiveCategory] = useState('All');
   const [results, setResults] = useState<DictionaryEntry[]>([]);
   const [loading, setLoading] = useState(false);
   const [categories, setCategories] = useState(['All', 'Noun', 'Verb', 'Adjective', 'Idiom']);
   const [userId, setUserId] = useState<string | null>(null);

   React.useEffect(() => {
      // 获取用户
      supabase.auth.getUser().then(({ data: { user } }) => {
         if (user) setUserId(user.id);
      });

      api.getCategories().then(setCategories);

      // 加载初始单词
      setLoading(true);
      api.getRecentWords(20).then(data => {
         setResults(data);
         setLoading(false);
      });
   }, []);

   // 防抖搜索
   React.useEffect(() => {
      const handler = setTimeout(async () => {
         if (searchTerm.trim()) {
            setLoading(true);
            try {
               console.log('Searching for:', searchTerm);
               const data = await api.searchDictionary(searchTerm);
               setResults(data);
            } catch (e) {
               console.error(e);
            } finally {
               setLoading(false);
            }
         } else {
            // 搜索清空时重新加载最近单词
            setLoading(true);
            api.getRecentWords(20).then(data => {
               setResults(data);
               setLoading(false);
            });
         }
      }, 500);

      return () => clearTimeout(handler);
   }, [searchTerm]);

   const handleToggleFavorite = async (e: React.MouseEvent, item: DictionaryEntry) => {
      e.stopPropagation(); // 阻止卡片点击冒泡
      if (!userId) {
         alert('请先登录收藏单词');
         return;
      }

      // 乐观更新
      const newIsStarred = !item.is_starred;
      const newResults = results.map(r =>
         r.id === item.id ? { ...r, is_starred: newIsStarred } : r
      );
      setResults(newResults);

      try {
         await api.toggleFavorite(userId, item.id, item.is_starred || false);
      } catch (err) {
         console.error(err);
         // 出错时回滚
         setResults(results);
      }
   };

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null);
   const [formData, setFormData] = useState({
      korean: '',
      romaja: '',
      pos: 'Noun',
      definition: '',
      example_sentence: '',
      example_meaning: ''
   });

   const openModal = (entry: DictionaryEntry | null = null) => {
      if (entry) {
         setEditingEntry(entry);
         setFormData({
            korean: entry.korean,
            romaja: entry.romaja || '',
            pos: entry.pos,
            definition: entry.definition,
            example_sentence: entry.example_sentence || '',
            example_meaning: entry.example_meaning || ''
         });
      } else {
         setEditingEntry(null);
         setFormData({
            korean: '',
            romaja: '',
            pos: 'Noun',
            definition: '',
            example_sentence: '',
            example_meaning: ''
         });
      }
      setIsModalOpen(true);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         if (editingEntry) {
            await api.updateDictionaryEntry(editingEntry.id, formData);
         } else {
            await api.addDictionaryEntry(formData);
         }
         setIsModalOpen(false);
         // 刷新列表
         setLoading(true);
         const data = await api.getRecentWords(20);
         setResults(data);
         setLoading(false);
      } catch (err: any) {
         alert('操作失败: ' + err.message);
      }
   };

   const handleDelete = async () => {
      if (!editingEntry) return;
      if (!confirm('确定要删除这个单词吗？')) return;
      try {
         await api.deleteDictionaryEntry(editingEntry.id);
         setIsModalOpen(false);
         // 刷新
         setLoading(true);
         const data = await api.getRecentWords(20);
         setResults(data);
         setLoading(false);
      } catch (err: any) {
         alert('删除失败: ' + err.message);
      }
   };

   const POS_MAP: Record<string, string> = {
      'Noun': '名词',
      'Verb': '动词',
      'Adjective': '形容词',
      'Adverb': '副词',
      'Phrase': '短语',
      'Idiom': '俗语',
      'All': '全部'
   };

   const filteredResults = results.filter(item => {
      // 允许匹配确切词性或已翻译的词性（用于混合数据兼容性）
      if (activeCategory === 'All') return true;
      return item.pos === activeCategory || POS_MAP[item.pos] === activeCategory;
   });

   return (
      <div className="flex flex-col h-screen bg-background-light overflow-hidden">
         {/* 搜索头部 */}
         <div className="shrink-0 z-30 bg-white shadow-sm pb-4 pt-4 px-4 rounded-b-3xl relative">
            <div className="flex items-center justify-between mb-4 px-1">
               <h1 className="text-xl font-bold text-slate-900">韩语词典</h1>
               <button
                  onClick={() => openModal()}
                  className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all"
               >
                  <Plus size={20} />
               </button>
            </div>

            <div className="relative group">
               <textarea
                  placeholder="请输入单词、句子或段落进行搜索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-24 pl-4 pr-10 py-3 rounded-2xl bg-gray-100 border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-800 placeholder:text-gray-400 font-medium outline-none resize-none"
               />
               {searchTerm && (
                  <button
                     onClick={() => setSearchTerm('')}
                     className="absolute right-3 top-3 p-1 text-gray-400 hover:text-slate-600 rounded-full hover:bg-gray-200"
                  >
                     <X size={16} />
                  </button>
               )}
               <div className="absolute right-3 bottom-3 text-gray-400 pointer-events-none">
                  <Search size={20} />
               </div>
            </div>

            {/* 分类 */}
            <div className="flex flex-wrap gap-2 mt-4 pb-1">
               {categories.map(cat => (
                  <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${activeCategory === cat
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'bg-white text-slate-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                  >
                     {POS_MAP[cat] || cat}
                  </button>
               ))}
            </div>
         </div>

         <main className="flex-1 px-4 pt-6 overflow-y-auto pb-24">
            <div className="flex flex-col gap-3 pb-8">
               {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  </div>
               ) : results.length > 0 ? (
                  results.map(item => (
                     <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 transition-all cursor-pointer group hover:scale-[1.01] hover:shadow-md duration-300 animate-slide-up">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                 <h3 className="text-2xl font-bold text-slate-900 font-korean tracking-tight">{item.korean}</h3>
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       speakKorean(item.korean);
                                    }}
                                    className="p-1.5 rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                 >
                                    <Volume2 size={18} />
                                 </button>
                              </div>
                              <span className="text-xs text-gray-400 font-medium mt-0.5">{item.romaja}</span>
                           </div>
                           <div className="flex gap-2">
                              <button
                                 onClick={(e) => { e.stopPropagation(); openModal(item); }}
                                 className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                              >
                                 <Pencil size={18} />
                              </button>
                              <button
                                 onClick={(e) => handleToggleFavorite(e, item)}
                                 className="text-gray-300 hover:text-yellow-400 transition-colors p-1 -mr-1"
                              >
                                 <Star size={22} fill={item.is_starred ? "#facc15" : "none"} className={item.is_starred ? "text-yellow-400" : ""} />
                              </button>
                           </div>
                        </div>
                        <div className="flex items-center flex-wrap gap-2 mb-3 mt-2">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${item.pos === 'Verb' || item.pos === '动' || item.pos === ' 动' || POS_MAP[item.pos] === '动词' ? 'bg-green-50 text-green-600 border-green-100' :
                              item.pos === 'Adjective' || item.pos === '形' || item.pos === ' 形' || POS_MAP[item.pos] === '形容词' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                              {POS_MAP[item.pos] || item.pos}
                           </span>
                           <span className="text-slate-800 font-bold text-sm">{item.definition}</span>
                        </div>
                        {item.example_sentence && (
                           <div className="bg-gray-50 rounded-xl p-3 text-sm text-slate-600 group-hover:bg-primary/5 transition-colors relative">
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    speakKorean(item.example_sentence!);
                                 }}
                                 className="absolute top-2 right-2 p-1 text-slate-400 hover:text-primary hover:bg-blue-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                              >
                                 <Volume2 size={14} />
                              </button>
                              <p className="font-korean mb-1 text-slate-800"><span className="text-primary font-bold">{item.korean}</span> 포함된 예문:</p>
                              <p className="text-slate-500 italic text-xs">"{item.example_sentence}" ({item.example_meaning})</p>
                           </div>
                        )}
                     </div>
                  ))
               ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                     <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search size={32} className="opacity-50" />
                     </div>
                     <p className="text-base font-bold text-gray-500">未找到单词 "{searchTerm}"</p>
                     <p className="text-xs mt-1 text-gray-400">请尝试更换关键词或检查拼写</p>
                  </div>
               )}
            </div>
         </main>

         {/* 编辑/添加模态框 */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
               <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-slide-up">
                  <button
                     onClick={() => setIsModalOpen(false)}
                     className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                  >
                     <X size={20} />
                  </button>
                  <h2 className="text-xl font-bold text-slate-900 mb-6">
                     {editingEntry ? '编辑单词' : '添加新单词'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">韩语单词</label>
                        <input
                           required
                           value={formData.korean}
                           onChange={e => setFormData({ ...formData, korean: e.target.value })}
                           className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-korean font-bold"
                           placeholder="例如：사과"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">词性</label>
                        <CustomSelect
                           value={formData.pos}
                           onChange={(val) => setFormData({ ...formData, pos: val })}
                           options={['名词', '动词', '形容词', '副词', '短语', '俗语', '连词', '代词']}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">中文定义</label>
                        <input
                           required
                           value={formData.definition}
                           onChange={e => setFormData({ ...formData, definition: e.target.value })}
                           className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                           placeholder="例如：苹果"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">罗马音 (选填)</label>
                        <input
                           value={formData.romaja}
                           onChange={e => setFormData({ ...formData, romaja: e.target.value })}
                           className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary outline-none"
                           placeholder="例如：sagwa"
                        />
                     </div>
                     <div className="pt-2 border-t border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">例句 (选填)</label>
                        <input
                           value={formData.example_sentence}
                           onChange={e => setFormData({ ...formData, example_sentence: e.target.value })}
                           className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary outline-none font-korean mb-2"
                           placeholder="韩语例句..."
                        />
                        <input
                           value={formData.example_meaning}
                           onChange={e => setFormData({ ...formData, example_meaning: e.target.value })}
                           className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary outline-none text-sm"
                           placeholder="例句翻译..."
                        />
                     </div>

                     <div className="flex gap-3 pt-4">
                        {editingEntry && (
                           <button
                              type="button"
                              onClick={handleDelete}
                              className="flex-1 py-3 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-colors"
                           >
                              删除
                           </button>
                        )}
                        <button
                           type="submit"
                           className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/30 transition-all"
                        >
                           {editingEntry ? '保存修改' : '确认添加'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default DictionaryView;