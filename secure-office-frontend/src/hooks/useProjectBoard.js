import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import TicketService from "../services/ticket.service";
import ProjectService from "../services/project.service";
import UserService from "../services/user.service";

const useProjectBoard = () => {
    const { id: projectId } = useParams();

    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [projectName, setProjectName] = useState("Yükleniyor...");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBoardData = async () => {
            try {
                const [projectRes, usersRes, ticketsRes] = await Promise.all([
                    ProjectService.getProjectById(projectId),
                    UserService.getAllUsers(),
                    TicketService.getTicketsByProject(projectId)
                ]);

                setProjectName(projectRes.data.name);
                setUsers(usersRes.data);
                setTickets(ticketsRes.data);
            } catch (error) {
                console.error("Board verisi yüklenirken hata:", error);
                toast.error("Proje verileri yüklenemedi.");
            } finally {
                setLoading(false);
            }
        };

        loadBoardData();
    }, [projectId]);

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const updatedTickets = tickets.map(ticket =>
            ticket.id.toString() === draggableId
                ? { ...ticket, status: destination.droppableId }
                : ticket
        );
        setTickets(updatedTickets);

        try {
            await TicketService.updateTicketStatus(draggableId, destination.droppableId);
        } catch (error) {
            toast.error("Taşıma işlemi sunucuda başarısız oldu!");
            // Hata durumunda eski state geri yüklenebilir (opsiyonel)
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        if(!window.confirm("Bu görevi silmek istediğine emin misin?")) return;

        try {
            await TicketService.deleteTicket(ticketId);
            setTickets(prev => prev.filter(t => t.id !== ticketId));
            toast.info("Görev silindi");
        } catch (error) {
            toast.error("Silme işlemi başarısız");
        }
    };

    const refreshBoard = () => {
        TicketService.getTicketsByProject(projectId)
            .then(res => setTickets(res.data));
    };

    return {
        projectId,
        projectName,
        users,
        tickets,
        loading,
        handleDragEnd,
        handleDeleteTicket,
        refreshBoard
    };
};

export default useProjectBoard;