// src/components/ServiceManagement.jsx
import React from 'react';
import { useServiceManagement } from '../hooks/useServiceManagement';
import ServiceItemModal from './ServiceItemModal';

const ServiceManagement = () => {
  const {
    services, providerOptions, loading, error, isModalOpen, setIsModalOpen,
    formData, setFormData, editingService, openCreateModal, openEditModal,
    toggleProviderCheckbox, handleSave, handleDelete
  } = useServiceManagement();

  // 💡 輔助函式：動態轉譯價格模式文字
  const renderPriceTag = (item) => {
    if (item.price_type === 'QUOTE') return <span className="text-gray-500 font-bold">現場報價</span>;
    if (item.price_type === 'STARTING') return <span className="text-amber-800 font-black">NT$ {item.price} <span className="text-xs font-normal text-amber-600">起</span></span>;
    return <span className="text-amber-800 font-black">NT$ {item.price}</span>;
  };

  // 💡 輔助函式：動態渲染類別標籤顏色
  const renderCategoryBadge = (category) => {
    const mapping = {
      'HAND': { label: '手部美甲', className: 'bg-pink-50 text-pink-600 border-pink-100' },
      'FOOT': { label: '足部美甲', className: 'bg-purple-50 text-purple-600 border-purple-100' },
      'PURE_REMOVAL': { label: '純保養/純卸甲', className: 'bg-blue-50 text-blue-600 border-blue-100' },
      'EAR': { label: '采耳', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
      'ADDON': { label: '加購項目', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    };
    const target = mapping[category] || { label: category, className: 'bg-gray-50 text-gray-600 border-gray-100' };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${target.className}`}>{target.label}</span>;
  };

  return (
    <div className="space-y-6 text-left">
      {/* 頂部動作控制列 */}
      <div className="flex justify-between items-center bg-[#f4f1eb]/30 p-4 rounded-2xl border border-[#e8e3d9]/40">
        <div>
          <h3 className="text-lg font-black text-gray-800">服務品項管理</h3>
          <p className="text-xs text-gray-400 mt-0.5">定義店內服務項目、定價與綁定特定人員</p>
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
              <th className="p-4">服務類別</th>
              <th className="p-4">預估時間</th>
              <th className="p-4">定價模式</th>
              <th className="p-4">可提供服務人員 (ManyToMany)</th>
              <th className="p-4 text-center w-32">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {services.map(s => (
              <tr key={s.id} className="hover:bg-gray-50/40 transition-colors">
                <td className="p-4 text-center font-mono font-bold text-gray-400">#{s.id}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-gray-800 text-base">{s.name}</p>
                    {s.is_addon && <span className="text-[9px] bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded border border-red-100">可加購</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{s.description || '無詳細描述'}</p>
                </td>
                {/* 💡 新增：服務類別顯示欄 */}
                <td className="p-4">{renderCategoryBadge(s.category)}</td>
                <td className="p-4 font-medium text-gray-700">⏱ {s.duration_minutes} 分鐘</td>
                {/* 💡 修正：動態價格欄 */}
                <td className="p-4 font-black">{renderPriceTag(s)}</td>
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
          <div key={s.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-left">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-mono font-bold text-gray-300">#{s.id}</span>
                  {renderCategoryBadge(s.category)}
                  {s.is_addon && <span className="text-[9px] bg-red-50 text-red-500 font-bold px-1.5 py-0.2 rounded">可加購</span>}
                </div>
                <h4 className="text-base font-black text-gray-800 mt-1">{s.name}</h4>
              </div>
              <div className="text-right text-sm font-black">{renderPriceTag(s)}</div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed truncate">{s.description || '無描述'}</p>
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

      <ServiceItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
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