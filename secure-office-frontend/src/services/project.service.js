import api from "./api"; // <--- Axios yerine kendi api'mizi çağırdık

const PROJECT_URL = "/projects"; // BaseURL zaten api.js içinde var

const getAllProjects = () => {
    return api.get(PROJECT_URL);
};

const getProjectById = (id) => {
    return api.get(PROJECT_URL + "/" + id);
};

const createProject = (projectData) => {
    return api.post(PROJECT_URL, projectData);
};

const deleteProject = (id) => {
    return api.delete(PROJECT_URL + "/" + id);
};

const ProjectService = {
    getAllProjects,
    getProjectById,
    createProject,
    deleteProject,
};

export default ProjectService;