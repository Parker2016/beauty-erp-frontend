// src/components/ProviderManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin';

const ProviderManagement = () => {
  // ==========================================
  // 1. 狀態宣告
  // ==========================================
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 表單專用狀態
  const [editingId, setEditingId] = useState(null); // null 代表新增，有值代表正在修改該 ID
  const [formData, setFormData] = useState({
    name: '',
    is_manager: false
  });

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getProviders();
      // 相容性解包防禦
      const list = Array.isArray(data) ? data : (data?.data || []);
      setProviders(list);
    } catch (err) {
      alert('無法取得人員名單，請確認網絡或帳號權限。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  // ==========================================
  // 2. 表單與 Modal 操作邏輯 (全數改為 API 串接)
  // ==========================================
  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', is_manager: false });
    setIsModalOpen(true);
  };

  const openEditModal = (provider) => {
    setEditingId(provider.id);
    setFormData({ name: provider.name, is_manager: provider.is_manager });
    setIsModalOpen(true);
  };

  // 💡 核心修正：儲存時向 Django 發送 POST 或 PATCH API
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        // 【編輯邏輯】PATCH API 到 Django 後端
        await adminService.updateProvider(editingId, formData);
      } else {
        // 【新增邏輯】POST API 到 Django 後端
        const payload = {
          shop_id: 1, // 預設店鋪 ID
          ...formData
        };
        await adminService.createProvider(payload);
      }
      
      setIsModalOpen(false);
      await loadProviders(); // 成功後向伺服器重撈最新資料，確保全域資料對齊！
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.response?.data?.name?.[0] || '儲存失敗，請再試一次。';
      alert(`操作失敗: ${errorDetail}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 💡 核心修正：刪除時向 Django 發送 DELETE API
  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除這位服務人員嗎？這將會連帶取消他所有的排班。')) {
      try {
        await adminService.deleteProvider(id);
        // 成功後向伺服器重新載入列表
        await loadProviders();
      } catch (err) {
        alert(err.response?.data?.detail || '刪除失敗，該人員可能尚有綁定的預約紀錄。');
      }
    }
  };

  return (
    <div className="animate-fade-in text-left">
      
      {/* 頂部操作列：標題與新增按鈕 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-black text-gray-800">店內美師名冊</h3>
          <p className="text-xs text-gray-400 mt-0.5">目前共編制 {providers.length} 位人員</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-gray-800 transition-all active:scale-95"
        >
          ＋ 新增服務人員
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-gray-400 font-medium animate-pulse">資料同步中...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <div 
              key={p.id}
              className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between hover:border-amber-200 transition-all"
            >
              <div className="flex items-center space-x-4 mb-4">
                {/* 大頭貼縮圖 */}
                <div className="w-12 h-12 rounded-full bg-[#f4f1eb] text-[#8c7654] font-black flex items-center justify-center text-lg shadow-inner">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-gray-800 text-base">{p.name}</h4>
                    {/* 店長標籤狀態 */}
                    {p.is_manager ? (
                      <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded-md border border-amber-200/40">店長</span>
                    ) : (
                      <span className="text-[10px] bg-gray-50 text-gray-400 font-medium px-1.5 py-0.5 rounded-md">美療師</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    已綁定 ⏱ {p.services?.length || 0} 項服務
                  </p>
                </div>
              </div>

              {/* 卡片底部按鈕區 */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-50 text-xs">
                <button 
                  onClick={() => openEditModal(p)}
                  className="px-3 py-1.5 text-[#8c7654] font-bold bg-[#f4f1eb] hover:bg-[#ebd9c1] rounded-lg transition-colors"
                >
                  編輯改制
                </button>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-1.5 text-red-500 font-bold hover:bg-red-50 rounded-lg transition-colors"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================
        📦 3. 增刪改彈窗
        ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => !isSubmitting && setIsModalOpen(false)} />

          <form 
            onSubmit={handleSaveSubmit}
            className="bg-white rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-fade-in-up text-left"
          >
            <h3 className="text-base font-black text-gray-900 mb-5">
              {editingId ? `編輯美師資料：${formData.name}` : '新編制服務人員'}
            </h3>

            <div className="space-y-4">
              {/* 欄位 1：姓名 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 block">美甲師稱呼 <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="請輸入美甲師名字 (例: Zoe)"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 欄位 2：職等權限 Switch */}
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100/50">
                <div>
                  <label className="text-xs font-bold text-gray-700 block">升任店長權限</label>
                  <p className="text-[11px] text-gray-400 mt-0.5">店長帳號未來擁有檢視全店營業額的權限</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_manager: !prev.is_manager }))}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none
                    ${formData.is_manager ? 'bg-amber-600' : 'bg-gray-200'}`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-transform duration-300
                      ${formData.is_manager ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>

            {/* Modal 底部按鈕 */}
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-50 text-xs font-bold">
              <button 
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 border border-gray-100 text-gray-400 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 shadow-sm disabled:bg-gray-400"
              >
                {isSubmitting ? '同步至雲端中...' : '儲存配置'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default ProviderManagement;