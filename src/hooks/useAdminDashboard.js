// src/hooks/useAdminDashboard.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminService } from '../services/admin';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 管理當前行事曆定錨的日期 (預設為今天)
  const [currentDate, setCurrentDate] = useState(new Date());
  // 記錄業主當前點擊選中的預約項目 (用於右側抽屜或側邊欄)
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // 輔助函式：計算給定日期所在那一週的週一與週日 (YYYY-MM-DD)
  const getWeekRange = useCallback((date) => {
    const current = new Date(date);
    const day = current.getDay();
    // 調整星期天 (0 改為 7) 讓星期一成為一週的第一天
    const distanceToMonday = day === 0 ? -6 : 1 - day; 
    
    const monday = new Date(current.setDate(current.getDate() + distanceToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (d) => d.toISOString().split('T')[0];
    return { monday: formatDate(monday), sunday: formatDate(sunday) };
  }, []);

  // 取得當前週的 7 個天數陣列，供 UI 畫出星期一到日
  const weekDays = useMemo(() => {
    const { monday } = getWeekRange(currentDate);
    const start = new Date(monday);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate, getWeekRange]);

  // 刷新核心看板與行事曆數據
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { monday, sunday } = getWeekRange(currentDate);
      
      // Concurrency 併發：同時發送營收統計與行事曆區間請求
      const [statsRes, calendarRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getCalendarAppointments(monday, sunday)
      ]);
      
      setStats(statsRes);
      setAppointments(calendarRes);
      
      // 預設將第一筆預約設為選中狀態 (仿截圖右側面板預設有資料)
      if (calendarRes.length > 0 && !selectedAppointment) {
        setSelectedAppointment(calendarRes[0]);
      }
    } catch (err) {
      setError('載入後台數據失敗，請檢查後端連線。');
    } finally {
      setLoading(false);
    }
  }, [currentDate, getWeekRange, selectedAppointment]);

  // 當日期定錨改變時，自動重新載入該週資料
  useEffect(() => {
    fetchDashboardData();
  }, [currentDate]);

  // 切換週的方法
  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + direction * 7);
      return next;
    });
  };

  return {
    stats,
    appointments,
    loading,
    error,
    currentDate,
    weekDays,
    selectedAppointment,
    setSelectedAppointment,
    navigateWeek,
    refreshData: fetchDashboardData
  };
};