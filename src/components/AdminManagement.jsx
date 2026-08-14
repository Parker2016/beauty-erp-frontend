// src/components/AdminManagement.jsx
import React, { useState } from 'react';
import AppointmentWithRecordEditor from './AppointmentWithRecordEditor';
import ServiceManagement from './ServiceManagement';
import ProviderManagement from './ProviderManagement';
import DesignPriceSettings from './settings/DesignPriceSettings'; 

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState('appointments'); 

  return (
    <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm min-h-[600px] text-left">
      
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-lg md:text-xl font-black text-gray-900">核心資料基礎建設</h2>
        <p className="text-xs text-gray-400 mt-1">管理店內人員、上架服務品項以及審查客製化美甲紀錄</p>
      </div>

      <div className="flex space-x-2 bg-gray-50 p-1.5 rounded-xl w-full overflow-x-auto whitespace-nowrap mb-6 scrollbar-none">
        <button 
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'appointments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          預約單與服務紀錄
        </button>
        <button 
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'providers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          人員管理
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'services' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          服務品項上架
        </button>
        <button 
          onClick={() => setActiveTab('design_prices')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${activeTab === 'design_prices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          設計款價目設定
        </button>
      </div>

      {/* 分流渲染區塊 */}
      <div className="mt-4">
        {activeTab === 'appointments' && <AppointmentWithRecordEditor />}
        {activeTab === 'providers' && <ProviderManagement />} 
        {activeTab === 'services' && <ServiceManagement />}
        {activeTab === 'design_prices' && <DesignPriceSettings />}
      </div>
    </div>
  );
};

export default AdminManagement;