// src/hooks/useProviderShifts.js
import { useState, useCallback } from 'react';
import { adminService } from '../services/admin';

export const useProviderShifts = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    /**
     * 1. 取得指定條件的排班資料 (週間或整月)
     * @param {Object} params - { provider_id, start_date, end_date }
     */
    const fetchShifts = useCallback(async (params) => {
        setLoading(true);
        try {
            const res = await adminService.getShifts(params);
            const data = res.data || res;
            setShifts(data);
        } catch (error) {
            console.error("載入班表失敗", error);
            alert("載入班表失敗！");
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 2. 整月批次排班 (核心功能)
     * 支援直接傳入 shifts 陣列 (支援週一至週日獨立範本)，或傳入年月參數自動產生
     */
    const batchGenerateMonthShifts = async ({
        providerId,
        shifts: incomingShifts, // 💡 優先接收前端已產生的班表陣列
        year,
        month,
        defaultStart = "11:00",
        defaultEnd = "19:00",
        restDaysOfWeek = []
    }) => {
        if (!providerId) {
            alert("請先選擇服務人員！");
            return false;
        }

        setSaving(true);
        try {
            let batchItems = [];

            // 💡 情況 A：前端 Modal 已經依據週範本產生好 shifts 陣列，直接使用
            if (incomingShifts && Array.isArray(incomingShifts) && incomingShifts.length > 0) {
                batchItems = incomingShifts;
            } 
            // 💡 情況 B：向下相容舊寫法（傳入年月與單一時間）
            else if (year && month) {
                const daysInMonth = new Date(year, month, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateObj = new Date(year, month - 1, day);
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayOfWeek = dateObj.getDay();
                    const isOff = restDaysOfWeek.includes(dayOfWeek);

                    batchItems.push({
                        date: dateStr,
                        start_time: isOff ? null : defaultStart,
                        end_time: isOff ? null : defaultEnd,
                        is_off: isOff,
                        break_times: []
                    });
                }
            } else {
                alert("缺少排班資料或年月參數！");
                return false;
            }

            // 發送批次 API（呼叫後端 bulk_update/bulk_create 最佳化後的 endpoint）
            await adminService.batchSaveShifts({
                provider_id: providerId,
                shifts: batchItems
            });

            alert("✅ 整月排班批次產生成功！");
            return true;
        } catch (error) {
            console.error("批次排班失敗", error);
            alert("批次排班儲存失敗，請檢查網路連線。");
            return false;
        } finally {
            setSaving(false);
        }
    };

    /**
     * 3. 單日快速修改 (臨時調整某天上下班、休息時段或請假)
     */
    const updateSingleShift = async (providerId, dateStr, shiftData) => {
        setSaving(true);
        try {
            await adminService.batchSaveShifts({
                provider_id: providerId,
                shifts: [{
                    date: dateStr,
                    is_off: shiftData.is_off,
                    start_time: shiftData.is_off ? null : shiftData.start_time,
                    end_time: shiftData.is_off ? null : shiftData.end_time,
                    break_times: shiftData.is_off ? [] : (shiftData.break_times || [])
                }]
            });
            return true;
        } catch (error) {
            console.error("單日班表更新失敗", error);
            alert("更新失敗！");
            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        shifts,
        loading,
        saving,
        fetchShifts,
        batchGenerateMonthShifts,
        updateSingleShift
    };
};