import axios from 'axios';

const API_BASE = 'https://biglist-t3-api-3.onrender.com/api';

export const fetchItems = (params) => {
    return axios.get(`${API_BASE}/items`, { params });
};

export const setSelectedItem = (id) => {
    return axios.post(`${API_BASE}/items/select`, { id });
};

export const setSortOrder = (order) => {
    return axios.post(`${API_BASE}/items/sort`, { order });
};
