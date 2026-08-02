// src/pages/ProviderSchedulePage.jsx
import React, { useState, useEffect } from 'react';
import { useProviderShifts } from '../hooks/useProviderShifts';
import { adminService } from '../services/admin';
import BatchShiftModal from '../components/modals/BatchShiftModal';
import SingleDayShiftModal from '../components/modals/SingleDayShiftModal';

const getWeekRange = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0],
        weekDates: [...Array(7)].map((_, i) => {
            const nextDay = new Date(monday);
            nextDay.setDate(monday.getDate() + i);
            return nextDay.toISOString().split('T')[0];
        })
    };
};

const ProviderSchedulePage = () => {
    const { shifts, loading, fetchShifts } = useProviderShifts();
    const [providers, setProviders] = useState([]);
    const [selectedProviderId, setSelectedProviderId] = useState('all'); // 💡 預設改為 'all'
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const weekInfo = getWeekRange(currentDate);

    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [editingDayInfo, setEditingDayInfo] = useState(null);

    // 1. 初始化撈取美甲師清單
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const res = await adminService.getProviders();
                const list = res.data || res;
                setProviders(list);
            } catch (err) {
                console.error("載入美甲師失敗");
            }
        };
        fetchProviders();
    }, []);

    // 2. 當美甲師或週間改變時撈取資料（如果選 'all'，後端會撈全部）
    useEffect(() => {
        fetchShifts({
            provider_id: selectedProviderId,
            start_date: weekInfo.start,
            end_date: weekInfo.end
        });
    }, [selectedProviderId, weekInfo.start, weekInfo.end, fetchShifts]);

    const handlePrevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };

    const handleNextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const selectedProvider = providers.find(p => p.id === Number(selectedProviderId));
    const refreshData = () => {
        fetchShifts({
            provider_id: selectedProviderId,
            start_date: weekInfo.start,
            end_date: weekInfo.end
        });
    };

    const dayNames = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

    return (
        <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm min-h-[600px] text-left">
            {/* 標題與操作列 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
                <div>
                    <h2 className="text-lg md:text-xl font-black text-gray-900">排班管理</h2>
                    <p className="text-xs text-gray-400 mt-1">管理每週工時、公休、休息時段與總表檢視</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* 下拉選單加入「全部美甲師」選項 */}
                    <select 
                        value={selectedProviderId} 
                        onChange={(e) => setSelectedProviderId(e.target.value)}
                        className="px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 focus:border-black focus:outline-none"
                    >
                        <option value="all">總表</option>
                        {providers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    {/* 只有在選取特定美甲師時才顯示「整月排班設定」按鈕 */}
                    {selectedProviderId !== 'all' && (
                        <button 
                            onClick={() => setIsBatchModalOpen(true)}
                            className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            ⚙️ 整月排班設定
                        </button>
                    )}
                </div>
            </div>

            {/* 週間切換控制列 */}
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl mb-6">
                <button onClick={handlePrevWeek} className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-100">◀ 上一週</button>
                <span className="text-xs font-black text-gray-800 font-mono">📅 {weekInfo.start} ~ {weekInfo.end}</span>
                <button onClick={handleNextWeek} className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-100">下一週 ▶</button>
            </div>

            {/* 💡 條件式渲染：當選取「全部美甲師」時顯示矩陣總表，否則顯示單一美甲師詳細週間卡片 */}
            {loading ? (
                <div className="p-12 text-center text-xs font-bold text-gray-400">載入排班資料中...</div>
            ) : selectedProviderId === 'all' ? (
                /* ================= 模式 A：全部美甲師矩陣總表 ================= */
                <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500">
                                <th className="p-3.5 pl-4 w-36">美甲師</th>
                                {weekInfo.weekDates.map((dateStr, idx) => (
                                    <th key={dateStr} className="p-3.5 text-center">
                                        <div>{dayNames[idx]}</div>
                                        <div className="text-[10px] font-mono font-normal text-gray-400">{dateStr.slice(5)}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                            {providers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-400">尚無美甲師資料</td>
                                </tr>
                            ) : (
                                providers.map(provider => (
                                    <tr key={provider.id} className="hover:bg-gray-50/50">
                                        <td className="p-3.5 pl-4 font-black text-gray-800 flex items-center space-x-2">
                                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">💅</span>
                                            <span>{provider.name}</span>
                                        </td>
                                        {weekInfo.weekDates.map(dateStr => {
                                            // 找出這位美甲師在這一天的排班
                                            const shiftData = shifts.find(s => s.provider === provider.id && s.date === dateStr);
                                            const isOff = shiftData ? shiftData.is_off : true;
                                            const startTime = shiftData?.start_time ? shiftData.start_time.slice(0, 5) : '';
                                            const endTime = shiftData?.end_time ? shiftData.end_time.slice(0, 5) : '';

                                            return (
                                                <td key={dateStr} className="p-2 text-center">
                                                    {isOff ? (
                                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-400 rounded-lg text-[11px] font-bold">
                                                            休假
                                                        </span>
                                                    ) : (
                                                        <div 
                                                            onClick={() => {
                                                                // 點擊矩陣格子可以直接切換到該美甲師或開啟編輯
                                                                setSelectedProviderId(provider.id);
                                                            }}
                                                            className="inline-block px-2.5 py-1 bg-green-50 border border-green-100 text-green-800 rounded-lg text-[11px] font-mono font-bold cursor-pointer hover:bg-green-100 transition-colors"
                                                            title="點擊切換至該美甲師詳細排班"
                                                        >
                                                            {startTime}-{endTime}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* ================= 模式 B：單一美甲師詳細週間卡片 (含工作/休息時間軸) ================= */
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {weekInfo.weekDates.map((dateStr, index) => {
                        const shiftData = shifts.find(s => s.date === dateStr);
                        const isOff = shiftData ? shiftData.is_off : true;
                        const startTime = shiftData?.start_time ? shiftData.start_time.slice(0, 5) : '11:30';
                        const endTime = shiftData?.end_time ? shiftData.end_time.slice(0, 5) : '20:00';
                        const breakTimes = shiftData?.break_times || [];
                        
                        // 時間軸切分邏輯
                        let timelineSegments = [];
                        if (!isOff) {
                            const sortedBreaks = [...breakTimes].sort((a, b) => a.start.localeCompare(b.start));
                            let currentTime = startTime;
                            
                            sortedBreaks.forEach(b => {
                                if (b.start > currentTime) {
                                    timelineSegments.push({ type: 'work', start: currentTime, end: b.start });
                                }
                                timelineSegments.push({ type: 'break', start: b.start, end: b.end });
                                currentTime = b.end > currentTime ? b.end : currentTime;
                            });

                            if (currentTime < endTime) {
                                timelineSegments.push({ type: 'work', start: currentTime, end: endTime });
                            }

                            if (timelineSegments.length === 0) {
                                timelineSegments.push({ type: 'work', start: startTime, end: endTime });
                            }
                        }

                        return (
                            <div 
                                key={dateStr}
                                className={`border rounded-2xl p-3 flex flex-col justify-between transition-all ${
                                    isOff ? 'bg-gray-50/60 border-gray-200 opacity-75' : 'bg-white border-gray-200 shadow-sm'
                                }`}
                            >
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-400">{dayNames[index]}</span>
                                        <span className="text-[11px] font-mono font-bold text-gray-600">{dateStr.slice(5)}</span>
                                    </div>

                                    <div className="my-2 space-y-1.5">
                                        {isOff ? (
                                            <div className="py-3 text-center bg-gray-200/60 rounded-xl text-xs font-black text-gray-500">
                                                💤 公休
                                            </div>
                                        ) : (
                                            timelineSegments.map((seg, sIdx) => (
                                                seg.type === 'work' ? (
                                                    <div key={sIdx} className="py-1.5 px-2 text-center bg-green-50 border border-green-100 rounded-lg">
                                                        <div className="text-[10px] text-green-600 font-bold">工作時間</div>
                                                        <div className="text-xs font-black text-green-800 font-mono">{seg.start} ~ {seg.end}</div>
                                                    </div>
                                                ) : (
                                                    <div key={sIdx} className="py-1.5 px-2 text-center bg-amber-50 border border-amber-200 rounded-lg">
                                                        <div className="text-[10px] text-amber-600 font-bold">休息時間</div>
                                                        <div className="text-xs font-black text-amber-800 font-mono">{seg.start} ~ {seg.end}</div>
                                                    </div>
                                                )
                                            ))
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setEditingDayInfo({ dateStr, shiftData: shiftData || { is_off: isOff } })}
                                    className="w-full py-1.5 text-xs font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-black hover:text-white transition-colors mt-2"
                                >
                                    ✏️ 編輯
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 批次排班 Modal */}
            <BatchShiftModal 
                isOpen={isBatchModalOpen}
                onClose={() => setIsBatchModalOpen(false)}
                selectedProviderId={selectedProviderId}
                providerName={selectedProvider?.name || ''}
                onSuccess={refreshData}
            />

            {/* 單日編輯 Modal */}
            <SingleDayShiftModal 
                isOpen={Boolean(editingDayInfo)}
                onClose={() => setEditingDayInfo(null)}
                providerId={selectedProviderId}
                dateStr={editingDayInfo?.dateStr}
                initialShiftData={editingDayInfo?.shiftData}
                onSuccess={refreshData}
            />
        </div>
    );
};

export default ProviderSchedulePage;