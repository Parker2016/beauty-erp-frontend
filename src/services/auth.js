// src/services/auth.js
import http from '../utils/http'; // 👈 指向你的 utils/http.js

/**
 * 身分驗證模組 API 服務
 */
export const authService = {
  /**
   * 工作人員帳號密碼登入
   * @param {string} username - 帳號
   * @param {string} password - 密碼
   * @returns {Promise<Object>} { access, refresh, user: { id, username, role, shop_id, shop_name, provider_id } }
   */
  login: (username, password) => {
    return http.post('auth/login/', { username, password });
  },

  /**
   * 手動刷新 Access Token (備用)
   * @param {string} refreshToken 
   * @returns {Promise<Object>} { access }
   */
  refreshToken: (refreshToken) => {
    return http.post('auth/refresh/', { refresh: refreshToken });
  }
};