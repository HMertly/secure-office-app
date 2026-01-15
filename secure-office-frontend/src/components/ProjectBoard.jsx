import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from 'react-toastify';
import TicketService from "../services/ticket.service";
import ProjectService from "../services/project.service";
import axios from "axios";

function ProjectBoard() {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE'LER ---
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Yeni Görev Formu
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [assignedTo, setAssignedTo] = useState("");

    // Kullanıcı ve Proje Bilgisi
    const [currentUser, setCurrentUser] = useState(null);
    const [projectName, setProjectName] = useState("Yükleniyor...");
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

    // --- MODAL STATE'LERİ (DÜZENLEME & YORUM) ---
    const [editingTicket, setEditingTicket] = useState(null); // Şu an hangi görevi düzenliyoruz?
    const [comments, setComments] = useState([]); // O görevin yorumları
    const [newComment, setNewComment] = useState(""); // Yeni yazılan yorum

    const API_BASE_URL = "http://localhost:8080/api/v1";
    const token = localStorage.getItem("token");

    // --- EFFECT'LER ---
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    useEffect(() => {
        fetchCurrentUser();
        fetchUsers();
        loadProjectTickets();

        ProjectService.getProjectById(id).then(
            (res) => setProjectName(res.data.name),
            (err) => console.error("Proje ismi alınamadı", err)
        );
    }, [id]);

    // Düzenleme penceresi açıldığında yorumları çek
    useEffect(() => {
        if (editingTicket) {
            fetchComments(editingTicket.id);
        } else {
            setComments([]);
        }
    }, [editingTicket]);

    // --- API FONKSİYONLARI ---
    const fetchCurrentUser = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            setCurrentUser(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
        } catch (e) { console.error(e); }
    };

    const loadProjectTickets = () => {
        TicketService.getTicketsByProject(id).then(
            (res) => {
                setTickets(res.data);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                toast.error("Proje verileri alınamadı.");
                setLoading(false);
            }
        );
    };

    const fetchComments = async (ticketId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(res.data);
        } catch (err) { console.error("Yorumlar alınamadı", err); }
    };

    // --- İŞLEM FONKSİYONLARI ---
    const handleCreateTicket = (e) => {
        e.preventDefault();
        const newTicket = {
            title: title,
            description: desc,
            priority: priority,
            assignedToUserId: assignedTo ? Number(assignedTo) : null,
            projectId: id
        };

        TicketService.createTicket(newTicket).then(
            () => {
                toast.success("Görev eklendi! 🚀");
                setTitle("");
                setDesc("");
                setAssignedTo("");
                loadProjectTickets();
            },
            (err) => { toast.error("Hata: " + (err.response?.data?.message || "Oluşturulamadı")); }
        );
    };

    const handleUpdateTicket = async () => {
        if (!editingTicket) return;
        try {
            await axios.put(`${API_BASE_URL}/tickets/${editingTicket.id}`,
                {
                    title: editingTicket.title,
                    description: editingTicket.description,
                    priority: editingTicket.priority,
                    assignedToUserId: editingTicket.assignedTo ? editingTicket.assignedTo.id : null
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingTicket(null);
            loadProjectTickets();
            toast.success("Görev güncellendi! ✅");
        } catch (error) {
            console.error("Güncelleme hatası", error);
            toast.error("Güncelleme başarısız!");
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            await axios.post(`${API_BASE_URL}/tickets/${editingTicket.id}/comments`,
                { text: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewComment("");
            fetchComments(editingTicket.id);
            toast.success("Yorum eklendi! 💬");
        } catch (err) { toast.error("Yorum gönderilemedi!"); }
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const updatedTickets = tickets.map(t => {
            if (t.id.toString() === draggableId) {
                return { ...t, status: destination.droppableId };
            }
            return t;
        });
        setTickets(updatedTickets);

        TicketService.updateTicketStatus(draggableId, destination.droppableId).catch(() => {
            toast.error("Taşıma başarısız, geri alınıyor...");
            loadProjectTickets();
        });
    };

    const handleDelete = (ticketId) => {
        if(!window.confirm("Silmek istediğine emin misin?")) return;
        TicketService.deleteTicket(ticketId).then(() => {
            toast.info("Görev silindi");
            loadProjectTickets();
        }).catch(err => toast.error("Silinemedi"));
    }

    const columns = {
        OPEN: { title: "📌 Yapılacaklar", items: tickets.filter(t => t.status === 'OPEN') },
        IN_PROGRESS: { title: "🚀 Sürüyor", items: tickets.filter(t => t.status === 'IN_PROGRESS') },
        DONE: { title: "✅ Tamamlandı", items: tickets.filter(t => t.status === 'DONE') }
    };

    if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Proje Yükleniyor...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', fontFamily: 'Arial, sans-serif' }}>

            {/* --- HEADER --- */}
            <div style={{ background: 'var(--bg-card)', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', padding: '0 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <button onClick={() => navigate("/projects")} style={{background:'transparent', border:'none', fontSize:'18px', cursor:'pointer', color:'var(--text-main)'}} title="Projelere Dön">⬅️</button>
                        <h2 style={{ color: 'var(--text-main)', margin: 0 }}>{projectName}</h2>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
                        {currentUser && currentUser.roles.some(r => r.name === 'ROLE_ADMIN') && (
                            <button onClick={() => navigate("/admin", { state: { projectId: id } })} style={{ padding: '6px 14px', background: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>👑 Yönetim</button>
                        )}
                        <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '50%', width:'32px', height:'32px', cursor:'pointer', fontSize:'16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{darkMode ? '☀️' : '🌙'}</button>
                        {currentUser && <span style={{color: 'var(--text-secondary)', fontSize:'14px'}}><b style={{color: 'var(--text-main)'}}>{currentUser.firstName}</b></span>}
                        <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }} style={{ padding: '6px 12px', background: '#ff5252', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Çıkış</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>

                {/* --- EKLEME FORMU --- */}
                <form onSubmit={handleCreateTicket} style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'var(--bg-card)', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <input type="text" placeholder="Bu projede ne yapılacak?" value={title} onChange={e => setTitle(e.target.value)} required style={{flex: 1, padding:'10px', borderRadius:'4px', border:'1px solid var(--border-color)', outline:'none', background:'var(--input-bg)', color:'var(--text-main)'}} />
                    <input type="text" placeholder="Detaylar" value={desc} onChange={e => setDesc(e.target.value)} style={{flex: 2, padding:'10px', borderRadius:'4px', border:'1px solid var(--border-color)', outline:'none', background:'var(--input-bg)', color:'var(--text-main)'}} />
                    <select value={priority} onChange={e => setPriority(e.target.value)} style={{padding:'10px', borderRadius:'4px', border:'1px solid var(--border-color)', outline:'none', cursor:'pointer', background:'var(--input-bg)', color:'var(--text-main)'}}>
                        <option value="LOW">Düşük 🟢</option>
                        <option value="MEDIUM">Orta 🟡</option>
                        <option value="HIGH">Yüksek 🔴</option>
                    </select>
                    <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={{padding:'10px', borderRadius:'4px', border:'1px solid var(--border-color)', outline:'none', cursor:'pointer', background:'var(--input-bg)', color:'var(--text-main)'}}>
                        <option value="">Bana Ata</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                    <button type="submit" style={{background:'#0052cc', color:'white', border:'none', padding:'0 20px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>Ekle +</button>
                </form>

                {/* --- KANBAN BOARD --- */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        {Object.entries(columns).map(([columnId, column]) => (
                            <div key={columnId} style={{ flex: 1, minWidth: '280px', background: 'var(--kanban-bg)', borderRadius: '6px', padding: '10px' }}>
                                <h3 style={{ margin: '0 0 10px 10px', fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{column.title} <span style={{color:'var(--text-main)', marginLeft:'5px'}}>{column.items.length}</span></h3>
                                <Droppable droppableId={columnId}>
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: '100px', background: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent', transition: 'background 0.2s', borderRadius: '4px' }}>
                                            {column.items.map((ticket, index) => (
                                                <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => setEditingTicket(ticket)} // <--- TIKLAYINCA DÜZENLEME AÇILIYOR
                                                            style={{
                                                                userSelect: 'none', padding: '16px', margin: '0 0 8px 0', minHeight: '50px',
                                                                backgroundColor: snapshot.isDragging ? 'var(--drag-bg)' : 'var(--bg-card)',
                                                                color: 'var(--text-main)', borderRadius: '4px', position: 'relative',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)', cursor: 'pointer', // <--- El işareti
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: 'white', marginBottom: '5px', backgroundColor: ticket.priority === 'HIGH' ? '#ff5252' : ticket.priority === 'LOW' ? '#36b37e' : '#ffab00' }}>{ticket.priority === 'HIGH' ? 'YÜKSEK' : ticket.priority === 'LOW' ? 'DÜŞÜK' : 'ORTA'}</div>
                                                            <strong style={{ display:'block', marginBottom:'4px' }}>{ticket.title}</strong>
                                                            <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{ticket.description}</span>
                                                            {ticket.assignedTo && (
                                                                <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0052cc', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }} title={ticket.assignedTo.firstName}>
                                                                    {ticket.assignedTo.firstName.charAt(0)}
                                                                </div>
                                                            )}
                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(ticket.id); }} style={{position:'absolute', top:'5px', right:'5px', border:'none', background:'transparent', color:'#ff5252', cursor:'pointer'}}>🗑️</button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>

            {/* --- DÜZENLEME MODALI (POPUP) --- */}
            {editingTicket && (
                <div className="modal-overlay" onClick={() => setEditingTicket(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px'}}>Görevi Düzenle</h3>

                        <div style={{display:'flex', gap:'15px', flexDirection:'column'}}>
                            <div>
                                <label>Başlık</label>
                                <input type="text" value={editingTicket.title} onChange={e => setEditingTicket({...editingTicket, title: e.target.value})} />
                            </div>
                            <div>
                                <label>Açıklama</label>
                                <textarea rows="3" value={editingTicket.description || ""} onChange={e => setEditingTicket({...editingTicket, description: e.target.value})} />
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                <div style={{flex:1}}>
                                    <label>Öncelik</label>
                                    <select value={editingTicket.priority} onChange={e => setEditingTicket({...editingTicket, priority: e.target.value})}>
                                        <option value="LOW">Düşük 🟢</option>
                                        <option value="MEDIUM">Orta 🟡</option>
                                        <option value="HIGH">Yüksek 🔴</option>
                                    </select>
                                </div>
                                <div style={{flex:1}}>
                                    <label>Atanan Kişi</label>
                                    <select
                                        value={editingTicket.assignedTo ? editingTicket.assignedTo.id : ""}
                                        onChange={e => {
                                            const userId = Number(e.target.value);
                                            const userObj = users.find(u => u.id === userId);
                                            setEditingTicket({...editingTicket, assignedTo: userObj || null});
                                        }}
                                    >
                                        <option value="">Atanmadı</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* --- YORUMLAR --- */}
                        <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                            <h4 style={{margin: '0 0 10px 0'}}>💬 Yorumlar</h4>
                            <div style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '15px', border: '1px solid var(--border-color)' }}>
                                {comments.length === 0 ? <p style={{textAlign:'center', color:'var(--text-secondary)', fontSize:'13px'}}>Henüz yorum yok.</p> : comments.map(c => (
                                    <div key={c.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                                            <strong>{c.createdBy.firstName} {c.createdBy.lastName}</strong>
                                            <span style={{ color: 'var(--text-secondary)' }}>{new Date(c.createdAt).toLocaleString('tr-TR')}</span>
                                        </div>
                                        <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{c.text}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" placeholder="Bir yorum yaz..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment()} style={{ flex: 1 }} />
                                <button onClick={handleAddComment} style={{ background: '#0052cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 15px' }}>Gönder</button>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setEditingTicket(null)} style={{padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '4px', cursor: 'pointer'}}>Kapat</button>
                            <button onClick={handleUpdateTicket} style={{padding: '8px 16px', background: '#36b37e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectBoard;