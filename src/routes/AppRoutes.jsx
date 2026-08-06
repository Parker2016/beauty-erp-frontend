// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

import BookingPage from '../pages/BookingPage';
import LoginPage from '../pages/LoginPage';
import AdminDashboard from '../pages/AdminDashboard'; // 你的業主後台主頁

export const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* ================================================================= */}
      {/* 1. 顧客預約頁 (公開路由：LINE 打開或普通用戶造訪的預設首頁)       */}
      {/* ================================================================= */}
      <Route path="/" element={<BookingPage />} />

      {/* ================================================================= */}
      {/* 2. 工作人員登入頁                                                 */}
      {/* ================================================================= */}
      <Route 
        path="/login" 
        element={
          isAuthenticated && user 
            ? <Navigate to={`/admin/${user.shop_id}`} replace /> 
            : <LoginPage />
        } 
      />

      {/* ================================================================= */}
      {/* 3. 業主後台受保護路由 (網址為 /admin/:shopId)                       */}
      {/* ================================================================= */}
      <Route element={<ProtectedRoute />}>
        {/* 當店長直接輸入 /admin 時，自動導向他專屬的分店網址 /admin/1 */}
        <Route 
          path="/admin" 
          element={
            isAuthenticated && user 
              ? <Navigate to={`/admin/${user.shop_id}`} replace /> 
              : <Navigate to="/login" replace />
          } 
        />

        {/* 核心後台 (對應你的 AdminDashboard) */}
        <Route path="/admin/:shopId/*" element={<AdminDashboard />} />
      </Route>

      {/* ================================================================= */}
      {/* 4. 通用降級導向：找不到網址時回首頁                              */}
      {/* ================================================================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};