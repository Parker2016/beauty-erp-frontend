// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import AdminCalendarView from '../components/AdminCalendarView'; 
import AdminManagement from '../components/AdminManagement';     
import QuickQuoteView from '../components/calculator/QuickQuoteView'; // 💡 1. 引入剛剛做好的獨立報價頁面

const AdminDashboard = () => {
  // 💡 增加一個新狀態 'quote'
  const [adminSubView, setAdminSubView] = useState('dashboard');

  return (
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

          {/* 💡 2. 電腦版新增：快速報價小幫手 */}
          <button 
            onClick={() => setAdminSubView('quote')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
              ${adminSubView === 'quote' ? 'bg-[#f4f1eb] text-[#8c7654]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span>🧮</span> <span>快速報價系統</span>
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
      <main className="flex-1 overflow-y-auto">
        {/* 💡 3. 根據狀態切換顯示不同元件，報價系統不給 padding 讓他自己掌控佈局 */}
        {adminSubView === 'dashboard' && <div className="p-4 md:p-8"><AdminCalendarView /></div>}
        {adminSubView === 'management' && <div className="p-4 md:p-8"><AdminManagement /></div>}
        {adminSubView === 'quote' && <QuickQuoteView />}
      </main>

      {/* ==========================================
        📱 4. 手機版專屬：底部 App 級別導覽列
        ========================================== */}
      {/* 💡 4. 改為 grid-cols-3 */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 grid grid-cols-3 z-50 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        
        <button
          onClick={() => setAdminSubView('dashboard')}
          className={`flex flex-col justify-center items-center space-y-0.5 transition-all active:scale-95
            ${adminSubView === 'dashboard' ? 'text-[#8c7654] font-black' : 'text-gray-400 font-medium'}`}
        >
          <span className="text-xl">📊</span>
          <span className="text-[11px]">營運看板</span>
          {adminSubView === 'dashboard' && <div className="w-4 h-0.5 bg-[#8c7654] rounded-full mt-0.5" />}
        </button>

        {/* 💡 5. 手機版新增：快速報價小幫手 */}
        <button
          onClick={() => setAdminSubView('quote')}
          className={`flex flex-col justify-center items-center space-y-0.5 transition-all active:scale-95
            ${adminSubView === 'quote' ? 'text-[#8c7654] font-black' : 'text-gray-400 font-medium'}`}
        >
          <span className="text-xl">🧮</span>
          <span className="text-[11px]">快速報價</span>
          {adminSubView === 'quote' && <div className="w-4 h-0.5 bg-[#8c7654] rounded-full mt-0.5" />}
        </button>

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