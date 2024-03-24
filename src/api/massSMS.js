import { axiosGet, axiosPost, axiosPut, axiosDelete } from './axios-config';

const APIS = {
  'mass-sms': '/mass-sms',
  'send-mass-sms': '/send-mass-sms',
};

export const getMassSMS = (query) => {
  return axiosGet(`${APIS['mass-sms']}`, query);
};

export const getSpecificMassSMS = (id, query) => {
  return axiosGet(`${APIS['mass-sms']}/${id}`, query);
};

export const addMassSMS = (data) => {
  return axiosPost(`${APIS['mass-sms']}`, data, {}, true);
};

export const deleteMassSMS = (id) => {
  return axiosDelete(`${APIS['mass-sms']}/${id}`);
};

export const updateMassSMS = (id, data) => {
  return axiosPut(`${APIS['mass-sms']}/${id}`, data, {}, true);
};

export const sendMassSMSWithoutSave = (data) => {
  return axiosPost(`${APIS['send-mass-sms']}`, data, {}, true);
};

export const sendMassSMSById = (id, data = null) => {
  return axiosPost(`${APIS['send-mass-sms']}/${id}`, data, {}, true);
};
