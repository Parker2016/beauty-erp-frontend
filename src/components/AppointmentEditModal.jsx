// src/components/AppointmentEditModal.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/admin';

const AppointmentEditModal = ({ appointment, isOpen, onClose, onRefresh }) => {
    if (!isOpen || !appointment) return null;

    // 在彈窗內部獨立接管表單狀態
    const [formState, setFormState] = useState({
        status: '',
        start_time: '',
        final_price: '',
        materials_note: '',
        image_url: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // 當傳入的預約單改變時，重新初始化內部狀態
    useEffect(() => {
        setFormState({
            status: appointment.status || 'PENDING',
            start_time: appointment.start_time ? appointment.start_time.replace(' ', 'T').substring(0, 16) : '',
            final_price: appointment.final_price ?? '',
            materials_note: appointment.record?.materials_note || '',
            image_url: appointment.record?.image_url || ''
        });
        setError(null);
    }, [appointment]);

    const handleFieldChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        // 組裝完全對齊 Django 一對一/多對多巢狀更新的 Payload
        const payload = {
            status: formState.status,
            start_time: formState.start_time,
            final_price: formState.final_price === '' ? null : Number(formState.final_price),
            record: {
                materials_note: formState.materials_note,
                image_url: formState.image_url
            }
        };

        try {
            await adminService.updateAppointmentWithRecord(appointment.id, payload);
            onRefresh(); // 成功後通知外層（看板或資料表）重撈最新數據
            onClose();   // 關閉彈窗
        } catch (err) {
            setError(err.response?.data?.detail || '儲存失敗，請檢查資料格式或是否有時間碰撞。');
        } finally {
            setIsSaving(false);
        }
    };

    // 💡 1. 核心優化：動態推導系統原定價基準線（所有主服務總額 + 所有加購總額）
    const systemCalculatedTotal =
        (appointment.services?.reduce((sum, s) => sum + Number(s.price || 0), 0) || 0) +
        (appointment.addons?.reduce((sum, addon) => sum + Number(addon.price || 0), 0) || 0);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex justify-center items-center p-4 animate-fade-in text-left">
            <div className="absolute inset-0" onClick={onClose} />

            <form
                onSubmit={handleFormSubmit}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col animate-fade-in-up"
            >
                {/* 彈窗標頭 */}
                <div className="p-5 bg-gray-900 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-black">聯合編輯面板 (共享核心)</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                            預約單號 #{appointment.id} & 紀錄單號 {appointment.record?.id ? `#${appointment.record.id}` : '(尚未申報)'}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                {/* 滾動表單主體 */}
                <div className="p-5 space-y-6 overflow-y-auto flex-1">
                    {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold">{error}</div>}

                    {/* 第一部分：核心狀態與時間改價變更 */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-[#8c7654] uppercase tracking-wider border-l-4 border-[#8c7654] pl-2">
                            第一部分：預約單核心狀態
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* 顧客姓名 */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1">顧客姓名 (唯讀)</label>
                                <input
                                    type="text" disabled value={appointment.customer?.name || appointment.customer_name}
                                    className="w-full p-3 border border-gray-100 rounded-xl bg-gray-50 text-base sm:text-sm text-gray-400 cursor-not-allowed font-bold h-[48px]"
                                />
                            </div>

                            {/* 預約狀態變更 */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 mb-1">預約狀態變更</label>
                                <div className="relative w-full">
                                    <select
                                        value={formState.status}
                                        onChange={(e) => handleFieldChange('status', e.target.value)}
                                        className="w-full appearance-none p-3 pr-10 border border-gray-100 rounded-xl bg-gray-50 text-base sm:text-sm font-bold text-gray-700 focus:outline-none focus:border-[#8c7654] h-[48px] cursor-pointer"
                                    >
                                        <option value="PENDING">待確認</option>
                                        <option value="CONFIRMED">已確認</option>
                                        <option value="COMPLETED">✅ 施作已完成</option>
                                        <option value="CANCELLED">❌ 已取消預約</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* 調整預約時間輸入框 */}
                            <div>
                                <label className="block text-[11px] font-bold text-blue-800 mb-1">⏱ 變更預約時間</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formState.start_time}
                                    onChange={(e) => handleFieldChange('start_time', e.target.value)}
                                    className="w-full p-3 border border-blue-100 bg-blue-50/5 rounded-xl text-base sm:text-sm font-mono font-bold text-gray-700 focus:outline-none focus:border-blue-500 h-[48px] cursor-pointer"
                                />
                            </div>

                            {/* 現場實收改價 */}
                            <div>
                                <label className="block text-[11px] font-bold text-amber-800 mb-1">💸 本次實際收費 (現場改價)</label>
                                <input
                                    type="number"
                                    placeholder={`系統總原價: ${systemCalculatedTotal}`}
                                    value={formState.final_price}
                                    onChange={(e) => handleFieldChange('final_price', e.target.value)}
                                    className="w-full p-3 border border-amber-100 bg-amber-50/10 rounded-xl text-base sm:text-sm font-mono font-bold text-amber-900 focus:outline-none focus:border-amber-600 h-[48px]"
                                />
                            </div>
                        </div>

                        {/* 💡 2. 核心優化：多選主造型名稱串接展示 */}
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50 text-xs text-gray-500 space-y-1">
                            <p>🎨 <span className="font-bold text-gray-700">主預約造型：</span>
                                <span className="font-bold text-gray-800">
                                    {appointment.services && appointment.services.length > 0
                                        ? appointment.services.map(s => s.name).join(' ＋ ')
                                        : (appointment.service_name || '無指定項目')}
                                </span>
                            </p>
                            {appointment.addons && appointment.addons.length > 0 && (
                                <p>➕ <span className="font-bold text-gray-700">追加附加服務：</span>
                                    <span className="text-amber-800 font-bold">{appointment.addons.map(a => a.name).join(', ')}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-50" />

                    {/* 第二部分：施作紀錄 */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-pink-800 uppercase tracking-wider border-l-4 border-pink-500 pl-2">
                            第二部分：美甲施作紀錄 (Service Record)
                        </h4>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                                    凝膠品牌、特調色號與鑽飾紀錄 (選填)
                                </label>
                                <textarea
                                    rows="4"
                                    value={formState.materials_note}
                                    onChange={(e) => handleFieldChange('materials_note', e.target.value)}
                                    placeholder="例如：使用 Presto 24號底膠 ＋ 罐裝 Ageha 11號亮片..."
                                    className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs focus:outline-none focus:border-pink-400 resize-none leading-relaxed font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                                    完工作品成果照 URL (選填)
                                </label>
                                <input
                                    type="url"
                                    value={formState.image_url}
                                    onChange={(e) => handleFieldChange('image_url', e.target.value)}
                                    placeholder="https://my-s3-bucket.amazonaws.com/nails/photo.jpg"
                                    className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl text-xs font-mono focus:outline-none focus:border-pink-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 彈窗底部 */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-100">取消</button>
                    <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-black shadow-md transition-all active:scale-95 disabled:bg-gray-300">
                        {isSaving ? '同步至雲端中...' : '確認保存變更'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AppointmentEditModal;