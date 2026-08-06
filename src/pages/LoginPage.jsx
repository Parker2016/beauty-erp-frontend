import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('請輸入帳號與密碼');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 呼叫 AuthContext 的 login 方法
      const user = await login(username, password);
      
      // 登入成功：自動跳轉至該店長的後台專屬網址 /admin/:shopId
      navigate(`/admin/${user.shop_id}`, { replace: true });
    } catch (err) {
      console.error('登入失敗:', err);
      // 擷取 Django 後端回傳的錯誤訊息
      const detail = err.response?.data?.detail || '帳號或密碼錯誤，請重新確認。';
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fade-in text-left">
        
        {/* 頂部 Header 與 Logo 區域 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#f4f1eb] text-[#8c7654] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner text-2xl font-black">
            💅
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-wide">美業管理系統</h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">工作人員與業主後台登入</p>
        </div>

        {/* 錯誤訊息提示盒 */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500 font-bold flex items-center space-x-2 animate-shake">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 登入表單 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-gray-600 mb-1.5">
              帳號 / 使用者名稱
            </label>
            <input
              type="text"
              required
              placeholder="請輸入後台帳號"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-xl text-sm font-medium focus:outline-none focus:border-amber-600 focus:bg-white transition-all placeholder:text-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-600 mb-1.5">
              密碼
            </label>
            <input
              type="password"
              required
              placeholder="請輸入密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200/80 rounded-xl text-sm font-medium focus:outline-none focus:border-amber-600 focus:bg-white transition-all placeholder:text-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-gray-900 text-white font-bold text-sm rounded-xl shadow-md hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>身分驗證中...</span>
              </>
            ) : (
              <span>登入管理後台</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-50">
          <p className="text-[11px] text-gray-400 font-medium">
            忘記密碼或需要開通帳號？請聯繫系統管理員
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;