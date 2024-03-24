import { axiosDelete, axiosGet, axiosPost, axiosPut } from './axios-config';

const APIS = {
  contact: '/contacts',
  'stage-contacts': '/stage-contacts',
  'assign-stage': '/assign-stage',
  'contacts-not-in-stage': '/contacts-not-in-stage',
  contactWithRsvp: '/contacts-with-rsvp',
  updateStatus: '/contactStatus',
  archiveContact: '/contacts/archive',
  assignContactPipeline: '/assign-contact-pipeline',
  updateContactAndForm: '/update-contact-and-form',
  validateImportContacts: '/validate-import-contacts',
  importContacts: '/import-contacts',
  importUnsubContacts: '/unsubscribe-contacts-list',
};

export const saveCotanct = (data) => {
  return axiosPost(APIS.contact, data, {}, true);
};

export const getContactDetails = (query) => {
  return axiosGet(`${APIS.contact}`, query, true);
};

export const getContactsNotInStage = (query) => {
  return axiosGet(`${APIS['contacts-not-in-stage']}`, query, true);
};

export const getStageContacts = (query) => {
  return axiosGet(`${APIS['stage-contacts']}`, query, true);
};

export const getContact = (id, query) => {
  return axiosGet(`${APIS.contact}/${id}`, query);
};

export const updateContactStatus = (id, data) => {
  return axiosPut(`${APIS.updateStatus}/${id}`, data, {}, true);
};

export const updateContactAndFormDetails = (data) => {
  return axiosPut(`${APIS.updateContactAndForm}`, data, {}, true);
};

export const updateContact = (id, data) => {
  return axiosPut(`${APIS.contact}/${id}`, data, {}, true);
};

export const assignContactPipeline = (data) => {
  return axiosPost(`${APIS.assignContactPipeline}`, data, {}, true);
};

export const updateMultipleContactStage = (data) => {
  return axiosPost(`${APIS['assign-stage']}`, data, {}, true);
};

export const validateImportContacts = (data, socketSessionId) => {
  return axiosPost(`${APIS.validateImportContacts}`, data, {}, true, {
    headers: {
      'socket-session-id': socketSessionId,
    },
  });
};

export const importContacts = (data) => {
  return axiosPost(`${APIS.importContacts}`, data, {}, true);
};

export const importUnsubContacts = (data) => {
  return axiosPost(`${APIS.importUnsubContacts}`, data, {});
};

export const deleteContact = (id) => {
  return axiosDelete(`${APIS.contact}/${id}`);
};

export const archiveContact = (id, data) => {
  return axiosPut(`${APIS.archiveContact}/${id}`, data, {}, true);
};

export const contactWithRsvp = (query) => {
  return axiosGet(`${APIS.contactWithRsvp}`, query, true);
};
