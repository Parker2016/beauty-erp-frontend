// src/services/booking.js
import http from '../utils/http';

export const bookingService = {
  /**
   * 取得所有美業師 (包含他們提供的 nested 服務項目)
   * 對應 Django: GET /api/providers/
   */
  getProviders: () => http.get('providers/'),
  
  /**
   * 送出預約訂單
   * 對應 Django: POST /api/appointments/ (Write Flat)
   * @param {Object} payload - { provider_id, service_id, customer_id, start_time }
   */
  createAppointment: (payload) => http.post('appointments/', payload),

  // 未來如果要串接剛才在 Django 寫的 get_available_slots，可以加在這裡
  // getAvailableSlots: (providerId, date, serviceId) => 
  //   http.get(`providers/${providerId}/slots/?date=${date}&service_id=${serviceId}`)
};