// src/pages/AdminDashboard.jsx
import React from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

const AdminDashboard = () => {
  const {
    stats, appointments, loading, weekDays,
    selectedAppointment, setSelectedAppointment, navigateWeek
  } = useAdminDashboard();

  // 輔助過濾：將後端撈回來的單維陣列，依據天數分類到對應的星期欄位
  const getAppointmentsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(app => app.start_time.startsWith(dateStr));
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-gray-800 p-4 md:p-8">
      {/* ================= 頂部導覽列 ================= */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Z. Studio 管理後台</h1>
          <p className="text-sm text-gray-400 mt-1">營運即時數據與預約行事曆面板</p>
        </div>
        
        {/* 週切換控制項 */}
        <div className="flex items-center space-x-2 bg-white border border-gray-100 p-1.5 rounded-xl shadow-sm">
          <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-gray-50 rounded-lg font-bold text-gray-400 hover:text-gray-700">←</button>
          <span className="text-sm font-bold px-3">週視圖</span>
          <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-gray-50 rounded-lg font-bold text-gray-400 hover:text-gray-700">→</button>
        </div>
      </header>

      {/* ================= 營收與指標看板列 (響應式 Grid) ================= */}
      {stats && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#f4f1eb] border border-[#e8e3d9] p-6 rounded-2xl">
            <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">今日營收 / 本月營業額</p>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl font-black text-[#8c7654]">NT$ {stats.revenue.today}</span>
              <span className="text-xs text-gray-400">/ 本月 NT$ {stats.revenue.month}</span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">今日總預約</p>
            <p className="text-2xl font-black text-gray-900 mt-2">{stats.today_counts.total} 筆</p>
          </div>
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">待確認 / 已確認</p>
            <p className="text-2xl font-black text-amber-600 mt-2">
              {stats.today_counts.pending} <span className="text-gray-300 font-light text-xl">/</span> <span className="text-emerald-600">{stats.today_counts.confirmed}</span>
            </p>
          </div>
        </section>
      )}

      {/* ================= 主工作區：左行事曆，右詳情面板 ================= */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* 左側：7天週曆欄位 (手機上自動變為單排向下延伸或橫向過濾，電腦上為寬軌 7 欄) */}
        <div className="flex-1 w-full bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-[700px] md:min-w-0">
            {weekDays.map((day, idx) => {
              const dayApps = getAppointmentsForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div key={idx} className={`flex flex-col min-h-[450px] rounded-2xl p-2 transition-all ${isToday ? 'bg-amber-50/40 border border-amber-200/50' : 'bg-gray-50/50'}`}>
                  {/* 天數標題標頭 */}
                  <div className="text-center pb-3 border-b border-gray-100/80 mb-3">
                    <p className="text-xs font-bold text-gray-300">週{['一','二','三','四','五','六','日'][idx]}</p>
                    <p className={`text-base font-black mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-700'}`}>
                      {day.getDate()}
                    </p>
                  </div>

                  {/* 當天預約卡片堆疊 */}
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] pr-1">
                    {dayApps.map(app => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppointment(app)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all active:scale-95 text-left
                          ${selectedAppointment?.id === app.id 
                            ? 'bg-[#cdbfa8] border-[#bcae97] text-white' 
                            : 'bg-white border-gray-100 hover:border-amber-200 shadow-sm'}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-black truncate max-w-[70px]">{app.customer.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase
                            ${app.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {app.status === 'CONFIRMED' ? '已確認' : '待確認'}
                          </span>
                        </div>
                        <p className={`text-[11px] font-medium tracking-wide truncate ${selectedAppointment?.id === app.id ? 'text-amber-5' : 'text-gray-400'}`}>
                          ⏱ {app.start_time.substring(11, 16)}
                        </p>
                        <p className="text-xs font-bold truncate mt-1">{app.service.name}</p>
                      </div>
                    ))}
                    {dayApps.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-200 text-[11px] font-medium">無預約</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 右側：預約詳情資訊面板 Drawer ================= */}
        <div className="w-full lg:w-80 shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-24">
          {selectedAppointment ? (
            <div className="animate-fade-in text-left">
              <div className="flex justify-between items-start border-b border-gray-50 pb-4 mb-4">
                <div>
                  <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">單號 #{selectedAppointment.id}</span>
                  <h3 className="text-xl font-black text-gray-800 mt-2">{selectedAppointment.customer.name}</h3>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg">已確認</span>
              </div>

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
                  <p className="font-bold text-gray-700 mt-0.5">{selectedAppointment.provider_name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-medium">預約備註</label>
                  <p className="text-xs text-gray-500 whitespace-pre-wrap bg-gray-50 p-3 rounded-xl mt-1 leading-relaxed border border-gray-100/30">
                    {selectedAppointment.memo || '無備註描述'}
                  </p>
                </div>
              </div>

              {/* 狀態切換按鈕組 */}
              <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-50">
                <button className="py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition-all">標記完成</button>
                <button className="py-2.5 border border-red-100 text-red-500 font-bold text-xs rounded-xl hover:bg-red-50 transition-all">標記未到</button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-300 font-medium text-sm">請點擊行事曆卡片<br />查看客戶預約詳情</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;