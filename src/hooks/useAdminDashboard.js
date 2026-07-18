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

  // 💡 修正地雷一：使用安全的原生本地時間格式化，徹底抹除 UTC 減 8 小時的破版地雷
  const safeFormatDate = useCallback((d) => {
    const year = d.getFullYear();
    // getMonth 預設從 0 開始，所以必須外加 1，並用 padStart 補足兩位數
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 輔助函式：計算給定日期所在那一週的週一與週日
  const getWeekRange = useCallback((date) => {
    const current = new Date(date);
    const day = current.getDay();
    // 調整星期天 (0 改為 7) 讓星期一成為一週的第一天
    const distanceToMonday = day === 0 ? -6 : 1 - day; 
    
    const monday = new Date(current.setDate(current.getDate() + distanceToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return { monday: safeFormatDate(monday), sunday: safeFormatDate(sunday) };
  }, [safeFormatDate]);

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
  // 💡 修正地雷二：依賴項拔除 selectedAppointment，讓 Fetch 函式回歸純粹，中斷死循環誘因
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
    } catch (err) {
      setError('載入後台數據失敗，請檢查後端連線。');
    } finally {
      setLoading(false);
    }
  }, [currentDate, getWeekRange]);

  // 當日期定錨改變時，自動重新載入該週資料
  useEffect(() => {
    fetchDashboardData();
  }, [currentDate, fetchDashboardData]);

  // ==========================================
  // 💡 核心補強：獨立管轄「自動預選」的職責分離狀態機
  // ==========================================
  useEffect(() => {
    // 只有當後端撈回來的預約單有資料，而且「當前是大螢幕電腦版」時，才允許自動勾選第一筆
    if (appointments.length > 0) {
      if (window.innerWidth >= 1024) {
        setSelectedAppointment(appointments[0]);
      } else {
        // 📱 如果是手機版，一切換回來必須強制歸零 null，防止抽屜盲目跳出
        setSelectedAppointment(null);
      }
    } else {
      setSelectedAppointment(null);
    }
  }, [appointments]); // 僅在預約單陣列重新整理時觸發檢查

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