
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { api } from '../services/api';
import { LogOut, Upload, Heart, User, ChevronRight } from 'lucide-react';

const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        api.getDictionaryStats(data.user.id).then(setStats);
      }
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  if (!user) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="text-gray-400" size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">请先登录</h2>
          <p className="text-gray-500 text-sm">登录后可以同步学习进度、收藏单词和上传资源。</p>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-colors"
        >
          立即登录 / 注册
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <User className="text-primary" size={24} />
        </div>
        <div>
          <p className="font-bold text-gray-800">{user.email}</p>
          <p className="text-xs text-gray-400">上次登录: {new Date(user.last_sign_in_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* 学习统计概览 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl flex flex-col items-center justify-center space-y-1">
          <span className="text-2xl font-bold text-blue-600">{stats?.learned || 0}</span>
          <span className="text-xs text-blue-400 font-medium">已学单词</span>
        </div>
        <div className="bg-green-50 p-4 rounded-xl flex flex-col items-center justify-center space-y-1">
          <span className="text-2xl font-bold text-green-600">1</span>
          <span className="text-xs text-green-500 font-medium">连续打卡(天)</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => navigate('/favorites')}
          className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Heart className="text-pink-500" size={20} />
            </div>
            <span className="font-medium text-gray-700">我的收藏</span>
          </div>
          <ChevronRight className="text-gray-300" size={18} />
        </button>

        <button
          onClick={() => navigate('/upload')}
          className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Upload className="text-blue-500" size={20} />
            </div>
            <span className="font-medium text-gray-700">资源上传</span>
          </div>
          <ChevronRight className="text-gray-300" size={18} />
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="w-full p-4 text-red-500 flex items-center justify-center gap-2 mt-8 hover:bg-red-50 rounded-xl transition-colors"
      >
        <LogOut size={18} /> 退出登录
      </button>
    </div>
  );
};

export default ProfileView;
