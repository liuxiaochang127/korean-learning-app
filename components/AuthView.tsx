import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AuthView: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                // 登录
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
                navigate('/');
            } else {
                // 注册
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.username,
                        }
                    }
                });
                if (error) throw error;
                // 注册成功提示
                setError('注册成功！请查收邮件验证后登录。');
                setIsLogin(true);
            }
        } catch (err: any) {
            console.error(err);
            let msg = err.message || '操作失败，请重试';
            // Translate common Supabase errors
            if (msg.includes('Invalid login credentials')) msg = '账号或密码错误';
            else if (msg.includes('Email not confirmed')) msg = '请先去验证邮箱';
            else if (msg.includes('User already registered')) msg = '该邮箱已被注册';
            else if (msg.includes('Password should be at least')) msg = '密码长度至少需6位';
            else if (msg.includes('Rate limit exceeded')) msg = '尝试次数过多，请稍后再试';

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!formData.email) {
            setError('请输入邮箱地址以重置密码');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                redirectTo: `${window.location.origin}/auth?type=recovery`,
            });
            if (error) throw error;
            setError('重置密码邮件已发送，请查收！');
        } catch (err: any) {
            let msg = err.message || '操作失败';
            if (msg.includes('Rate limit exceeded')) msg = '尝试次数过多，请稍后再试';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background-light to-blue-50 flex flex-col">
            {/* Header */}
            <header className="pt-12 pb-8 px-6 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-4">
                    <BookOpen size={40} className="text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">延世韩语学习</h1>
                <p className="text-sm text-gray-500 mt-1">开始你的韩语学习之旅</p>
            </header>

            {/* Auth Card */}
            <main className="flex-1 px-6 pb-8">
                <div className="bg-white rounded-3xl shadow-xl p-6 max-w-md mx-auto">
                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${isLogin ? 'bg-white shadow-sm text-primary' : 'text-gray-500'
                                }`}
                        >
                            登录
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${!isLogin ? 'bg-white shadow-sm text-primary' : 'text-gray-500'
                                }`}
                        >
                            注册
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username (Register only) */}
                        {!isLogin && (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={20} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="用户名"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required={!isLogin}
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail size={20} className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="邮箱地址"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={20} className="text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="密码"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full h-12 pl-12 pr-12 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Forgot Password Link */}
                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    disabled={loading}
                                    className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                                >
                                    忘记密码？
                                </button>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className={`text-sm p-3 rounded-lg ${error.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <span>{isLogin ? '登录' : '注册'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400">或</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Guest Mode */}
                    <button
                        onClick={() => navigate('/')}
                        className="w-full h-12 rounded-xl border-2 border-gray-200 text-gray-500 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        游客模式浏览
                    </button>
                </div>

                {/* Footer Info */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    继续即表示您同意我们的服务条款和隐私政策
                </p>
            </main>
        </div>
    );
};

export default AuthView;
