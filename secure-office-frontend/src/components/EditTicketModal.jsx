import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from "../services/api"; // Merkezi API yapımızı kullanıyoruz
import { PRIORITY, PRIORITY_LABELS } from "../utils/constants";
import './ProjectBoard.css';

const EditTicketModal = ({ editingTicket, setEditingTicket, users, onUpdateSuccess }) => {

    // State Yönetimi artık Modalin içinde (Encapsulation)
    const [currentTicket, setCurrentTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    // Modal açıldığında verileri senkronize et
    useEffect(() => {
        if (editingTicket) {
            setCurrentTicket({ ...editingTicket }); // Props'u local state'e kopyala
            fetchComments(editingTicket.id);
        }
    }, [editingTicket]);

    // API: Yorumları Çek
    const fetchComments = async (ticketId) => {
        try {
            const res = await api.get(`/tickets/${ticketId}/comments`);
            setComments(res.data || []); // Data yoksa boş dizi ata
        } catch (err) {
            console.error("Yorum hatası:", err);
            setComments([]);
        }
    };

    // API: Yorum Ekle
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            await api.post(`/tickets/${currentTicket.id}/comments`, { text: newComment });
            setNewComment("");
            fetchComments(currentTicket.id); // Listeyi tazele
            toast.success("Yorum eklendi! 💬");
        } catch (err) {
            toast.error("Yorum eklenemedi.");
        }
    };

    // API: Görevi Güncelle (Kaydet)
    const handleSave = async () => {
        try {
            await api.put(`/tickets/${currentTicket.id}`, {
                title: currentTicket.title,
                description: currentTicket.description,
                priority: currentTicket.priority,
                assignedToUserId: currentTicket.assignedTo ? currentTicket.assignedTo.id : null
            });

            toast.success("Güncellendi! ✅");
            if (onUpdateSuccess) onUpdateSuccess(); // Ana sayfayı (Board) yenile
            setEditingTicket(null); // Modalı kapat
        } catch (error) {
            console.error(error);
            toast.error("Güncelleme başarısız!");
        }
    };

    // Eğer kapalıysa veya veri yüklenmediyse gösterme
    if (!editingTicket || !currentTicket) return null;

    return (
        <div className="modal-overlay" onClick={() => setEditingTicket(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <h3 className="modal-header">Görevi Düzenle</h3>

                {/* Form Alanı */}
                <div className="modal-form">
                    <div className="form-group">
                        <label className="modal-label">Başlık</label>
                        <input
                            type="text"
                            value={currentTicket.title}
                            onChange={e => setCurrentTicket({...currentTicket, title: e.target.value})}
                            className="form-input"
                            placeholder="Görev başlığı..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="modal-label">Açıklama</label>
                        <textarea
                            rows="4"
                            value={currentTicket.description || ""}
                            onChange={e => setCurrentTicket({...currentTicket, description: e.target.value})}
                            className="form-input"
                            placeholder="Detaylı açıklama ekle..."
                        />
                    </div>

                    <div className="modal-row">
                        <div className="form-group">
                            <label className="modal-label">Öncelik</label>
                            <select
                                value={currentTicket.priority}
                                onChange={e => setCurrentTicket({...currentTicket, priority: e.target.value})}
                                className="form-select"
                            >
                                <option value={PRIORITY.LOW}>{PRIORITY_LABELS[PRIORITY.LOW]}</option>
                                <option value={PRIORITY.MEDIUM}>{PRIORITY_LABELS[PRIORITY.MEDIUM]}</option>
                                <option value={PRIORITY.HIGH}>{PRIORITY_LABELS[PRIORITY.HIGH]}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="modal-label">Atanan Kişi</label>
                            <select
                                value={currentTicket.assignedTo ? currentTicket.assignedTo.id : ""}
                                onChange={e => {
                                    const userId = Number(e.target.value);
                                    const userObj = users.find(u => u.id === userId);
                                    setCurrentTicket({...currentTicket, assignedTo: userObj || null});
                                }}
                                className="form-select"
                            >
                                <option value="">Atanmadı</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Yorumlar Bölümü */}
                <div className="comments-section">
                    <h4 className="section-title">💬 Yorumlar</h4>

                    <div className="comment-list">
                        {comments.length === 0 ? (
                            <p style={{textAlign:'center', color:'var(--text-secondary)', fontSize:'0.85rem', fontStyle:'italic'}}>Henüz yorum yok.</p>
                        ) : (
                            comments.map(c => (
                                <div key={c.id} className="comment-bubble">
                                    <div className="comment-header">
                                        <span>{c.createdBy ? `${c.createdBy.firstName} ${c.createdBy.lastName}` : 'Bilinmeyen'}</span>
                                        <span>{new Date(c.createdAt).toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div className="comment-body">{c.text}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="comment-input-area">
                        <input
                            type="text"
                            placeholder="Bir yorum yaz..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                            className="form-input"
                            style={{ flex: 1 }}
                        />
                        <button onClick={handleAddComment} className="btn-primary">Gönder</button>
                    </div>
                </div>

                {/* Footer Butonları */}
                <div className="modal-footer">
                    <button onClick={() => setEditingTicket(null)} className="btn-secondary">İptal</button>
                    <button onClick={handleSave} className="btn-primary" style={{backgroundColor: '#36b37e'}}>Kaydet</button>
                </div>
            </div>
        </div>
    );
};

export default EditTicketModal;