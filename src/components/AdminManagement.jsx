// src/components/AdminManagement.jsx
import React, { useState } from 'react';
import AppointmentWithRecordEditor from './AppointmentWithRecordEditor';
import ServiceManagement from './ServiceManagement';
import ProviderManagement from './ProviderManagement';

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState('appointments'); 

  return (
    /* 
      📱 手機版防禦：將原本大桌機的 rounded-3xl 在手機版降為 rounded-2xl，
      p-6 降為 p-4，幫手機版省下左右各 8px 的珍貴操作空間。
    */
    <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm min-h-[600px] text-left">
      
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-lg md:text-xl font-black text-gray-900">核心資料基礎建設</h2>
        <p className="text-xs text-gray-400 mt-1">管理店內人員、上架服務品項以及審查客製化美甲紀錄</p>
      </div>

      {/* 
        📱 核心 RWD 頁籤優化（Scrollable Tab Bar）：
        w-full: 寬度不再寫死 w-max，改用 100% 撐滿
        overflow-x-auto: 【靈魂屬性】當按鈕字數超出手機螢幕時，自動變成可以用手指滑動的橫向滾動條
        whitespace-nowrap: 強制內部的文字按鈕絕對不准換行破版
        scrollbar-none: 隱藏原生醜陋的滾動條，維持美感
      */}
      <div className="flex space-x-2 bg-gray-50 p-1.5 rounded-xl w-full overflow-x-auto whitespace-nowrap mb-6 scrollbar-none">
        <button 
          onClick={() => setActiveTab('appointments')}
          /* shrink-0: 防止按鈕在寬度不夠時被 flex 壓縮變形，確保文字完整呈現 */
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'appointments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          預約單與服務紀錄
        </button>
        <button 
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'providers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          服務人員管理 (Providers)
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'services' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          服務品項上架 (Services)
        </button>
      </div>

      {/* 分流渲染區塊 */}
      <div className="mt-4">
        {activeTab === 'appointments' && <AppointmentWithRecordEditor />}
        {activeTab === 'providers' && <ProviderManagement />} {/* 💡 2. 換上實體元件 */}
        {activeTab === 'services' && <ServiceManagement />}
      </div>
    </div>
  );
};

export default AdminManagement;