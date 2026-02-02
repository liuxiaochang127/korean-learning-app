import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AuthView: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isRecovery, setIsRecovery] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: ''
    });

    React.useEffect(() => {
        // 1. 检查URL query参数
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('type') === 'recovery') {
            setIsRecovery(true);
        }

        // 2. 检查 hash 中的错误参数 (Supabase 重定向常带在 hash 中)
        // React Router 的 location.hash 包含了 # 及其后的内容
        const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
        const error = searchParams.get('error') || hashParams.get('error');
        const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

        if (error || errorCode) {
            console.log('Auth Error Detected:', { error, errorCode, errorDescription });
            let msg = errorDescription || '验证链接无效';

            if (errorCode === 'otp_expired' || msg.includes('expired')) {
                msg = '链接已过期，请重新申请重置密码邮件';
            } else if (error === 'access_denied') {
                msg = '访问被拒绝，链接可能无效或已使用';
            }

            setError(msg);
            // 如果链接失效，不应进入重置密码模式，而是让用户重试
            setIsRecovery(false);
            // 确保显示登录/忘记密码界面
            setIsLogin(true);
        }

        // 3. 监听 Supabase 密码恢复事件
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecovery(true);
                setError(''); // 清除之前的错误
            }
        });

        return () => subscription.unsubscribe();
    }, [location]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password.length < 6) {
            setError('密码长度至少需6位');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.updateUser({
                password: formData.password
            });

            if (error) throw error;

            setError('密码修改成功，正在通过新密码登录...');
            setTimeout(() => {
                setIsRecovery(false);
                setIsLogin(true);
                navigate('/');
            }, 1500);
        } catch (err: any) {
            console.error(err);
            let msg = err.message || '重置密码失败，请重试';
            if (msg.includes('Auth session missing')) msg = '链接已失效或会话过期，请重新申请重置密码邮件';
            if (msg.includes('Password should be at least')) msg = '密码长度至少需6位';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isRecovery) {
            handleUpdatePassword(e);
            return;
        }

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
            // 翻译常见的 Supabase 错误
            if (msg.includes('Invalid login credentials')) msg = '账号或密码错误';
            else if (msg.includes('Email not confirmed')) msg = '请先去验证邮箱';
            else if (msg.includes('User already registered')) msg = '该邮箱已被注册';
            else if (msg.includes('Password should be at least')) msg = '密码长度至少需6位';
            else if (msg.toLowerCase().includes('email rate limit exceeded')) msg = '邮件请求过于频繁，请稍后再试';
            else if (msg.includes('Rate limit exceeded')) msg = '尝试次数过多，请稍后再试';
            else if (msg.includes('Auth session missing')) msg = '会话已过期，请刷新页面重试';

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
            // 确保没有残留的过期会话影响
            await supabase.auth.signOut();

            // 针对 HashRouter 的 URL 构造： origin + /#/auth?type=recovery
            const redirectTo = `${window.location.origin}/#/auth?type=recovery`;
            console.log('Reset password redirect to:', redirectTo);

            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                redirectTo,
            });
            if (error) throw error;
            setError('重置密码邮件已发送，请查收！');
        } catch (err: any) {
            console.error('Reset password error:', err);
            let msg = err.message || '操作失败';
            if (msg.toLowerCase().includes('email rate limit exceeded')) msg = '邮件请求过于频繁，请稍后再试';
            else if (msg.includes('Rate limit exceeded')) msg = '尝试次数过多，请稍后再试';
            else if (msg.includes('Auth session missing')) msg = '会话异常，请刷新页面后重试';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background-light to-blue-50 flex flex-col">
            {/* 头部 */}
            <header className="pt-12 pb-8 px-6 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-4">
                    <BookOpen size={40} className="text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">延世韩语学习</h1>
                <p className="text-sm text-gray-500 mt-1">开始你的韩语学习之旅</p>
            </header>

            {/* 认证卡片 */}
            <main className="flex-1 px-6 pb-8">
                <div className="bg-white rounded-3xl shadow-xl p-6 max-w-md mx-auto">
                    {/* 选项卡 - 仅在非恢复模式显示 */}
                    {!isRecovery && (
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
                    )}

                    {/* 恢复模式标题 */}
                    {isRecovery && (
                        <div className="mb-6 text-center">
                            <h2 className="text-xl font-bold text-gray-800">重置密码</h2>
                            <p className="text-gray-500 text-sm mt-1">请输入您的新密码</p>
                        </div>
                    )}

                    {/* 表单 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 用户名（仅注册） */}
                        {!isLogin && !isRecovery && (
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

                        {/* 邮箱 - 非恢复模式下显示 */}
                        {!isRecovery && (
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
                                    required={!isRecovery}
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800"
                                />
                            </div>
                        )}

                        {/* 密码 - 所有模式显示 */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={20} className="text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder={isRecovery ? "新密码 (至少6位)" : "密码"}
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

                        {/* 忘记密码链接 - 仅登录显示 */}
                        {isLogin && !isRecovery && (
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

                        {/* 错误消息 */}
                        {error && (
                            <div className={`text-sm p-3 rounded-lg ${error.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {error}
                            </div>
                        )}

                        {/* 提交按钮 */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <span>{isRecovery ? '重置密码' : (isLogin ? '登录' : '注册')}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* 分隔线 */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400">或</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* 游客模式 */}
                    <button
                        onClick={() => navigate('/')}
                        className="w-full h-12 rounded-xl border-2 border-gray-200 text-gray-500 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        游客模式浏览
                    </button>
                </div>

                {/* 底部信息 */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    继续即表示您同意我们的服务条款和隐私政策
                </p>
            </main>
        </div>
    );
};

export default AuthView;
