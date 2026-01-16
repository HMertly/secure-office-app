import React from 'react';

const AdminHeader = ({ onBack, darkMode, setDarkMode }) => {
    return (
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

                <button onClick={onBack} className="btn-back">
                    ← Geri Dön
                </button>
            </div>
        </div>
    );
};

export default AdminHeader;