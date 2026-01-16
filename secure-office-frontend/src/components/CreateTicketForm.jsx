import React, { useState } from 'react';
import { toast } from 'react-toastify';
import TicketService from "../services/ticket.service";
import { PRIORITY, PRIORITY_LABELS } from "../utils/constants";

const CreateTicketForm = ({ projectId, users, onTicketCreated }) => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [priority, setPriority] = useState(PRIORITY.MEDIUM);
    const [assignedTo, setAssignedTo] = useState("");

    const handleCreate = async (e) => {
        e.preventDefault();

        const newTicket = {
            title,
            description: desc,
            priority,
            assignedToUserId: assignedTo ? Number(assignedTo) : null,
            projectId
        };

        try {
            await TicketService.createTicket(newTicket);
            toast.success("Görev eklendi! 🚀");

            setTitle("");
            setDesc("");
            setAssignedTo("");

            if (onTicketCreated) onTicketCreated();

        } catch (err) {
            const errorMsg = err.response?.data?.message || "Oluşturulamadı";
            toast.error("Hata: " + errorMsg);
        }
    };

    return (
        <form onSubmit={handleCreate} className="create-ticket-form">
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
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                    </option>
                ))}
            </select>
            <button type="submit" className="btn-primary">Ekle +</button>
        </form>
    );
};

export default CreateTicketForm;