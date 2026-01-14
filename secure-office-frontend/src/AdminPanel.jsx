import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import './App.css';

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // <-- BEN KİMİM?
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const token = localStorage.getItem("token");
    const API_BASE_URL = "http://localhost:8080/api/v1";

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        fetchMe(); // <-- Önce ben kimim onu öğrenelim
        fetchUsers();
    }, []);

    // Şu an giriş yapmış olan adminin bilgilerini çek
    const fetchMe = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(res.data);
        } catch (error) {
            console.error("Kimlik bilgisi alınamadı", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Kullanıcılar çekilemedi", error);
            toast.error("Yetkisiz Giriş!");
            navigate("/tickets");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Bu kullanıcıyı silmek istediğine emin misin?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Kullanıcı silindi. 👋");
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            // Backend'den gelen özel hata mesajını gösterelim (örn: "Kendi hesabınızı silemezsiniz")
            if (error.response && error.response.data) {
                toast.error(error.response.data);
            } else {
                toast.error("Silme işlemi başarısız!");
            }
        }
    };

    if (loading) return <div style={{textAlign:'center', marginTop:'50px', color:'var(--text-main)'}}>Yükleniyor...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'Arial, sans-serif', padding: '20px', transition: 'background 0.3s' }}>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', borderBottom:'1px solid var(--border-color)', paddingBottom:'20px' }}>
                    <h2 style={{margin:0}}>👑 Admin Yönetim Paneli</h2>

                    <div style={{display:'flex', gap:'15px'}}>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '50%',
                                width:'32px', height:'32px',
                                cursor:'pointer', fontSize:'16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Gece/Gündüz Modu"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        <button
                            onClick={() => navigate("/tickets")}
                            style={{
                                padding:'8px 16px',
                                background:'var(--bg-card)',
                                border:'1px solid var(--border-color)',
                                color:'var(--text-main)',
                                borderRadius:'4px',
                                cursor:'pointer'
                            }}
                        >
                            ← Görevlere Dön
                        </button>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '15px 10px' }}>ID</th>
                            <th style={{ padding: '15px 10px' }}>İsim</th>
                            <th style={{ padding: '15px 10px' }}>E-Posta</th>
                            <th style={{ padding: '15px 10px' }}>Roller</th>
                            <th style={{ padding: '15px 10px', textAlign:'right' }}>İşlem</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => {
                            // KONTROL: Bu satırdaki kullanıcı BEN miyim?
                            const isMe = currentUser && currentUser.id === user.id;

                            return (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', background: isMe ? 'rgba(0, 82, 204, 0.05)' : 'transparent' }}>
                                    <td style={{ padding: '15px 10px', color:'var(--text-secondary)' }}>#{user.id}</td>
                                    <td style={{ padding: '15px 10px', fontWeight: isMe ? 'bold' : 'normal' }}>
                                        {user.firstName} {user.lastName}
                                        {isMe && <span style={{marginLeft:'5px', fontSize:'10px', color:'var(--text-secondary)'}}>(Sen)</span>}
                                    </td>
                                    <td style={{ padding: '15px 10px' }}>{user.email}</td>
                                    <td style={{ padding: '15px 10px' }}>
                                        {user.roles.map(r => (
                                            <span key={r.id} style={{
                                                background: r.name === 'ROLE_ADMIN' ? '#fab387' : '#89b4fa',
                                                color: '#1e1e2e',
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', marginRight:'5px'
                                            }}>
                                                    {r.name === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                                                </span>
                                        ))}
                                    </td>
                                    <td style={{ padding: '15px 10px', textAlign:'right' }}>
                                        {/* EĞER BU BEN DEĞİLSEM SİL BUTONUNU GÖSTER */}
                                        {!isMe && (
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                style={{
                                                    background: 'transparent', color: '#ff5252', border: '1px solid #ff5252',
                                                    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight:'bold',
                                                    transition: '0.2s'
                                                }}
                                                onMouseOver={(e) => { e.target.style.background = '#ff5252'; e.target.style.color = 'white'; }}
                                                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ff5252'; }}
                                            >
                                                Sil
                                            </button>
                                        )}
                                        {isMe && (
                                            <span style={{fontSize:'20px'}} title="Kendini silemezsin">🛡️</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;