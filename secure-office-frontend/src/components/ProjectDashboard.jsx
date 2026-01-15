import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProjectService from "../services/project.service";
import axios from "axios"; // Kullanıcı ismini çekmek için

const ProjectDashboard = () => {
    const navigate = useNavigate();

    // Veri State'leri
    const [projects, setProjects] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form State'leri
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [message, setMessage] = useState("");

    // Tema State'i
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

    // --- 1. TEMA AYARLARI (ProjectBoard ile Aynı) ---
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    // --- 2. VERİLERİ ÇEKME ---
    useEffect(() => {
        fetchCurrentUser();
        loadProjects();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;
            // Backend endpointin bu olduğunu varsayıyoruz (Auth yapına göre)
            const res = await axios.get("http://localhost:8080/api/v1/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(res.data);
        } catch (e) { console.error("Kullanıcı bilgisi alınamadı", e); }
    };

    const loadProjects = () => {
        ProjectService.getAllProjects().then(
            (response) => {
                setProjects(response.data);
                setLoading(false);
            },
            (error) => {
                console.error("Projeler yüklenemedi:", error);
                if (error.response && error.response.status === 401) {
                    setMessage("Oturum süreniz dolmuş.");
                }
                setLoading(false);
            }
        );
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const projectData = { name: newProjectName, description: newProjectDesc };

        ProjectService.createProject(projectData).then(
            () => {
                setMessage("Proje oluşturuldu! 🎉");
                setNewProjectName("");
                setNewProjectDesc("");
                // Mesajı 3 saniye sonra temizle
                setTimeout(() => setMessage(""), 3000);
                loadProjects();
            },
            (error) => {
                setMessage("Hata: " + error.message);
            }
        );
    };

    if (loading && !projects.length) return <div style={{textAlign:'center', marginTop:'50px', color:'var(--text-main)'}}>Yükleniyor...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', fontFamily: 'Arial, sans-serif', transition: 'background 0.3s' }}>

            {/* --- HEADER (ProjectBoard İle Birebir Aynı Yapı) --- */}
            <div style={{ background: 'var(--bg-card)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', padding: '0 20px', transition: 'background 0.3s' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                    {/* Sol Taraf: Logo / Başlık */}
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize:'20px' }}>🚀 Proje Yönetimi</h2>
                    </div>

                    {/* Sağ Taraf: Admin, Mod, İsim, Çıkış */}
                    <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>

                        {/* Yönetim Butonu (Sadece Admin Görür) */}
                        {currentUser && currentUser.roles && currentUser.roles.some(r => r.name === 'ROLE_ADMIN') && (
                            <button
                                onClick={() => navigate("/admin")}
                                style={{
                                    padding: '6px 14px',
                                    background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                👑 Yönetim
                            </button>
                        )}

                        {/* Gece/Gündüz Modu */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: '50%',
                                width:'32px', height:'32px',
                                cursor:'pointer', fontSize:'16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-main)'
                            }}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        {/* Kullanıcı İsmi */}
                        {currentUser && (
                            <span style={{color: 'var(--text-secondary)', fontSize:'14px'}}>
                                <b style={{color: 'var(--text-main)'}}>{currentUser.firstName}</b>
                            </span>
                        )}

                        {/* Çıkış Butonu */}
                        <button
                            onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
                            style={{ padding: '6px 12px', background: '#ff5252', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Çıkış
                        </button>
                    </div>
                </div>
            </div>

            {/* --- ANA İÇERİK --- */}
            <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>

                {/* Bilgi Mesajı */}
                {message && (
                    <div style={{ padding: '10px', marginBottom: '20px', borderRadius: '4px', background: '#36b37e', color: 'white', textAlign: 'center', fontWeight:'bold' }}>
                        {message}
                    </div>
                )}

                {/* --- YENİ PROJE OLUŞTURMA FORMU (Kart Tasarımı) --- */}
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-main)' }}>Yeni Proje Oluştur</h4>
                    <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', flexWrap:'wrap' }}>
                        <div style={{flex: 1, minWidth:'200px'}}>
                            <input
                                type="text"
                                placeholder="Proje Adı (Örn: Mobil Uygulama)"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                required
                                style={{ width:'100%', padding:'10px', borderRadius:'4px', border:'1px solid var(--border-color)', outline:'none', background:'var(--input-bg)', color:'var(--text-main)' }}
                            />
                        </div>
                        <div style={{flex: 2, minWidth:'200px'}}>
                            <input
                                type="text"
                                placeholder="Açıklama (Opsiyonel)"
                                value={newProjectDesc}
                                onChange={(e) => setNewProjectDesc(e.target.value)}
                                style={{ width:'100%', padding:'10px', borderRadius:'4px', border:'1px solid var(--border-color)', outline:'none', background:'var(--input-bg)', color:'var(--text-main)' }}
                            />
                        </div>
                        <button type="submit" style={{ padding: '10px 25px', background: '#0052cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight:'bold' }}>
                            Oluştur +
                        </button>
                    </form>
                </div>

                {/* --- MEVCUT PROJELER LİSTESİ --- */}
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>Mevcut Projeler ({projects.length})</h4>

                {projects.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign:'center', marginTop:'40px' }}>Henüz hiç proje yok. Yukarıdan bir tane oluştur! 👆</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {projects.map((proj) => (
                            <div
                                key={proj.id}
                                onClick={() => navigate("/project/" + proj.id + "/tickets")}
                                style={{
                                    background: 'var(--bg-card)',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    border: '1px solid transparent',
                                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                    e.currentTarget.style.borderColor = '#0052cc';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                            >
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                                    <h3 style={{ margin: 0, color: '#0052cc', fontSize:'18px' }}>{proj.name}</h3>
                                    <span style={{ fontSize:'11px', background:'var(--bg-main)', padding:'2px 6px', borderRadius:'4px', color:'var(--text-secondary)' }}>ID: {proj.id}</span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize:'14px', lineHeight:'1.5' }}>
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