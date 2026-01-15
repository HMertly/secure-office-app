import api from "./api"; // Merkezi api yapımızı kullanıyoruz

const USERS_URL = "/users";
const AUTH_URL = "/auth";

// 1. Tüm Kullanıcıları Getir
const getAllUsers = () => {
    return api.get(USERS_URL);
};

// 2. Kullanıcı Sil
const deleteUser = (userId) => {
    return api.delete(USERS_URL + "/" + userId);
};

// 3. Şu anki kullanıcının bilgisini al (Ben kimim?)
const getMe = () => {
    return api.get(AUTH_URL + "/me");
};

// 4. Davet Gönder (İleride kullanacağız, şimdiden yeri hazır olsun)
const sendInvite = (email) => {
    return api.post("/invitations/send", email);
};

const UserService = {
    getAllUsers,
    deleteUser,
    getMe,
    sendInvite
};

export default UserService;