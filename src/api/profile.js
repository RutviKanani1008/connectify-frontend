import { axiosGet, axiosPost } from './axios-config';

const APIS = {
  'contact-us': '/api/contact-us',
  'feature-request': '/feature-request',
  'file-upload': '/report-problem-upload',
  'send-request': '/report-problem',
  'new-updates': '/new-updates-count',
};

export const saveCotanctUs = (data) => {
  return axiosPost(APIS['contact-us'], data, {}, true);
};

export const saveFeatureRequest = (data) => {
  return axiosPost(APIS['feature-request'], data, {}, true);
};

export const sendReqFileUpload = (data, socketSessionId) => {
  return axiosPost(APIS['file-upload'], data, {}, true, {
    headers: {
      'socket-session-id': socketSessionId,
    },
  });
};

export const saveSendeRequest = (data) => {
  return axiosPost(APIS['send-request'], data, {}, true);
};

export const getNewUpdatesCount = (params) => {
  return axiosGet(APIS['new-updates'], params);
};
