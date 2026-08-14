// src/components/BookingNoticeModal.jsx
import React, { useState } from 'react';

export const BookingNoticeModal = ({ isOpen, onConfirm }) => {
  const [isAgreed, setIsAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity p-0 sm:p-4">
      {/* 彈窗主體 (手機端由下往上滑出樣式) */}
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in slide-in-from-bottom duration-200">
        
        {/* 標題欄 */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="w-8"></div> {/* 排版平衡用 */}
          <h3 className="text-lg font-bold text-gray-800 tracking-wide">
            〻 預約注意事項
          </h3>
          <div className="w-8"></div>
        </div>

        {/* 內文滾動區域 */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700 leading-relaxed font-sans">
          
          {/* 區塊 ①：預約變更相關 */}
          <div className="bg-[#FFF8F8] p-4 rounded-2xl border border-[#FFE4E4]">
            <h4 className="font-bold text-[#D88A8A] text-base mb-2 flex items-center gap-1.5">
              <span>①</span> 預約變更相關
            </h4>
            <p className="text-gray-600 text-xs mb-3">
              除了特定時段，其餘 <strong className="text-gray-800">不收定金</strong>～<br/>
              也因為時段都是為妳保留的寶貴空檔：
            </p>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-1.5">
                <span className="text-[#D88A8A]">⸝⋆</span>
                <div>
                  <strong className="text-red-500">當日改時間／無故取消／超時未到</strong>
                  <br />
                  <span className="text-gray-500">➔ 需支付空檔費 <strong>$1000／項目</strong></span>
                </div>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#D88A8A]">⸝⋆</span>
                <div>若需更改時間，請 <strong className="text-gray-900 underline">提前 2–3 天</strong> 告知</div>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#D88A8A]">⸝⋆</span>
                <div>當日預約保留 <strong>15 分鐘</strong>，超過就會自動取消唷！</div>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#D88A8A]">⸝⋆</span>
                <div className="text-red-500 font-medium">無故放鳥、連續取消兩次者，將不再提供預約服務</div>
              </li>
            </ul>
          </div>

          {/* 區塊 ②：攜伴小提醒 */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-800 text-base mb-2 flex items-center gap-1.5">
              <span>②</span> 攜伴小提醒
            </h4>
            <p className="text-xs text-gray-600 leading-normal">
              工作室可以攜伴，但 <strong className="text-gray-800">最多 1 位</strong>。<br/>
              以不影響我們施作為主 ♡ 也請提前跟我說一下～
            </p>
          </div>

          {/* 區塊 ③：攜帶外食 */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-800 text-base mb-2 flex items-center gap-1.5">
              <span>③</span> 攜帶外食
            </h4>
            <p className="text-xs text-gray-600 leading-normal">
              工作室可以帶飲料來喝‎ 𐩢𐩺<br/>
              食物部分儘量以 <strong className="text-gray-800">輕便／味道清淡</strong> 為主。<br/>
              食用完的飲料與食物垃圾也請自行隨手帶走呦！
            </p>
          </div>

        </div>

        {/* 底部確認按鈕區 */}
        <div className="p-5 border-t border-gray-100 bg-white space-y-3">
          {/* 勾選框 */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none px-1">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="w-4 h-4 text-[#D88A8A] rounded border-gray-300 focus:ring-[#D88A8A] transition cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-gray-700 font-medium">
              我已詳閱並同意以上預約注意事項與規範
            </span>
          </label>

          {/* 送出/進入預約按鈕 */}
          <button
            type="button"
            disabled={!isAgreed}
            onClick={onConfirm}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition duration-200 shadow-md ${
              isAgreed
                ? 'bg-[#D88A8A] text-white hover:bg-[#c67676] active:scale-[0.99]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            預約前請詳閱注意事項，送出預約即視同同意相關規範
          </button>
        </div>

      </div>
    </div>
  );
};