// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * 自訂 Hook：全域快速存取身分驗證狀態
 * @example
 * const { user, shopId, isManager, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth 必須在 <AuthProvider> 包裹的元件樹範圍內使用！');
  }

  return context;
};