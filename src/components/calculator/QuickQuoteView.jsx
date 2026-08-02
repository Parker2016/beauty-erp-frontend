// src/components/calculator/QuickQuoteView.jsx
import React from 'react';
import { useDesignCalculator } from '../../hooks/useDesignCalculator';
import DesignCalculatorUI from './DesignCalculatorUI';

const QuickQuoteView = () => {
    // 💡 傳入 null 代表這是「新單/試算模式」，不會去後端撈取歷史快照
    const calculator = useDesignCalculator(null);

    if (calculator.loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#fcfbfa]">
                <div className="text-sm font-bold text-gray-400 animate-pulse">載入最新價目表中...</div>
            </div>
        );
    }

    if (calculator.error) {
        return <div className="p-10 text-red-500 font-bold">{calculator.error}</div>;
    }

    return (
        <div className="min-h-screen bg-[#fcfbfa] p-4 md:p-8">
            <div className="max-w-xl mx-auto">
                {/* 頁面說明區 */}
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-black text-gray-800 tracking-widest">快速報價小幫手</h2>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                        獨立試算模式，操作不影響任何預約單，計算完畢後請點擊下方按鈕複製明細。
                    </p>
                </div>

                {/* 
                  💡 將 hook 產生的所有狀態與方法 ({...calculator}) 直接灌入 UI 組件
                  並開啟 isStandalone=true 模式 (顯示複製按鈕)
                */}
                <DesignCalculatorUI 
                    {...calculator} 
                    isStandalone={true} 
                />
            </div>
        </div>
    );
};

export default QuickQuoteView;