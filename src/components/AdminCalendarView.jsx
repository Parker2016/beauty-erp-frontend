// src/components/AdminCalendarView.jsx
import React, { useState, useEffect } from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import AppointmentEditModal from './AppointmentEditModal'; 

const AdminCalendarView = () => {
  const {
    stats, appointments, loading, weekDays,
    selectedAppointment, setSelectedAppointment, navigateWeek,
    refreshData
  } = useAdminDashboard();

  const [activeMobileDayIdx, setActiveMobileDayIdx] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const renderStatusBadge = (status) => {
    const mapping = {
      'CONFIRMED': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'PENDING': 'bg-amber-50 text-amber-600 border-amber-100',
      'COMPLETED': 'bg-blue-50 text-blue-600 border-blue-100',
      'CANCELLED': 'bg-gray-50 text-gray-400 border-gray-100',
    };
    const labelMapping = { 'CONFIRMED': '已確認', 'PENDING': '待確認', 'COMPLETED': '已完成', 'CANCELLED': '已取消' };
    return (
      <span className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${mapping[status] || mapping['PENDING']}`}>
        {labelMapping[status] || '待確認'}
      </span>
    );
  };

  // 💡 在抽屜點選渲染前先動態計算選中項目的「總時長」與「總定價」
  // 總時長（所有主服務 + 所有加購）
const totalDuration = selectedAppointment
  ? (selectedAppointment.services?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0) + 
    (selectedAppointment.addons?.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) || 0)
  : 0;

// 系統預設總價（所有主服務 + 所有加購）
const systemTotal = selectedAppointment
  ? (selectedAppointment.services?.reduce((sum, s) => sum + Number(s.price || 0), 0) || 0) + 
    (selectedAppointment.addons?.reduce((sum, a) => sum + Number(a.price || 0), 0) || 0)
  : 0;

  if (loading && weekDays.length === 0) return <div className="text-center py-20 text-sm text-gray-400">行事曆同步中...</div>;

  return (
    <div className="animate-fade-in text-left">
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
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mb-6">
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

        {/* 左側：週曆核心網格 */}
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

          {/* 💻/📱 行事曆網格 */}
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
                    {dayApps.map(app => {
                      const isCurrentSelected = selectedAppointment?.id === app.id;
                      return (
                        <div
                          key={app.id}
                          onClick={() => setSelectedAppointment(app)}
                          className={`p-3.5 md:p-3 rounded-xl border cursor-pointer transition-all active:scale-95 text-left 
                            ${isCurrentSelected ? 'bg-[#cdbfa8] border-[#bcae97] text-white shadow-md' : 'bg-white border-gray-100 hover:border-amber-200 shadow-sm'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-sm md:text-xs font-black truncate max-w-[120px] md:max-w-[70px]">{app.customer?.name || app.customer_name}</p>
                            <div className={isCurrentSelected ? '!bg-white/10 rounded-md text-white' : ''}>
                              {renderStatusBadge(app.status)}
                            </div>
                          </div>
                          <p className={`text-xs md:text-[11px] font-mono font-medium tracking-wide ${isCurrentSelected ? 'text-amber-50' : 'text-gray-400'}`}>
                            ⏱ {app.start_time.substring(11, 16)}
                          </p>
                          <p className="text-sm md:text-xs font-bold truncate mt-1">{app.service?.name || app.service_name}</p>
                          
                          {app.addons && app.addons.length > 0 && (
                            <span className={`text-[9px] font-bold px-1 py-0.2 rounded mt-1 inline-block ${isCurrentSelected ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>
                              ＋{app.addons.length} 加購
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {dayApps.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 md:h-32 text-gray-300 text-xs md:text-[11px] font-medium">🎉 這天完全空檔</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側 / 手機浮出：精簡唯讀摘要面板 */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center animate-fade-in lg:static lg:bg-transparent lg:z-auto lg:flex-initial lg:w-80 lg:shrink-0">
            <div className="absolute inset-0 lg:hidden" onClick={() => setSelectedAppointment(null)} />

            <div className="relative w-full max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl p-6 pb-10 lg:pb-6 shadow-2xl transition-all duration-300 lg:w-full lg:max-h-none lg:rounded-3xl lg:border lg:border-gray-100 lg:shadow-sm lg:sticky lg:top-24">
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 lg:hidden" />

              <div className="flex justify-between items-start border-b border-gray-50 pb-4 mb-4">
                <div>
                  <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">單號 #{selectedAppointment.id}</span>
                  <h3 className="text-xl font-black text-gray-800 mt-2">{selectedAppointment.customer?.name || selectedAppointment.customer_name}</h3>
                </div>
                <button onClick={() => setSelectedAppointment(null)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full lg:hidden font-bold">✕</button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center bg-gray-50 p-2.5 px-3 rounded-xl border border-gray-100/50">
                  <span className="text-xs text-gray-400 font-bold">預約狀態</span>
                  {renderStatusBadge(selectedAppointment.status)}
                </div>

                <div>
                  <label className="text-xs text-gray-400 block font-medium">聯絡電話</label>
                  <p className="font-bold text-gray-700 mt-0.5 font-mono">{selectedAppointment.customer?.phone || selectedAppointment.customer_phone || '無資料'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50 space-y-2">
                  <label className="text-xs text-gray-400 block font-medium">服務明細與加購</label>
                  <p className="font-black text-gray-800 text-base">{selectedAppointment.service?.name || selectedAppointment.service_name}</p>
                  
                  {selectedAppointment.addons && selectedAppointment.addons.length > 0 && (
                    <div className="text-xs text-amber-800 font-bold bg-amber-50/60 p-2 rounded-lg space-y-0.5">
                      {selectedAppointment.addons.map(a => <p key={a.id}>＋ {a.name} (NT$ {a.price})</p>)}
                    </div>
                  )}

                  {/* 💡 核心優化：將原先錯位的文案一拆為二，清晰展示總時長與對帳金額 */}
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-200/50">
                    <span>⏱ 總計施作時長</span>
                    <span className="font-bold text-gray-700 font-mono">{totalDuration} 分鐘</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>💰 實收 / 預估收費</span>
                    <span className="font-black text-amber-900 text-sm font-mono">
                      {selectedAppointment.final_price !== null && selectedAppointment.final_price !== undefined 
                        ? `實收 NT$ ${selectedAppointment.final_price}` 
                        : `預估 NT$ ${systemTotal}`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block font-medium">擔當美甲師</label>
                  <p className="font-bold text-gray-700 mt-0.5">{selectedAppointment.provider_name || '未指定'}</p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 block font-medium">客戶留言與備註</label>
                  <p className="text-xs text-gray-500 whitespace-pre-wrap bg-gray-50 p-3 rounded-xl mt-1 leading-relaxed border border-gray-100/30">
                    {selectedAppointment.memo || '無備註描述'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full py-3.5 bg-gray-900 text-white font-bold text-xs rounded-xl shadow-md hover:bg-black transition-all active:scale-95 text-center block pt-4"
                >
                  ⚡ 開啟聯合編輯 / 現場結帳 ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedAppointment && (
          <div className="hidden lg:block w-80 shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center py-20 text-gray-300 font-medium text-sm sticky top-24">請點擊行事曆卡片<br />查看客戶預約詳情</div>
        )}

      </div>

      {/* ==========================================
        📦 共享模組：短路邏輯條件加載 (瓦解編譯器 Bug)
        ========================================== */}
      {isEditModalOpen && (
        <AppointmentEditModal
          isOpen={true}
          appointment={selectedAppointment}
          onClose={() => setIsEditModalOpen(false)}
          onRefresh={refreshData}
        />
      )}

    </div>
  );
};

export default AdminCalendarView;