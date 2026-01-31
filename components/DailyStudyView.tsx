import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, CheckCircle2, AlertCircle, TrendingUp, HelpCircle, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, StudyItem } from '../services/api';
import { supabase } from '../lib/supabaseClient';
import { speakKorean } from '../lib/tts';

const DailyStudyView: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [studySet, setStudySet] = useState<StudyItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reviewedCountToday, setReviewedCountToday] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadSession();
    }, []);

    const loadSession = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }
            setUserId(user.id);

            const { items, reviewedToday } = await api.getDailyStudySet(user.id, 100);
            setStudySet(items);
            setReviewedCountToday(reviewedToday);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleRating = async (rating: 0 | 1 | 2 | 3) => {
        if (!userId) return;

        const currentWord = studySet[currentIndex];

        // 1. Submit to API (Record status)
        await api.submitReview(userId, currentWord.id, rating, currentWord.progress);

        let newSet = [...studySet];

        if (rating < 2) {
            // 2. Re-queue logic (Session Internal)
            const gap = rating === 0 ? 3 : 10;
            let insertIndex = currentIndex + gap;

            if (insertIndex > newSet.length) {
                insertIndex = newSet.length;
            }

            newSet.splice(insertIndex, 0, { ...currentWord });
            setStudySet(newSet);
        } else {
            setReviewedCountToday(prev => prev + 1);
            window.dispatchEvent(new Event('study-progress-updated'));
        }

        const nextIndex = currentIndex + 1;

        if (nextIndex >= newSet.length) {
            setSessionComplete(true);
        } else {
            setCurrentIndex(nextIndex);
            setShowAnswer(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-background-light items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">正在为你准备今日复习计划...</p>
            </div>
        );
    }

    if (sessionComplete) {
        return (
            <div className="flex flex-col h-screen bg-background-light p-6 items-center justify-center text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce-slight">
                    <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">今日任务完成！</h1>
                <p className="text-gray-500 mb-8">你已经完成了今天的单词复习。</p>
                <div className="flex gap-4 w-full">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 py-3.5 bg-gray-100 text-slate-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                    >
                        返回首页
                    </button>
                    <button
                        onClick={() => {
                            setSessionComplete(false);
                            loadSession();
                        }}
                        className="flex-1 py-3.5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors"
                    >
                        再学一组
                    </button>
                </div>
            </div>
        );
    }

    if (studySet.length === 0) {
        return (
            <div className="flex flex-col h-screen bg-background-light p-6 items-center justify-center text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">暂无待复习内容</h2>
                <p className="text-gray-500 mb-8">现在没有任何单词需要复习。去背些新单词吧？</p>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-dark transition-colors"
                >
                    去背词
                </button>
            </div>
        );
    }

    const currentWord = studySet[currentIndex];
    const totalTarget = 100;
    const currentProgressNum = Math.min(totalTarget, reviewedCountToday + 1);
    const progressPercent = (currentProgressNum / totalTarget) * 100;

    return (
        <div className="flex flex-col h-screen bg-background-light overflow-hidden pb-20">
            {/* Header */}
            <div className="shrink-0 px-4 pt-4 pb-2 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex justify-between items-center mb-3">
                    <button onClick={() => navigate('/')} className="p-2 text-slate-500 -ml-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft />
                    </button>
                    <span className="text-sm font-bold text-slate-600">
                        今日进度 {currentProgressNum} / {totalTarget}
                    </span>
                    <button className="p-2 text-slate-400 -mr-2">
                        <HelpCircle size={20} />
                    </button>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Card Content */}
            <main className="flex-1 flex flex-col justify-center px-6 relative overflow-hidden">
                <div key={currentWord.id} className="w-full flex-1 flex flex-col items-center justify-center text-center z-10 animate-in fade-in duration-300">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4">
                        {currentWord.isNew ? '新词' : '复习'}
                    </span>

                    <div className="flex items-center justify-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold font-korean text-slate-800 tracking-tight">
                            {currentWord.korean}
                        </h1>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                speakKorean(currentWord.korean);
                            }}
                            className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95"
                        >
                            <Volume2 size={24} />
                        </button>
                    </div>

                    {/* Placeholder for Pronunciation or Audio */}
                    <p className="text-slate-400 font-medium text-lg mb-6">{showAnswer ? (currentWord.romaja || '...') : '...'}</p>

                    <div className={`transition-all duration-500 ease-out transform ${showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <div className="mb-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border mb-1 ${currentWord.pos === 'Verb' ? 'text-green-600 border-green-200 bg-green-50' :
                                'text-blue-600 border-blue-200 bg-blue-50'
                                }`}>
                                {currentWord.pos}
                            </span>
                            <h2 className="text-xl font-bold text-slate-700">{currentWord.definition}</h2>
                        </div>

                        {currentWord.example_sentence && (
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-xs mx-auto text-left relative group">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        speakKorean(currentWord.example_sentence || '');
                                    }}
                                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
                                >
                                    <Volume2 size={16} />
                                </button>
                                <p className="font-korean text-slate-800 mb-1 leading-relaxed pr-8">
                                    {currentWord.example_sentence}
                                </p>
                                <p className="text-slate-500 text-xs">{currentWord.example_meaning}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Action Bar */}
            <div className="shrink-0 p-3 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                {!showAnswer ? (
                    <button
                        onClick={() => setShowAnswer(true)}
                        className="w-full py-3 bg-primary text-white text-base font-bold rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all hover:bg-primary-dark"
                    >
                        查看释义
                    </button>
                ) : (
                    <div className="grid grid-cols-4 gap-3">
                        <button
                            onClick={() => handleRating(0)}
                            className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        >
                            <span className="text-sm font-bold">忘记</span>
                            <span className="text-[10px] opacity-60">1天</span>
                        </button>
                        <button
                            onClick={() => handleRating(1)}
                            className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors"
                        >
                            <span className="text-sm font-bold">模糊</span>
                            <span className="text-[10px] opacity-60">2天</span>
                        </button>
                        <button
                            onClick={() => handleRating(2)}
                            className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                        >
                            <span className="text-sm font-bold">记得</span>
                            <span className="text-[10px] opacity-60">5天</span>
                        </button>
                        <button
                            onClick={() => handleRating(3)}
                            className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                            <span className="text-sm font-bold">熟练</span>
                            <span className="text-[10px] opacity-60">7天</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyStudyView;
