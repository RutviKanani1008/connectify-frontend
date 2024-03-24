import { axiosGet, axiosPost, axiosPut, axiosDelete } from './axios-config';

const APIS = {
  status: '/status',
};

export const getStatus = (query) => {
  return axiosGet(`${APIS.status}`, query);
};

export const addStatus = (data) => {
  return axiosPost(APIS.status, data, {}, true);
};

export const deleteStatus = (id) => {
  return axiosDelete(`${APIS.status}/${id}`);
};

export const updateStatus = (id, data) => {
  return axiosPut(`${APIS.status}/${id}`, data, {}, true);
};
