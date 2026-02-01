import React from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import HomeView from './components/HomeView';
import LessonAudioView from './components/LessonAudioView';
import GrammarView from './components/GrammarView';
import FlashcardView from './components/FlashcardView';
import TextReadingView from './components/TextReadingView';
import FavoritesView from './components/FavoritesView';
import DictionaryView from './components/DictionaryView';
import AuthView from './components/AuthView';
import DailyStudyView from './components/DailyStudyView';
import ReciteView from './components/ReciteView';
import ResourceUploadView from './components/ResourceUploadView';
import ProfileView from './components/ProfileView';
import BottomNav from './components/BottomNav';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // 仅在主要仪表板页面显示底部导航
  const showBottomNav = ['/', '/dictionary', '/practice', '/profile', '/recite', '/upload'].includes(location.pathname);
  const isAuthPage = location.pathname === '/auth';

  React.useEffect(() => {
    const checkInactivity = async () => {
      const lastActiveStr = localStorage.getItem('last_active_time');
      const now = Date.now();
      const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;

      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        if (now - lastActive > FIFTEEN_DAYS) {
          // 超过15天未活跃，强制登出
          await supabase.auth.signOut();
          localStorage.removeItem('last_active_time');
          if (location.pathname !== '/auth') {
            navigate('/auth');
          }
          return;
        }
      }

      // 更新活跃时间
      localStorage.setItem('last_active_time', now.toString());
    };

    checkInactivity();
  }, [location]);

  return (
    <div className="relative min-h-screen w-full max-w-md mx-auto bg-background-light shadow-2xl overflow-hidden flex flex-col">
      <main className={`flex-1 overflow-y-auto no-scrollbar ${showBottomNav ? 'pb-24' : ''}`}>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/auth" element={<AuthView />} />
          <Route path="/lesson/audio" element={<LessonAudioView />} />
          <Route path="/lesson/grammar" element={<GrammarView />} />
          <Route path="/lesson/flashcards" element={<FlashcardView />} />
          <Route path="/lesson/reading" element={<TextReadingView />} />
          <Route path="/favorites" element={<FavoritesView />} />
          <Route path="/dictionary" element={<DictionaryView />} />
          <Route path="/practice" element={<DailyStudyView />} />
          <Route path="/recite" element={<ReciteView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/upload" element={<ResourceUploadView />} />
        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  );
};

export default App;