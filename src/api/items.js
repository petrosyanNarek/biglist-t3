import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export const fetchItems = (params) => {
    return axios.get(`${API_BASE}/items`, { params });
};

export const setSelectedItem = (id) => {
    return axios.post(`${API_BASE}/items/select`, { id });
};

export const setSortOrder = (order) => {
    return axios.post(`${API_BASE}/items/sort`, { order });
};
