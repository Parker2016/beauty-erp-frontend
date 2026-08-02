// src/components/calculator/DesignCalculatorUI.jsx
import React from 'react';

/**
 * Z_98.ST 包浩斯極簡風格計價器 (純 UI 渲染核心)
 * 負責接收 hook 傳來的狀態與操作方法，不直接打 API
 */
const DesignCalculatorUI = ({ 
    menuItems = [], 
    deposit, setDeposit, 
    discount, setDiscount,
    selectedBaseId, selectedRemovalId, addonCounts, styleCounts, customStyles,
    checkoutData, actions, 
    isStandalone = true, // true: 獨立報價模式, false: 結帳模式
    onConfirmSave // 結帳模式下，按下「確認寫入訂單」的觸發事件
}) => {
    
    // 依據 category 拆分菜單
    const bases = menuItems.filter(m => m.category === 'BASE');
    const addons = menuItems.filter(m => m.category === 'ADDON');
    const styles = menuItems.filter(m => m.category === 'STYLE');
    const removals = menuItems.filter(m => m.category === 'REMOVAL');

    // 複製明細邏輯 (移植自你的 HTML)
    const handleCopyReceipt = () => {
        const now = new Date();
        const dateString = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
        
        let detailLines = [];
        checkoutData.activeItems.forEach(item => {
            detailLines.push(`・${item.item_name}${item.quantity > 1 ? ` x${item.quantity}` : ''}: $${item.unit_price * item.quantity}`);
        });

        let msg = `📅 ${dateString}\n`;
        msg += `【Z_98.ST 報價單】\n`;
        msg += detailLines.join('\n') + '\n';
        msg += `-------------------\n`;
        msg += `▫️ 項目小計: $${checkoutData.subtotal.toLocaleString()}\n`;
        
        if (deposit > 0) msg += `▫️ 已付定金: -$${deposit.toLocaleString()}\n`;
        if (discount > 0) msg += `▫️ 優惠折扣: -$${discount.toLocaleString()}\n`;
        
        msg += `-------------------\n`;
        msg += `💰 應付尾款: $${checkoutData.total.toLocaleString()}`;

        navigator.clipboard.writeText(msg)
            .then(() => alert("明細已複製到剪貼簿！可以去 LINE 貼上了！"))
            .catch(() => alert("複製失敗，請手動選取複製"));
    };

    const promptCustomItem = () => {
        const name = prompt("請輸入自訂項目名稱 (例如：立體大鑽)：");
        if (!name) return;
        const price = parseInt(prompt("請輸入單價："), 10);
        if (isNaN(price)) return;
        const count = parseInt(prompt("請輸入數量："), 10);
        if (isNaN(count)) return;
        actions.addCustomStyle(name, price, count);
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-white border-2 border-black shadow-[6px_6px_0px_0px_#111111] flex flex-col relative pb-6 text-gray-900 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center border-b-2 border-black p-4 md:p-6 mb-4">
                <div className="text-xl md:text-2xl font-black tracking-widest uppercase">Z_98.ST</div>
                {isStandalone && (
                    <span className="text-[10px] font-bold bg-black text-white px-2 py-1 uppercase tracking-wider">快速報價系統</span>
                )}
            </header>

            <div className="px-4 md:px-6 space-y-6">
                {/* 1. 款式底價 Tabs */}
                <section>
                    <div className="text-sm font-extrabold tracking-widest uppercase border-l-4 border-black pl-2 mb-3">款式底價</div>
                    <div className="flex border-2 border-black">
                        {bases.map((b, idx) => (
                            <button 
                                type="button"
                                key={b.id} 
                                onClick={() => actions.selectBase(b.id)}
                                className={`flex-1 py-2.5 text-sm font-bold transition-colors ${idx !== bases.length - 1 ? 'border-r-2 border-black' : ''} ${selectedBaseId === b.id ? 'bg-black text-white' : 'bg-transparent hover:bg-gray-100'}`}
                            >
                                {b.name} ${b.price}
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. 加價項目 Counters */}
                <section>
                    <div className="text-sm font-extrabold tracking-widest uppercase border-l-4 border-black pl-2 mb-3">加價項目</div>
                    <div className="flex flex-col gap-3">
                        {addons.map(a => {
                            const count = addonCounts[a.id] || 0;
                            return (
                                <div key={a.id} className="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <span className="text-sm font-bold">{a.name} (${a.price})</span>
                                    <div className="flex items-center border-2 border-black">
                                        <button type="button" onClick={() => actions.changeAddon(a.id, -1)} className="w-8 h-8 font-black hover:bg-gray-200 active:bg-gray-300">-</button>
                                        <div className="w-10 text-center text-sm font-black border-x-2 border-black leading-8">{count}</div>
                                        <button type="button" onClick={() => actions.changeAddon(a.id, 1)} className="w-8 h-8 font-black hover:bg-gray-200 active:bg-gray-300">+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 3. 進階造型 Badges */}
                <section>
                    <div className="text-sm font-extrabold tracking-widest uppercase border-l-4 border-black pl-2 mb-3">進階造型</div>
                    <div className="flex flex-wrap gap-2">
                        {styles.map(s => {
                            const count = styleCounts[s.id] || 0;
                            return (
                                <button 
                                    type="button"
                                    key={s.id} 
                                    onClick={() => actions.cycleStyle(s.id)}
                                    className={`border-2 border-black px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 transition-all rounded-none ${count > 0 ? 'bg-black text-white' : 'bg-transparent hover:bg-gray-100'}`}
                                >
                                    + {s.name} ${s.price}
                                    {count > 0 && <span className="bg-red-600 text-white text-[10px] px-1.5 ml-1">{count}</span>}
                                </button>
                            );
                        })}
                        
                        {/* 臨時自訂項目顯示 */}
                        {customStyles.map(cs => (
                            <button type="button" key={cs.id} className="border-2 border-black px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 bg-black text-white rounded-none">
                                + {cs.name} ${cs.price} <span className="bg-red-600 text-white text-[10px] px-1.5 ml-1">{cs.count}</span>
                            </button>
                        ))}
                    </div>
                    <button type="button" onClick={promptCustomItem} className="w-full mt-3 border-2 border-dashed border-black py-2.5 text-xs font-bold hover:bg-gray-50 uppercase tracking-wider">
                        + 新增現場自訂項目
                    </button>
                </section>

                {/* 4. 卸甲服務 Grid */}
                <section>
                    <div className="text-sm font-extrabold tracking-widest uppercase border-l-4 border-black pl-2 mb-3">卸甲服務</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {removals.map(r => (
                            <button 
                                type="button"
                                key={r.id} 
                                onClick={() => actions.toggleRemoval(r.id)}
                                className={`border-2 flex justify-between items-center p-2.5 text-xs font-bold transition-all ${selectedRemovalId === r.id ? 'border-black bg-gray-200 shadow-[2px_2px_0px_0px_black]' : 'border-black/30 hover:border-black'}`}
                            >
                                <span>{r.name}</span>
                                <span>${r.price}</span>
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {/* 底部固定結帳面板 Footer Panel */}
            <div className="sticky bottom-0 left-0 w-full bg-white border-t-4 border-black p-4 md:p-5 z-20 mt-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-2 text-sm font-bold">
                    <span>預收定金 (-$):</span>
                    <input type="number" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} className="border-2 border-black w-24 p-1 text-right font-black focus:outline-none focus:bg-yellow-50" />
                </div>
                <div className="flex justify-between items-center mb-2 text-sm font-bold">
                    <span>折扣優惠 (-$):</span>
                    <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="border-2 border-black w-24 p-1 text-right font-black focus:outline-none focus:bg-yellow-50" />
                </div>
                
                <div className="flex justify-between items-end mt-2 pt-2 border-t-2 border-gray-200">
                    <span className="text-sm font-black uppercase">應付尾款</span>
                    <span className="text-3xl font-black tracking-tighter">${checkoutData.total.toLocaleString()}</span>
                </div>

                <div className="flex gap-2 mt-4">
                    <button type="button" onClick={actions.reset} className="flex-1 py-3 text-sm font-black border-2 border-black bg-white hover:bg-gray-100">重置選項</button>
                    
                    {isStandalone ? (
                        <button type="button" onClick={handleCopyReceipt} className="flex-1 py-3 text-sm font-black border-2 border-black bg-black text-white hover:bg-gray-800">複製報價明細</button>
                    ) : (
                        <button type="button" onClick={() => onConfirmSave(checkoutData)} className="flex-[2] py-3 text-sm font-black border-2 border-black bg-[#8c7654] text-white hover:bg-[#7a6648] border-[#8c7654]">確認結帳寫入單據</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignCalculatorUI;