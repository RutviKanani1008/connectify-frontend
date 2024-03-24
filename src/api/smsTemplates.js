import { axiosDelete, axiosGet, axiosPost } from './axios-config';

const APIS = {
  'sms-templates': '/sms-templates',
  'send-test-sms-template': '/send-test-sms-template',
  'clone-sms-template': '/clone-sms-template',
};

export const getSmsTemplates = (query) => {
  return axiosGet(APIS['sms-templates'], query);
};

export const deleteSmsTemplate = (id) => {
  return axiosDelete(`${APIS['sms-templates']}/${id}`, null, {}, true);
};

export const sendTestSmsTemplate = (data) => {
  return axiosPost(APIS['send-test-sms-template'], data, {}, true);
};

export const cloneSmsTemplate = (id, data = null) => {
  return axiosPost(`${APIS['clone-sms-template']}/${id}`, data, {}, true);
};
