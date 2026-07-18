// src/hooks/useBookingFlow.js
import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/booking';

export const useBookingFlow = () => {
  // 1. 系統資料狀態
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 💡 新增：針對時間空檔的獨立狀態，避免干擾主頁面的全螢幕載入
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);

  // 2. 預約流程狀態 (UI 依據 step 來切換畫面)
  const [step, setStep] = useState(1); 
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  // 初始化：元件載入時自動去 Django 撈取美業師名單
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

  // 3. 流程控制方法 (暴露給 UI Page 綁定 onClick)
  const selectProvider = (provider) => {
    setSelectedProvider(provider);
    setStep(2); // 自動進入步驟 2：選服務
    setError(null);
  };

  const selectService = (service) => {
    setSelectedService(service);
    setStep(3); // 自動進入步驟 3：選時間
    setError(null);
    setAvailableSlots([]); // 💡 確保換項目時，先清空上一次的時間快取
  };

  // 使用 useCallback 包裹，防止 UI 元件重新渲染時導致無效的重複請求
  const fetchAvailableSlots = useCallback(async (providerId, serviceId, dateString) => {
    setIsSlotsLoading(true);
    setError(null);
    try {
      // 呼叫後端 API，傳入美甲師ID、服務ID、以及格式化後的日期 (例如: 2026-07-18)
      const data = await bookingService.getAvailableSlots(providerId, serviceId, dateString);
      
      // 假設後端回傳格式為：[{ start_time: "2026-07-18T10:00:00+08:00", end_time: "..." }, ...]
      // 我們在前端可以將它轉換為 ['10:00', '13:30'] 這種純時間字串供月曆按鈕顯示
      const pureTimes = data.map(slot => {
        const date = new Date(slot.start_time);
        return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
      });
      
      setAvailableSlots(pureTimes);
    } catch (err) {
      setError('無法撈取該日期的可用時段，請更換日期試試');
      setAvailableSlots([]);
    } finally {
      setIsSlotsLoading(false);
    }
  }, []);

  const submitBooking = async (startTime, customerData) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        provider_id: selectedProvider.id,
        service_id: selectedService.id,
        customer_id: 1, // 測試階段先寫死，未來整合 LINE 登入後帶入真實顧客 ID
        start_time: startTime,
        memo: `[聯絡資訊]\n姓名: ${customerData.name}\n電話: ${customerData.phone}\nEmail: ${customerData.email || '無'}\n\n[客人備註]\n${customerData.memo || '無'}`
      };
      
      await bookingService.createAppointment(payload);
      setStep(5); // 進入步驟 5：預約成功畫面
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.start_time || '預約失敗，請確認時段是否被搶走';
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
    setSelectedProvider(null);
    setSelectedService(null);
    setAvailableSlots([]); // 💡 重設流程時清空時間
    setError(null);
  };

  // 將所有 UI 需要的變數和方法打包丟出去
  return {
    providers,
    isLoading,
    error,
    step,
    setStep,
    selectedProvider,
    selectedService,
    availableSlots,     // 💡 釋放給 BookingPage.jsx 渲染時間按鈕
    isSlotsLoading,     // 💡 釋放給 BookingPage.jsx 顯示時段的小圈圈 Loading
    fetchAvailableSlots,// 💡 釋放給 BookingPage.jsx 的 useEffect 監聽呼叫
    selectProvider,
    selectService,
    submitBooking,
    resetFlow,
    goBack,
  };
};