import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAdminPanel from "./hooks/useAdminPanel";
import useTheme from "./hooks/useTheme";
import AdminHeader from "./components/admin/AdminHeader";
import UserTable from "./components/admin/UserTable";
import './AdminPanel.css';

function AdminPanel() {
    const navigate = useNavigate();
    const location = useLocation();

    // Custom Hook ile mantığı çek
    const { users, currentUser, loading, handleDeleteUser } = useAdminPanel();

    // Tema yönetimi
    const [darkMode, setDarkMode] = useTheme();

    // Navigasyon mantığı (UI ile ilgili olduğu için burada kalabilir veya hook'a alınabilir)
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

                <AdminHeader
                    onBack={handleGoBack}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />

                <UserTable
                    users={users}
                    currentUser={currentUser}
                    onDelete={handleDeleteUser}
                />

            </div>
        </div>
    );
}

export default AdminPanel;