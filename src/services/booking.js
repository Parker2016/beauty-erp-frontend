// src/services/booking.js
import http from '../utils/http';

export const bookingService = {
  /**
   * 取得所有美業師 (包含他們提供的 nested 服務項目)
   * 對應 Django: GET /api/providers/
   */
  getProviders: () => http.get('providers/'),
  
  getAvailableSlots: async (providerId, serviceId, date) => {
    // 發送 GET 請求到：/api/providers/{id}/available_slots/?date=2026-07-18&service_id=2
    return http.get(`providers/${providerId}/available_slots/`, {
      params: {
        date: date,
        service_id: serviceId
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