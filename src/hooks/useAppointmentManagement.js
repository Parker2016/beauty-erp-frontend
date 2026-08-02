// src/hooks/useAppointmentManagement.js
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin';

export const useAppointmentManagement = () => {
  const [shopId] = useState(1);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 控制彈窗與當前編輯中的預約
  const [editingApp, setEditingApp] = useState(null);

  // 撈取資料大腦
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAppointmentsWithRecords(shopId);
      const list = Array.isArray(data) ? data : (data?.data || []);
      setAppointments(list);
    } catch (err) {
      setError('無法載入預約與施作紀錄，請確認後端連線。');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const openEditModal = (app) => {
    setEditingApp(app);
  };

  // 處理表單欄位變更（支援第一層與巢狀 record 層）
  const handleFieldChange = (field, value, isNestedRecord = false) => {
    setEditingApp(prev => {
      if (isNestedRecord) {
        return {
          ...prev,
          record: { ...prev.record, [field]: value }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // 送出聯合儲存
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 拋出 payload 給 Django 序列化器
      await adminService.updateAppointmentWithRecord(editingApp.id, editingApp, shopId);
      await loadAppointments(); // 重新刷榜
      setEditingApp(null); // 關閉彈窗
    } catch (err) {
      setError(err.response?.data?.detail || '儲存聯合紀錄失敗，請確認欄位格式。');
    } finally {
      setLoading(false);
    }
  };

  return {
    appointments,
    loading,
    error,
    editingApp,
    setEditingApp,
    openEditModal,
    handleFieldChange,
    handleSaveSubmit,
    refreshData: loadAppointments
  };
};