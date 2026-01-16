// src/components/ProjectBoard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";

// Hook & Utils
import useProjectBoard from "../hooks/useProjectBoard";
import useTheme from "../hooks/useTheme";
import { ROLES } from "../utils/constants";

// Components
import KanbanColumn from "./KanbanColumn";
import EditTicketModal from "./EditTicketModal";
import CreateTicketForm from "./CreateTicketForm"; // Bunu da ayırdığımızı varsayalım (aşağıda kodu var)

// CSS
import "./ProjectBoard.css";

function ProjectBoard() {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useTheme();

    // Logic extracted to custom hook (Bölüm 3 & 10)
    const {
        projectId, projectName, users, tickets, loading,
        handleDragEnd, handleDeleteTicket, refreshBoard
    } = useProjectBoard();

    // Local UI State (Sadece modal ve form için gerekli basit state'ler burada kalabilir)
    const [editingTicket, setEditingTicket] = useState(null);

    // Columns Definition (Bölüm 6: Veri Yapıları)
    const columns = {
        OPEN: { title: "📌 Yapılacaklar", items: tickets.filter(t => t.status === 'OPEN') },
        IN_PROGRESS: { title: "🚀 Sürüyor", items: tickets.filter(t => t.status === 'IN_PROGRESS') },
        DONE: { title: "✅ Tamamlandı", items: tickets.filter(t => t.status === 'DONE') }
    };

    // Yükleniyor durumu
    if (loading) return <div className="loading-screen">Proje Yükleniyor...</div>;

    return (
        <div className="board-container">
            <header className="board-header">
                <div className="header-content">
                    <div className="header-left">
                        <button onClick={() => navigate("/projects")} className="back-btn" title="Geri">⬅️</button>
                        <h2 className="board-title">{projectName}</h2>
                    </div>

                    <div className="header-right">
                        <button onClick={() => setDarkMode(!darkMode)} className="btn-icon">
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
                            className="btn-logout"
                        >
                            Çıkış
                        </button>
                    </div>
                </div>
            </header>

            <main className="board-wrapper">
                {/* Form Mantığı da ayrıştırılmalı, şimdilik prop olarak geçiyoruz */}
                <CreateTicketForm
                    projectId={projectId}
                    users={users}
                    onTicketCreated={refreshBoard}
                />

                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="kanban-columns">
                        {Object.entries(columns).map(([columnId, columnData]) => (
                            <KanbanColumn
                                key={columnId}
                                columnId={columnId}
                                title={columnData.title}
                                tickets={columnData.items}
                                onTicketClick={setEditingTicket}
                                onTicketDelete={handleDeleteTicket}
                            />
                        ))}
                    </div>
                </DragDropContext>
            </main>

            {/* Modal hala biraz karmaşık, bir sonraki refactor adımında Context API kullanılabilir */}
            <EditTicketModal
                editingTicket={editingTicket}
                setEditingTicket={setEditingTicket}
                users={users}
                onUpdateSuccess={refreshBoard}
            />
        </div>
    );
}

export default ProjectBoard;