import { useState } from 'react';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard'; // 1. 引入剛剛寫好的管理後台

function App() {
  // 2. 用一個狀態來控制目前的畫面：'booking' 代表客戶端，'admin' 代表業主端
  const [view, setView] = useState('booking');

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ================= 開發者專用切換工具列 ================= */}
      <div className="bg-gray-900 text-white p-2 flex justify-center space-x-4 text-xs font-mono sticky top-0 z-50 shadow-md">
        <span className="text-gray-400 flex items-center">🛠️ 開發者模式：</span>
        <button 
          onClick={() => setView('booking')}
          className={`px-3 py-1 rounded transition-all ${view === 'booking' ? 'bg-pink-500 font-bold text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          切換至：客戶預約頁
        </button>
        <button 
          onClick={() => setView('admin')}
          className={`px-3 py-1 rounded transition-all ${view === 'admin' ? 'bg-amber-600 font-bold text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          切換至：業主後台
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