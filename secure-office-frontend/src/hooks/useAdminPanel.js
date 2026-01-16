import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import UserService from "../services/user.service";

const useAdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Paralel istek atıyoruz (Performance Optimization)
            const [meRes, usersRes] = await Promise.all([
                UserService.getMe(),
                UserService.getAllUsers()
            ]);

            setCurrentUser(meRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Veri çekme hatası", error);
            toast.error("Veriler alınamadı veya yetkisiz giriş.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Bu kullanıcıyı silmek istediğine emin misin?")) return;

        try {
            await UserService.deleteUser(userId);
            // Optimistic Update: Sunucuya tekrar sormadan listeden siliyoruz (Hız hissi)
            setUsers(prev => prev.filter(u => u.id !== userId));
            toast.success("Kullanıcı silindi. 👋");
        } catch (error) {
            const msg = error.response?.data || "Silme işlemi başarısız!";
            toast.error(msg);
        }
    };

    return {
        users,
        currentUser,
        loading,
        handleDeleteUser
    };
};

export default useAdminPanel;