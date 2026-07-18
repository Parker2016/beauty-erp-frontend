// src/components/AdminCalendarView.jsx
import React, { useState, useEffect } from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

const AdminCalendarView = () => {
  const {
    stats, appointments, loading, weekDays,
    selectedAppointment, setSelectedAppointment, navigateWeek
  } = useAdminDashboard();

  const [activeMobileDayIdx, setActiveMobileDayIdx] = useState(0);

  useEffect(() => {
    if (weekDays && weekDays.length > 0) {
      const todayStr = new Date().toDateString();
      const todayIdx = weekDays.findIndex(day => day.toDateString() === todayStr);
      setActiveMobileDayIdx(todayIdx !== -1 ? todayIdx : 0);
    }
  }, [weekDays]);

  const getAppointmentsForDay = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(app => app.start_time.startsWith(dateStr));
  };

  if (loading && weekDays.length === 0) return <div className="text-center py-20 text-sm text-gray-400">行事曆同步中...</div>;

  return (
    <div className="animate-fade-in">
      {/* ================= 1. 內頁週切換控制項 ================= */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">營運看板中心</h2>
          <p className="text-xs text-gray-400 mt-0.5">即時店務數據與預約碰撞防禦排班表</p>
        </div>

        <div className="flex items-center space-x-2 bg-white border border-gray-100 p-1 rounded-xl shadow-sm w-full sm:w-auto justify-between sm:justify-start">
          <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-gray-50 rounded-lg font-bold text-xs text-gray-400 hover:text-gray-700">← 上一週</button>
          <span className="text-xs font-bold px-3">週視圖</span>
          <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-gray-50 rounded-lg font-bold text-xs text-gray-400 hover:text-gray-700">下一週 →</button>
        </div>
      </header>

      {/* ================= 2. 營收指標列 ================= */}
      {stats && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mb-6 text-left">
          <div className="bg-[#f4f1eb] border border-[#e8e3d9] p-4 md:p-6 rounded-2xl">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider uppercase">今日營收 / 本月營業額</p>
            <div className="flex items-baseline space-x-2 mt-1 md:mt-2">
              <span className="text-xl md:text-2xl font-black text-[#8c7654]">NT$ {stats.revenue.today}</span>
              <span className="text-[10px] md:text-xs text-gray-400">/ 月 NT$ {stats.revenue.month}</span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-2xl shadow-sm flex sm:flex-col justify-between sm:justify-start items-center sm:items-start">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider uppercase">今日總預約</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 mt-0 sm:mt-2">{stats.today_counts.total} 筆</p>
          </div>
          <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-2xl shadow-sm flex sm:flex-col justify-between sm:justify-start items-center sm:items-start">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider uppercase">待確認 / 已確認</p>
            <p className="text-xl md:text-2xl font-black text-amber-600 mt-0 sm:mt-2">
              {stats.today_counts.pending} <span className="text-gray-300 font-light text-lg">/</span> <span className="text-emerald-600">{stats.today_counts.confirmed}</span>
            </p>
          </div>
        </section>
      )}

      {/* ================= 3. 主工作區 ================= */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* 左側：週曆核心 */}
        <div className="flex-1 w-full bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">

          {/* 📱 手機版 7 天頁籤 */}
          <div className="grid grid-cols-7 gap-1 bg-gray-50 p-1 rounded-xl mb-4 md:hidden">
            {weekDays.map((day, idx) => {
              const isSelected = activeMobileDayIdx === idx;
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMobileDayIdx(idx)}
                  className={`flex flex-col items-center py-2 rounded-lg transition-all ${isSelected ? 'bg-white text-gray-900 shadow-sm font-black' : 'text-gray-400'}`}
                >
                  <span className="text-[10px] scale-90">{['一', '二', '三', '四', '五', '六', '日'][idx]}</span>
                  <span className={`text-xs mt-0.5 w-5 h-5 flex items-center justify-center rounded-full ${isToday && !isSelected ? 'bg-amber-100 text-amber-800 font-bold' : ''} ${isToday && isSelected ? 'bg-amber-600 text-white' : ''}`}>
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 💻/📱 行事曆柵格容器 */}
          <div className="block md:grid md:grid-cols-7 md:gap-4">
            {weekDays.map((day, idx) => {
              const dayApps = getAppointmentsForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={idx}
                  className={`flex-col min-h-0 md:min-h-[450px] rounded-2xl p-0 md:p-2 transition-all 
                    ${activeMobileDayIdx === idx ? 'flex' : 'hidden md:flex'}
                    ${isToday ? 'md:bg-amber-50/40 md:border md:border-amber-200/50' : 'md:bg-gray-50/50'}`}
                >
                  <div className="hidden md:block text-center pb-3 border-b border-gray-100/80 mb-3">
                    <p className="text-xs font-bold text-gray-300">週{['一', '二', '三', '四', '五', '六', '日'][idx]}</p>
                    <p className={`text-base font-black mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-700'}`}>
                      {day.getDate()}
                    </p>
                  </div>

                  <div className="flex-1 space-y-2 md:overflow-y-auto md:max-h-[400px] pr-0 md:pr-1">
                    {dayApps.map(app => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppointment(app)}
                        className={`p-3.5 md:p-3 rounded-xl border cursor-pointer transition-all active:scale-95 text-left ${selectedAppointment?.id === app.id ? 'bg-[#cdbfa8] border-[#bcae97] text-white shadow-md' : 'bg-white border-gray-100 hover:border-amber-200 shadow-sm'}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm md:text-xs font-black truncate max-w-[120px] md:max-w-[70px]">{app.customer.name}</p>
                          <span className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${app.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} ${selectedAppointment?.id === app.id ? '!bg-white/20 !text-white' : ''}`}>
                            {app.status === 'CONFIRMED' ? '已確認' : '待確認'}
                          </span>
                        </div>
                        <p className={`text-xs md:text-[11px] font-medium tracking-wide truncate ${selectedAppointment?.id === app.id ? 'text-amber-50' : 'text-gray-400'}`}>⏱ {app.start_time.substring(11, 16)}</p>
                        <p className="text-sm md:text-xs font-bold truncate mt-1">{app.service.name}</p>
                      </div>
                    ))}
                    {dayApps.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 md:h-32 text-gray-300 text-xs md:text-[11px] font-medium">🎉 這天完全空檔</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側 / 手機浮出：詳情面板 */}
        {selectedAppointment && (
          /* 
            💡 關鍵修正點：將原先的 z-50 升級為 z-[60] 
            這樣抽屜白底本體就會完美騎在底部導覽列（z-50）的上方，按鈕重見天日！
          */
          <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center animate-fade-in lg:static lg:bg-transparent lg:z-auto lg:flex-initial lg:w-80 lg:shrink-0">

            {/* 手機版點擊灰色遮罩區自動關閉詳情 */}
            <div className="absolute inset-0 lg:hidden" onClick={() => setSelectedAppointment(null)} />

            {/* 實際抽屜白底本體 */}
            {/* 💡 視覺細節優化：在手機版底端追加 pb-10（Padding-Bottom），防止無邊框手機（如 iPhone FaceID 系列）底部的黑條安全區去撞到按鈕 */}
            <div className="relative w-full max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl p-6 pb-10 lg:pb-6 shadow-2xl transition-all duration-300 lg:w-full lg:max-h-none lg:rounded-3xl lg:border lg:border-gray-100 lg:shadow-sm lg:sticky lg:top-24 text-left">

              {/* 手機版頂部小拉條裝飾 */}
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 lg:hidden" />

              <div className="flex justify-between items-start border-b border-gray-50 pb-4 mb-4">
                <div>
                  <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">單號 #{selectedAppointment.id}</span>
                  <h3 className="text-xl font-black text-gray-800 mt-2">{selectedAppointment.customer.name}</h3>
                </div>

                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full lg:hidden font-bold"
                >
                  ✕
                </button>
              </div>

              {/* 中間主要資訊 (不變) */}
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-gray-400 block font-medium">聯絡電話</label>
                  <p className="font-bold text-gray-700 mt-0.5">{selectedAppointment.customer.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                  <label className="text-xs text-gray-400 block font-medium">預約項目</label>
                  <p className="font-black text-gray-800 text-base mt-0.5">{selectedAppointment.service.name}</p>
                  <div className="flex justify-between items-center mt-3 text-xs text-gray-500 pt-2 border-t border-gray-200/50">
                    <span>⏱ {selectedAppointment.service.duration_minutes} 分鐘</span>
                    <span className="font-black text-amber-700 text-sm">NT$ {selectedAppointment.service.price}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-medium">擔當美甲師</label>
                  <p className="font-bold text-gray-700 mt-0.5">{selectedAppointment.provider_name || '未指定'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-medium">預約備註</label>
                  <p className="text-xs text-gray-500 whitespace-pre-wrap bg-gray-50 p-3 rounded-xl mt-1 leading-relaxed border border-gray-100/30">
                    {selectedAppointment.memo || '無備註描述'}
                  </p>
                </div>
              </div>

              {/* 狀態切換按鈕組：現在這裡會完美浮在導覽列上方，超級好按！ */}
              <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-50">
                <button className="py-3 lg:py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition-all active:scale-95">標記完成</button>
                <button className="py-3 lg:py-2.5 border border-red-100 text-red-500 font-bold text-xs rounded-xl hover:bg-red-50 transition-all active:scale-95">標記未到</button>
              </div>
            </div>
          </div>
        )}

        {!selectedAppointment && (
          <div className="hidden lg:block w-80 shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center py-20 text-gray-300 font-medium text-sm sticky top-24">請點擊行事曆卡片<br />查看客戶預約詳情</div>
        )}

      </div>
    </div>
  );
};

export default AdminCalendarView;