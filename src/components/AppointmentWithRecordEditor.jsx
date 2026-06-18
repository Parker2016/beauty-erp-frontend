// src/components/AppointmentWithRecordEditor.jsx
import React, { useState } from 'react';

const AppointmentWithRecordEditor = () => {
  // 模擬從後端撈出來的複合式預約資料 (已自動 select_related / prefetch_related 了它的 service_record)
  const [mockAppointments, setMockAppointments] = useState([
    {
      id: 101,
      customer_name: '周曉彤',
      service_name: '客製化手繪彩繪',
      start_time: '2026-06-10 12:30',
      status: 'CONFIRMED',
      // 這裡就是綁在一起的紀錄資料 (對應 Django 1:1 關聯)
      service_record: {
        id: 45,
        gel_brand_used: 'Presto 24號',
        nail_condition: '指緣稍微乾燥，有輕微甘皮增生',
        photo_url: 'https://example.com/nails/101.jpg'
      }
    }
  ]);

  const [editingApp, setEditingApp] = useState(null); // 當前正在彈窗編輯的預約

  // 處理表單欄位變更 (支援同時改預約單與服務紀錄)
  const handleRecordChange = (field, value, isNestedRecord = false) => {
    setEditingApp(prev => {
      if (isNestedRecord) {
        return {
          ...prev,
          service_record: { ...prev.service_record, [field]: value }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSave = () => {
    // 未來這裡直接丟給 adminService.updateAppointmentWithRecord(editingApp.id, editingApp)
    alert(`儲存成功！已同步更新預約單 #${editingApp.id} 與服務紀錄 #${editingApp.service_record.id}`);
    
    // 同步更新本地狀態列表
    setMockAppointments(prev => prev.map(item => item.id === editingApp.id ? editingApp : item));
    setEditingApp(null); // 關閉彈窗
  };

  return (
    <div className="space-y-4">
      {/* 預約管理表格 */}
      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-bold">
            <tr>
              <th className="p-4">預約編號</th>
              <th className="p-4">顧客姓名</th>
              <th className="p-4">施作項目</th>
              <th className="p-4">預約時間</th>
              <th className="p-4">狀態</th>
              <th className="p-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockAppointments.map(app => (
              <tr key={app.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-mono font-bold text-gray-400">#{app.id}</td>
                <td className="p-4 font-bold text-gray-800">{app.customer_name}</td>
                <td className="p-4">{app.service_name}</td>
                <td className="p-4 text-xs font-medium">{app.start_time}</td>
                <td className="p-4">
                  <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded-md font-bold">已確認</span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => setEditingApp(JSON.parse(JSON.stringify(app)))} // 深拷貝防止未保存就污染原始數據
                    className="text-xs bg-[#8c7654] text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#736144] transition-all"
                  >
                    編輯預約與紀錄
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= 終極綁定編輯彈窗 (Modal Drawer) ================= */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            
            {/* 彈窗標頭 */}
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black">聯合編輯面板</h3>
                <p className="text-xs text-gray-400 mt-0.5">預約單號 #{editingApp.id} & 服務紀錄 #{editingApp.service_record.id}</p>
              </div>
              <button onClick={() => setEditingApp(null)} className="text-gray-400 hover:text-white font-bold text-xl">✕</button>
            </div>

            {/* 滾動表單主體 */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-left">
              
              {/* 第一部分：預約基本資料修改 */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider border-l-4 border-amber-600 pl-2">第一部分：預約單核心狀態</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">預約時間</label>
                    <input type="text" value={editingApp.start_time} onChange={(e) => handleRecordChange('start_time', e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 font-mono text-xs focus:outline-none focus:border-[#8c7654]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">預約狀態</label>
                    <select value={editingApp.status} onChange={(e) => handleRecordChange('status', e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#8c7654]">
                      <option value="PENDING">待確認</option>
                      <option value="CONFIRMED">已確認</option>
                      <option value="COMPLETED">已完成</option>
                      <option value="CANCELLED">已取消</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* 第二部分：服務紀錄 (ServiceRecord) 聯合編輯 */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-pink-800 uppercase tracking-wider border-l-4 border-pink-500 pl-2">第二部分：美甲施作紀錄 (Service Record)</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">本次使用凝膠品牌/色號</label>
                    <input 
                      type="text" 
                      value={editingApp.service_record.gel_brand_used} 
                      onChange={(e) => handleRecordChange('gel_brand_used', e.target.value, true)} // 標記為 Nested
                      placeholder="例如：Presto 24號, Ageha 亮片膠" 
                      className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs focus:outline-none focus:border-pink-400" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">美甲與指緣健康備註</label>
                    <textarea 
                      rows="3"
                      value={editingApp.service_record.nail_condition} 
                      onChange={(e) => handleRecordChange('nail_condition', e.target.value, true)} 
                      placeholder="紀錄客人的指甲厚薄、是否有飛甲或需要特別注意的皮膚狀況..." 
                      className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs focus:outline-none focus:border-pink-400 resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">作品照雲端網址</label>
                    <input 
                      type="text" 
                      value={editingApp.service_record.photo_url} 
                      onChange={(e) => handleRecordChange('photo_url', e.target.value, true)} 
                      placeholder="https://..." 
                      className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs font-mono focus:outline-none focus:border-pink-400" 
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* 彈窗底部的操作條 */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button onClick={() => setEditingApp(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100">取消</button>
              <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-black shadow-md transition-all">合併儲存變更</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentWithRecordEditor;