import { axiosGet, axiosPost, axiosPut, axiosDelete } from './axios-config';

const APIS = {
  category: '/category',
};

export const getCategory = (query) => {
  return axiosGet(`${APIS.category}`, query);
};

export const addCategory = (data) => {
  return axiosPost(APIS.category, data, {}, true);
};

export const deleteCategory = (id) => {
  return axiosDelete(`${APIS.category}/${id}`);
};

export const updateCategory = (id, data) => {
  return axiosPut(`${APIS.category}/${id}`, data, {}, true);
};
