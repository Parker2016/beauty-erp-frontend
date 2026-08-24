// src/hooks/useBookingFlow.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { bookingService } from '../services/booking';

export const useBookingFlow = () => {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. 月度可用狀態與載入狀態
  const [monthStatus, setMonthStatus] = useState({});
  const [isMonthLoading, setIsMonthLoading] = useState(false);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  // 0毫秒記憶體鎖 + 全螢幕遮罩 State
  const isSubmitLockedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step, setStep] = useState(1);
  const [customerData, setCustomerData] = useState({
    name: '', phone: '', email: '', birthday: '', memo: ''
  });

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      try {
        const data = await bookingService.getProviders();
        setProviders(data);
      } catch (err) {
        setError('無法載入人員資料，請稍後再試');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const submitCustomerData = (data) => {
    setCustomerData(data);
    setStep(2);
    setError(null);
  };

  const selectProvider = async (provider) => {
    setSelectedProvider(provider);
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingService.getServicesByProvider(provider.id);
      setServices(data);
      setSelectedServices([]);
      setSelectedAddons([]);
      setMonthStatus({});
      setStep(3);
    } catch (err) {
      setError('無法載入該美甲師的造型服務項目，請換人試試或稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleService = (serviceItem) => {
    setSelectedServices(prev => {
      const isExist = prev.some(item => item.id === serviceItem.id);
      return isExist ? prev.filter(item => item.id !== serviceItem.id) : [...prev, serviceItem];
    });
  };

  const confirmServicesAndGoToAddons = () => {
    if (selectedServices.length === 0) {
      setError('請至少選擇一項主服務造型項目。');
      return;
    }
    setStep(4);
    setError(null);
    setSelectedAddons([]);
    setMonthStatus({});
    setAvailableSlots([]);
  };

  const toggleAddon = (addonItem) => {
    setSelectedAddons(prev => {
      const isExist = prev.some(item => item.id === addonItem.id);
      return isExist ? prev.filter(item => item.id !== addonItem.id) : [...prev, addonItem];
    });
  };

  const confirmAddonsAndGoToCalendar = () => {
    setStep(5);
    setError(null);
  };

  // 2. 核心新增：抓取指定年月份的整月可用狀態 (AVAILABLE / FULL / OFF / PAST)
  const fetchMonthAvailability = useCallback(async (providerId, year, month) => {
    setIsMonthLoading(true);
    setError(null);
    try {
      const serviceIds = (selectedServices || []).map(s => s.id);
      const addonIds = (selectedAddons || []).map(a => a.id);
      const res = await bookingService.getMonthAvailability(providerId, year, month, serviceIds, addonIds);

      const data = res?.data || res || {};
      const statusMap = data.month_status || {};
      setMonthStatus(statusMap);

      return data.first_available_date || null;
    } catch (err) {
      console.error('整月空檔狀態撈取發生錯誤:', err);
      setMonthStatus({});
      return null;
    } finally {
      setIsMonthLoading(false);
    }
  }, [selectedServices, selectedAddons]);

  // 抓取單日具體可用時段
  const fetchAvailableSlots = useCallback(async (providerId, dateString) => {
    setIsSlotsLoading(true);
    setError(null);
    try {
      const serviceIds = (selectedServices || []).map(s => s.id);
      const addonIds = (selectedAddons || []).map(a => a.id);
      const res = await bookingService.getAvailableSlots(providerId, serviceIds, dateString, addonIds);

      const rawSlots = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const pureTimes = rawSlots
        .map(slot => (slot?.start_time ? slot.start_time.substring(11, 16) : null))
        .filter(Boolean);

      setAvailableSlots(pureTimes);
    } catch (err) {
      console.error('❌ 時段撈取發生錯誤:', err);
      setError('無法撈取該日期的可用時段，請更換日期試試');
      setAvailableSlots([]);
    } finally {
      setIsSlotsLoading(false);
    }
  }, [selectedServices, selectedAddons]);

  // 防爆連點預約送出
  const submitBooking = async (startTime, liffUser) => {
    if (isSubmitLockedRef.current) {
      console.warn('⚠️ [防爆連點] 點擊過快，第二次請求被源頭鎖成功攔截！');
      return false;
    }

    isSubmitLockedRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const serviceIds = selectedServices.map(s => s.id);
      const addonIds = selectedAddons.map(a => a.id);
      const lineDisplayName = liffUser?.lineDisplayName || liffUser?.name || '無';
      const payload = {
        provider_id: selectedProvider.id,
        service_ids: serviceIds,
        addon_ids: addonIds,
        line_uid: liffUser?.lineUid || `line_user_${Date.now()}`,
        line_display_name: lineDisplayName === '無' ? '' : lineDisplayName,
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        customer_email: customerData.email || '',
        start_time: startTime,
        memo: `[客戶聯絡資料]\n姓名: ${customerData.name}\nLINE 暱稱: ${lineDisplayName}\n電話: ${customerData.phone}\nEmail: ${customerData.email || '無'}\n生日: ${customerData.birthday || '未填'}\n\n[客人客製備註]\n${customerData.memo || '無'}`
      };

      await bookingService.createAppointment(payload);
      
      setStep(6);
      return true;

    } catch (err) {
      console.error('❌ 預約失敗:', err);
      
      const rawErr = err.response?.data;
      let errorMsg = '預約失敗，這個時段剛剛被別人搶先一步劃走了！';

      if (typeof rawErr === 'string') {
        errorMsg = rawErr;
      } else if (rawErr?.detail) {
        errorMsg = rawErr.detail;
      } else if (rawErr?.start_time) {
        errorMsg = Array.isArray(rawErr.start_time) ? rawErr.start_time[0] : rawErr.start_time;
      } else if (rawErr?.non_field_errors) {
        errorMsg = Array.isArray(rawErr.non_field_errors) ? rawErr.non_field_errors[0] : rawErr.non_field_errors;
      }

      setError(errorMsg);
      return false;

    } finally {
      isSubmitLockedRef.current = false;
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    setStep((prev) => prev - 1);
    setError(null);
  };

  const resetFlow = () => {
    isSubmitLockedRef.current = false;
    setIsSubmitting(false);
    setStep(1);
    setCustomerData({ name: '', phone: '', email: '', birthday: '', memo: '' });
    setSelectedProvider(null);
    setSelectedServices([]);
    setSelectedAddons([]);
    setMonthStatus({});
    setAvailableSlots([]);
    setError(null);
  };

  return {
    providers,
    services,
    isLoading,
    isSubmitting,
    error,
    step,
    setStep,
    customerData,
    selectedProvider,
    selectedServices,
    selectedAddons,
    monthStatus,
    isMonthLoading,
    availableSlots,
    isSlotsLoading,
    fetchMonthAvailability,
    fetchAvailableSlots,
    submitCustomerData,
    selectProvider,
    toggleService,
    confirmServicesAndGoToAddons,
    toggleAddon,
    confirmAddonsAndGoToCalendar,
    submitBooking,
    resetFlow,
    goBack,
  };
};