// src/components/AppointmentWithRecordEditor.jsx
import React from 'react';
import { useAppointmentManagement } from '../hooks/useAppointmentManagement';

const AppointmentWithRecordEditor = () => {
  const {
    appointments, loading, error, editingApp, setEditingApp,
    openEditModal, handleFieldChange, handleSaveSubmit
  } = useAppointmentManagement();

  if (loading && appointments.length === 0) return <div className="text-center py-12 text-sm text-gray-400 font-medium">資料同步中...</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold">{error}</div>}

      {/* ==========================================
        💻 情況 A：電腦版專屬表格 (手機版 hidden)
        ========================================== */}
      <div className="hidden md:block overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-bold">
            <tr className="text-left">
              <th className="p-4">預約編號</th>
              <th className="p-4">顧客姓名</th>
              <th className="p-4">施作項目</th>
              <th className="p-4">預約時間</th>
              <th className="p-4">狀態</th>
              <th className="p-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {appointments.map(app => (
              <tr key={app.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-mono font-bold text-gray-400">#{app.id}</td>
                <td className="p-4 font-bold text-gray-800">{app.customer?.name || app.customer_name}</td>
                <td className="p-4">{app.service?.name || app.service_name}</td>
                <td className="p-4 text-xs font-medium">
                  {app.start_time?.replace('T', ' ').substring(0, 16)}
                </td>
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold
                    ${app.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {app.status === 'CONFIRMED' ? '已確認' : '待確認'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => openEditModal(app)}
                    className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-gray-800 transition-all"
                  >
                    編輯紀錄
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==========================================
        📱 情況 B：手機版專屬高質感卡片清單 (電腦版 md:hidden)
        ========================================== */}
      <div className="block md:hidden space-y-3">
        {appointments.map(app => (
          <div key={app.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-left flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-mono text-xs font-bold text-gray-400">#{app.id}</span>
                <h4 className="font-black text-gray-800 text-base mt-0.5">{app.customer?.name || app.customer_name}</h4>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold
                ${app.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {app.status === 'CONFIRMED' ? '已確認' : '待確認'}
              </span>
            </div>

            <div className="text-xs text-gray-500 space-y-1 mb-3">
              <p>💅 項目：{app.service?.name || app.service_name}</p>
              <p>⏱ 時間：{app.start_time?.replace('T', ' ').substring(0, 16)}</p>
              <p className="truncate">🎨 紀錄：{app.record?.materials_note || '（目前無凝膠紀錄）'}</p>
            </div>

            <button
              onClick={() => openEditModal(app)}
              className="w-full py-2.5 bg-[#f4f1eb] text-[#8c7654] font-bold text-xs rounded-xl active:scale-95 transition-all"
            >
              開啟聯合編輯面板 ➔
            </button>
          </div>
        ))}
      </div>

      {/* ==========================================
        📦 情況 C：最高層級的聯合編輯彈窗 Drawer
        ========================================== */}
      {editingApp && (
        /* z-[60]: 確保絕對不會被手機版最底下的黑色導覽列擋住 */
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex justify-center items-center p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => setEditingApp(null)} />

          <form
            onSubmit={handleSaveSubmit}
            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col animate-fade-in-up"
          >
            {/* 彈窗標頭 */}
            <div className="p-5 bg-gray-900 text-white flex justify-between items-center">
              <div className="text-left">
                <h3 className="text-base font-black">聯合編輯面板</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  預約單號 #{editingApp.id} & 紀錄單號 {editingApp.record?.id ? `#${editingApp.record.id}` : '(尚未申報)'}
                </p>
              </div>
              <button type="button" onClick={() => setEditingApp(null)} className="text-gray-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            {/* 滾動表單主體 */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1 text-left">

              {/* 第一部分 */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#8c7654] uppercase tracking-wider border-l-4 border-[#8c7654] pl-2">
                  第一部分：預約單核心狀態
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 顧客姓名 */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">顧客姓名 (唯讀)</label>
                    <input
                      type="text"
                      disabled
                      value={editingApp.customer_name}
                      /* 💡 升級為 text-base sm:text-sm：防止 iOS 盲目自動放大畫面 */
                      className="w-full p-3 border border-gray-100 rounded-xl bg-gray-50 text-base sm:text-sm text-gray-400 cursor-not-allowed font-bold"
                    />
                  </div>

                  {/* 預約狀態 (已解毒版本) */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">預約狀態</label>

                    {/* 💡 靈魂外殼：利用 relative 奪回右側小箭頭的絕對控制權 */}
                    <div className="relative w-full">
                      <select
                        value={editingApp.status}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        className="w-full appearance-none p-3 pr-10 border border-gray-100 rounded-xl bg-gray-50 text-base sm:text-sm font-bold text-gray-700 focus:outline-none focus:border-[#8c7654] h-[48px] cursor-pointer transition-all"
                      >
                        <option value="PENDING">待確認</option>
                        <option value="CONFIRMED">已確認</option>
                        <option value="CANCELLED">已取消</option>
                      </select>

                      {/* 💡 自刻黃金右側小箭頭：外觀完全受你操控，手感極佳 */}
                      {/* pointer-events-none: 【極重要】讓滑鼠點擊可以穿透它，客人在手機大拇指按到箭頭時依然能順暢彈出選單 */}
                      <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-50" />

              {/* 第二部分（💡 對齊 Django Model 欄位命名：materials_note, image_url） */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-pink-800 uppercase tracking-wider border-l-4 border-pink-500 pl-2">第二部分：美甲施作紀錄 (Service Record)</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">凝膠品牌、特調色號與鑽飾紀錄 *</label>
                    <textarea
                      rows="4"
                      required
                      value={editingApp.record.materials_note}
                      onChange={(e) => handleFieldChange('materials_note', e.target.value, true)}
                      placeholder="例如：使用 Presto 24號底膠 ＋ 罐裝 Ageha 11號亮片。左手無名指鑲嵌施華洛世奇 V型水鑽3顆。指緣稍微乾燥，叮嚀客人洗完澡擦指緣油..."
                      className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs focus:outline-none focus:border-pink-400 resize-none leading-relaxed font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">完工作品成果照 URL (選填)</label>
                    <input
                      type="url"
                      value={editingApp.record.image_url}
                      onChange={(e) => handleFieldChange('image_url', e.target.value, true)}
                      placeholder="https://my-s3-bucket.amazonaws.com/nails/photo.jpg"
                      className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs font-mono focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* 彈窗底部 */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button type="button" onClick={() => setEditingApp(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-100">取消</button>
              <button type="submit" className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-black shadow-md transition-all active:scale-95">
                合併儲存變更
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};

export default AppointmentWithRecordEditor;