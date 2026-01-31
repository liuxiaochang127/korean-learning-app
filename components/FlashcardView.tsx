import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, List, Volume2, Lightbulb, Quote, CheckCircle } from 'lucide-react';

import { api, Flashcard } from '../services/api';

const FlashcardView: React.FC = () => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadCards = async () => {
      try {
        // For now, fetch generic/demo cards since we don't have route params for chapter yet
        const data = await api.getFlashcards();
        setCards(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCards();
  }, []);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // End of deck
        alert("恭喜！本组卡片学习完成！");
        navigate(-1);
      }
    }, 300);
  };


  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // Prevent card flip

    if (isPlaying) return;

    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR'; // Korean
      utterance.rate = 0.8; // Slightly slower for clarity

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback visual feedback if API not supported
      console.warn("Speech Synthesis not supported");
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pb-2 z-10">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">延世韩国语 第3册</span>
          <h2 className="text-slate-900 text-base font-bold">第一课：成语</h2>
        </div>
        <button onClick={() => navigate('/favorites')} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100">
          <List size={24} />
        </button>
      </header>

      {/* Progress Ring */}
      <div className="flex flex-col items-center justify-center py-4 w-full">
        <div className="relative flex items-center justify-center w-16 h-16">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
            <path className="text-primary transition-all duration-1000 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${((currentIndex + 1) / Math.max(cards.length, 1)) * 100}, 100`} strokeLinecap="round" strokeWidth="3"></path>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-[10px] font-bold text-primary">{currentIndex + 1}</span>
          </div>
        </div>
        <p className="mt-1 text-xs font-medium text-gray-500">{currentIndex + 1} / {cards.length || '-'} 已学</p>
      </div>

      {/* Card Container */}
      <main className="flex-1 px-5 py-2 flex flex-col justify-center perspective-1000">
        {!loading && currentCard ? (
          <div
            className={`relative w-full h-[450px] transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front Face */}
            <div className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col backface-hidden">
              <div className="flex justify-between items-start p-6">
                <div className="px-3 py-1 bg-primary/10 rounded-full">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{currentCard.is_grammar ? '语法' : '单词'}</span>
                </div>
                <button
                  className={`transition-all duration-200 p-2 rounded-full ${isPlaying ? 'text-primary bg-primary/10 scale-110' : 'text-gray-400 hover:text-primary hover:bg-gray-50'}`}
                  onClick={(e) => playAudio(e, currentCard.front_text)}
                  aria-label="播放发音"
                >
                  <Volume2 size={24} className={isPlaying ? "animate-pulse" : ""} />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center pb-20 gap-4">
                <h1 className="font-korean text-5xl font-bold text-slate-900 tracking-tight">{currentCard.front_text}</h1>
                {/* Romaja could be optional or generated, for now hiding if not in DB */}
                {/* <p className="text-sm text-gray-500 font-medium">Jak-sim-sam-il</p> */}
              </div>
              <div className="absolute bottom-6 w-full text-center">
                <p className="text-xs text-gray-400">点击查看背面</p>
              </div>
            </div>

            {/* Back Face */}
            <div className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col backface-hidden rotate-y-180">
              <div className="flex-1 flex flex-col items-center text-center px-6 pt-10 pb-8 gap-6">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                    <h3 className="font-korean text-3xl font-medium text-primary">{currentCard.front_text}</h3>
                  </div>
                  {/* <p className="text-xs text-gray-500 mt-2">制造 • 决心 • 三 • 天</p> */}
                </div>

                <div className="w-16 h-1 bg-gray-100 rounded-full my-1"></div>

                <div className="flex flex-col gap-4 w-full text-left">
                  <div className="flex gap-3">
                    <Lightbulb size={20} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-0.5">含义</p>
                      <p className="text-base text-slate-600 leading-relaxed">{currentCard.back_text}</p>
                      {currentCard.back_meaning && <p className="text-sm text-gray-500 mt-1">{currentCard.back_meaning}</p>}
                    </div>
                  </div>
                  {currentCard.example_sentence && (
                    <div className="flex gap-3">
                      <Quote size={20} className="text-primary mt-0.5 shrink-0" />
                      <div className="font-korean">
                        <p className="text-sm font-bold text-slate-800 mb-0.5 font-sans">例句</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{currentCard.example_sentence}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-[450px]">
            {loading ? <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div> : <div className="text-gray-400">暂无卡片</div>}
          </div>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="p-5 pb-8">
        <div className="flex gap-4">
          <button onClick={handleNext} className="flex-1 h-14 rounded-2xl border-2 border-gray-200 bg-transparent text-gray-500 font-bold text-base hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]">
            仍在学习
          </button>
          <button onClick={handleNext} className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <CheckCircle size={20} />
            已掌握
          </button>
        </div>
      </footer>
    </div>
  );
};

export default FlashcardView;