import React from 'react';
import { Droppable } from "@hello-pangea/dnd";
import TicketCard from "./TicketCard";

const KanbanColumn = ({ columnId, title, tickets, onTicketClick, onTicketDelete }) => {
    return (
        <div className="kanban-column">
            <h3 className="column-header">
                {title} <span className="ticket-count">{tickets.length}</span>
            </h3>

            <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                            minHeight: '100px',
                            transition: 'background 0.2s',
                            background: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent'
                        }}
                    >
                        {tickets.map((ticket, index) => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                index={index}
                                onClick={onTicketClick}
                                onDelete={onTicketDelete}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default KanbanColumn;