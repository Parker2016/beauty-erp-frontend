// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import AdminCalendarView from '../components/AdminCalendarView'; // 把我們上一回寫的行事曆移到獨立組件
import AdminManagement from '../components/AdminManagement';   // 新建的資料管理組件
import { useAdminDashboard } from '../hooks/useAdminDashboard';

const AdminDashboard = () => {
  // 控制後台內部的子頁面切换：'dashboard' 或 'management'
  const [adminSubView, setAdminSubView] = useState('dashboard');
  
  const dashboardProps = useAdminDashboard(); // 沿用之前的 Hook 邏輯

  return (
    <div className="min-h-screen bg-[#fcfbfa] flex flex-col md:flex-row">
      
      {/* ================= 左側固定側邊欄 ================= */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex flex-col p-6 shrink-0">
        <div className="mb-8">
          <h2 className="text-xl font-black text-gray-800 tracking-wider">Z. Studio 後台總管</h2>
          <p className="text-xs text-gray-400 mt-1">v1.0.0 Pro</p>
        </div>

        {/* 導覽選單按鈕 */}
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

      {/* ================= 右側主內容顯示區 ================= */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {adminSubView === 'dashboard' ? (
          // 渲染原本的行事曆與營收看板
          <AdminCalendarView {...dashboardProps} />
        ) : (
          // 渲染新擴充的資料管理頁面
          <AdminManagement />
        )}
      </main>

    </div>
  );
};

export default AdminDashboard;