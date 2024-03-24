import { axiosDelete, axiosGet, axiosPost, axiosPut } from './axios-config';

const APIS = {
  'add-form': '/add-form',
  forms: '/forms',
  'form-response': '/form-response',
  upload: '/upload',
  sendTestMail: '/send-test-mail',
  'clone-form': '/clone-form',
};

export const saveForm = (data) => {
  return axiosPost(APIS['add-form'], data, {}, true);
};

export const getForms = (query) => {
  return axiosGet(`${APIS.forms}`, query, true);
};

export const getFormDetail = (id, query) => {
  return axiosGet(`${APIS.forms}/${id}`, query, true);
};

export const getFormResponseDetail = (id, query) => {
  return axiosGet(`${APIS['form-response']}/${id}`, query, true);
};

export const updateForm = (id, data) => {
  return axiosPut(`${APIS.forms}/${id}`, data, {}, true);
};

export const updateFormResponse = (id, data) => {
  return axiosPut(`${APIS['form-response']}/${id}`, data, {}, true);
};

export const submitFormResponse = (id, data) => {
  return axiosPost(`${APIS['form-response']}/${id}`, data, {}, true);
};

export const deleteForm = (id) => {
  return axiosDelete(`${APIS.forms}/${id}`, {}, {}, true);
};

export const deleteFormResponse = (id) => {
  return axiosDelete(`${APIS['form-response']}/${id}`, {}, {}, true);
};

export const uploadFormFile = (data) => {
  return axiosPost(APIS.upload, data, {}, true);
};

export const sendTestFormResponseMail = (data) => {
  return axiosPost(APIS.sendTestMail, data, {}, true);
};

export const cloneForm = (id, data = null) => {
  return axiosPost(`${APIS['clone-form']}/${id}`, data, {}, true);
};
