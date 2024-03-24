import { axiosGet, axiosPost, axiosPut, axiosDelete } from './axios-config';

const APIS = {
  category: '/custom-field',
};

export const getCustomField = (query) => {
  return axiosGet(`${APIS.category}`, query);
};

export const addCustomField = (data) => {
  return axiosPost(APIS.category, data, {}, true);
};

export const deleteCustomField = (id) => {
  return axiosDelete(`${APIS.category}/${id}`);
};

export const updateCustomField = (id, data) => {
  return axiosPut(`${APIS.category}/${id}`, data, {}, true);
};
