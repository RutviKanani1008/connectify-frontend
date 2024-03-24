import { axiosGet, axiosPost, axiosPut, axiosDelete } from './axios-config';

const APIS = {
  changeLog: '/change-logs',
};

export const getAllChangeLogs = (query) => axiosGet(`${APIS.changeLog}`, query);

export const latestChangeLog = (query) =>
  axiosGet(`${APIS.changeLog}/latest`, query);

export const createChangeLog = (data) => axiosPost(`${APIS.changeLog}`, data);

export const getChangeLog = (id) => axiosGet(`${APIS.changeLog}/${id}`);

export const deleteChangeLog = (id) => axiosDelete(`${APIS.changeLog}/${id}`);

export const updateChangeLog = (id, data) => {
  return axiosPut(`${APIS.changeLog}/${id}`, data);
};
