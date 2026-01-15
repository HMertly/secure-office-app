import axios from "axios";

const API_URL = "http://localhost:8080/api/projects";

const authHeader = () => {
    const token = localStorage.getItem("token");
    if (token) {
        return { Authorization: "Bearer " + token };
    } else {
        return {};
    }
};

const getAllProjects = () => {
    return axios.get(API_URL, { headers: authHeader() });
};

const getProjectById = (id) => {
    return axios.get(API_URL + "/" + id, { headers: authHeader() });
};
// ------------------------------------

const createProject = (projectData) => {
    return axios.post(API_URL, projectData, { headers: authHeader() });
};

const deleteProject = (id) => {
    return axios.delete(API_URL + "/" + id, { headers: authHeader() });
};

const ProjectService = {
    getAllProjects,
    getProjectById,
    createProject,
    deleteProject,
};

export default ProjectService;