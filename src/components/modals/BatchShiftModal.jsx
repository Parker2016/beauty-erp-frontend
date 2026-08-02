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
    const [startTime, setStartTime] = useState('11:30');
    const [endTime, setEndTime] = useState('20:00');
    const [restDays, setRestDays] = useState([1]); // 預設週一公休

    if (!isOpen) return null;

    const handleRestDayToggle = (dayId) => {
        setRestDays(prev => 
            prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await batchGenerateMonthShifts({
            providerId: selectedProviderId,
            year: Number(year),
            month: Number(month),
            defaultStart: startTime,
            defaultEnd: endTime,
            restDaysOfWeek: restDays
        });

        if (success) {
            onSuccess(); // 重新整理父層的週曆
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-left animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">⚙️ 整月批次排班設定</h3>
                        <p className="text-xs text-gray-400 mt-0.5">為美甲師 <span className="font-bold text-gray-700">{providerName}</span> 快速產生整月班表</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 年月選擇 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">年份 (Year)</label>
                            <input 
                                type="number" 
                                value={year} 
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full p-2.5 text-xs border border-gray-200 rounded-xl font-bold focus:border-black focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">月份 (Month)</label>
                            <select 
                                value={month} 
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full p-2.5 text-xs border border-gray-200 rounded-xl font-bold focus:border-black focus:outline-none bg-white"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i+1} value={i+1}>{i+1} 月</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 上下班時間 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">預設上班時間</label>
                            <input 
                                type="time" 
                                value={startTime} 
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full p-2.5 text-xs border border-gray-200 rounded-xl font-mono font-bold focus:border-black focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">預設下班時間</label>
                            <input 
                                type="time" 
                                value={endTime} 
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full p-2.5 text-xs border border-gray-200 rounded-xl font-mono font-bold focus:border-black focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* 固定公休日勾選 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">固定公休日（可複選）</label>
                        <div className="flex flex-wrap gap-1.5">
                            {WEEKDAYS.map(day => {
                                const isSelected = restDays.includes(day.id);
                                return (
                                    <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => handleRestDayToggle(day.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            isSelected ? 'bg-black text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 按鈕群 */}
                    <div className="flex space-x-2 pt-4 border-t border-gray-100">
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
                            {saving ? '處理中...' : '🚀 一鍵產生整月班表'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchShiftModal;