// src/services/admin.js
import http from '../utils/http';

export const adminService = {
  // ==========================================
  // 1. 營運看板與行事曆區塊
  // ==========================================
  
  /**
   * 取得指定日期區間內的行事曆預約資料
   * @param {string} startDate - 格式：'YYYY-MM-DD'
   * @param {string} endDate - 格式：'YYYY-MM-DD'
   * @param {number} [shopId=1] - 店家 ID
   */
  getCalendarAppointments: (startDate, endDate, shopId = 1) => {
    return http.get('admin/calendar/', {
      params: { start_date: startDate, end_date: endDate, shop_id: shopId }
    });
  },

  /**
   * 取得今日/本週/本月營收與看盤指標
   * @param {number} [shopId=1] - 店家 ID
   */
  getDashboardStats: (shopId = 1) => {
    return http.get('admin/stats/', {
      params: { shop_id: shopId }
    });
  },

  // ==========================================
  // 2. 基礎建設：服務品項管理 (ServiceItem CRUD)
  // ==========================================

  /**
   * 取得該店家所有服務品項列表
   * @param {number} [shopId=1] - 店家 ID
   */
  getServices: (shopId = 1) => {
    return http.get('admin/services/', {
      params: { shop_id: shopId }
    });
  },

  /**
   * 上架新服務品項
   * @param {Object} data - { name, price, duration_minutes, description, provider_ids: [1, 2] }
   * @param {number} [shopId=1] - 店家 ID
   */
  createService: (data, shopId = 1) => {
    return http.post('admin/services/', data, {
      params: { shop_id: shopId }
    });
  },

  /**
   * 修改服務品項參數
   * @param {number} id - 服務品項 ID
   * @param {Object} data - 更新的欄位資料
   * @param {number} [shopId=1] - 店家 ID
   */
  updateService: (id, data, shopId = 1) => {
    return http.put(`admin/services/${id}/`, data, {
      params: { shop_id: shopId }
    });
  },

  /**
   * 下架/刪除服務品項
   * @param {number} id - 服務品項 ID
   */
  deleteService: (id) => {
    return http.delete(`admin/services/${id}/`);
  },

  /**
   * 💡 撈取多對多勾選清單：取得目前店家旗下所有的美甲師輕量清單 (ID 與姓名)
   * URL 對接 Django 的 @action(url_path='provider_options')
   * @param {number} [shopId=1] - 店家 ID
   */
  getProviderOptions: (shopId = 1) => {
    return http.get('admin/services/provider_options/', {
      params: { shop_id: shopId }
    });
  }
};