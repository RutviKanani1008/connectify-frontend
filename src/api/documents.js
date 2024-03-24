import { axiosDelete, axiosGet, axiosPost, axiosPut } from './axios-config';

const APIS = {
  document: '/document',
  documents: '/documents',
  documentOder: '/documents/order',
  upload: '/document/document-file-upload',
};

export const addDocumentAPI = (data) => {
  return axiosPost(APIS.document, data, {}, true);
};

export const getDocumentsAPI = (query) => {
  return axiosGet(`${APIS.documents}`, query, true);
};

export const getDocumentDetailAPI = (id, query) => {
  return axiosGet(`${APIS.document}/${id}`, query, true);
};

export const updateDocumentAPI = (id, data) => {
  return axiosPut(`${APIS.document}/${id}`, data, {}, true);
};
export const updateDocumentOrderAPI = (data) => {
  return axiosPut(`${APIS.documentOder}`, data, {}, true);
};

export const deleteDocumentAPI = (id) => {
  return axiosDelete(`${APIS.document}/${id}`, {}, {}, true);
};

export const uploadDocumentFileAPI = (data) => {
  return axiosPost(APIS.upload, data, {}, true);
};
