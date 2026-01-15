import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from 'react-toastify';
import TicketService from "../services/ticket.service";
import ProjectService from "../services/project.service";
import axios from "axios";
import EditTicketModal from "./EditTicketModal";
import useTheme from "../hooks/useTheme";
import { ROLES, PRIORITY, PRIORITY_LABELS } from "../utils/constants"; // <--- SABİTLER EKLENDİ
import "./ProjectBoard.css";

function ProjectBoard() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [priority, setPriority] = useState(PRIORITY.MEDIUM); // Sabit kullanımı
    const [assignedTo, setAssignedTo] = useState("");

    const [currentUser, setCurrentUser] = useState(null);
    const [projectName, setProjectName] = useState("Yükleniyor...");

    const [editingTicket, setEditingTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const API_BASE_URL = "http://localhost:8080/api/v1";
    const token = localStorage.getItem("token");

    const [darkMode, setDarkMode] = useTheme();

    useEffect(() => {
        if(!token) { navigate("/"); return; }
        fetchCurrentUser();
        fetchUsers();
        loadProjectTickets();
        ProjectService.getProjectById(id).then(
            (res) => setProjectName(res.data.name),
            (err) => console.error("Proje ismi hatası", err)
        );
    }, [id]);

    useEffect(() => {
        if (editingTicket) fetchComments(editingTicket.id);
        else setComments([]);
    }, [editingTicket]);

    // API Calls
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
            (res) => { setTickets(res.data); setLoading(false); },
            (err) => { console.error(err); toast.error("Veriler alınamadı."); setLoading(false); }
        );
    };

    const fetchComments = async (ticketId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(res.data);
        } catch (err) { console.error(err); }
    };

    // Handlers
    const handleCreateTicket = (e) => {
        e.preventDefault();
        const newTicket = { title, description: desc, priority, assignedToUserId: assignedTo ? Number(assignedTo) : null, projectId: id };

        TicketService.createTicket(newTicket).then(
            () => {
                toast.success("Görev eklendi! 🚀");
                setTitle(""); setDesc(""); setAssignedTo("");
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
                    title: editingTicket.title, description: editingTicket.description,
                    priority: editingTicket.priority,
                    assignedToUserId: editingTicket.assignedTo ? editingTicket.assignedTo.id : null
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingTicket(null);
            loadProjectTickets();
            toast.success("Güncellendi! ✅");
        } catch (error) { toast.error("Güncelleme başarısız!"); }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            await axios.post(`${API_BASE_URL}/tickets/${editingTicket.id}/comments`,
                { text: newComment }, { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewComment("");
            fetchComments(editingTicket.id);
            toast.success("Yorum eklendi! 💬");
        } catch (err) { toast.error("Yorum hatası!"); }
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const updatedTickets = tickets.map(t => {
            if (t.id.toString() === draggableId) { return { ...t, status: destination.droppableId }; }
            return t;
        });
        setTickets(updatedTickets);

        TicketService.updateTicketStatus(draggableId, destination.droppableId).catch(() => {
            toast.error("Taşıma başarısız!");
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
        <div className="board-container">
            {/* HEADER */}
            <div className="board-header">
                <div className="header-content">
                    <div className="header-left">
                        <button onClick={() => navigate("/projects")} className="back-btn" title="Geri">⬅️</button>
                        <h2 className="board-title">{projectName}</h2>
                    </div>
                    <div className="header-right">
                        {currentUser && currentUser.roles.some(r => r.name === ROLES.ADMIN) && (
                            <button onClick={() => navigate("/admin", { state: { projectId: id } })} className="btn-admin">👑 Yönetim</button>
                        )}
                        <button onClick={() => setDarkMode(!darkMode)} className="btn-icon">{darkMode ? '☀️' : '🌙'}</button>
                        {currentUser && <span style={{fontSize:'14px', color:'var(--text-secondary)'}}><b>{currentUser.firstName}</b></span>}
                        <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }} className="btn-logout">Çıkış</button>
                    </div>
                </div>
            </div>

            <div className="board-wrapper">
                {/* --- EKLEME FORMU --- */}
                <form onSubmit={handleCreateTicket} className="create-ticket-form">
                    <input
                        type="text"
                        placeholder="Ne yapılacak?"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        className="form-input input-title"
                    />
                    <input
                        type="text"
                        placeholder="Detaylar"
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="form-input input-desc"
                    />
                    <select
                        value={priority}
                        onChange={e => setPriority(e.target.value)}
                        className="form-select select-priority"
                    >
                        {/* Sabitlerden okuma */}
                        <option value={PRIORITY.LOW}>{PRIORITY_LABELS[PRIORITY.LOW]}</option>
                        <option value={PRIORITY.MEDIUM}>{PRIORITY_LABELS[PRIORITY.MEDIUM]}</option>
                        <option value={PRIORITY.HIGH}>{PRIORITY_LABELS[PRIORITY.HIGH]}</option>
                    </select>
                    <select
                        value={assignedTo}
                        onChange={e => setAssignedTo(e.target.value)}
                        className="form-select select-user"
                    >
                        <option value="">Bana Ata</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                    <button type="submit" className="btn-create btn-primary">Ekle +</button>
                </form>

                {/* KANBAN BOARD */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="kanban-columns">
                        {Object.entries(columns).map(([columnId, column]) => (
                            <div key={columnId} className="kanban-column">
                                <h3 className="column-header">{column.title} <span className="ticket-count">{column.items.length}</span></h3>
                                <Droppable droppableId={columnId}>
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: '100px', transition: 'background 0.2s', background: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent' }}>
                                            {column.items.map((ticket, index) => (
                                                <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => setEditingTicket(ticket)}
                                                            className="ticket-card"
                                                            style={{
                                                                backgroundColor: snapshot.isDragging ? 'var(--drag-bg)' : 'var(--bg-card)',
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div className={`ticket-priority priority-${ticket.priority.toLowerCase()}`}>
                                                                {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                                                            </div>
                                                            <strong className="ticket-title">{ticket.title}</strong>
                                                            <span className="ticket-desc">{ticket.description}</span>

                                                            {ticket.assignedTo && (
                                                                <div className="ticket-avatar" title={ticket.assignedTo.firstName}>
                                                                    {ticket.assignedTo.firstName.charAt(0)}
                                                                </div>
                                                            )}
                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(ticket.id); }} className="btn-delete-card">🗑️</button>
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

            {/* DÜZENLEME MODALI */}
            <EditTicketModal
                editingTicket={editingTicket}
                setEditingTicket={setEditingTicket}
                users={users}
                handleUpdateTicket={handleUpdateTicket}
                comments={comments}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={handleAddComment}
            />
        </div>
    );
}

export default ProjectBoard;