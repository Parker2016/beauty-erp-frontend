import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin';

export const useServiceManagement = () => {
  // 目前本地開發階段，預設管理 1 號店
  const [shopId] = useState(1);

  // 核心數據狀態
  const [services, setServices] = useState([]);
  const [providerOptions, setProviderOptions] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 彈窗與表單本地狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // null: 新增, 物件: 編輯
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_minutes: '',
    description: '',
    provider_ids: [] // 串接 Django Serializer 唯寫的欄位
  });

  /**
   * 讀取資料管線：對齊 adminService.getServices(shopId) 與 getProviderOptions(shopId)
   */
  const loadServiceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [servicesRes, providersRes] = await Promise.all([
        adminService.getServices(shopId),
        adminService.getProviderOptions(shopId)
      ]);
      setServices(servicesRes);
      setProviderOptions(providersRes);
    } catch (err) {
      console.error('Data loading error:', err);
      setError('無法載入服務品項或美甲師選單，請檢查後端連線。');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  // 組件掛載時自動初始化
  useEffect(() => {
    loadServiceData();
  }, [loadServiceData]);

  /**
   * 打開新增彈窗
   */
  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      price: '',
      duration_minutes: '',
      description: '',
      provider_ids: []
    });
    setError(null);
    setIsModalOpen(true);
  };

  /**
   * 打開編輯彈窗：將後端 nested 的 providers 物件陣列轉化為前端表單所需的純 ID 陣列
   */
  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      // 確保價格欄位在 input[type=number] 中能正常呈現數字
      price: Math.floor(service.price) || '', 
      duration_minutes: service.duration_minutes || '',
      description: service.description || '',
      // 靈魂映射：將讀取到的 [{id:1, name:'Zoe'}] 映射為寫入所需的 [1]
      provider_ids: service.providers ? service.providers.map(p => p.id) : []
    });
    setError(null);
    setIsModalOpen(true);
  };

  /**
   * 處理多選複選框（Checkbox）的狀態增刪
   */
  const toggleProviderCheckbox = (providerId) => {
    setFormData(prev => {
      const isChecked = prev.provider_ids.includes(providerId);
      const newIds = isChecked
        ? prev.provider_ids.filter(id => id !== providerId) // 已勾選 -> 拔除
        : [...prev.provider_ids, providerId];              // 未勾選 -> 塞入
      return { ...prev, provider_ids: newIds };
    });
  };

  /**
   * 儲存表單：對齊 adminService.createService(data, shopId) 與 updateService(id, data, shopId)
   */
  const handleSave = async (e) => {
    e.preventDefault();
    
    // 防呆驗證：必須指派至少一位美甲師才能上架服務
    if (formData.provider_ids.length === 0) {
      setError('請至少勾選指派一位授權美甲師！');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editingService) {
        // 執行 PUT 覆蓋變更
        await adminService.updateService(editingService.id, formData, shopId);
      } else {
        // 執行 POST 新增品項
        await adminService.createService(formData, shopId);
      }
      
      await loadServiceData(); // 儲存成功後，重新刷榜
      setIsModalOpen(false);   // 關閉 Modal
    } catch (err) {
      console.error('Save service error:', err);
      // 嘗試抓取 Django Serializer 丟回來的細部欄位錯誤訊息
      const backendError = err.response?.data 
        ? JSON.stringify(err.response.data) 
        : '儲存失敗，請檢查參數格式。';
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刪除/下架品項：對齊 adminService.deleteService(id)
   */
  const handleDelete = async (id) => {
    if (!window.confirm('警告：確定要永久下架此服務品項嗎？下架後客戶將無法在前端預約。')) return;
    
    setLoading(true);
    setError(null);
    try {
      await adminService.deleteService(id);
      await loadServiceData(); // 重新刷榜
    } catch (err) {
      console.error('Delete service error:', err);
      setError('刪除失敗，該品項可能正被現有的預約單關聯中。');
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    providerOptions,
    loading,
    error,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    editingService,
    openCreateModal,
    openEditModal,
    toggleProviderCheckbox,
    handleSave,
    handleDelete,
    refreshData: loadServiceData
  };
};