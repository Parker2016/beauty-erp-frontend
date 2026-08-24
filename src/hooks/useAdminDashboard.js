// src/hooks/useAdminDashboard.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminService } from '../services/admin'; 
import { useAuth } from './useAuth';

export const useAdminDashboard = () => {
  const { user, isManager } = useAuth();

  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [providers, setProviders] = useState([]);

  // 視圖模式：預設為月視圖 ('month' | 'week')
  const [viewMode, setViewMode] = useState('month');

  const [selectedProviderId, setSelectedProviderId] = useState(() => {
    if (!isManager && user?.provider_id) {
      return String(user.provider_id);
    }
    return 'all';
  });

  useEffect(() => {
    if (!isManager && user?.provider_id) {
      setSelectedProviderId(String(user.provider_id));
    }
  }, [isManager, user]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const safeFormatDate = useCallback((d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 根據目前 viewMode 動態計算 API 起訖日期
  const getDateRange = useCallback((date, mode) => {
    if (mode === 'month') {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0); // 取當月最後一天
      return { 
        startDate: safeFormatDate(firstDay), 
        endDate: safeFormatDate(lastDay) 
      };
    } else {
      // 週視圖：以週一為起始點
      const current = new Date(date);
      const day = current.getDay();
      const distanceToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(current.setDate(current.getDate() + distanceToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { 
        startDate: safeFormatDate(monday), 
        endDate: safeFormatDate(sunday) 
      };
    }
  }, [safeFormatDate]);

  // 週視圖 7 天陣列
  const weekDays = useMemo(() => {
    const current = new Date(currentDate);
    const day = current.getDay();
    const distanceToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(current.setDate(current.getDate() + distanceToMonday));
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [currentDate]);

  // 💡 3. 月視圖日曆網格矩陣（含星期一開頭的留白 padding）
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (週日) ~ 6 (週六)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 將週日轉為索引 6，週一為 0
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const days = Array(startOffset).fill(null);

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  // 初始化載入美甲師清單
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await adminService.getProviders();
        setProviders(res.data || res);
      } catch (err) {
        console.error("載入美甲師清單失敗", err);
      }
    };
    fetchProviders();
  }, []);

  // 刷新核心數據（自動切換 月/週 請求區間）
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange(currentDate, viewMode);
      
      const [statsRes, calendarRes] = await Promise.all([
        adminService.getDashboardStats(1, selectedProviderId),
        adminService.getCalendarAppointments(startDate, endDate, 1, selectedProviderId)
      ]);
      
      setStats(statsRes.data || statsRes);
      setAppointments(calendarRes.data || calendarRes);
    } catch (err) {
      setError('載入後台數據失敗，請檢查後端連線。');
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewMode, getDateRange, selectedProviderId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 智慧預選：當預約資料更新時保持或選擇第一筆
  useEffect(() => {
    setSelectedAppointment(prev => {
      if (appointments.length === 0) return null;
      const latestSnapshot = appointments.find(app => app.id === prev?.id);
      if (window.innerWidth >= 1024) {
        return latestSnapshot || appointments[0];
      } else {
        return latestSnapshot || null;
      }
    });
  }, [appointments]);

  // 4. 智慧切換日期：依據當前模式切換月或週
  const navigateDate = (direction) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      if (viewMode === 'month') {
        next.setMonth(prev.getMonth() + direction);
      } else {
        next.setDate(prev.getDate() + direction * 7);
      }
      return next;
    });
  };

  const navigateWeek = (direction) => navigateDate(direction);

  return {
    stats,
    appointments,
    loading,
    error,
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    weekDays,
    monthDays,
    selectedAppointment,
    setSelectedAppointment,
    providers,
    selectedProviderId,
    setSelectedProviderId,
    navigateDate,
    navigateWeek,
    refreshData: fetchDashboardData
  };
};