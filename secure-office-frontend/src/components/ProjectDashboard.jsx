import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProjectService from "../services/project.service";
import UserService from "../services/user.service";
import { toast } from 'react-toastify';
import useTheme from "../hooks/useTheme";
import { ROLES } from "../utils/constants"; // <--- SABİTLER EKLENDİ
import "./ProjectDashboard.css";

const ProjectDashboard = () => {
    const navigate = useNavigate();

    // State'ler
    const [projects, setProjects] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");

    const [darkMode, setDarkMode] = useTheme();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(!token) {
            navigate("/");
            return;
        }
        fetchCurrentUser();
        loadProjects();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await UserService.getMe();
            setCurrentUser(res.data);
        } catch (e) {
            console.error("Kullanıcı bilgisi alınamadı", e);
        }
    };

    const loadProjects = () => {
        ProjectService.getAllProjects().then(
            (response) => {
                setProjects(response.data);
                setLoading(false);
            },
            (error) => {
                console.error("Projeler yüklenemedi:", error);
                setLoading(false);
            }
        );
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const projectData = { name: newProjectName, description: newProjectDesc };

        ProjectService.createProject(projectData).then(
            () => {
                toast.success("Proje oluşturuldu! 🎉");
                setNewProjectName("");
                setNewProjectDesc("");
                loadProjects();
            },
            (error) => {
                toast.error("Hata: " + error.message);
            }
        );
    };

    const handleDeleteProject = (e, projectId) => {
        e.stopPropagation();
        if (!window.confirm("Bu projeyi ve içindeki TÜM görevleri silmek istediğine emin misin?")) {
            return;
        }
        ProjectService.deleteProject(projectId).then(
            () => {
                toast.info("Proje silindi. 🗑️");
                setProjects(projects.filter(p => p.id !== projectId));
            },
            (error) => {
                toast.error("Silinemedi: " + error.message);
            }
        );
    };

    // CLEAN CODE: Sihirli string yerine sabit kullanımı
    const isAdmin = currentUser && currentUser.roles && currentUser.roles.some(r => r.name === ROLES.ADMIN);

    if (loading && !projects.length) return <div style={{textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;

    return (
        <div className="dashboard-container">
            {/* HEADER */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h2 className="app-title">🚀 Proje Yönetimi</h2>
                    </div>
                    <div className="header-right">
                        {isAdmin && (
                            <button onClick={() => navigate("/admin")} className="btn-admin">👑 Yönetim</button>
                        )}
                        <button onClick={() => setDarkMode(!darkMode)} className="btn-icon">
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        {currentUser && <span style={{fontSize:'14px', color:'var(--text-secondary)'}}><b>{currentUser.firstName}</b></span>}
                        <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }} className="btn-logout">Çıkış</button>
                    </div>
                </div>
            </div>

            {/* İÇERİK */}
            <div className="dashboard-content">

                {/* YENİ PROJE ÇUBUĞU */}
                <form onSubmit={handleCreate} className="create-project-bar">
                    <input
                        type="text"
                        placeholder="Yeni Proje Adı..."
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        required
                        className="form-input input-project-name"
                    />
                    <input
                        type="text"
                        placeholder="Açıklama (Opsiyonel)"
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        className="form-input input-project-desc"
                    />
                    <button type="submit" className="btn-primary">Oluştur +</button>
                </form>

                {/* PROJE LİSTESİ */}
                <h4 className="section-title">Mevcut Projeler ({projects.length})</h4>

                {projects.length === 0 ? (
                    <p className="empty-state">Henüz hiç proje yok. Yukarıdan bir tane oluştur! 👆</p>
                ) : (
                    <div className="project-grid">
                        {projects.map((proj) => (
                            <div
                                key={proj.id}
                                onClick={() => navigate("/project/" + proj.id + "/tickets")}
                                className="project-card"
                            >
                                <div className="card-header">
                                    <h3 className="project-name">{proj.name}</h3>

                                    {isAdmin && (
                                        <button
                                            onClick={(e) => handleDeleteProject(e, proj.id)}
                                            className="btn-delete-project"
                                            title="Projeyi Sil"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>

                                <span className="project-id-badge">ID: {proj.id}</span>

                                <p className="project-desc">
                                    {proj.description || "Açıklama yok."}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDashboard;