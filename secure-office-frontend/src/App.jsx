import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProjectDashboard from "./components/ProjectDashboard.jsx";
import ProjectBoard from "./components/ProjectBoard.jsx"; // <-- YENİ EKLENDİ
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import AdminPanel from "./AdminPanel";
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
                {/* Giriş ve Kayıt */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />



                {/* Admin Paneli */}
                <Route path="/admin" element={<AdminPanel />} />

                {/* --- PROJE ROTALARI --- */}

                {/* 1. Proje Listesi (Dashboard) */}
                <Route path="/projects" element={<ProjectDashboard />} />

                {/* 2. Proje Detay (Board) - YENİ */}
                {/* :id kısmı dinamiktir (örn: /project/5) */}
                {/* Artık adresin sonunda /tickets de olacak */}
                <Route path="/project/:id/tickets" element={<ProjectBoard />} />

                {/* --- EN SONDA OLACAK --- */}
                {/* Bilinmeyen bir yere giderse Login'e at */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;