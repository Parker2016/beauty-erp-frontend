import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';

/**
 * 路由防護守衛 (Route Guard)
 * 職責：
 * 1. 驗證登入狀態 (未登入 -> 重導向 /login)
 * 2. 驗證網址 shopId 是否與登入者一致 (越權 -> 自動彈回自己的 /admin/:userShopId)
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { shopId: urlShopId } = useParams();

  // ① 如果系統仍在讀取 localStorage 復原狀態中，暫時回傳 null 或 Loading 畫面
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-sm font-medium text-gray-400 animate-pulse">
          系統身分驗證中...
        </div>
      </div>
    );
  }

  // ② 安全檢查 1：未登入者，強制彈回登入頁
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // ③ 安全檢查 2：多租戶網域越權防護 (比對 URL 的 shopId 與登入者的 user.shop_id)
  if (urlShopId && Number(urlShopId) !== Number(user.shop_id)) {
    console.warn(`[安全警示] 嘗試存取非授權店家 (URL: ${urlShopId}, User Shop: ${user.shop_id})`);
    // 自動矯正並跳轉回該使用者授權的店家網址
    return <Navigate to={`/admin/${user.shop_id}`} replace />;
  }

  // ④ 所有檢查通過，渲染子路由 (Outlet)
  return <Outlet />;
};