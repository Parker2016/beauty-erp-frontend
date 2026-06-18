// src/hooks/useBookingFlow.js
import { useState, useEffect } from 'react';
import { bookingService } from '../services/booking';

export const useBookingFlow = () => {
  // 1. 系統資料狀態
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  };

  const submitBooking = async (startTime, customerData) => {
    setIsLoading(true);
    setError(null);
    try {
      // 這裡完全符合 Django AppointmentCreateSerializer 的格式要求
      const payload = {
        provider_id: selectedProvider.id,
        service_id: selectedService.id,
        // 目前測試階段，因為後端沒有自動建立客人的邏輯，我們寫死為 1
        // (請確保你在 Django Admin 裡面有建立 id=1 的 Customer！)
        customer_id: 1, 
        start_time: startTime,
        // 把客人的表單資料，暫時全部塞進 memo 裡面，這樣後台才看得到
        memo: `[聯絡資訊]\n姓名: ${customerData.name}\n電話: ${customerData.phone}\nEmail: ${customerData.email || '無'}\n\n[客人備註]\n${customerData.memo || '無'}`
      };
      
      await bookingService.createAppointment(payload);
      setStep(5); // 進入步驟 5：預約成功畫面
      return true;
    } catch (err) {
      // 捕捉 Django Serializer ValidationError 丟回來的錯誤
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
    selectProvider,
    selectService,
    submitBooking,
    resetFlow,
    goBack,
  };
};