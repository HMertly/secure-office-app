import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from "react-router-dom";
import UserService from "./services/user.service"; // Yeni servisimiz
import './AdminPanel.css'; // Yeni CSS dosyamız
import useTheme from "./hooks/useTheme";

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

        const [darkMode, setDarkMode] = useTheme();

    // Veri Çekme
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Promise.all ile iki isteği paralel atıyoruz (Daha hızlı)
            const [meRes, usersRes] = await Promise.all([
                UserService.getMe(),
                UserService.getAllUsers()
            ]);

            setCurrentUser(meRes.data);
            setUsers(usersRes.data);
            setLoading(false);

        } catch (error) {
            console.error("Veri çekme hatası", error);
            toast.error("Veriler alınamadı veya yetkisiz giriş.");
            setLoading(false);
            // Hata durumunda (eğer api.js redirect yapmazsa) projeler sayfasına atabiliriz
            // navigate("/projects");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Bu kullanıcıyı silmek istediğine emin misin?")) return;

        try {
            await UserService.deleteUser(userId);
            toast.success("Kullanıcı silindi. 👋");
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            const msg = error.response?.data || "Silme işlemi başarısız!";
            toast.error(msg);
        }
    };

    // Geri Dönüş Mantığı
    const handleGoBack = () => {
        if (location.state && location.state.projectId) {
            navigate("/project/" + location.state.projectId + "/tickets");
        } else {
            navigate("/projects");
        }
    };

    if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;

    return (
        <div className="admin-container">
            <div className="admin-wrapper">

                {/* HEADER */}
                <div className="admin-header">
                    <h2 className="admin-title">👑 Admin Yönetim Paneli</h2>

                    <div className="header-actions">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="btn-icon"
                            title="Gece/Gündüz Modu"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        <button onClick={handleGoBack} className="btn-back">
                            ← Görevlere Dön
                        </button>
                    </div>
                </div>

                {/* TABLO */}
                <div className="table-card">
                    <table className="user-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>İsim</th>
                            <th>E-Posta</th>
                            <th>Roller</th>
                            <th style={{textAlign:'right'}}>İşlem</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => {
                            const isMe = currentUser && currentUser.id === user.id;

                            return (
                                <tr key={user.id} className={isMe ? "row-me" : ""}>
                                    <td style={{color: 'var(--text-secondary)'}}>#{user.id}</td>

                                    <td className={isMe ? "text-me" : ""}>
                                        {user.firstName} {user.lastName}
                                        {isMe && <span className="badge-me">(Sen)</span>}
                                    </td>

                                    <td>{user.email}</td>

                                    <td>
                                        {user.roles.map(r => (
                                            <span
                                                key={r.id}
                                                className={`role-badge ${r.name === 'ROLE_ADMIN' ? 'role-admin' : 'role-user'}`}
                                            >
                                                    {r.name === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
                                                </span>
                                        ))}
                                    </td>

                                    <td style={{textAlign:'right'}}>
                                        {!isMe ? (
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="btn-delete-user"
                                            >
                                                Sil
                                            </button>
                                        ) : (
                                            <span className="icon-shield" title="Kendini silemezsin">🛡️</span>
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