// src/services/quote.js
import http from '../utils/http';

/**
 * 現場計價與設計款報價單服務 (Admin 專用)
 */
export const quoteService = {
  // =========================================================================
  // 1. 價目表模板管理 (Design Price Menu)
  // =========================================================================

  /**
   * 取得店家目前的設計款價目表
   * 對應 Django: GET /api/admin/design-prices/?shop_id={shopId}
   * @param {number} [shopId=1] - 店家 ID
   * @returns {Promise<Array>} 價目清單 (包含 BASE, ADDON, STYLE, REMOVAL)
   */
  getDesignPrices: (shopId = 1) => {
    return http.get('admin/design-prices/', { params: { shop_id: shopId } });
  },

  /**
   * 新增單筆價目表項目
   * @param {Object} payload - { category, name, price, sort_order, is_active }
   */
  createDesignPrice: (payload) => http.post('admin/design-prices/', payload),

  /**
   * 更新單筆價目表項目
   * @param {number} id - DesignPriceItem ID
   * @param {Object} payload - 更新內容
   */
  updateDesignPrice: (id, payload) => http.put(`admin/design-prices/${id}/`, payload),

  /**
   * 刪除單筆價目表項目
   * @param {number} id - DesignPriceItem ID
   */
  deleteDesignPrice: (id) => http.delete(`admin/design-prices/${id}/`),

  /**
   * 批次更新/新增/刪除價目表項目
   * 對應 Django: POST /api/admin/design-prices/batch/
   * @param {Object} payload - { shop_id, deleted_ids: [1,2], items: [...] }
   */
  batchUpdateDesignPrices: (payload) => http.post('admin/design-prices/batch/', payload),
  
  // =========================================================================
  // 2. 結帳快照管理 (Appointment Quote Snapshot)
  // =========================================================================

  /**
   * 取得特定預約單的結帳明細快照
   * 對應 Django: GET /api/admin/appointments/{appointmentId}/quote/
   * @param {number} appointmentId - 預約單 ID
   * @returns {Promise<Object>} 結帳快照資料 (含 nested items 陣列)
   */
  getQuote: (appointmentId) => {
    return http.get(`admin/appointments/${appointmentId}/quote/`);
  },

  /**
   * 儲存/覆寫特定預約單的結帳快照 (一鍵打包 Nested 寫入)
   * 對應 Django: PUT /api/admin/appointments/{appointmentId}/quote/
   * @param {number} appointmentId - 預約單 ID
   * @param {Object} payload - 結帳單大包裝 Payload
   * @param {number} payload.deposit - 預收定金
   * @param {number} payload.discount - 優惠折扣
   * @param {number} payload.subtotal - 項目小計
   * @param {number} payload.total_amount - 應付尾款 (會同步回寫 appointment.final_price)
   * @param {string} payload.formatted_receipt - 供複製的格式化文字
   * @param {Array<Object>} payload.items - 結帳明細陣列 [{category, item_name, unit_price, quantity, is_custom}]
   * @returns {Promise<Object>} 儲存成功的結帳快照資料
   */
  saveQuote: (appointmentId, payload) => {
    return http.put(`admin/appointments/${appointmentId}/quote/`, payload);
  }
};