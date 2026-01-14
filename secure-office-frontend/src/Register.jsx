import { useState } from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'USER',
        adminKey: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', formData);

            console.log("Sunucu Cevabı:", response.data); // Konsola bak, ne geliyor?
            alert("Kayıt Başarılı! Giriş ekranına yönlendiriliyorsunuz...");
            navigate("/");

            // Backend'deki AuthResponse içindeki değişken adı neyse o gelir.
            // Genelde Java'da 'accessToken' (camelCase) olur.
            // Garanti olsun diye hepsini kontrol ediyoruz:
            const token = response.data.accessToken || response.data.access_token || response.data.token;

            if (token) {
                localStorage.setItem('token', token);
                alert("Kayıt Başarılı! Token Kaydedildi.");
                // İstersen burada yönlendirme yap: window.location.href = '/dashboard';
            } else {
                alert("Kayıt başarılı ama Token boş geldi. Konsolu (F12) kontrol et.");
            }

        } catch (err) {
            console.error("Kayıt Hatası:", err);
            const errMsg = err.response?.data?.message || "Bir hata oluştu";
            alert("Kayıt Başarısız: " + errMsg);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Kayıt Ol</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input type="text" name="firstName" placeholder="Ad" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <input type="text" name="lastName" placeholder="Soyad" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <input type="email" name="email" placeholder="E-posta" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <input type="password" name="password" placeholder="Şifre" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="USER">Kullanıcı (Üye)</option>
                            <option value="ADMIN">Yönetici (Admin)</option>
                        </select>
                    </div>
                    {formData.role === 'ADMIN' && (
                        <div className="form-group admin-key-box">
                            <label className="admin-label">Admin Doğrulama Anahtarı:</label>
                            <input type="password" name="adminKey" placeholder="Gizli Anahtarı Giriniz" onChange={handleChange} required />
                        </div>
                    )}

                    <button type="submit" className="auth-button">Kayıt Ol</button>
                </form>

                {/* --- YENİ EKLENEN KISIM: ZATEN HESABIN VAR MI? --- */}
                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                    Zaten hesabın var mı?{' '}
                    <span
                        onClick={() => navigate("/")}
                        style={{ color: '#0052cc', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                    >
                        Giriş Yap
                    </span>
                </p>
                {/* ------------------------------------------------ */}

            </div>
        </div>
    );
};

export default Register;