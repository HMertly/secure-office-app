import React from 'react';
import { PRIORITY, PRIORITY_LABELS } from "../utils/constants"; // <--- SABİTLER EKLENDİ
import './ProjectBoard.css';

const EditTicketModal = ({
                             editingTicket, setEditingTicket, users, handleUpdateTicket,
                             comments, newComment, setNewComment, handleAddComment
                         }) => {

    if (!editingTicket) return null;

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
                            value={editingTicket.title}
                            onChange={e => setEditingTicket({...editingTicket, title: e.target.value})}
                            className="form-input"
                            placeholder="Görev başlığı..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="modal-label">Açıklama</label>
                        <textarea
                            rows="4"
                            value={editingTicket.description || ""}
                            onChange={e => setEditingTicket({...editingTicket, description: e.target.value})}
                            className="form-input"
                            placeholder="Detaylı açıklama ekle..."
                            // style prop'una gerek kalmadı, CSS hallediyor (resize: none)
                        />
                    </div>

                    {/* Yan Yana Grid Yapısı */}
                    <div className="modal-row">
                        <div className="form-group">
                            <label className="modal-label">Öncelik</label>
                            <select
                                value={editingTicket.priority}
                                onChange={e => setEditingTicket({...editingTicket, priority: e.target.value})}
                                className="form-select"
                            >
                                {/* Sabitlerden okuma */}
                                <option value={PRIORITY.LOW}>{PRIORITY_LABELS[PRIORITY.LOW]}</option>
                                <option value={PRIORITY.MEDIUM}>{PRIORITY_LABELS[PRIORITY.MEDIUM]}</option>
                                <option value={PRIORITY.HIGH}>{PRIORITY_LABELS[PRIORITY.HIGH]}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="modal-label">Atanan Kişi</label>
                            <select
                                value={editingTicket.assignedTo ? editingTicket.assignedTo.id : ""}
                                onChange={e => {
                                    const userId = Number(e.target.value);
                                    const userObj = users.find(u => u.id === userId);
                                    setEditingTicket({...editingTicket, assignedTo: userObj || null});
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
                                        <span>{c.createdBy.firstName} {c.createdBy.lastName}</span>
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
                    <button onClick={() => setEditingTicket(null)} className="btn-secondary">Kapat</button>
                    <button onClick={handleUpdateTicket} className="btn-primary" style={{backgroundColor: '#36b37e'}}>Kaydet</button>
                </div>
            </div>
        </div>
    );
};

export default EditTicketModal;