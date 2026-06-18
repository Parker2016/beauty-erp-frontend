import axios from 'axios';

// ==========================================
// 1. 單例模式 (Singleton) 實例化
// ==========================================
const http = axios.create({
    baseURL: 'http://192.168.0.105:8000/api/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// ==========================================
// 2. 刷新 Token 的併發防護狀態機
// ==========================================
let isRefreshing = false; // 標記是否正在刷新 Token
let failedQueue = []; // 失敗請求佇列

// 處理佇列中的請求
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// ==========================================
// 3. Request 攔截器：自動夾帶 Token
// ==========================================
http.interceptors.request.use(
    (config) => {
        // 從 localStorage 抓取 Token (未來整合 LINE 登入後存入的 JWT)
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ==========================================
// 4. Response 攔截器：全局錯誤與 401 處理
// ==========================================
http.interceptors.response.use(
    (response) => {
        // API 成功，直接回傳資料層，讓後面的程式碼不用再解構 response.data
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // 情況 A：遇到 401 Unauthorized，且這支 API 還沒重試過
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // 如果已經有其他 API 觸發了刷新，把這個 API 推進佇列等待
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return http(originalRequest);
                })
                .catch(err => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                // 呼叫 Django 刷新 Token 的 API (這裡假設你的路由是 /auth/refresh/)
                const refreshToken = localStorage.getItem('refresh_token');
                const { data } = await axios.post('http://127.0.0.1:8000/api/auth/refresh/', {
                    refresh: refreshToken
                });

                // 刷新成功，更新 localStorage
                localStorage.setItem('access_token', data.access);
                
                // 釋放佇列，讓剛才卡住的 API 換上新 Token 重新出發
                processQueue(null, data.access);
                
                // 重新發送當初失敗的這支 API
                originalRequest.headers['Authorization'] = 'Bearer ' + data.access;
                return http(originalRequest);

            } catch (refreshError) {
                // 刷新也失敗 (Refresh Token 過期)，強制登出
                processQueue(refreshError, null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // 這裡可以直接導向登入頁面，例如 window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // 情況 B：其他錯誤 (400, 403, 500 等)，直接拋給上層的 Catch 處理
        // 你提過要防範「爽約防護」，未來 403 的特殊攔截也可以寫在這裡
        return Promise.reject(error);
    }
);

export default http;