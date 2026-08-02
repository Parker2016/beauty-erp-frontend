import { useState, useEffect } from 'react';
import liff from '@line/liff';

export const useLiffAuth = () => {
  const [liffUser, setLiffUser] = useState({
    lineUid: '',
    name: '',
    email: '',
    isLoggedIn: false
  });
  const [isLiffLoading, setIsLiffLoading] = useState(true);

  useEffect(() => {
    // setLiffUser({
    //   lineUid: "local_test_uid_999",
    //   name: "測試貴賓",
    //   email: "test@example.com",
    //   isLoggedIn: true
    // });
    // setIsLiffLoading(false);
    
    // 💡 填入你在 LINE Developers Console 申請的 LIFF ID
    const LIFF_ID = "2010936171-7Xd34Q7R"; 

    liff.init({ liffId: LIFF_ID })
      .then(() => {
        if (!liff.isLoggedIn()) {
          // 如果使用者是用一般瀏覽器打開，引導她進行 LINE 登入
          // 若是在 LINE App 內部打開，會自動帶過
          liff.login();
        } else {
          // 已經登入，抓取使用者的 LINE 個人檔案
          liff.getProfile().then(profile => {
            setLiffUser({
              lineUid: profile.userId,       // 👑 這就是我們要的唯一 line_uid！
              name: profile.displayName || '', // LINE 顯示名稱（可以預填到步驟一的姓名欄位）
              email: liff.getDecodedIDToken()?.email || '', // 若有勾選 email 權限可一併抓取
              isLoggedIn: true
            });
            setIsLiffLoading(false);
          });
        }
      })
      .catch((err) => {
        console.error("LINE LIFF 初始化失敗:", err);
        // 💡 容錯機制：如果是在本地離線測試環境 (localhost)，給予一個測試用 UID 避免畫面卡死
        setLiffUser({
          lineUid: "local_test_uid_999",
          name: "測試貴賓",
          email: "",
          isLoggedIn: true
        });
        setIsLiffLoading(false);
      });
  }, []);

  return { liffUser, isLiffLoading };
};