// src/components/ServiceItemModal.jsx
import React from 'react';

const ServiceItemModal = ({
  isOpen, onClose, formData, setFormData, providerOptions,
  editingService, toggleProviderCheckbox, onSubmit, loading, error
}) => {
  if (!isOpen) return null;

  // 💡 智慧連動變更：切換是否為加購項時，自動變更分類屬性
  const handleAddonChange = (e) => {
    const isAddonValue = e.target.value === 'true';
    setFormData({
      ...formData,
      is_addon: isAddonValue,
      // 如果設為加購，類別強制定錨至 ADDON；如果取消加購，自動退回 HAND 手部服務
      category: isAddonValue ? 'ADDON' : (formData.category === 'ADDON' ? 'HAND' : formData.category)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <form 
        onSubmit={onSubmit} 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh] text-left animate-fade-in-up"
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

          {/* 服務名稱 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">服務項目名稱 *</label>
            <input 
              type="text" required value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="例如：璀璨冰透貓眼造型" 
              className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs focus:outline-none focus:border-[#8c7654] font-bold text-gray-800" 
            />
          </div>

          {/* 💡 新增：屬性與大分類（防阻手機版縮小劫持外殼） */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">項目屬性</label>
              <div className="relative w-full">
                <select
                  value={formData.is_addon === true || formData.is_addon === 'true' ? 'true' : 'false'}
                  onChange={handleAddonChange}
                  className="w-full appearance-none p-3 pr-10 border border-gray-100 rounded-xl bg-gray-50 text-base sm:text-sm font-bold text-gray-700 focus:outline-none focus:border-[#8c7654] h-[48px] cursor-pointer"
                >
                  <option value="false">主要造型服務</option>
                  <option value="true">加購增值服務 (如卸甲/延甲)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">服務歸類頁籤</label>
              <div className="relative w-full">
                <select
                  value={formData.category || 'HAND'}
                  onChange={e => setFormData({...formData, category: e.target.value, is_addon: e.target.value === 'ADDON'})}
                  className="w-full appearance-none p-3 pr-10 border border-gray-100 rounded-xl bg-gray-50 text-base sm:text-sm font-bold text-gray-700 focus:outline-none focus:border-[#8c7654] h-[48px] cursor-pointer"
                >
                  <option value="HAND">💅 手部造型保養</option>
                  <option value="FOOT">🩴 足部精緻修護</option>
                  <option value="PURE_REMOVAL">🧼 純卸甲潔淨</option>
                  <option value="ADDON">➕ 獨立加購項目</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* 💡 新增：計價模式選單 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">計價模式設定</label>
              <div className="relative w-full">
                <select
                  value={formData.price_type || 'FIXED'}
                  onChange={e => setFormData({...formData, price_type: e.target.value})}
                  className="w-full appearance-none p-3 pr-10 border border-gray-100 rounded-xl bg-gray-50 text-base sm:text-sm font-bold text-gray-700 focus:outline-none focus:border-[#8c7654] h-[48px] cursor-pointer"
                >
                  <option value="FIXED">💰 固定定價</option>
                  <option value="STARTING">📈 最低起價 (..起)</option>
                  <option value="QUOTE">💬 現場溝通報價</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                {formData.price_type === 'QUOTE' ? '基準參考價 (唯讀)' : '定價 / 起步價 (NT$) *'}
              </label>
              <input 
                type="number" required disabled={formData.price_type === 'QUOTE'}
                value={formData.price_type === 'QUOTE' ? 0 : (formData.price || '')} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                placeholder={formData.price_type === 'QUOTE' ? '現場決定金額' : '1500'} 
                className={`w-full p-3 border border-gray-100 rounded-xl text-sm font-mono font-bold h-[48px] focus:outline-none focus:border-[#8c7654]
                  ${formData.price_type === 'QUOTE' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-amber-900'}`} 
              />
            </div>
          </div>

          {/* 施作時間 & 描述 */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">預估施作消耗工時 (分鐘) *</label>
              <input 
                type="number" required value={formData.duration_minutes || ''} 
                onChange={e => setFormData({...formData, duration_minutes: e.target.value})} 
                placeholder="60" 
                className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-sm focus:outline-none focus:border-[#8c7654] font-mono font-bold text-gray-700" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">品項描述</label>
            <textarea 
              rows="2" value={formData.description || ''} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="填寫該項目的施作亮點與包含的基礎保養手續..." 
              className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs focus:outline-none focus:border-[#8c7654] resize-none leading-relaxed font-medium" 
            />
          </div>

          {/* 多對多美甲師指派 */}
          <div className="border-t border-gray-100 pt-3">
            <label className="block text-xs font-bold text-[#8c7654] mb-2">指派授權人員 (可多選) *</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl max-h-32 overflow-y-auto border border-gray-100/50">
              {providerOptions.map(p => {
                const isChecked = formData.provider_ids?.includes(p.id);
                return (
                  <label 
                    key={p.id} 
                    className={`flex items-center space-x-2 p-2 bg-white rounded-lg border text-xs font-bold cursor-pointer select-none transition-all
                      ${isChecked ? 'border-amber-300 bg-amber-50/20' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <input 
                      type="checkbox" checked={isChecked || false} 
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
            type="button" onClick={onClose} 
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button 
            type="submit" disabled={loading} 
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-black shadow-md transition-all active:scale-95 disabled:bg-gray-300"
          >
            {loading ? '封裝保存中...' : '確認保存變更'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceItemModal;