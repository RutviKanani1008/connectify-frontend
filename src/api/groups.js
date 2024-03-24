import { axiosDelete, axiosGet, axiosPost, axiosPut } from './axios-config';

const APIS = {
  group: '/group',
  groupDetails: '/group-related-details',
};

export const createGroup = (data) => {
  return axiosPost(APIS.group, data, {}, true);
};

export const getGroups = (query) => {
  return axiosGet(`${APIS.group}`, query, true);
};

export const deleteGroup = (id) => {
  return axiosDelete(`${APIS.group}/${id}`, {}, {}, true);
};

export const updateGroup = (id, data) => {
  return axiosPut(`${APIS.group}/${id}`, data, {}, true);
};

export const getGroupDetails = (id, query = null) => {
  return axiosGet(`${APIS.groupDetails}/${id}`, query, true);
};
