// src/hooks/useDesignCalculator.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { quoteService } from '../services/quote';

export const useDesignCalculator = (appointmentId) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // 原始菜單資料 (從 API 抓回來供設定面板與初始渲染使用)
    const [menuItems, setMenuItems] = useState([]);
    
    // 結帳總表與折扣狀態
    const [deposit, setDeposit] = useState(0);
    const [discount, setDiscount] = useState(0);

    // ==========================================
    // 1. 各分類的操作狀態 (State)
    // ==========================================
    const [selectedBaseId, setSelectedBaseId] = useState(null); // 單選款式底價
    const [selectedRemovalId, setSelectedRemovalId] = useState(null); // 單選卸甲
    const [addonCounts, setAddonCounts] = useState({}); // { itemId: quantity } 加購數量
    const [styleCounts, setStyleCounts] = useState({}); // { itemId: quantity } 造型數量
    const [customStyles, setCustomStyles] = useState([]); // 現場臨時新增的自訂項目 [{id, name, price, count}]

    // ==========================================
    // 2. 初始化與撈取資料 (Menu & Snapshot)
    // ==========================================
    const loadCalculatorData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // 💡 修正 1：動態決定要發送幾個 API 請求
            const apiCalls = [quoteService.getDesignPrices(1)];
            if (appointmentId) {
                apiCalls.push(quoteService.getQuote(appointmentId));
            }

            // 平行發送請求
            const results = await Promise.allSettled(apiCalls);

            // 處理菜單資料 (永遠是陣列的第一個)
            const menuRes = results[0];
            let currentMenu = [];
            if (menuRes.status === 'fulfilled') {
                currentMenu = menuRes.value.data || menuRes.value;
                setMenuItems(currentMenu);
            }

            // 💡 修正 2：如果有發送快照請求，它會是陣列的第二個
            const quoteRes = appointmentId ? results[1] : null;
            const snapshot = (quoteRes && quoteRes.status === 'fulfilled') ? (quoteRes.value.data || quoteRes.value) : null;

            // 判斷是否有成功拿到歷史快照
            if (snapshot && Array.isArray(snapshot.items)) {
                 setDeposit(Number(snapshot.deposit) || 0);
                 setDiscount(Number(snapshot.discount) || 0);
                 
                 // 將快照項目還原回狀態中
                 const newAddonCounts = {};
                 const newStyleCounts = {};
                 const newCustomStyles = [];
                 
                 snapshot.items.forEach(item => {
                     if (item.category === 'BASE') {
                        const baseItem = currentMenu.find(m => m.name === item.item_name && m.category === 'BASE');
                        if(baseItem) setSelectedBaseId(baseItem.id);
                     }
                     else if (item.category === 'REMOVAL') {
                         const removalItem = currentMenu.find(m => m.name === item.item_name && m.category === 'REMOVAL');
                         if(removalItem) setSelectedRemovalId(removalItem.id);
                     }
                     else if (item.category === 'ADDON') {
                         const addonItem = currentMenu.find(m => m.name === item.item_name && m.category === 'ADDON');
                         if(addonItem) newAddonCounts[addonItem.id] = item.quantity;
                     }
                     else if (item.category === 'STYLE') {
                         if (item.is_custom) {
                             newCustomStyles.push({
                                 id: `custom_${Date.now()}_${Math.random()}`,
                                 name: item.item_name,
                                 price: Number(item.unit_price),
                                 count: item.quantity,
                                 is_custom: true
                             });
                         } else {
                             const styleItem = currentMenu.find(m => m.name === item.item_name && m.category === 'STYLE');
                             if(styleItem) newStyleCounts[styleItem.id] = item.quantity;
                         }
                     }
                 });
                 
                 setAddonCounts(newAddonCounts);
                 setStyleCounts(newStyleCounts);
                 setCustomStyles(newCustomStyles);
                 
            } else {
                 // 沒快照（或者是獨立報價模式），載入乾淨的預設狀態
                 const firstBase = currentMenu.find(m => m.category === 'BASE');
                 setSelectedBaseId(firstBase ? firstBase.id : null);
                 
                 setAddonCounts({});
                 setStyleCounts({});
                 setCustomStyles([]);
                 setSelectedRemovalId(null);
                 setDeposit(0);
                 setDiscount(0);
            }

        } catch (err) {
            setError("載入價目表失敗，請重試。");
        } finally {
            setLoading(false);
        }
    }, [appointmentId]);

    useEffect(() => {
        loadCalculatorData();
    }, [loadCalculatorData]);

    // ==========================================
    // 3. UI 互動操作函式 (Actions)
    // ==========================================
    const handleSelectBase = (id) => setSelectedBaseId(id);
    const handleToggleRemoval = (id) => setSelectedRemovalId(prev => prev === id ? null : id);
    
    const handleChangeAddon = (id, delta) => {
        setAddonCounts(prev => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) + delta)
        }));
    };

    const handleCycleStyle = (id) => {
        // 依照設計：點擊 +1，大於10歸零
        setStyleCounts(prev => ({
            ...prev,
            [id]: ((prev[id] || 0) + 1) % 11
        }));
    };

    const handleAddCustomStyle = (name, price, count) => {
        setCustomStyles(prev => [...prev, {
            id: `custom_${Date.now()}`,
            name, price, count, is_custom: true
        }]);
    };

    const handleReset = () => {
        setAddonCounts({});
        setStyleCounts({});
        setCustomStyles([]);
        setSelectedRemovalId(null);
        setDeposit(0);
        setDiscount(0);
        const firstBase = menuItems.find(m => m.category === 'BASE');
        if (firstBase) setSelectedBaseId(firstBase.id);
    };

    // ==========================================
    // 4. 即時金額結算與明細打包 (Calculations)
    // ==========================================
    const checkoutData = useMemo(() => {
        let subtotal = 0;
        const activeItems = [];

        // 整理底價
        const baseItem = menuItems.find(m => m.id === selectedBaseId);
        if (baseItem) {
            subtotal += Number(baseItem.price);
            activeItems.push({ category: 'BASE', item_name: baseItem.name, unit_price: baseItem.price, quantity: 1, is_custom: false });
        }

        // 整理加價
        menuItems.filter(m => m.category === 'ADDON').forEach(item => {
            const count = addonCounts[item.id] || 0;
            if (count > 0) {
                subtotal += Number(item.price) * count;
                activeItems.push({ category: 'ADDON', item_name: item.name, unit_price: item.price, quantity: count, is_custom: false });
            }
        });

        // 整理進階造型 (公版)
        menuItems.filter(m => m.category === 'STYLE').forEach(item => {
            const count = styleCounts[item.id] || 0;
            if (count > 0) {
                subtotal += Number(item.price) * count;
                activeItems.push({ category: 'STYLE', item_name: item.name, unit_price: item.price, quantity: count, is_custom: false });
            }
        });

        // 整理臨時自訂造型
        customStyles.forEach(item => {
            if (item.count > 0) {
                subtotal += Number(item.price) * item.count;
                activeItems.push({ category: 'STYLE', item_name: item.name, unit_price: item.price, quantity: item.count, is_custom: true });
            }
        });

        // 整理卸甲
        const removalItem = menuItems.find(m => m.id === selectedRemovalId);
        if (removalItem) {
            subtotal += Number(removalItem.price);
            activeItems.push({ category: 'REMOVAL', item_name: removalItem.name, unit_price: removalItem.price, quantity: 1, is_custom: false });
        }

        const total = Math.max(0, subtotal - deposit - discount);

        return { subtotal, total, activeItems };
    }, [menuItems, selectedBaseId, selectedRemovalId, addonCounts, styleCounts, customStyles, deposit, discount]);

    // ==========================================
    // 5. 儲存快照至後端 (Save API)
    // ==========================================
    const saveCalculatorQuote = async (formattedReceipt) => {
        if (!appointmentId) return;
        setIsSaving(true);
        try {
            const payload = {
                deposit,
                discount,
                subtotal: checkoutData.subtotal,
                total_amount: checkoutData.total,
                formatted_receipt: formattedReceipt || '',
                items: checkoutData.activeItems
            };
            
            await quoteService.saveQuote(appointmentId, payload);
            return true;
        } catch (err) {
            setError("儲存快照失敗，請稍後再試。");
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        // State & Data
        loading, error, isSaving,
        menuItems,
        deposit, setDeposit,
        discount, setDiscount,
        
        // Selections
        selectedBaseId,
        selectedRemovalId,
        addonCounts,
        styleCounts,
        customStyles,

        // Calculated Data
        checkoutData,

        // Actions
        actions: {
            selectBase: handleSelectBase,
            toggleRemoval: handleToggleRemoval,
            changeAddon: handleChangeAddon,
            cycleStyle: handleCycleStyle,
            addCustomStyle: handleAddCustomStyle,
            reset: handleReset,
            saveQuote: saveCalculatorQuote,
            refreshMenu: loadCalculatorData // 給後台設定 Modal 存檔後刷新用
        }
    };
};