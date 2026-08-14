// src/components/modals/BatchShiftModal.jsx
import React, { useState } from 'react';
import { useProviderShifts } from '../../hooks/useProviderShifts';

const WEEKDAYS = [
    { id: 1, label: '週一' },
    { id: 2, label: '週二' },
    { id: 3, label: '週三' },
    { id: 4, label: '週四' },
    { id: 5, label: '週五' },
    { id: 6, label: '週六' },
    { id: 0, label: '週日' },
];

const BatchShiftModal = ({ isOpen, onClose, selectedProviderId, providerName, onSuccess }) => {
    const { batchGenerateMonthShifts, saving } = useProviderShifts();
    
    // 預設帶入當前年月
    const currentDate = new Date();
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth() + 1);

    // 週一至週日獨立週常態設定
    const [weeklySchedule, setWeeklySchedule] = useState({
        1: { isOff: false, startTime: '11:30', endTime: '20:00', breakTimes: [] },
        2: { isOff: false, startTime: '11:30', endTime: '20:00', breakTimes: [] },
        3: { isOff: false, startTime: '11:30', endTime: '20:00', breakTimes: [] },
        4: { isOff: false, startTime: '11:30', endTime: '20:00', breakTimes: [] },
        5: { isOff: false, startTime: '11:30', endTime: '20:00', breakTimes: [] },
        6: { isOff: false, startTime: '11:30', endTime: '18:00', breakTimes: [] },
        0: { isOff: true,  startTime: '11:30', endTime: '18:00', breakTimes: [] }, // 預設週日公休
    });

    if (!isOpen) return null;

    // 切換某天的公休狀態
    const handleToggleOff = (dayId) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                isOff: !prev[dayId].isOff
            }
        }));
    };

    // 變更某天的上班或下班時間
    const handleTimeChange = (dayId, field, value) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                [field]: value
            }
        }));
    };

    // 新增該天的休息時段
    const handleAddBreakTime = (dayId) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                breakTimes: [
                    ...prev[dayId].breakTimes,
                    { start: '14:00', end: '15:00' }
                ]
            }
        }));
    };

    // 刪除該天的特定休息時段
    const handleRemoveBreakTime = (dayId, index) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                breakTimes: prev[dayId].breakTimes.filter((_, i) => i !== index)
            }
        }));
    };

    // 修改該天特定休息時段的時間
    const handleBreakTimeChange = (dayId, index, field, value) => {
        setWeeklySchedule(prev => {
            const updated = [...prev[dayId].breakTimes];
            updated[index][field] = value;
            return {
                ...prev,
                [dayId]: {
                    ...prev[dayId],
                    breakTimes: updated
                }
            };
        });
    };

    // 送出表單：展開整月班表
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const y = Number(year);
        const m = Number(month);
        const daysInMonth = new Date(y, m, 0).getDate();
        
        const shifts = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(y, m - 1, d);
            const dayOfWeek = dateObj.getDay();
            const dayConfig = weeklySchedule[dayOfWeek];

            const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            
            const breaks = (!dayConfig.isOff && dayConfig.breakTimes && dayConfig.breakTimes.length > 0)
                ? dayConfig.breakTimes
                    .filter(b => b.start && b.end)
                    .map(b => ({
                        start: b.start,
                        end: b.end,
                        start_time: b.start,
                        end_time: b.end
                    }))
                : [];

            shifts.push({
                date: dateStr,
                is_off: dayConfig.isOff,
                start_time: dayConfig.isOff ? null : dayConfig.startTime,
                end_time: dayConfig.isOff ? null : dayConfig.endTime,
                break_times: breaks
            });
        }

        const success = await batchGenerateMonthShifts({
            providerId: selectedProviderId,
            shifts: shifts
        });

        if (success) {
            onSuccess();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl text-left animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col my-auto">
                
                {/* 頂部標題 */}
                <div className="flex justify-between items-start pb-3 border-b border-gray-100 shrink-0">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">⚙️ 整月週範本批次排班</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            為人員 <span className="font-bold text-gray-700">{providerName}</span> 設定週常態班表並自動套用整月
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
                    
                    {/* 1. 年月份選擇 */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">目標年份</label>
                            <input 
                                type="number" 
                                value={year} 
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full p-2.5 text-xs border border-gray-200 rounded-xl font-bold bg-white focus:border-black focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">目標月份</label>
                            <select 
                                value={month} 
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full p-2.5 text-xs border border-gray-200 rounded-xl font-bold bg-white focus:border-black focus:outline-none cursor-pointer"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i+1} value={i+1}>{i+1} 月</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 2. 週一至週日 7 天獨立編輯列表 */}
                    <div className="space-y-3">
                        {WEEKDAYS.map((day) => {
                            const config = weeklySchedule[day.id];
                            return (
                                <div 
                                    key={day.id} 
                                    className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                                        config.isOff 
                                            ? 'bg-gray-50/70 border-gray-200' 
                                            : 'bg-white border-gray-200 shadow-xs'
                                    }`}
                                >
                                    {/* 第一列：星期標籤 ＋ 燈號切換按鈕 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800">
                                                {day.label}
                                            </span>
                                            {config.isOff && (
                                                <span className="text-[11px] text-gray-400 font-bold">
                                                    整日不開放預約
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleToggleOff(day.id)}
                                            className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all ${
                                                config.isOff
                                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                            }`}
                                        >
                                            {config.isOff ? '✕ 當日公休' : '✓ 正常營業'}
                                        </button>
                                    </div>

                                    {/* 營業時間與休息時段 (非公休時顯示) */}
                                    {!config.isOff && (
                                        <>
                                            {/* 上下班時間 (Grid 2 欄完整呈現) */}
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-1">上班時間</label>
                                                    <input 
                                                        type="time" 
                                                        value={config.startTime} 
                                                        onChange={(e) => handleTimeChange(day.id, 'startTime', e.target.value)}
                                                        className="w-full p-2 text-xs border border-gray-200 rounded-xl font-mono font-bold bg-white focus:border-black focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-1">下班時間</label>
                                                    <input 
                                                        type="time" 
                                                        value={config.endTime} 
                                                        onChange={(e) => handleTimeChange(day.id, 'endTime', e.target.value)}
                                                        className="w-full p-2 text-xs border border-gray-200 rounded-xl font-mono font-bold bg-white focus:border-black focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* 自訂休息時段 (支援橫向滑動 overflow-x-auto) */}
                                            <div className="pt-1">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <label className="text-[11px] font-bold text-gray-500">自訂休息時段 (選填)</label>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleAddBreakTime(day.id)}
                                                        className="text-[11px] font-bold text-blue-600 hover:underline"
                                                    >
                                                        ＋ 新增休息段
                                                    </button>
                                                </div>

                                                {config.breakTimes.length === 0 ? (
                                                    <p className="text-[11px] text-gray-400 italic bg-gray-50 p-2 rounded-xl border border-dashed border-gray-200 text-center">
                                                        無額外休息時段
                                                    </p>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        {config.breakTimes.map((bt, index) => (
                                                            <div 
                                                                key={index} 
                                                                className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-200 overflow-x-auto whitespace-nowrap"
                                                            >
                                                                <input 
                                                                    type="time" 
                                                                    value={bt.start} 
                                                                    onChange={(e) => handleBreakTimeChange(day.id, index, 'start', e.target.value)}
                                                                    className="p-1.5 text-xs border border-gray-200 rounded-lg font-mono font-bold bg-white focus:border-black focus:outline-none"
                                                                />
                                                                <span className="text-xs text-gray-400 shrink-0">至</span>
                                                                <input 
                                                                    type="time" 
                                                                    value={bt.end} 
                                                                    onChange={(e) => handleBreakTimeChange(day.id, index, 'end', e.target.value)}
                                                                    className="p-1.5 text-xs border border-gray-200 rounded-lg font-mono font-bold bg-white focus:border-black focus:outline-none"
                                                                />
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleRemoveBreakTime(day.id, index)}
                                                                    className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5 shrink-0"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* 3. 送出按鈕 */}
                    <div className="flex space-x-2 pt-4 border-t border-gray-100 shrink-0">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            取消
                        </button>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="flex-1 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                        >
                            {saving ? '處理中...' : `🚀 一鍵產生 ${month} 月班表`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchShiftModal;