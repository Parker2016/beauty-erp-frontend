import { useState, useEffect } from 'react';
import liff from '@line/liff';

export const useLiffAuth = () => {
  const [liffUser, setLiffUser] = useState({
    lineUid: '',
    name: '',
    lineDisplayName: '',
    email: '',
    isLoggedIn: false
  });
  const [isLiffLoading, setIsLiffLoading] = useState(true);

  useEffect(() => {
    const isDevelopment = 
      import.meta.env.DEV || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
      console.log('[Mock LIFF] 偵測到本地測試環境，已自動啟用 Mock 身份並跳過 LIFF 重定向。');
      
      setLiffUser({
        lineUid: "local_test_uid_999",
        name: "",
        lineDisplayName: "小美",
        email: "test@example.com",
        isLoggedIn: true
      });
      setIsLiffLoading(false);
      return;
    }

    // 2. 線上正式環境：執行真正的 LINE LIFF 初始化與登入流程
    const LIFF_ID = "2010936171-7Xd34Q7R"; 

    liff.init({ liffId: LIFF_ID })
      .then(() => {
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          liff.getProfile().then(profile => {
            setLiffUser({
              lineUid: profile.userId,
              name: '',
              lineDisplayName: profile.displayName || '',
              email: liff.getDecodedIDToken()?.email || '',
              isLoggedIn: true
            });
            setIsLiffLoading(false);
          });
        }
      })
      .catch((err) => {
        console.error("LINE LIFF 線上初始化失敗:", err);
        setLiffUser({
          lineUid: "fallback_user_uid",
          name: "",
          lineDisplayName: "訪客 (LINE未授權)",
          email: "",
          isLoggedIn: true
        });
        setIsLiffLoading(false);
      });
  }, []);

  return { liffUser, isLiffLoading };
};