import { useState, useEffect } from "react";

const useTheme = () => {
    // Başlangıç değerini localStorage'dan al
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    // darkMode değiştiğinde Body class'ını ve Storage'ı güncelle
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    // Bileşenlere sadece bu iki değeri döndür
    return [darkMode, setDarkMode];
};

export default useTheme;