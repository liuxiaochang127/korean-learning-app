
import React, { useState } from 'react';
import { Search, X, Volume2, ChevronRight, Book, Star } from 'lucide-react';

import { api, DictionaryEntry } from '../services/api';
import { supabase } from '../lib/supabaseClient';

const DictionaryView: React.FC = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [activeCategory, setActiveCategory] = useState('All');
   const [results, setResults] = useState<DictionaryEntry[]>([]);
   const [loading, setLoading] = useState(false);
   const [categories, setCategories] = useState(['All', 'Noun', 'Verb', 'Adjective', 'Idiom']);
   const [userId, setUserId] = useState<string | null>(null);

   React.useEffect(() => {
      // Get user
      supabase.auth.getUser().then(({ data: { user } }) => {
         if (user) setUserId(user.id);
      });

      api.getCategories().then(setCategories);

      // Load initial words
      setLoading(true);
      api.getRecentWords(20).then(data => {
         setResults(data);
         setLoading(false);
      });
   }, []);

   // Debounce search
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
            // Reload recent words when search is cleared
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
      e.stopPropagation(); // Prevent card click
      if (!userId) {
         alert('请先登录收藏单词');
         return;
      }

      // Optimistic Update
      const newIsStarred = !item.is_starred;
      const newResults = results.map(r =>
         r.id === item.id ? { ...r, is_starred: newIsStarred } : r
      );
      setResults(newResults);

      try {
         await api.toggleFavorite(userId, item.id, item.is_starred || false);
      } catch (err) {
         console.error(err);
         // Revert on error
         setResults(results);
      }
   };

   const filteredResults = results.filter(item => {
      const matchesCategory = activeCategory === 'All' || item.pos === activeCategory;
      return matchesCategory;
   });

   return (
      <div className="flex flex-col h-screen bg-background-light overflow-hidden">
         {/* Search Header */}
         <div className="shrink-0 z-30 bg-white shadow-sm pb-4 pt-4 px-4 rounded-b-3xl relative">
            <div className="flex items-center justify-between mb-4 px-1">
               <h1 className="text-xl font-bold text-slate-900">韩语词典</h1>
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

            {/* Categories */}
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
                     {cat === 'All' ? '全部' : cat}
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
                              <h3 className="text-2xl font-bold text-slate-900 font-korean tracking-tight">{item.korean}</h3>
                              <span className="text-xs text-gray-400 font-medium mt-0.5">{item.romaja}</span>
                           </div>
                           <button
                              onClick={(e) => handleToggleFavorite(e, item)}
                              className="text-gray-300 hover:text-yellow-400 transition-colors p-1 -mr-1"
                           >
                              <Star size={22} fill={item.is_starred ? "#facc15" : "none"} className={item.is_starred ? "text-yellow-400" : ""} />
                           </button>
                        </div>
                        <div className="flex items-center flex-wrap gap-2 mb-3 mt-2">
                           <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${item.pos === 'Verb' || item.pos === '动' || item.pos === ' 动' ? 'bg-green-50 text-green-600 border-green-100' :
                              item.pos === 'Adjective' || item.pos === '形' || item.pos === ' 形' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                              {item.pos}
                           </span>
                           <span className="text-slate-800 font-bold text-sm">{item.definition}</span>
                        </div>
                        {item.example_sentence && (
                           <div className="bg-gray-50 rounded-xl p-3 text-sm text-slate-600 group-hover:bg-primary/5 transition-colors">
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
      </div>
   );
};

export default DictionaryView;