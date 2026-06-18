// src/components/ServiceItemModal.jsx
import React from 'react';

const ServiceItemModal = ({
  isOpen,
  onClose,
  formData,
  setFormData, // 用於同步表單輸入
  providerOptions,
  editingService,
  toggleProviderCheckbox,
  onSubmit,
  loading,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <form 
        onSubmit={onSubmit} 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left animate-fade-in"
      >
        {/* 彈窗頭部 */}
        <div className="p-5 bg-gray-900 text-white flex justify-between items-center">
          <h3 className="font-black text-base">
            {editingService ? '⚙️ 更新服務品項參數' : '✨ 上架全新服務品項'}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white font-bold transition-colors">✕</button>
        </div>

        {/* 滾動表單主體 */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-500 rounded-r-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">服務名稱 *</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="例如：法式單色凝膠" 
              className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs focus:outline-none focus:border-[#8c7654] font-medium" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">定價 (NT$) *</label>
              <input 
                type="number" 
                required 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                placeholder="1200" 
                className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs focus:outline-none focus:border-[#8c7654] font-mono font-bold" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">施作時間 (分鐘) *</label>
              <input 
                type="number" 
                required 
                value={formData.duration_minutes} 
                onChange={e => setFormData({...formData, duration_minutes: e.target.value})} 
                placeholder="60" 
                className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs focus:outline-none focus:border-[#8c7654] font-mono font-bold" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">品項描述</label>
            <textarea 
              rows="3" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="填寫該項目的施作亮點與包含的基礎保養手續..." 
              className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs focus:outline-none focus:border-[#8c7654] resize-none leading-relaxed" 
            />
          </div>

          {/* 多對多：美甲師指派複選網格 */}
          <div className="border-t border-gray-100 pt-3">
            <label className="block text-xs font-bold text-[#8c7654] mb-2">指派授權人員 (可多選) *</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl max-h-36 overflow-y-auto border border-gray-100/50">
              {providerOptions.map(p => {
                const isChecked = formData.provider_ids.includes(p.id);
                return (
                  <label 
                    key={p.id} 
                    className={`flex items-center space-x-2 p-2 bg-white rounded-lg border text-xs font-bold cursor-pointer select-none transition-all
                      ${isChecked ? 'border-amber-300 bg-amber-50/20' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => toggleProviderCheckbox(p.id)}
                      className="accent-[#8c7654] rounded h-3.5 w-3.5"
                    />
                    <span className="text-gray-700">{p.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* 彈窗底部操作區 */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-black shadow-md transition-all active:scale-95 disabled:bg-gray-300"
          >
            {loading ? '核心封裝保存中...' : '確認保存變更'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceItemModal;