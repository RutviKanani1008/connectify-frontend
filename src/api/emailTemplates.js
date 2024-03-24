import { axiosDelete, axiosGet, axiosPost } from './axios-config';

const APIS = {
  'email-templates': '/email-templates',
  'send-test-email-template': '/send-test-email-template',
  'clone-email-template': '/clone-email-template',
};

export const getEmailTemplates = (query) => {
  return axiosGet(APIS['email-templates'], query);
};

export const deleteEmailTemplate = (id) => {
  return axiosDelete(`${APIS['email-templates']}/${id}`, null, {}, true);
};

export const sendTestEmailTemplate = (data) => {
  return axiosPost(APIS['send-test-email-template'], data, {}, true);
};

export const cloneEmailTemplate = (id, data = null) => {
  return axiosPost(`${APIS['clone-email-template']}/${id}`, data, {}, true);
};
