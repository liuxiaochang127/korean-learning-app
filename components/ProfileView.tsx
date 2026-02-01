
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LogOut, Upload, Heart, User, ChevronRight } from 'lucide-react';

const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <User className="text-primary" size={24} />
        </div>
        <div>
          <p className="font-bold text-gray-800">{user?.email || 'User'}</p>
          <p className="text-xs text-gray-400">Student</p>
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
