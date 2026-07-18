// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import AdminCalendarView from '../components/AdminCalendarView'; // 💡 剛才分拆出去的行事曆大組件
import AdminManagement from '../components/AdminManagement';     // 包含人員與品項上架的組件

const AdminDashboard = () => {
  // 💡 核心開關：'dashboard' (看板與行事曆) 或 'management' (資料基礎建設)
  const [adminSubView, setAdminSubView] = useState('dashboard');

  return (
    /* pb-16: 為手機版底部導覽列預留空間，防止內容被按鈕遮擋 */
    <div className="min-h-screen bg-[#fcfbfa] flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* ==========================================
        📱 1. 手機版專屬：頂部窄版 Header (電腦版 md:hidden)
        ========================================== */}
      <header className="w-full bg-white border-b border-gray-100 p-4 sticky top-0 z-40 flex justify-between items-center md:hidden">
        <div className="text-left">
          <h2 className="text-base font-black text-gray-800 tracking-wider">Z. Studio 後台總管</h2>
          <p className="text-[10px] text-gray-400">v1.0.0 Pro</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#f4f1eb] flex items-center justify-center text-xs text-[#8c7654] font-bold">
          Z
        </div>
      </header>

      {/* ==========================================
        💻 2. 電腦版專屬：左側固定側邊欄 (手機版 hidden)
        ========================================== */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col p-6 shrink-0 sticky top-0 h-screen text-left">
        <div className="mb-8">
          <h2 className="text-xl font-black text-gray-800 tracking-wider">Z. Studio 後台總管</h2>
          <p className="text-xs text-gray-400 mt-1">v1.0.0 Pro</p>
        </div>

        {/* 導覽選單（桌機垂直排版） */}
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setAdminSubView('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
              ${adminSubView === 'dashboard' ? 'bg-[#f4f1eb] text-[#8c7654]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span>📊</span> <span>營運看板中心</span>
          </button>
          
          <button 
            onClick={() => setAdminSubView('management')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
              ${adminSubView === 'management' ? 'bg-[#f4f1eb] text-[#8c7654]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span>⚙️</span> <span>後台資料管理</span>
          </button>
        </nav>
      </aside>

      {/* ==========================================
        📦 3. 中央主內容路由渲染區
        ========================================== */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {adminSubView === 'dashboard' ? (
          <AdminCalendarView />
        ) : (
          <AdminManagement />
        )}
      </main>

      {/* ==========================================
        📱 4. 手機版專屬：底部 App 級別導覽列列列！(這裡就是切換路徑！)
        ========================================== */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 grid grid-cols-2 z-50 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        
        {/* 按鈕一：切到行事曆看板 */}
        <button
          onClick={() => setAdminSubView('dashboard')}
          className={`flex flex-col justify-center items-center space-y-0.5 transition-all active:scale-95
            ${adminSubView === 'dashboard' ? 'text-[#8c7654] font-black' : 'text-gray-400 font-medium'}`}
        >
          <span className="text-xl">📊</span>
          <span className="text-[11px]">營運看板</span>
          {adminSubView === 'dashboard' && <div className="w-4 h-0.5 bg-[#8c7654] rounded-full mt-0.5" />}
        </button>

        {/* 按鈕二：切到人員、品項基礎建設管理 (點這裡就能進去了！) */}
        <button
          onClick={() => setAdminSubView('management')}
          className={`flex flex-col justify-center items-center space-y-0.5 transition-all active:scale-95
            ${adminSubView === 'management' ? 'text-[#8c7654] font-black' : 'text-gray-400 font-medium'}`}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-[11px]">資料管理</span>
          {adminSubView === 'management' && <div className="w-4 h-0.5 bg-[#8c7654] rounded-full mt-0.5" />}
        </button>

      </nav>

    </div>
  );
};

export default AdminDashboard;