// src/components/calculator/AppointmentCalculatorModal.jsx
import React from 'react';
import { useDesignCalculator } from '../../hooks/useDesignCalculator';
import DesignCalculatorUI from './DesignCalculatorUI';

const AppointmentCalculatorModal = ({ isOpen, onClose, appointmentId, onConfirmPrice }) => {
    // 💡 傳入 appointmentId，hook 會自動去撈這張單「過去結帳的快照紀錄」來還原畫面
    const calculator = useDesignCalculator(isOpen ? appointmentId : null);

    if (!isOpen) return null;

    // 攔截 UI 組件傳回的「確認結帳寫入單據」事件
    const handleConfirmSave = async (checkoutData) => {
        // 1. 呼叫 API 寫入/更新這張預約單的快照 (存進資料庫)
        const success = await calculator.actions.saveQuote();
        
        if (success) {
            // 2. 成功後，將算好的「應付尾款(total)」傳回給外層的編輯表單
            if (onConfirmPrice) {
                onConfirmPrice(checkoutData.total);
            }
            // 3. 關閉計算機彈窗
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex justify-center items-start md:items-center p-4 pt-10 overflow-y-auto">
            <div className="fixed inset-0" onClick={onClose} />
            
            <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
                {/* 關閉按鈕 */}
                <button 
                    type="button" // 💡 加上了 type="button" 防止觸發外層表單送出
                    onClick={onClose} 
                    className="absolute -top-10 right-0 text-white font-bold text-xs bg-black/50 px-4 py-2 rounded-none hover:bg-black transition-colors border border-white/20"
                >
                    ✕ 關閉計算機
                </button>

                {calculator.loading ? (
                    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_#111111] p-12 text-center text-sm font-bold text-gray-500">
                        正在載入單據快照與菜單...
                    </div>
                ) : (
                    <DesignCalculatorUI 
                        {...calculator} 
                        isStandalone={false} 
                        onConfirmSave={handleConfirmSave} 
                    />
                )}
            </div>
        </div>
    );
};

export default AppointmentCalculatorModal;