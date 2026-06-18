// src/components/ServiceManagement.jsx
import React from 'react';
import { useServiceManagement } from '../hooks/useServiceManagement';
import ServiceItemModal from './ServiceItemModal'; // 引入剛剛獨立出去的彈窗

const ServiceManagement = () => {
  const {
    services, providerOptions, loading, error, isModalOpen, setIsModalOpen,
    formData, setFormData, editingService, openCreateModal, openEditModal,
    toggleProviderCheckbox, handleSave, handleDelete
  } = useServiceManagement();

  return (
    <div className="space-y-6 text-left">
      {/* 頂部動作控制列 */}
      <div className="flex justify-between items-center bg-[#f4f1eb]/30 p-4 rounded-2xl border border-[#e8e3d9]/40">
        <div>
          <h3 className="text-lg font-black text-gray-800">服務品項管理</h3>
          <p className="text-xs text-gray-400 mt-0.5">定義店內核心服務項目、定價與綁定專門美業師</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-[#8c7654] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#736144] transition-all shadow-sm"
        >
          ＋ 上架新服務
        </button>
      </div>

      {/* ================= 寬螢幕桌面端（Table 版面） ================= */}
      <div className="hidden md:block overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-bold">
            <tr className="border-b border-gray-100">
              <th className="p-4 text-center w-16">ID</th>
              <th className="p-4">項目名稱</th>
              <th className="p-4">預估時間</th>
              <th className="p-4">定價</th>
              <th className="p-4">可提供服務人員 (ManyToMany)</th>
              <th className="p-4 text-center w-32">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {services.map(s => (
              <tr key={s.id} className="hover:bg-gray-50/40 transition-colors">
                <td className="p-4 text-center font-mono font-bold text-gray-400">#{s.id}</td>
                <td className="p-4">
                  <p className="font-bold text-gray-800 text-base">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{s.description || '無詳細描述'}</p>
                </td>
                <td className="p-4 font-medium text-gray-700">⏱ {s.duration_minutes} 分鐘</td>
                <td className="p-4 font-black text-amber-800">NT$ {s.price}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {s.providers?.map(p => (
                      <span key={p.id} className="text-[10px] bg-[#f4f1eb] text-[#8c7654] font-bold px-2 py-0.5 rounded-md border border-[#e8e3d9]/30">
                        {p.name}
                      </span>
                    ))}
                    {(!s.providers || s.providers.length === 0) && <span className="text-xs text-red-400 font-medium">⚠️ 尚未指派人員</span>}
                  </div>
                </td>
                <td className="p-4 text-center space-x-3">
                  <button onClick={() => openEditModal(s)} className="text-xs font-bold text-gray-600 hover:text-[#8c7654] transition-colors">編輯</button>
                  <button onClick={() => handleDelete(s.id)} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors">下架</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= 行動裝置端（Card 版面） ================= */}
      <div className="block md:hidden space-y-3">
        {services.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-bold text-gray-300">#{s.id}</span>
                <h4 className="text-base font-black text-gray-800">{s.name}</h4>
              </div>
              <span className="text-sm font-black text-amber-800">NT$ {s.price}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{s.description || '無描述'}</p>
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
              <span className="text-xs font-medium text-gray-500">⏱ {s.duration_minutes} 分鐘</span>
              <div className="space-x-3">
                <button onClick={() => openEditModal(s)} className="text-xs font-bold text-[#8c7654]">編輯</button>
                <button onClick={() => handleDelete(s.id)} className="text-xs font-bold text-red-400">下架</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= 載入獨立的彈窗組件 ================= */}
      <ServiceItemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData} // 這裡把狀態修改器傳過去，對齊我們在 Hook 裡面新增的狀態
        providerOptions={providerOptions}
        editingService={editingService}
        toggleProviderCheckbox={toggleProviderCheckbox}
        onSubmit={handleSave}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default ServiceManagement;