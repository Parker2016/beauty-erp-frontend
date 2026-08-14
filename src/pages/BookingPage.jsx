// src/pages/BookingPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { useLiffAuth } from '../hooks/useLiffAuth';

// 💡 模組級全域鎖：獨立於 React 生命週期與 State 重繪之外，0 毫秒同步卡死連點
let isGlobalSubmitting = false;

const BookingPage = () => {
  const { liffUser, isLiffLoading } = useLiffAuth();

  // 從自訂 Hook 解構出全域狀態與控制大腦
  const {
    providers, services, isLoading, isSubmitting, error, step, setStep,
    selectedProvider, selectedServices, selectedAddons,
    availableSlots, isSlotsLoading, fetchAvailableSlots,
    submitCustomerData, selectProvider, toggleService, confirmServicesAndGoToAddons,
    toggleAddon, confirmAddonsAndGoToCalendar, submitBooking, resetFlow, goBack
  } = useBookingFlow();

  // ==========================================
  // 步驟 1：本地客戶表單暫存狀態 (姓名預設保持空白，由客人手動填寫真實姓名)
  // ==========================================
  const [localForm, setLocalForm] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    memo: ''
  });

  // 💡 修正：移除預填 LINE 顯示名稱 (liffUser.name)，僅在有取得 Email 時自動帶入 Email
  useEffect(() => {
    if (liffUser.email && !localForm.email) {
      setLocalForm(prev => ({ ...prev, email: liffUser.email }));
    }
  }, [liffUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalForm(prev => ({ ...prev, [name]: value }));
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!localForm.name.trim() || !localForm.phone.trim()) {
      alert('請填寫姓名與電話！');
      return;
    }
    submitCustomerData(localForm);
  };

  // ==========================================
  // 步驟 5：月曆與時間定錨狀態
  // ==========================================
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  // 核心連動：步驟 5 (選日期) 自動呼叫 Django 計算多服務空檔
  useEffect(() => {
    if (step === 5 && selectedDate && selectedProvider && selectedServices.length > 0) {
      setSelectedTime('');

      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      fetchAvailableSlots(selectedProvider.id, formattedDate);
    }
  }, [selectedDate, selectedProvider, selectedServices, step, fetchAvailableSlots]);

  // 業務分類篩選器
  const mainServices = useMemo(() => {
    return services.filter(s => !s.is_addon && s.category !== 'ADDON');
  }, [services]);

  const addonServices = useMemo(() => {
    return services.filter(s => s.is_addon || s.category === 'ADDON');
  }, [services]);

  const handServices = mainServices.filter(s => s.category === 'HAND');
  const footServices = mainServices.filter(s => s.category === 'FOOT');
  const pureRemovalServices = mainServices.filter(s => s.category === 'PURE_REMOVAL');
  const earServices = mainServices.filter(s => s.category === 'EAR');

  // 月曆矩陣核心計算
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

  // ==========================================
  // 終極送出核銷 (原生 DOM + 模組鎖雙重防護)
  // ==========================================
  const handleFinalSubmit = async (e) => {
    // 🛑 1. 第一道防線：模組級全域鎖 (0 毫秒攔截第二次點擊)
    if (isGlobalSubmitting) {
      console.warn('⛔ [防爆鎖] 手動連點被模組鎖攔截！');
      return;
    }

    isGlobalSubmitting = true;

    // 🛑 2. 第二道防線：DOM 節點物理切斷 (讓瀏覽器直接無視所有後續滑鼠點擊)
    const btnTarget = e.currentTarget;
    if (btnTarget) {
      btnTarget.style.pointerEvents = 'none';
      btnTarget.setAttribute('disabled', 'true');
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const startDateTime = `${year}-${month}-${day}T${selectedTime}:00`;

      const isSuccess = await submitBooking(startDateTime, liffUser);

      // 預約失敗時解鎖，允許客人更換時段重試
      if (!isSuccess) {
        isGlobalSubmitting = false;
        if (btnTarget) {
          btnTarget.style.pointerEvents = 'auto';
          btnTarget.removeAttribute('disabled');
        }
      }
    } catch (err) {
      isGlobalSubmitting = false;
      if (btnTarget) {
        btnTarget.style.pointerEvents = 'auto';
        btnTarget.removeAttribute('disabled');
      }
    }
  };

  // 重置流程時，同步解開全域鎖
  const handleResetFlow = () => {
    isGlobalSubmitting = false;
    resetFlow();
  };

  // 全螢幕同步 Loading 阻斷器
  if (isLoading && step === 1) {
    return <div className="min-h-screen flex justify-center items-center text-[#8c7654] font-bold bg-[#fcfbfa]">沙龍行事曆同步中...</div>;
  }

  if (isLiffLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-[#8c7654] font-bold bg-[#fcfbfa] space-y-3">
        <div className="w-8 h-8 border-4 border-[#8c7654] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs">正在安全驗證您的 LINE 身分...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative pb-28 shadow-2xl text-left">

      {/* 🔒 全螢幕霧面鎖定遮罩 */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white animate-fade-in px-6 pointer-events-none select-none">
          <div className="bg-gray-900/90 p-6 rounded-2xl flex flex-col items-center space-y-3 shadow-2xl border border-white/10 max-w-xs text-center">
            <div className="w-9 h-9 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-sm font-black tracking-wide">正在為您鎖定預約時段...</p>
            <p className="text-[11px] text-gray-300 font-medium leading-relaxed">請勿關閉或重新整理頁面，確保排班順序</p>
          </div>
        </div>
      )}

      {/* 頂部導覽列 */}
      <header className="bg-white p-5 text-center shadow-sm sticky top-0 z-10 flex items-center border-b border-gray-50">
        {step > 1 && step < 6 && (
          <button onClick={goBack} className="absolute left-5 text-gray-400 hover:text-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <h1 className="text-base font-black text-gray-800 flex-1 tracking-wider">Z. Studio 線上預約</h1>
        <span className="absolute right-5 text-[10px] font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Step {step}/6</span>
      </header>

      {/* 互斥防護：只有在非成功頁面 (step < 6) 且有錯誤時，才渲染紅色錯誤提示 */}
      {error && step < 6 && (
        <div className="m-4 p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold leading-relaxed border border-red-100/60 animate-shake">
          {error}
        </div>
      )}

      <main className="p-5">

        {/* ================= 步驟 1：填寫個人基本資料 ================= */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4 animate-fade-in-up">
            <div>
              <h2 className="text-lg font-black text-gray-800">填寫預約聯絡人資訊</h2>
              <p className="text-xs text-gray-400 mt-0.5">請填寫正確真實資料，以便 LINE 通知管線對接</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">姓名 <span className="text-red-400">*</span></label>
              <input type="text" name="name" required value={localForm.name} onChange={handleInputChange} placeholder="請輸入您的真實姓名" className="w-full p-3 border border-gray-100 rounded-xl focus:outline-none focus:border-[#8c7654] bg-gray-50 text-sm font-medium" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">手機號碼 <span className="text-red-400">*</span></label>
              <input type="tel" name="phone" required value={localForm.phone} onChange={handleInputChange} placeholder="0912345678" className="w-full p-3 border border-gray-100 rounded-xl focus:outline-none focus:border-[#8c7654] bg-gray-50 text-sm font-mono" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">電子信箱</label>
              <input type="email" name="email" value={localForm.email} onChange={handleInputChange} placeholder="example@gmail.com (選填)" className="w-full p-3 border border-gray-100 rounded-xl focus:outline-none focus:border-[#8c7654] bg-gray-50 text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">生日當月好禮推播</label>
              <input type="date" name="birthday" value={localForm.birthday} onChange={handleInputChange} className="w-full p-3 border border-gray-100 rounded-xl focus:outline-none focus:border-[#8c7654] bg-gray-50 text-sm text-gray-700 font-medium" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 block">給美甲師的客製備註</label>
              <textarea name="memo" rows="3" value={localForm.memo} onChange={handleInputChange} placeholder="若有特定的美甲形狀喜好，或指甲邊緣有傷口需要小心，請在此告知..." className="w-full p-3 border border-gray-100 rounded-xl focus:outline-none focus:border-[#8c7654] bg-gray-50 text-sm resize-none leading-relaxed"></textarea>
            </div>

            <button type="submit" className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs shadow-md hover:bg-black transition-all active:scale-95 pt-4">
              下一頁：選擇指定美甲師 ➔
            </button>
          </form>
        )}

        {/* ================= 步驟 2：選擇美甲師 (選誰) ================= */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in-up">
            <div>
              <h2 className="text-lg font-black text-gray-800">請選擇擔當美甲師</h2>
              <p className="text-xs text-gray-400 mt-0.5">點擊頭像即可直接指派</p>
            </div>
            {providers.map((p) => (
              <div
                key={p.id} onClick={() => selectProvider(p)}
                className="flex items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm cursor-pointer hover:border-[#8c7654] transition-all active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-[#f4f1eb] text-[#8c7654] font-black flex items-center justify-center text-lg mr-4 shadow-inner">{p.name.charAt(0)}</div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-gray-800">{p.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{p.is_manager ? '店長' : '美甲師'}</p>
                </div>
                <div className="text-gray-300 font-bold text-xs">➔</div>
              </div>
            ))}
          </div>
        )}

        {/* ================= 步驟 3：選擇主要項目 (Booking What - 可複選) ================= */}
        {step === 3 && selectedProvider && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-lg font-black text-gray-800">想預約什麼服務呢？ (可複選)</h2>
              <p className="text-xs text-gray-400 mt-0.5">已指定服務人員：{selectedProvider.name}</p>
            </div>

            {[
              { title: "手部美甲", list: handServices },
              { title: "足部美甲", list: footServices },
              { title: "純保養/純卸甲", list: pureRemovalServices },
              { title: "采耳", list: earServices || [] } // 🆕 新增采耳分類群組
            ].map((group, gIdx) => group.list && group.list.length > 0 && (
              <div key={gIdx} className="space-y-2">
                <h3 className="text-xs font-black text-[#8c7654] tracking-wider bg-[#f4f1eb]/60 px-3 py-1.5 rounded-lg w-max">
                  {group.title}
                </h3>
                <div className="space-y-2.5">
                  {group.list.map((s) => {
                    const isChecked = selectedServices.some(item => item.id === s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => toggleService(s)}
                        className={`p-4 border rounded-xl shadow-sm cursor-pointer select-none transition-all active:scale-98 flex flex-col text-left
                  ${isChecked ? 'border-[#8c7654] bg-[#fdfbf7] shadow-md ring-1 ring-[#8c7654]' : 'border-gray-100 bg-white'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all
                      ${isChecked ? 'bg-[#8c7654] border-[#8c7654] text-white' : 'border-gray-200 bg-gray-50'}`}>
                              {isChecked && <span className="text-[10px]">✓</span>}
                            </div>
                            <h4 className="text-sm font-black text-gray-800">{s.name}</h4>
                          </div>
                          <span className="text-sm font-black text-[#8c7654]">
                            {s.price_type === 'QUOTE' ? '現場報價' : s.price_type === 'STARTING' ? `NT$ ${s.price} 起` : `NT$ ${s.price}`}
                          </span>
                        </div>
                        {s.description && <p className="text-xs text-gray-400 mt-1 pl-6 leading-relaxed">{s.description}</p>}
                        <div className="text-[10px] text-gray-400 font-bold mt-2 pl-6">⏱ 施作需時 {s.duration_minutes} 分鐘</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={confirmServicesAndGoToAddons}
              className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs shadow-md hover:bg-black transition-all active:scale-95"
            >
              下一步：加購項目 ({selectedServices.length} 項已選) ➔
            </button>
          </div>
        )}

        {/* ================= 步驟 4：加購項目選填 (可不選) ================= */}
        {step === 4 && selectedServices.length > 0 && (
          <div className="space-y-4 animate-fade-in-up">
            <div>
              <h2 className="text-lg font-black text-gray-800">需要額外加購服務嗎？</h2>
              <p className="text-xs text-gray-400 mt-0.5">無加購需求請直接點選下方下一步按鈕</p>
            </div>

            {addonServices.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {addonServices.map((addon) => {
                  const isChecked = selectedAddons.some(item => item.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`p-4 border rounded-xl cursor-pointer select-none transition-all active:scale-98 flex items-center justify-between
                        ${isChecked ? 'border-amber-300 bg-amber-50/10 shadow-sm' : 'border-gray-100 bg-white'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all
                          ${isChecked ? 'bg-[#8c7654] border-[#8c7654] text-white' : 'border-gray-200 bg-gray-50'}`}>
                          {isChecked && <span className="text-[10px]">✓</span>}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-gray-800">{addon.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">⏱ ＋{addon.duration_minutes} 分鐘</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-700">＋NT$ {addon.price}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-300 text-xs font-medium">這位美甲師目前沒有開放可選的加購項目喔。</div>
            )}

            <button
              type="button"
              onClick={confirmAddonsAndGoToCalendar}
              className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs shadow-md hover:bg-black transition-all active:scale-95"
            >
              下一步：前往挑選可預約時段 ➔
            </button>
          </div>
        )}

        {/* ================= 步驟 5：選擇日期與時間空檔 ================= */}
        {step === 5 && selectedServices.length > 0 && (
          <div className="animate-fade-in-up">
            <h2 className="text-base font-black text-gray-800 mb-4">挑選預約日期與時間</h2>

            {/* 月曆切換控制器 */}
            <div className="flex justify-between items-center mb-4 text-xs font-bold bg-gray-50 p-2 rounded-xl border border-gray-100/50">
              <div className="flex items-center space-x-2">
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 text-gray-400 hover:text-gray-700">&lt;</button>
                <span className="text-gray-800">{currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月</span>
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 text-gray-400 hover:text-gray-700">&gt;</button>
              </div>
              <button type="button" onClick={() => { setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today); }} className="text-[#8c7654]">定位今天</button>
            </div>

            {/* 星期排頭 */}
            <div className="grid grid-cols-7 mb-2 text-center text-gray-300 font-bold text-[10px] uppercase">
              {['一', '二', '三', '四', '五', '六', '日'].map(d => <div key={d}>{d}</div>)}
            </div>

            {/* 日期格子網格 */}
            <div className="grid grid-cols-7 gap-y-2 mb-6">
              {calendarDays.map((dateObj, i) => {
                if (!dateObj) return <div key={i} />;
                const active = isSameDate(dateObj, selectedDate);
                const past = isPast(dateObj);
                return (
                  <div key={i} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => !past && setSelectedDate(dateObj)}
                      disabled={past}
                      className={`w-9 h-9 rounded-full font-bold transition-all text-xs flex items-center justify-center
                        ${active ? 'bg-gray-900 text-white shadow-md' : past ? 'text-gray-200 cursor-not-allowed' : 'text-gray-700 hover:bg-[#f4f1eb]'}`}
                    >
                      {dateObj.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 當天可用時間按鈕渲染流 */}
            {selectedDate && (
              <div className="mt-4 border-t border-gray-50 pt-4">
                <p className="text-gray-400 text-xs mb-3 font-medium">
                  📅 {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 可指派時間空檔
                </p>

                {isSlotsLoading ? (
                  <div className="text-center py-6 text-[#8c7654] font-bold animate-pulse text-xs">
                    正在即時同步多主服務與加購總工時之防撞班表...
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-2.5 rounded-xl border font-bold transition-all text-xs font-mono
                          ${selectedTime === time ? 'border-[#8c7654] bg-[#f4f1eb] text-[#8c7654]' : 'border-gray-100 bg-white text-gray-500 hover:border-amber-200'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-400 text-xs px-4 leading-relaxed border border-gray-100/50">
                    抱歉！當天因加上多項服務工時，剩餘空檔不足 😭<br />請嘗試更換日期或其他時段！
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= 步驟 6：預約完美完結成功畫面 ================= */}
        {step === 6 && (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">✓</div>
            <h2 className="text-xl font-black text-gray-800 mb-2">預約申請已送出！</h2>
            <p className="text-xs text-gray-500 mb-8 px-4 leading-relaxed">
              美甲師確認時段無誤後，系統將自動透過官方 LINE 向您發送「已確認」通知信！
            </p>
            <button onClick={handleResetFlow} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs shadow-md hover:bg-black transition-all active:scale-95">
              關閉頁面並返回首頁
            </button>
          </div>
        )}
      </main>

      {/* ==========================================
        📱 底部懸浮固定結帳條列 (動態按鈕 + Spinner + 多重鎖定)
        ========================================== */}
      {step === 5 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-100 flex items-center space-x-3 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] z-40">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-bold mb-0.5 uppercase tracking-wider">總預約內容摘要</p>
            <p className="text-xs font-black text-gray-700 truncate">
              {selectedServices.map(s => s.name).join(' ＋ ')}
              {selectedAddons.length > 0 && ` (加購: ${selectedAddons.map(a => a.name).join(', ')})`}
            </p>
            <p className="text-[11px] font-mono text-[#8c7654] font-bold mt-0.5">
              {selectedDate ? `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}` : ''} {selectedTime || '⏱ 未選時段'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={!selectedDate || !selectedTime || isSlotsLoading || isSubmitting}
            className={`px-5 py-3.5 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center space-x-2 shrink-0
              ${(!selectedDate || !selectedTime || isSlotsLoading || isSubmitting)
                ? 'bg-gray-200 cursor-not-allowed opacity-75 pointer-events-none'
                : 'bg-[#8c7654] shadow-md active:scale-95 hover:bg-[#7a6648]'}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>時段鎖定中...</span>
              </>
            ) : (
              <span>確認預約送出 ➔</span>
            )}
          </button>
        </div>
      )}

    </div>
  );
};

export default BookingPage;