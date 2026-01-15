import axios from "axios";

// Backend'de TicketController @RequestMapping("/api/v1/tickets") olarak ayarlıydı.
const API_URL = "http://localhost:8080/api/v1/tickets";

const authHeader = () => {
    const token = localStorage.getItem("token");
    if (token) {
        return { Authorization: "Bearer " + token };
    } else {
        return {};
    }
};

// 1. Tüm Ticketları Getir (Eski sayfa için)
const getAllTickets = () => {
    return axios.get(API_URL, { headers: authHeader() });
};

// 2. YENİ: Sadece bir projeye ait ticketları getir
const getTicketsByProject = (projectId) => {
    // Backend'de bu uç: /api/v1/tickets/project/{projectId}
    return axios.get(API_URL + "/project/" + projectId, { headers: authHeader() });
};

// 3. Ticket Oluştur
const createTicket = (ticketData) => {
    return axios.post(API_URL, ticketData, { headers: authHeader() });
};

// 4. Statü Güncelle (Sürükle Bırak için)
const updateTicketStatus = (id, status) => {
    return axios.patch(API_URL + "/" + id + "/status", { status }, { headers: authHeader() });
};

// 5. Sil
const deleteTicket = (id) => {
    return axios.delete(API_URL + "/" + id, { headers: authHeader() });
};

const TicketService = {
    getAllTickets,
    getTicketsByProject,
    createTicket,
    updateTicketStatus,
    deleteTicket
};

export default TicketService;