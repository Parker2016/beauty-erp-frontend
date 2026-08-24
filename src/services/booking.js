// src/services/booking.js
import http from '../utils/http';

/**
 * 前台顧客預約服務模組 (C 端專用 API)
 */
export const bookingService = {
  // =========================================================================
  // 1. 美甲師與服務項目查詢 (Providers & Services)
  // =========================================================================

  /**
   * 取得所有服務人員/美甲師名冊 (包含 nested 服務項目)
   * 對應 Django: GET /api/providers/
   * @returns {Promise<Array>} 美甲師列表
   */
  getProviders: () => http.get('providers/'),

  /**
   * 明確撈出該名美甲師「有授權提供」的所有服務項目 (主服務 + 加購項)
   * 對應 Django: GET /api/providers/{providerId}/services/
   * @param {number} providerId - 美甲師/服務人員 ID
   * @returns {Promise<Array>} 該美甲師可施作的 ServiceItem 列表
   */
  getServicesByProvider: (providerId) => {
    return http.get(`providers/${providerId}/services/`);
  },

  // =========================================================================
  // 2. 防撞時段計算與預約下單 (Slots & Appointments)
  // =========================================================================

  /**
   * 帶入年月與多選服務品項，查詢整月每日的空檔狀態 (AVAILABLE / FULL / OFF / PAST)
   * 對應 Django: GET /api/providers/{providerId}/month_availability/
   * @param {number} providerId - 美甲師/服務人員 ID
   * @param {number} year - 查詢年份 (例如 2026)
   * @param {number} month - 查詢月份 (例如 8)
   * @param {Array<number>} serviceIds - 多選主服務項目 ID 陣列 (例如 [1, 2])
   * @param {Array<number>} [addonIds=[]] - 多選加購項目 ID 陣列 (例如 [3, 4])
   * @returns {Promise<Object>} 包含 month_status 字典與 first_available_date 的物件
   */
  getMonthAvailability: (providerId, year, month, serviceIds, addonIds = []) => {
    return http.get(`providers/${providerId}/month_availability/`, {
      params: {
        year: year,
        month: month,
        'service_ids[]': serviceIds,
        'addon_ids[]': addonIds
      }
    });
  },

  /**
   * 帶入日期與多選服務品項，呼叫後端演算法計算無衝突可預約時段
   * 對應 Django: GET /api/providers/{providerId}/available_slots/
   * @param {number} providerId - 美甲師/服務人員 ID
   * @param {Array<number>} serviceIds - 多選主服務項目 ID 陣列 (例如 [1, 2])
   * @param {string} date - 指定預約日期 (格式：'YYYY-MM-DD')
   * @param {Array<number>} [addonIds=[]] - 多選加購項目 ID 陣列 (例如 [3, 4])
   * @returns {Promise<Array<string>>} 可預約開始時間字串陣列 (例如 ['10:00', '13:30', '16:00'])
   */
  getAvailableSlots: (providerId, serviceIds, date, addonIds = []) => {
    return http.get(`providers/${providerId}/available_slots/`, {
      params: {
        date: date,
        'service_ids[]': serviceIds, // 多選主服務 ID 陣列
        'addon_ids[]': addonIds      // 多選加購項 ID 陣列
      }
    });
  },

  /**
   * 送出預約訂單 (寫入平鋪格式)
   * 對應 Django: POST /api/appointments/
   * @param {Object} payload - 預約訂單資料 payload
   * @param {number} payload.provider_id - 美甲師 ID
   * @param {Array<number>} payload.service_ids - 主服務項目 ID 陣列
   * @param {Array<number>} [payload.addon_ids=[]] - 加購項目 ID 陣列
   * @param {number} [payload.customer_id=1] - 顧客/會員 ID
   * @param {string} payload.start_time - 預約開始時間 ISO 字串 (例如 '2026-07-23T10:00:00+08:00')
   * @param {string} [payload.memo] - 客戶備註或聯絡資訊文字
   * @returns {Promise<Object>} 新建成功的預約單完整物件
   */
  createAppointment: (payload) => http.post('appointments/', payload),
};