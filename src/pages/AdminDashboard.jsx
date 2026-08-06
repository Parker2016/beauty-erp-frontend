// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminCalendarView from '../components/AdminCalendarView'; 
import AdminManagement from '../components/AdminManagement';     
import QuickQuoteView from '../components/calculator/QuickQuoteView';
import ProviderSchedulePage from './ProviderSchedulePage';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [adminSubView, setAdminSubView] = useState('dashboard');

  return (
    <div className="min-h-screen bg-[#fcfbfa] flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* ==========================================
        📱 1. 手機版專屬：頂部 Header (包含動態店家名稱與登出按鈕)
        ========================================== */}
      <header className="w-full bg-white border-b border-gray-100 p-4 sticky top-0 z-40 flex justify-between items-center md:hidden shadow-sm">
        <div className="text-left">
          <h2 className="text-base font-black text-gray-800 tracking-wider">
            {user?.shop_name || '店面管理後台'}
          </h2>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
            登入者：{user?.username} ({user?.role === 'MANAGER' ? '店長' : '美甲師'})
          </p>
        </div>

        <button 
          onClick={logout}
          className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-gray-100"
        >
          登出 ➔
        </button>
      </header>

      {/* ==========================================
        💻 2. 電腦版專屬：左側固定側邊欄 (含使用者資訊與登出鈕)
        ========================================== */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col justify-between p-6 shrink-0 sticky top-0 h-screen text-left">
        <div>
          {/* 店家標題與登入者卡片 */}
          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-800 tracking-wider">
              {user?.shop_name || '店面管理後台'}
            </h2>
            
            {/* 使用者簡介小卡 */}
            <div className="mt-3 flex items-center space-x-3 bg-[#fcfbfa] p-3 rounded-2xl border border-gray-100">
              <div className="w-9 h-9 rounded-full bg-[#f4f1eb] text-[#8c7654] font-black flex items-center justify-center text-sm shadow-inner shrink-0">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-gray-800 truncate">{user?.username}</p>
                <div className="mt-0.5">
                  {user?.role === 'MANAGER' ? (
                    <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded-md border border-amber-200/40">店長</span>
                  ) : (
                    <span className="text-[9px] bg-gray-100 text-gray-500 font-medium px-1.5 py-0.5 rounded-md">美甲師</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 導覽選單 */}
          <nav className="space-y-1.5">
            <button 
              onClick={() => setAdminSubView('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                ${adminSubView === 'dashboard' ? 'bg-[#f4f1eb] text-[#8c7654]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span>📊</span> <span>營運看板中心</span>
            </button>
            
            <button 
              onClick={() => setAdminSubView('quote')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                ${adminSubView === 'quote' ? 'bg-[#f4f1eb] text-[#8c7654]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span>🧮</span> <span>快速報價系統</span>
            </button>

            <button 
              onClick={() => setAdminSubView('shifts')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                ${adminSubView === 'shifts' ? 'bg-[#f4f1eb] text-[#8c7654]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span>📅</span> <span>人員排班管理</span>
            </button>
            
            <button 
              onClick={() => setAdminSubView('management')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                ${adminSubView === 'management' ? 'bg-[#f4f1eb] text-[#8c7654]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span>⚙️</span> <span>後台資料管理</span>
            </button>
          </nav>
        </div>

        {/* 側邊欄底部：登出按鈕 */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100 hover:border-red-100"
          >
            <span>➔</span>
            <span>登出系統</span>
          </button>
        </div>
      </aside>

      {/* ==========================================
        📦 3. 中央主內容路由渲染區
        ========================================== */}
      <main className="flex-1 overflow-y-auto">
        {adminSubView === 'dashboard' && <div className="p-4 md:p-8"><AdminCalendarView currentShopId={user?.shop_id} /></div>}
        {adminSubView === 'management' && <div className="p-4 md:p-8"><AdminManagement currentShopId={user?.shop_id} /></div>}
        {adminSubView === 'quote' && <QuickQuoteView currentShopId={user?.shop_id} />}
        {adminSubView === 'shifts' && <div className="p-4 md:p-8"><ProviderSchedulePage currentShopId={user?.shop_id} /></div>}
      </main>

      {/* ==========================================
        📱 4. 手機版專屬：底部 App 級別導覽列
        ========================================== */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 grid grid-cols-4 z-50 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setAdminSubView('dashboard')}
          className={`flex flex-col justify-center items-center space-y-0.5 transition-all active:scale-95
            ${adminSubView === 'dashboard' ? 'text-[#8c7654] font-black' : 'text-gray-400 font-medium'}`}
        >
          <span className="text-xl">📊</span>
          <span className="text-[10px]">看板</span>
          {adminSubView === 'dashboard' && <div className="w-4 h-0.5 bg-[#8c7654] rounded-full mt-0.5" />}
        </button>

        <button
          onClick={() => setAdminSubView('quote')}
          className={`flex flex-col justify-center items-center space-y-0.5 transition-all active:scale-95
            ${adminSubView === 'quote' ? 'text-[#8c7654] font-black' : 'text-gray-400 font-medium'}`}
        >
          <span className="text-xl">🧮</span>
          <span className="text-[10px]">報價</span>
          {adminSubView === 'quote' && <div className="w-4 h-0.5 bg-[#8c7654] rounded-full mt-0.5" />}
        </button>

        <button
          onClick={() => setAdminSubView('shifts')}
          className={`flex flex-col justify-center items-center space-y-0.5 transition-all active:scale-95
            ${adminSubView === 'shifts' ? 'text-[#8c7654] font-black' : 'text-gray-400 font-medium'}`}
        >
          <span className="text-xl">📅</span>
          <span className="text-[10px]">排班</span>
          {adminSubView === 'shifts' && <div className="w-4 h-0.5 bg-[#8c7654] rounded-full mt-0.5" />}
        </button>

        <button
          onClick={() => setAdminSubView('management')}
          className={`flex flex-col justify-center items-center space-y-0.5 transition-all active:scale-95
            ${adminSubView === 'management' ? 'text-[#8c7654] font-black' : 'text-gray-400 font-medium'}`}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-[10px]">設定</span>
          {adminSubView === 'management' && <div className="w-4 h-0.5 bg-[#8c7654] rounded-full mt-0.5" />}
        </button>
      </nav>

    </div>
  );
};

export default AdminDashboard;