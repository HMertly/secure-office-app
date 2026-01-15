import axios from "axios";

// 1. Merkezi Ayarlar (Base URL)
const api = axios.create({
    baseURL: "http://localhost:8080/api/v1", // Artık v1'i buraya koyduk
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. Request Interceptor (İstek Atılmadan Önce Araya Gir)
api.interceptors.request.use(
    (config) => {
        // LocalStorage'dan token'ı al
        const token = localStorage.getItem("token");

        // Eğer token varsa, her isteğin başlığına ekle
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor (Cevap Geldikten Sonra Araya Gir - Opsiyonel)
// Örneğin: Token süresi dolmuşsa (401 hatası), kullanıcıyı otomatik log-out yapabiliriz.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token geçersizse veya süresi dolmuşsa
            console.warn("Oturum süresi doldu, çıkış yapılıyor...");
            localStorage.removeItem("token");
            window.location.href = "/"; // Login'e at
        }
        return Promise.reject(error);
    }
);

export default api;