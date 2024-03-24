import { useGetApi } from '../hooks/useApi';
import { axiosGet, axiosPost, axiosPut, axiosDelete } from './axios-config';

const APIS = {
  'mass-email': '/mass-email',
  'send-mass-email': '/send-mass-email',
  'send-grid-matrix': '/send-grid-matrix',
};

export const getMassEmail = (query) => {
  return axiosGet(`${APIS['mass-email']}`, query);
};

export const useGetMassEmails = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getMassEmails = (query) =>
    apiCall(`${APIS['mass-email']}`, {
      params: query,
    });

  return { getMassEmails, isLoading, isSuccess, isError };
};

export const getSpecificMassEmail = (id, query) => {
  return axiosGet(`${APIS['mass-email']}/${id}`, query);
};

export const getSendGridStastics = (query) => {
  return axiosGet(`${APIS['send-grid-matrix']}`, query);
};

export const addMassEmail = (data) => {
  return axiosPost(APIS['mass-email'], data, {}, true);
};

export const deleteMassEmail = (id) => {
  return axiosDelete(`${APIS['mass-email']}/${id}`);
};

export const updateMassEmail = (id, data) => {
  return axiosPut(`${APIS['mass-email']}/${id}`, data, {}, true);
};

export const sendMassEmailWithoutSave = (data) => {
  return axiosPost(`${APIS['send-mass-email']}`, data, {}, true);
};
export const sendMassEmailFromContactList = (data) => {
  return axiosPost(
    `${APIS['send-mass-email']}-from-contact-list`,
    data,
    {},
    true
  );
};

export const sendMassEmailById = (id, data = null) => {
  return axiosPost(`${APIS['send-mass-email']}/${id}`, data, {}, true);
};
