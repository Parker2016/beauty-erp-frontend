import React, { useState, useMemo, useEffect } from 'react';
import { useBookingFlow } from '../hooks/useBookingFlow';

const BookingPage = () => {
  // ==========================================
  // 1. 從自訂 Hook 解構出動態狀態與方法
  // ==========================================
  const { 
    providers, isLoading, error, step, setStep,
    selectedProvider, selectedService, 
    availableSlots, isSlotsLoading, fetchAvailableSlots, // 💡 新增：後端連動的時間防撞狀態
    selectProvider, selectService, submitBooking, 
    resetFlow, goBack 
  } = useBookingFlow();

  // ==========================================
  // 步驟 3：月曆與時間狀態
  // ==========================================
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null); 
  const [selectedTime, setSelectedTime] = useState('');

  // ==========================================
  // 2. 核心連動：當客人選定日期時，即時去後端打 API 算時段
  // ==========================================
  useEffect(() => {
    if (selectedDate && selectedProvider && selectedService) {
      // 💡 防呆：換日期時，先把上一次選的時間清空
      setSelectedTime(''); 
      
      // 將 JavaScript Date 物件格式化成 Django 想要的 'YYYY-MM-DD'
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // 呼叫 Hook 方法，直接觸發 Django ProviderViewSet 的演算法
      fetchAvailableSlots(selectedProvider.id, selectedService.id, formattedDate);
    }
  }, [selectedDate, selectedProvider, selectedService, fetchAvailableSlots]);

  // ==========================================
  // 步驟 4：客戶基本資料與備註狀態
  // ==========================================
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    memo: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
  };

  // 月曆生成邏輯 (不變)
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1; 
    const days = Array(startDayIndex).fill(null);
    for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, month, i)); }
    return days;
  }, [currentMonth]);

  const isSameDate = (d1, d2) => d1 && d2 && d1.toDateString() === d2.toDateString();
  const isPast = (date) => date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // 步驟 3 的按鈕改為「下一頁」
  const handleGoToForm = () => {
    if (selectedDate && selectedTime) {
      setStep(4); 
    }
  };

  // 步驟 4 的最終送出
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!customerData.name || !customerData.phone) {
      alert('請填寫姓名與電話！');
      return;
    }
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const startDateTime = new Date(`${year}-${month}-${day}T${selectedTime}:00`).toISOString();
    
    await submitBooking(startDateTime, customerData);
  };

  if (isLoading && step === 1) return <div className="min-h-screen flex justify-center items-center text-pink-400 font-bold">載入中...</div>;

  return (
    /* 
      【行動端黃金外殼】
      max-w-md: 限制最大寬度在手機範圍 
      mx-auto: margin 左右自動置中，在大螢幕看就不會散開
      pb-24: 底部內留空白 96px，預留給 fixed 懸浮按鈕條，防止內容被遮擋
    */
    <div className="max-w-md mx-auto min-h-screen bg-white relative pb-24 shadow-2xl">
      
      {/* 頂部 Header */}
      <header className="bg-white p-5 text-center shadow-sm sticky top-0 z-10 flex items-center">
        {step > 1 && step < 5 && (
          <button onClick={goBack} className="absolute left-5 text-gray-400 hover:text-pink-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-800 flex-1">線上預約</h1>
      </header>

      {error && <div className="m-4 p-4 bg-red-50 text-red-500 rounded-xl text-sm">{error}</div>}

      <main className="p-6">
        {/* ================= 步驟 1：選擇人員 ================= */}
        {step === 1 && (
          /* space-y-4: 元件與元件之間自動撐開垂直間距 (等同 Antd 的 Space direction="vertical") */
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-700">請選擇服務人員</h2>
            {providers.map((p) => (
              /* active:scale-95: 點擊按鈕瞬間微縮 95%，產生極高質感的 iOS 觸控回饋感 */
              <div 
                key={p.id} onClick={() => selectProvider(p)}
                className="flex items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm cursor-pointer hover:border-pink-300 hover:shadow-md transition-all active:scale-95"
              >
                <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-xl mr-4">{p.name.charAt(0)}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.is_manager ? '店長' : '專業美業師'}</p>
                </div>
                <div className="text-pink-200">➔</div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 步驟 2：選擇項目 ================= */}
        {step === 2 && selectedProvider && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-700">請選擇服務項目</h2>
            <div className="p-3 bg-pink-50 rounded-lg text-sm text-pink-500 font-medium">指定：{selectedProvider.name}</div>
            {selectedProvider.services?.map((s) => (
              <div 
                key={s.id} onClick={() => selectService(s)}
                className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm cursor-pointer hover:border-pink-300 transition-all active:scale-95 flex flex-col"
              >
                {/* justify-between: 標題靠左、金額靠右完美對齊 */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{s.name}</h3>
                  <span className="text-pink-500 font-bold">NT$ {s.price}</span>
                </div>
                
                {s.description && (
                  <p className="text-sm text-gray-500 mb-3 leading-relaxed">{s.description}</p>
                )}
                
                <div className="inline-block bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-md w-max font-medium border border-gray-100">
                  ⏱ 預估時間：{s.duration_minutes} 分鐘
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 步驟 3：選擇日期時間 ================= */}
        {step === 3 && selectedService && (
          <div className="animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-700 mb-6">選擇預約日期與時間</h2>
            
            {/* 月曆切換 Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="text-gray-400 text-xl font-bold p-2">&lt;</button>
                <span className="text-xl font-bold text-gray-800">{currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="text-gray-400 text-xl font-bold p-2">&gt;</button>
              </div>
              <button onClick={() => {setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today);}} className="text-pink-400 font-bold">今天</button>
            </div>

            {/* 星期欄位：grid-cols-7 完美均分 7 格 (等同 Antd 的 Row/Col 24格切分法) */}
            <div className="grid grid-cols-7 mb-4">
              {['一', '二', '三', '四', '五', '六', '日'].map(d => <div key={d} className="text-center text-gray-300 font-bold text-xs">{d}</div>)}
            </div>

            {/* 日期格子群 */}
            <div className="grid grid-cols-7 gap-y-4 mb-8">
              {calendarDays.map((dateObj, i) => {
                if (!dateObj) return <div key={i} />;
                const active = isSameDate(dateObj, selectedDate);
                const past = isPast(dateObj);
                return (
                  <div key={i} className="flex justify-center">
                    <button 
                      onClick={() => !past && setSelectedDate(dateObj)} 
                      disabled={past} 
                      className={`w-10 h-10 rounded-full font-bold transition-all text-sm ${active ? 'bg-pink-400 text-white shadow-lg' : past ? 'text-gray-200 cursor-not-allowed' : 'text-gray-700 hover:bg-pink-50'}`}
                    >
                      {dateObj.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 💡 這裡進行了核心重構：根據後端撈取狀態，動態渲染時段區塊 */}
            {selectedDate && (
              <div className="mt-8 border-t border-gray-50 pt-6">
                <p className="text-gray-400 text-sm mb-4 font-medium">
                  {selectedDate.getMonth()+1}/{selectedDate.getDate()} 可預約時間
                </p>

                {isSlotsLoading ? (
                  /* 情況 1：正在與 Django 通訊計算時段 */
                  <div className="text-center py-8 text-pink-400 font-bold animate-pulse text-sm">
                    正在即時同步美甲師行事曆...
                  </div>
                ) : availableSlots.length > 0 ? (
                  /* 情況 2：撈取成功，有可用空檔 */
                  /* grid-cols-3 gap-3: 橫向排 3 個按鈕，自動產生兼距 */
                  <div className="grid grid-cols-3 gap-3">
                    {availableSlots.map(time => (
                      <button 
                        key={time} 
                        type="button"
                        onClick={() => setSelectedTime(time)} 
                        className={`py-3 rounded-xl border-2 font-bold transition-all text-sm ${selectedTime === time ? 'border-pink-400 bg-pink-50 text-pink-500' : 'border-pink-50 text-pink-300 hover:border-pink-200'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* 情況 3：全被搶光了，黃金碰撞防禦起效 */
                  <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400 text-sm px-4 leading-relaxed">
                    唉呀！當天這位美甲師已經被約滿囉 😭<br/>要不要換一天或其他美甲師試試看？
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= 步驟 4：填寫基本資料與備註 ================= */}
        {step === 4 && selectedDate && selectedTime && (
          <form onSubmit={handleFinalSubmit} className="space-y-5 animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-700 mb-2">確認聯絡資料</h2>
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 block">姓名 <span className="text-red-400">*</span></label>
              <input type="text" name="name" required value={customerData.name} onChange={handleInputChange} placeholder="請輸入您的真實姓名" className="w-full p-3 border border-gray-100 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50 text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 block">電話 <span className="text-red-400">*</span></label>
              <input type="tel" name="phone" required value={customerData.phone} onChange={handleInputChange} placeholder="請輸入手機號碼" className="w-full p-3 border border-gray-100 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50 text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 block">Email</label>
              <input type="email" name="email" value={customerData.email} onChange={handleInputChange} placeholder="example@mail.com (選填)" className="w-full p-3 border border-gray-100 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50 text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 block">預約備註</label>
              <textarea name="memo" rows="3" value={customerData.memo} onChange={handleInputChange} placeholder="是否有需要額外告知美甲師的事項呢？(例如需卸甲)" className="w-full p-3 border border-gray-100 rounded-xl focus:outline-none focus:border-pink-400 bg-gray-50 text-sm resize-none"></textarea>
            </div>
          </form>
        )}

        {/* ================= 步驟 5：預約成功 ================= */}
        {step === 5 && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-20 h-20 bg-pink-50 text-pink-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">預約已送出！</h2>
            <p className="text-gray-500 mb-10 text-sm px-6">您的預約申請已通知美甲師，確定時段 ok 後，系統將透過官方 LINE 發送確認訊息給您。</p>
            <button onClick={resetFlow} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg">回到首頁</button>
          </div>
        )}
      </main>

      {/* 
        【底部固定操作列】
        fixed bottom-0: 死死釘在最下方
        max-w-md mx-auto: 高度契合大螢幕下的水平居中外殼
      */}
      {step === 3 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-5 border-t border-gray-50 flex items-center space-x-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          {/* truncate: 文字太長自動變點點點 (...) 的超級防禦防破版技巧 */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-1">已選項目</p>
            <p className="text-sm font-bold text-gray-700 truncate">{selectedProvider?.name} / {selectedService?.name}</p>
          </div>
          <button 
            onClick={handleGoToForm}
            disabled={!selectedDate || !selectedTime || isSlotsLoading}
            className={`px-8 py-4 rounded-2xl font-bold text-white transition-all ${(!selectedDate || !selectedTime || isSlotsLoading) ? 'bg-gray-200 cursor-not-allowed' : 'bg-pink-400 shadow-lg active:scale-95'}`}
          >
            填寫預約備註 ➔
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-5 border-t border-gray-50 flex items-center space-x-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-1">預約時間</p>
            <p className="text-sm font-bold text-gray-700 truncate">{selectedDate ? `${selectedDate.getMonth()+1}/${selectedDate.getDate()}` : ''} {selectedTime}</p>
          </div>
          <button 
            onClick={handleFinalSubmit}
            disabled={!customerData.name || !customerData.phone || isLoading}
            className={`px-8 py-4 rounded-2xl font-bold text-white transition-all ${(!customerData.name || !customerData.phone || isLoading) ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-900 shadow-lg active:scale-95'}`}
          >
            {isLoading ? '送出中...' : '確認預約 ➔'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingPage;