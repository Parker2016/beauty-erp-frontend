// src/services/admin.js
import http from '../utils/http';

/**
 * 業主後台管理核心 API 服務模組
 */
export const adminService = {
  // =========================================================================
  // 1. 營運看板與行事曆 (Dashboard & Calendar)
  // =========================================================================

  /**
   * 取得指定日期區間內的行事曆預約資料
   * @param {string} startDate - 開始日期 (格式：'YYYY-MM-DD')
   * @param {string} endDate - 結束日期 (格式：'YYYY-MM-DD')
   * @param {number} [shopId=1] - 店家 ID
   * @returns {Promise<Array>} 預約卡片清單
   */
  getCalendarAppointments: (startDate, endDate, shopId = 1) => {
    return http.get('admin/calendar/', {
      params: { start_date: startDate, end_date: endDate, shop_id: shopId }
    });
  },

  /**
   * 取得今日/本週/本月營收與看盤關鍵指標 (KPI Stats)
   * @param {number} [shopId=1] - 店家 ID
   * @returns {Promise<Object>} 營收統計數據物件
   */
  getDashboardStats: (shopId = 1) => {
    return http.get('admin/stats/', {
      params: { shop_id: shopId }
    });
  },

  // =========================================================================
  // 2. 預約單與施作紀錄管理 (Appointments & Records)
  // =========================================================================

  /**
   * 撈取全店的預約單列表（包含巢狀的 1:1 施作紀錄、美甲師、顧客資料）
   * @param {number} [shopId=1] - 店家 ID
   * @returns {Promise<Array>} 預約單與施作紀錄綜合清單
   */
  getAppointmentsWithRecords: (shopId = 1) => {
    return http.get('admin/appointments-records/', {
      params: { shop_id: shopId }
    });
  },

  /**
   * 聯合更新預約單狀態與施作紀錄 (色號、款式說明、成果照片網址等)
   * @param {number} appointmentId - 預約單 ID
   * @param {Object} data - 更新內容 (例如：{ status: 'CONFIRMED', record: { color_code: 'P-24' } })
   * @param {number} [shopId=1] - 店家 ID
   * @returns {Promise<Object>} 更新後的預約紀錄物件
   */
  updateAppointmentWithRecord: (appointmentId, data, shopId = 1) => {
    return http.put(`admin/appointments-records/${appointmentId}/`, data, {
      params: { shop_id: shopId }
    });
  },

  // =========================================================================
  // 3. 美甲師/服務人員管理 (Provider CRUD)
  // =========================================================================

  /**
   * 取得全店所有美甲師/服務人員名冊
   * @returns {Promise<Array>} 美甲師物件列表
   */
  getProviders: () => {
    return http.get('providers/');
  },

  /**
   * 新增美甲師/服務人員
   * @param {Object} data - { name: 'Zoe', is_manager: false, shop_id: 1 }
   * @returns {Promise<Object>} 新增成功的美甲師物件
   */
  createProvider: (data) => {
    return http.post('providers/', data);
  },

  /**
   * 編輯美甲師/服務人員資料 (名稱、是否升任店長等)
   * @param {number} id - 美甲師 ID
   * @param {Object} data - 要修改的欄位資料
   * @returns {Promise<Object>} 更新後的美甲師物件
   */
  updateProvider: (id, data) => {
    return http.patch(`providers/${id}/`, data);
  },

  /**
   * 刪除/編制下架美甲師
   * @param {number} id - 美甲師 ID
   * @returns {Promise<void>}
   */
  deleteProvider: (id) => {
    return http.delete(`providers/${id}/`);
  },

  // =========================================================================
  // 4. 服務品項與菜單管理 (ServiceItem CRUD & Options)
  // =========================================================================

  /**
   * 取得該店家所有服務品項列表 (主服務 + 加購項)
   * @param {number} [shopId=1] - 店家 ID
   * @returns {Promise<Array>} 服務品項清單
   */
  getServices: (shopId = 1) => {
    return http.get('admin/services/', {
      params: { shop_id: shopId }
    });
  },

  /**
   * 上架新服務品項
   * @param {Object} data - { name, price, duration_minutes, description, is_addon, provider_ids: [1, 2] }
   * @param {number} [shopId=1] - 店家 ID
   * @returns {Promise<Object>} 新建成功的服務品項物件
   */
  createService: (data, shopId = 1) => {
    return http.post('admin/services/', data, {
      params: { shop_id: shopId }
    });
  },

  /**
   * 修改服務品項參數 (名稱、價格、工時、綁定人員)
   * @param {number} id - 服務品項 ID
   * @param {Object} data - 更新的欄位資料
   * @param {number} [shopId=1] - 店家 ID
   * @returns {Promise<Object>} 更新後的服務品項物件
   */
  updateService: (id, data, shopId = 1) => {
    return http.put(`admin/services/${id}/`, data, {
      params: { shop_id: shopId }
    });
  },

  /**
   * 下架/刪除服務品項
   * @param {number} id - 服務品項 ID
   * @returns {Promise<void>}
   */
  deleteService: (id) => {
    return http.delete(`admin/services/${id}/`);
  },

  /**
   * 撈取選單專用的美甲師輕量選項清單 (僅包含 id, name，供服務上架時多選勾選綁定)
   * @param {number} [shopId=1] - 店家 ID
   * @returns {Promise<Array>} 簡化版美甲師清單 [{ id: 1, name: 'Zoe' }]
   */
  getProviderOptions: (shopId = 1) => {
    return http.get('admin/services/provider_options/', {
      params: { shop_id: shopId }
    });
  },

  // =========================================================================
  // 5. 美甲師排班管理 (Provider Shifts)
  // =========================================================================

  /**
   * 取得指定條件的排班表清單 (支援依美甲師與日期區間過濾)
   * 對應後端: GET /api/admin/shifts/?provider_id=1&start_date=2026-09-01&end_date=2026-09-30
   * @param {Object} params - 查詢參數 { provider_id, start_date, end_date }
   * @returns {Promise<Array>} 班表記錄清單
   */
  getShifts: (params = {}) => {
    return http.get('admin/shifts/', { params });
  },

  /**
   * 整月批次排班/覆蓋端點 (支援單一美甲師整月班表一次性寫入)
   * 對應後端: POST /api/admin/shifts/batch/
   * @param {Object} payload - { provider_id: 1, shifts: [{ date, start_time, end_time, is_off }] }
   * @returns {Promise<Object>} 成功回應物件
   */
  batchSaveShifts: (payload) => {
    return http.post('admin/shifts/batch/', payload);
  },
};