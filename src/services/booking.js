// src/services/booking.js
import http from '../utils/http';

export const bookingService = {
  /**
   * 取得所有美業師 (包含他們提供的 nested 服務項目)
   * 對應 Django: GET /api/providers/
   */
  getProviders: () => http.get('providers/'),

  getServicesByProvider: async (providerId) => {
    return http.get(`providers/${providerId}/services/`);
  },

  // src/services/booking.js 內部的可用時段對接
  getAvailableSlots: (providerId, serviceIds, date, addonIds = []) => {
    return http.get(`providers/${providerId}/available_slots/`, {
      params: {
        date: date,
        'service_ids[]': serviceIds, // 傳送多選主服務 ID 陣列
        'addon_ids[]': addonIds      // 傳送多選加購項 ID 陣列
      }
    });
  },

  /**
   * 送出預約訂單
   * 對應 Django: POST /api/appointments/ (Write Flat)
   * @param {Object} payload - { provider_id, service_id, customer_id, start_time }
   */
  createAppointment: (payload) => http.post('appointments/', payload),
};