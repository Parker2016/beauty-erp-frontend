import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL;

// ==========================================
// 1. 單例模式 (Singleton) 實例化
// ==========================================
const http = axios.create({
    baseURL: apiBaseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// ==========================================
// 2. 刷新 Token 的併發防護狀態機
// ==========================================
let isRefreshing = false; 
let failedQueue = []; 

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
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
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
                const refreshToken = localStorage.getItem('refresh_token');
                
                const { data } = await axios.post(`${apiBaseUrl}auth/refresh/`, {
                    refresh: refreshToken
                });

                localStorage.setItem('access_token', data.access);
                
                processQueue(null, data.access);
                
                originalRequest.headers['Authorization'] = 'Bearer ' + data.access;
                return http(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // 未來可加入：window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default http;