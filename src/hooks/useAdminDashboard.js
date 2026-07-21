// src/hooks/useAdminDashboard.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminService } from '../services/admin'; 

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const safeFormatDate = useCallback((d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const getWeekRange = useCallback((date) => {
    const current = new Date(date);
    const day = current.getDay();
    const distanceToMonday = day === 0 ? -6 : 1 - day; 
    
    const monday = new Date(current.setDate(current.getDate() + distanceToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return { monday: safeFormatDate(monday), sunday: safeFormatDate(sunday) };
  }, [safeFormatDate]);

  const weekDays = useMemo(() => {
    const { monday } = getWeekRange(currentDate);
    const start = new Date(monday);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate, getWeekRange]);

  // 刷新核心數據
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { monday, sunday } = getWeekRange(currentDate);
      
      // ✅ 正名與參數微調：完全符合你 services/admin.js 的參數排列順序與預設 shop_id 邏輯
      const [statsRes, calendarRes] = await Promise.all([
        adminService.getDashboardStats(1),
        adminService.getCalendarAppointments(monday, sunday, 1)
      ]);
      
      setStats(statsRes);
      setAppointments(calendarRes);
    } catch (err) {
      setError('載入後台數據失敗，請檢查後端連線。');
    } finally {
      setLoading(false);
    }
  }, [currentDate, getWeekRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [currentDate, fetchDashboardData]);

  // 智慧預選
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