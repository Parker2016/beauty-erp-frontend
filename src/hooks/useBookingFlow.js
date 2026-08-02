// src/hooks/useBookingFlow.js
import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/booking';

export const useBookingFlow = () => {
  // ==========================================
  // 1. 核心系統數據狀態
  // ==========================================
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 時間空檔獨立狀態
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  // ==========================================
  // 2. 6 步預約流程狀態機
  // ==========================================
  const [step, setStep] = useState(1);

  // 使用者填寫的個人資料狀態
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    memo: ''
  });

  const [selectedProvider, setSelectedProvider] = useState(null);
  // 💡 核心變革 1：主服務由單選物件改為多選陣列
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);

  // ==========================================
  // 3. 資料初始化掛載
  // ==========================================
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

  // ==========================================
  // 4. 各步驟精準控制方法 (暴露給 UI 使用)
  // ==========================================

  // 步驟 1 ➔ 2：提交客戶基本資料
  const submitCustomerData = (data) => {
    setCustomerData(data);
    setStep(2);
    setError(null);
  };

  // 步驟 2 ➔ 3：選定美甲師
  const selectProvider = async (provider) => {
    setSelectedProvider(provider);
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingService.getServicesByProvider(provider.id);
      setServices(data);
      setSelectedServices([]); // 清空上一次選的主服務
      setSelectedAddons([]);   // 清空上一次選的加購項
      setStep(3);
    } catch (err) {
      setError('無法載入該美甲師的造型服務項目，請換人試試或稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  // 💡 核心變革 2：步驟 3 專用 — 切換主服務項目的勾選狀態 (M2M 多選邏輯)
  const toggleService = (serviceItem) => {
    setSelectedServices(prev => {
      const isExist = prev.some(item => item.id === serviceItem.id);
      if (isExist) {
        return prev.filter(item => item.id !== serviceItem.id);
      } else {
        return [...prev, serviceItem];
      }
    });
  };

  // 💡 核心變革 3：步驟 3 ➔ 4 — 確認主服務 (需防呆確認至少選 1 項) 並前往加購區
  const confirmServicesAndGoToAddons = () => {
    if (selectedServices.length === 0) {
      setError('請至少選擇一項主服務造型項目。');
      return;
    }
    setStep(4); // 跳轉至加購項目區
    setError(null);
    setSelectedAddons([]); // 清空加購項
    setAvailableSlots([]);  // 清空時段快取
  };

  // 步驟 4 專用：切換加購項目的勾選狀態 (M2M 多選邏輯)
  const toggleAddon = (addonItem) => {
    setSelectedAddons(prev => {
      const isExist = prev.some(item => item.id === addonItem.id);
      if (isExist) {
        return prev.filter(item => item.id !== addonItem.id);
      } else {
        return [...prev, addonItem];
      }
    });
  };

  // 步驟 4 ➔ 5：確認加購項，前往時間排班表
  const confirmAddonsAndGoToCalendar = () => {
    setStep(5);
    setError(null);
  };

  // ==========================================
  // 5. 核心異步：串接多選主服務與加購時間的可用時段計算
  // ==========================================
  const fetchAvailableSlots = useCallback(async (providerId, dateString) => {
    setIsSlotsLoading(true);
    setError(null);
    try {
      const serviceIds = (selectedServices || []).map(s => s.id);
      const addonIds = (selectedAddons || []).map(a => a.id);

      // 1. 呼叫 API (對齊參數順序: providerId, serviceIds, dateString, addonIds)
      const res = await bookingService.getAvailableSlots(providerId, serviceIds, dateString, addonIds);

      // 💡 2. 萬能相容：如果 http.js 已經解包，res 就是陣列；如果沒解包，資料在 res.data 裡
      const rawSlots = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data) ? res.data : []);

      // 💡 3. 時間格式轉換："2026-07-29T10:00:00+08:00" ➔ "10:00"
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

  // ==========================================
  // 6. 最終決策：提交最終總訂單給 Django
  // ==========================================
  const submitBooking = async (startTime, liffUser) => {
    setIsLoading(true);
    setError(null);
    try {
      const serviceIds = selectedServices.map(s => s.id);
      const addonIds = selectedAddons.map(a => a.id);

      // 💡 取得 LINE UID (若在 LINE LIFF 環境中可動態抓取，若無則預設或帶入暫存值)
      const currentLineUid = window.liff?.getContext?.()?.userId || customerData.lineUid || `line_user_${Date.now()}`;

      const payload = {
        provider_id: selectedProvider.id,
        service_ids: serviceIds,
        addon_ids: addonIds,
        line_uid: liffUser.lineUid,
        customer_name: customerData.name,         // 對應 customer_name
        customer_phone: customerData.phone,       // 對應 customer_phone
        customer_email: customerData.email || '', // 對應 customer_email (選填)
        start_time: startTime,
        memo: `[客戶聯絡資料]\n姓名: ${customerData.name}\n電話: ${customerData.phone}\nEmail: ${customerData.email || '無'}\n生日: ${customerData.birthday || '未填'}\n\n[客人客製備註]\n${customerData.memo || '無'}`
      };

      await bookingService.createAppointment(payload);
      setStep(6);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.start_time || err.response?.data?.service_ids || '預約失敗，這個時段剛剛被別人搶先一步劃走了！';
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep((prev) => prev - 1);
    setError(null);
  };

  const resetFlow = () => {
    setStep(1);
    setCustomerData({ name: '', phone: '', email: '', birthday: '', memo: '' });
    setSelectedProvider(null);
    setSelectedServices([]);
    setSelectedAddons([]);
    setAvailableSlots([]);
    setError(null);
  };

  // ==========================================
  // 7. 將大腦全數對外釋放解構
  // ==========================================
  return {
    providers,
    services,
    isLoading,
    error,
    step,
    setStep,
    customerData,
    selectedProvider,
    selectedServices,             // 💡 釋放多選主服務陣列
    selectedAddons,
    availableSlots,
    isSlotsLoading,
    fetchAvailableSlots,
    submitCustomerData,
    selectProvider,
    toggleService,                // 💡 釋放步驟 3 的勾選切換函式
    confirmServicesAndGoToAddons, // 💡 釋放步驟 3 的下一步確認按鈕函式
    toggleAddon,
    confirmAddonsAndGoToCalendar,
    submitBooking,
    resetFlow,
    goBack,
  };
};