import React from 'react';
import { Draggable } from "@hello-pangea/dnd";
import { PRIORITY_LABELS } from "../utils/constants";

const TicketCard = ({ ticket, index, onClick, onDelete }) => {
    return (
        <Draggable draggableId={ticket.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(ticket)}
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

                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(ticket.id); }}
                        className="btn-delete-card"
                    >
                        🗑️
                    </button>
                </div>
            )}
        </Draggable>
    );
};

export default TicketCard;