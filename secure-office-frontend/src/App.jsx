import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import TicketList from "./TicketList.jsx";
import AdminPanel from "./AdminPanel"; // Admin paneli importu
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <BrowserRouter>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <Routes>
                {/* Giriş Sayfası */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Ticket Listesi Sayfası */}
                <Route path="/tickets" element={<TicketList />} />

                {/* Admin Paneli Sayfası - HATA BURADAYDI, DÜZELDİ */}
                <Route path="/admin" element={<AdminPanel />} />

                {/* Bilinmeyen bir yere giderse Login'e at */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;