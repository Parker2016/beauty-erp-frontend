// src/components/AdminManagement.jsx
import React, { useState } from 'react';
import AppointmentWithRecordEditor from './AppointmentWithRecordEditor';
import ServiceManagement from './ServiceManagement';

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState('appointments'); // providers, services, appointments

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[600px] text-left">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-xl font-black text-gray-900">核心資料基礎建設</h2>
        <p className="text-xs text-gray-400 mt-1">管理店內人員、上架服務品項以及審查客製化美甲紀錄</p>
      </div>

      {/* 子分頁 Tabs */}
      <div className="flex space-x-2 bg-gray-50 p-1.5 rounded-xl w-max mb-6">
        <button 
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'appointments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          預約單與服務紀錄
        </button>
        <button 
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'providers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          服務人員管理 (Providers)
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === 'services' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          服務品項上架 (Services)
        </button>
      </div>

      {/* 分流渲染各個管理的 CRUD 列表 */}
      <div className="mt-4">
        {activeTab === 'appointments' && <AppointmentWithRecordEditor />}
        {activeTab === 'providers' && <div className="text-gray-300 py-10 text-center">人員列表增刪查改區塊（待開發）</div>}
        {activeTab === 'services' && <ServiceManagement />}
      </div>
    </div>
  );
};

export default AdminManagement;