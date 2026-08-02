// src/components/settings/DesignPriceSettings.jsx
import React, { useState, useEffect } from 'react';
import { quoteService } from '../../services/quote';

const CATEGORIES = [
    { id: 'BASE', label: '款式底價 (BASE)' },
    { id: 'ADDON', label: '加價項目 (ADDON)' },
    { id: 'STYLE', label: '進階造型 (STYLE)' },
    { id: 'REMOVAL', label: '卸甲服務 (REMOVAL)' }
];

const DesignPriceSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // 儲存所有的菜單項目
    const [items, setItems] = useState([]);
    // 當前選中的子分類
    const [activeCategory, setActiveCategory] = useState('BASE');
    // 記錄被刪除的真實 ID (供後端刪除用)
    const [deletedIds, setDeletedIds] = useState([]);

    // 1. 載入資料
    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await quoteService.getDesignPrices(1); // 假設 shop_id = 1
            const data = res.data || res;
            setItems(data);
            setDeletedIds([]);
        } catch (error) {
            alert("載入價目表失敗！");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // 2. 本地端編輯欄位
    const handleFieldChange = (id, field, value) => {
        setItems(prev => prev.map(item => 
            item.id === id ? { ...item, [field]: value, is_modified: true } : item
        ));
    };

    // 3. 新增一列空白項目 (賦予一個暫時的 ID)
    const handleAddNewItem = () => {
        const newItem = {
            id: `temp_${Date.now()}`, // 辨識為尚未存檔的新項目
            category: activeCategory,
            name: '',
            price: 0,
            sort_order: 1,
            is_active: true,
            is_new: true 
        };
        setItems(prev => [...prev, newItem]);
    };

    // 4. 刪除項目
    const handleDeleteItem = (id) => {
        if (typeof id === 'number') {
            // 如果是資料庫已經有的 ID，記錄到刪除陣列中，等按儲存時一併送出
            setDeletedIds(prev => [...prev, id]);
        }
        // 從畫面上移除
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // 5. 批次儲存到後端
    const handleSaveAll = async () => {
        setSaving(true);
        try {
            // 整理出需要新增、修改、刪除的資料
            const payload = {
                shop_id: 1,
                deleted_ids: deletedIds,
                // 過濾掉未填寫名稱的空項目
                items: items.filter(i => i.name.trim() !== '').map(i => ({
                    id: typeof i.id === 'string' ? null : i.id, // temp_xxx 轉成 null 讓後端知道是新增
                    category: i.category,
                    name: i.name,
                    price: Number(i.price),
                    sort_order: Number(i.sort_order),
                    is_active: i.is_active
                }))
            };

            // 呼叫 API 進行批次更新 (我們稍後會在 quote.js 補上這個 API)
            await quoteService.batchUpdateDesignPrices(payload);
            
            alert("✅ 儲存成功！");
            await fetchItems(); // 重新撈取最新的真實資料
        } catch (error) {
            alert("儲存失敗，請檢查網路或資料格式。");
        } finally {
            setSaving(false);
        }
    };

    // 過濾出當前畫面上要顯示的分類項目
    const displayedItems = items
        .filter(item => item.category === activeCategory)
        .sort((a, b) => a.sort_order - b.sort_order); // 依照 sort_order 排序

    if (loading) return <div className="p-10 text-center font-bold text-gray-400">載入價目表中...</div>;

    return (
        <div className="p-2 md:p-4">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-lg font-black text-gray-800">價目維護面板</h3>
                    <p className="text-xs text-gray-500">此處的變更會即時影響「現場結帳」與「快速報價」的系統選項。</p>
                </div>
                <button 
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                >
                    {saving ? '儲存中...' : '💾 儲存並發佈所有變更'}
                </button>
            </div>

            {/* 子分類頁籤 */}
            <div className="flex space-x-2 border-b border-gray-200 mb-4">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
                            activeCategory === cat.id ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Excel 風格資料表格 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-3 text-[11px] font-bold text-gray-500 w-16 text-center">排序</th>
                            <th className="p-3 text-[11px] font-bold text-gray-500">項目名稱</th>
                            <th className="p-3 text-[11px] font-bold text-gray-500 w-28">價格 (NT$)</th>
                            <th className="p-3 text-[11px] font-bold text-gray-500 w-24 text-center">狀態</th>
                            <th className="p-3 text-[11px] font-bold text-gray-500 w-16 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedItems.map((item, index) => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 group">
                                <td className="p-2 text-center">
                                    <input 
                                        type="number" 
                                        value={item.sort_order} 
                                        onChange={(e) => handleFieldChange(item.id, 'sort_order', e.target.value)}
                                        className="w-12 p-1.5 text-xs text-center border border-gray-200 rounded-md focus:border-black focus:outline-none bg-transparent"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="text" 
                                        value={item.name} 
                                        placeholder="例如：單色漸層..."
                                        onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                                        className="w-full p-1.5 text-xs font-bold border border-transparent hover:border-gray-200 focus:border-black focus:bg-white rounded-md focus:outline-none bg-transparent transition-all"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="number" 
                                        value={item.price} 
                                        onChange={(e) => handleFieldChange(item.id, 'price', e.target.value)}
                                        className="w-full p-1.5 text-xs font-mono font-bold text-amber-900 border border-gray-200 rounded-md focus:border-amber-600 focus:outline-none bg-white"
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <button 
                                        onClick={() => handleFieldChange(item.id, 'is_active', !item.is_active)}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        {item.is_active ? '✅ 上架' : '❌ 停用'}
                                    </button>
                                </td>
                                <td className="p-2 text-center">
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-gray-300 hover:text-red-500 font-bold px-2 py-1 transition-colors"
                                        title="刪除"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* 新增列按鈕 */}
                <div className="p-2 bg-gray-50 border-t border-gray-100">
                    <button 
                        onClick={handleAddNewItem}
                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 text-xs font-bold rounded-lg hover:border-gray-400 hover:text-gray-700 hover:bg-white transition-all"
                    >
                        ＋ 新增一列 {CATEGORIES.find(c => c.id === activeCategory)?.label.split(' ')[0]}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DesignPriceSettings;