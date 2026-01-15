import api from "./api";

const TICKET_URL = "/tickets";

// 1. Tüm Ticketları Getir
const getAllTickets = () => {
    return api.get(TICKET_URL);
};

// 2. Sadece bir projeye ait ticketları getir
const getTicketsByProject = (projectId) => {
    return api.get(TICKET_URL + "/project/" + projectId);
};

// 3. Ticket Oluştur
const createTicket = (ticketData) => {
    return api.post(TICKET_URL, ticketData);
};

// 4. Statü Güncelle
const updateTicketStatus = (id, status) => {
    return api.patch(TICKET_URL + "/" + id + "/status", { status });
};

// 5. Sil
const deleteTicket = (id) => {
    return api.delete(TICKET_URL + "/" + id);
};

const TicketService = {
    getAllTickets,
    getTicketsByProject,
    createTicket,
    updateTicketStatus,
    deleteTicket
};

export default TicketService;