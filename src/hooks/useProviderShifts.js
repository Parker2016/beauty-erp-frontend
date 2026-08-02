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
     * 讓店長輸入年份、月份、預設上下班時間與固定公休幾幾，瞬間產生整月陣列並儲存
     */
    const batchGenerateMonthShifts = async ({ providerId, year, month, defaultStart = "11:30", defaultEnd = "20:00", restDaysOfWeek = [] }) => {
        if (!providerId) {
            alert("請先選擇美甲師！");
            return false;
        }

        setSaving(true);
        try {
            let batchItems = [];
            // 取得該月總天數 (利用 JS Date 的特性：傳入 0 代表取得上個月最後一天，即該月總天數)
            const daysInMonth = new Date(year, month, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                // 組裝成 YYYY-MM-DD
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                // 判斷這一天是不是固定公休 (0 代表週日，1 代表週一...)
                const dayOfWeek = new Date(dateStr).getDay();
                const isOff = restDaysOfWeek.includes(dayOfWeek);

                batchItems.push({
                    date: dateStr,
                    start_time: isOff ? null : defaultStart,
                    end_time: isOff ? null : defaultEnd,
                    is_off: isOff
                });
            }

            // 發送批次 API
            await adminService.batchSaveShifts({
                provider_id: providerId,
                shifts: batchItems
            });

            alert("✅ 整月排班批次產生成功！");
            return true;
        } catch (error) {
            console.error("批次排班失敗", error);
            alert("批次排班儲存失敗，請檢查網路。");
            return false;
        } finally {
            setSaving(false);
        }
    };

    /**
     * 3. 單日快速修改 (臨時調整某天上下班或請假)
     */
    const updateSingleShift = async (providerId, dateStr, shiftData) => {
        setSaving(true);
        try {
            // 因為後端 batch API 的 update_or_create 支援單筆或多筆，我們直接包裝帶入陣列即可
            await adminService.batchSaveShifts({
                provider_id: providerId,
                shifts: [{
                    date: dateStr,
                    is_off: shiftData.is_off,
                    start_time: shiftData.is_off ? null : shiftData.start_time,
                    end_time: shiftData.is_off ? null : shiftData.end_time,
                    break_times: shiftData.is_off ? [] : (shiftData.break_times || []) // 💡 確保這裡也有接收
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