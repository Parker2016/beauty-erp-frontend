// src/components/AppointmentWithRecordEditor.jsx
import React from 'react';
import { useAppointmentManagement } from '../hooks/useAppointmentManagement';
import AppointmentEditModal from './AppointmentEditModal';

const AppointmentWithRecordEditor = () => {
  const {
    appointments, loading, error, editingApp, setEditingApp, openEditModal
  } = useAppointmentManagement();

  if (loading && appointments.length === 0) return <div className="text-center py-12 text-sm text-gray-400 font-medium bg-[#fcfbfa]">資料同步中...</div>;

  const renderStatusBadge = (status) => {
    const mapping = {
      'CONFIRMED': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'PENDING': 'bg-amber-50 text-amber-600 border-amber-100',
      'COMPLETED': 'bg-blue-50 text-blue-600 border-blue-100',
      'CANCELLED': 'bg-gray-50 text-gray-400 border-gray-100',
    };
    const labelMapping = { 'CONFIRMED': '已確認', 'PENDING': '待確認', 'COMPLETED': '已完成', 'CANCELLED': '已取消' };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${mapping[status] || mapping['PENDING']}`}>
        {labelMapping[status] || '待確認'}
      </span>
    );
  };

  return (
    <div className="space-y-4 text-left">
      {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold">{error}</div>}

      {/* ==========================================
        💻 情況 A：電腦版專屬表格 (手機版 hidden)
        ========================================== */}
      <div className="hidden md:block overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-bold">
            <tr className="text-left border-b border-gray-100">
              <th className="p-4 w-20 text-center">預約編號</th>
              <th className="p-4">顧客姓名</th>
              <th className="p-4">施作項目與加購</th>
              <th className="p-4">預約時間</th>
              <th className="p-4">實收實付金額</th>
              <th className="p-4 w-24">狀態</th>
              <th className="p-4 text-right w-28">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {appointments.map(app => {
              // 💡 1. 核心計算修正：將所有主服務金額 ＋ 所有加購項目金額進行總合計算 (加裝 Number 轉型防禦)
              const systemTotal =
                (app.services?.reduce((sum, s) => sum + Number(s.price || 0), 0) || 0) +
                (app.addons?.reduce((sum, a) => sum + Number(a.price || 0), 0) || 0);

              return (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-center font-mono font-bold text-gray-400">#{app.id}</td>
                  <td className="p-4 font-bold text-gray-800">{app.customer?.name || app.customer_name}</td>
                  <td className="p-4">
                    {/* 💡 2. 名稱呈現修正：將多個主服務名稱用 ＋ 號串接呈現 */}
                    <span className="font-bold text-gray-700">
                      {app.services && app.services.length > 0
                        ? app.services.map(s => s.name).join(' ＋ ')
                        : (app.service_name || '無指定項目')}
                    </span>

                    {/* 加購項目標籤 */}
                    {app.addons && app.addons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.addons.map(addon => (
                          <span key={addon.id} className="text-[9px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.2 rounded font-medium">
                            ＋{addon.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-xs font-mono font-medium text-gray-500">
                    {app.start_time?.replace('T', ' ').substring(0, 16)}
                  </td>
                  <td className="p-4 font-mono font-bold text-amber-900">
                    {app.final_price !== null && app.final_price !== undefined ? (
                      <span>NT$ {app.final_price} <span className="text-[10px] font-normal text-amber-600 bg-amber-50 px-1 rounded">實收</span></span>
                    ) : (
                      <span className="text-gray-400 font-normal">NT$ {systemTotal} (基底定價)</span>
                    )}
                  </td>
                  <td className="p-4">{renderStatusBadge(app.status)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openEditModal(app)}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-sm"
                    >
                      編輯紀錄
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ==========================================
        📱 情況 B：手機版專屬高質感卡片清單 (同步對齊多選 services)
        ========================================== */}
      <div className="block md:hidden space-y-3">
        {appointments.map(app => {
          // 💡 1. 手機版同步升級：計算所有主服務 ＋ 加購項目的基底總價
          const systemTotal =
            (app.services?.reduce((sum, s) => sum + Number(s.price || 0), 0) || 0) +
            (app.addons?.reduce((sum, a) => sum + Number(a.price || 0), 0) || 0);

          // 💡 2. 手機版同步升級：主服務多選名稱串接
          const serviceNames =
            app.services && app.services.length > 0
              ? app.services.map(s => s.name).join(' ＋ ')
              : (app.service_name || '無指定項目');

          return (
            <div key={app.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-left flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-xs font-bold text-gray-400">#{app.id}</span>
                  <h4 className="font-black text-gray-800 text-base mt-0.5">{app.customer?.name || app.customer_name}</h4>
                </div>
                {renderStatusBadge(app.status)}
              </div>

              <div className="text-xs text-gray-500 space-y-1.5 mb-3">
                <div>
                  {/* 顯示主服務多選結果 */}
                  <p className="font-bold text-gray-800">💅 項目：{serviceNames}</p>
                  
                  {/* 加購項目標籤 */}
                  {app.addons && app.addons.length > 0 && (
                    <p className="text-[11px] text-amber-700 font-bold pl-5 mt-0.5">
                      加購：{app.addons.map(a => a.name).join(', ')}
                    </p>
                  )}
                </div>
                <p className="font-mono">⏱ 時間：{app.start_time?.replace('T', ' ').substring(0, 16)}</p>
                <p className="font-bold text-amber-900">
                  💰 實收：{app.final_price !== null && app.final_price !== undefined ? `NT$ ${app.final_price} (實收)` : `NT$ ${systemTotal} (基底定價)`}
                </p>
                <p className="truncate text-gray-400">🎨 紀錄：{app.record?.materials_note || '（目前無凝膠色號紀錄）'}</p>
              </div>

              <button
                onClick={() => openEditModal(app)}
                className="w-full py-2.5 bg-[#f4f1eb] text-[#8c7654] font-bold text-xs rounded-xl active:scale-95 transition-all"
              >
                開啟聯合編輯面板 ➔
              </button>
            </div>
          );
        })}
      </div>

      {/* ==========================================
        📦 情況 C：短路邏輯條件加載 (瓦解編譯器 Bug)
        ========================================== */}
      {editingApp && (
        <AppointmentEditModal
          isOpen={true}
          appointment={editingApp}
          onClose={() => setEditingApp(null)}
          onRefresh={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default AppointmentWithRecordEditor;