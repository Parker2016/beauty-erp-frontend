// src/components/modals/SingleDayShiftModal.jsx
import React, { useState, useEffect } from 'react';
import { useProviderShifts } from '../../hooks/useProviderShifts';

const SingleDayShiftModal = ({ isOpen, onClose, providerId, dateStr, initialShiftData, onSuccess }) => {
    const { updateSingleShift, saving } = useProviderShifts();

    const [isOff, setIsOff] = useState(false);
    const [startTime, setStartTime] = useState('11:30');
    const [endTime, setEndTime] = useState('20:00');
    const [breakTimes, setBreakTimes] = useState([]); // [{start: '14:00', end: '15:00'}]

    // 當 Modal 打開或日期變動時，載入該天的現有資料
    useEffect(() => {
        if (initialShiftData) {
            setIsOff(initialShiftData.is_off || false);
            setStartTime(initialShiftData.start_time ? initialShiftData.start_time.slice(0, 5) : '11:30');
            setEndTime(initialShiftData.end_time ? initialShiftData.end_time.slice(0, 5) : '20:00');
            setBreakTimes(initialShiftData.break_times || []);
        } else {
            setIsOff(false);
            setStartTime('11:30');
            setEndTime('20:00');
            setBreakTimes([]);
        }
    }, [initialShiftData, isOpen]);

    if (!isOpen) return null;

    // 新增一個休息時段欄位
    const handleAddBreakTime = () => {
        setBreakTimes([...breakTimes, { start: '14:00', end: '15:00' }]);
    };

    // 刪除特定休息時段
    const handleRemoveBreakTime = (index) => {
        setBreakTimes(breakTimes.filter((_, i) => i !== index));
    };

    // 修改特定休息時段的時間
    const handleBreakTimeChange = (index, field, value) => {
        const updated = [...breakTimes];
        updated[index][field] = value;
        setBreakTimes(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await updateSingleShift(providerId, dateStr, {
            is_off: isOff,
            start_time: isOff ? null : startTime,
            end_time: isOff ? null : endTime,
            break_times: isOff ? [] : breakTimes
        });

        if (success) {
            onSuccess();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-left animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">✏️ 調整單日班表</h3>
                        <p className="text-xs text-gray-400 mt-0.5">日期：<span className="font-bold text-gray-700">{dateStr}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 是否公休開關 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-700">當日是否公休？</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isOff} 
                                onChange={(e) => setIsOff(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </label>
                    </div>

                    {!isOff && (
                        <>
                            {/* 上下班時間 */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">上班時間</label>
                                    <input 
                                        type="time" 
                                        value={startTime} 
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full p-2.5 text-xs border border-gray-200 rounded-xl font-mono font-bold focus:border-black focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">下班時間</label>
                                    <input 
                                        type="time" 
                                        value={endTime} 
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full p-2.5 text-xs border border-gray-200 rounded-xl font-mono font-bold focus:border-black focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* 當日自訂休息時段 (Break Times) */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold text-gray-600">當日自訂休息時段 (選填)</label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddBreakTime}
                                        className="text-[11px] font-bold text-blue-600 hover:underline"
                                    >
                                        ＋ 新增休息段
                                    </button>
                                </div>

                                {breakTimes.length === 0 ? (
                                    <p className="text-[11px] text-gray-400 italic bg-gray-50 p-2.5 rounded-xl border border-dashed border-gray-200 text-center">
                                        目前無額外休息時段（正常連續上班）
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                        {breakTimes.map((bt, index) => (
                                            <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                                                <input 
                                                    type="time" 
                                                    value={bt.start} 
                                                    onChange={(e) => handleBreakTimeChange(index, 'start', e.target.value)}
                                                    className="p-1.5 text-xs border border-gray-200 rounded-lg font-mono font-bold bg-white"
                                                />
                                                <span className="text-xs text-gray-400">至</span>
                                                <input 
                                                    type="time" 
                                                    value={bt.end} 
                                                    onChange={(e) => handleBreakTimeChange(index, 'end', e.target.value)}
                                                    className="p-1.5 text-xs border border-gray-200 rounded-lg font-mono font-bold bg-white"
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveBreakTime(index)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5"
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
                            {saving ? '儲存中...' : '儲存變更'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SingleDayShiftModal;