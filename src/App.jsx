import React, { useState } from 'react';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // 💡 簡單偵測目前網址是不是包含 '/admin'，或者你也可以用 React Router
  const isOwnerAdminMode = window.location.pathname.includes('/admin');

  // 用來在業主後台手動切換頁面的狀態
  const [view, setView] = useState('admin');

  // 1. 如果不是管理模式（例如 LINE 打開或普通用戶造訪），直接強制只回傳預約頁面！
  if (!isOwnerAdminMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BookingPage />
      </div>
    );
  }

  // 2. 只有當網址明確造訪 /admin 時，才會解鎖業主後台與開發者工具列
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ================= 業主專用切換工具列 ================= */}
      <div className="bg-gray-900 text-white p-2 flex justify-center space-x-4 text-xs font-mono sticky top-0 z-50 shadow-md">
        <span className="text-gray-400 flex items-center">👑 業主管理模式：</span>
        <button 
          onClick={() => setView('booking')}
          className={`px-3 py-1 rounded transition-all ${view === 'booking' ? 'bg-pink-500 font-bold text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          預覽客戶端
        </button>
        <button 
          onClick={() => setView('admin')}
          className={`px-3 py-1 rounded transition-all ${view === 'admin' ? 'bg-amber-600 font-bold text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          營運看板/排班
        </button>
      </div>

      {/* ================= 核心畫面條件渲染 ================= */}
      <div className="transition-all duration-300">
        {view === 'booking' ? (
          <BookingPage />
        ) : (
          <AdminDashboard />
        )}
      </div>

    </div>
  );
}

export default App;