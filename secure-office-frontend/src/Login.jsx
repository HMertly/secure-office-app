import { useState } from "react";
import axios from "axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8080/api/v1/auth/login", {
                email,
                password,
            });

            // --- CASUS (DEBUG) ---
            console.log("BACKEND'DEN GELEN CEVAP:", res.data);

            // Token'ı yakalamaya çalışalım (3 farklı ihtimali dene)
            let token = null;

            if (res.data.token) {
                token = res.data.token; // İhtimal 1: { token: "..." }
            } else if (res.data.accessToken) {
                token = res.data.accessToken; // İhtimal 2: { accessToken: "..." }
            } else if (typeof res.data === "string") {
                token = res.data; // İhtimal 3: Sadece düz yazı "..."
            }

            if (token) {
                localStorage.setItem("token", token);
                console.log("TOKEN BAŞARIYLA KAYDEDİLDİ:", token);
                window.location.href = "/projects";
            } else {
                alert("Giriş başarılı ama Token bulunamadı! Konsola bak.");
            }

        } catch (err) {
            console.error(err);
            alert("Giriş başarısız! Bilgileri kontrol et.");
        }
    };

    return (
        <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            height: "100vh", backgroundColor: "#f4f5f7", fontFamily: "'Segoe UI', sans-serif"
        }}>
            <div style={{
                width: "100%", maxWidth: "400px", padding: "40px",
                backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center"
            }}>
                <h2 style={{ marginBottom: "20px", color: "#172b4d" }}>Giriş Yap</h2>
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)}
                           style={{ padding: "12px", borderRadius: "4px", border: "2px solid #dfe1e6", outline: "none" }} />
                    <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)}
                           style={{ padding: "12px", borderRadius: "4px", border: "2px solid #dfe1e6", outline: "none" }} />
                    <button type="submit" style={{
                        padding: "12px", backgroundColor: "#0052cc", color: "white", border: "none",
                        borderRadius: "4px", fontWeight: "bold", cursor: "pointer"
                    }}>
                        Giriş Yap
                    </button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '14px' }}>
                    Hesabın yok mu? <a href="/register" style={{ color: '#0052cc', textDecoration: 'none' }}>Hemen Kaydol</a>
                </p>
            </div>
        </div>
    );
}

export default Login;