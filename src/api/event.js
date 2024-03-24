import { axiosGet, axiosPost, axiosPut, axiosDelete } from './axios-config';

const APIS = {
  event: '/event',
  events: '/events',
  rsvp: '/rsvp',
  'event-detail': '/event-detail',
  'event-rsvp': '/event-rsvp',
};

export const getEvent = (query) => {
  return axiosGet(`${APIS.event}`, query);
};

export const getSpecificEvent = (query) => {
  return axiosGet(`${APIS['event-detail']}`, query);
};

export const addEvent = (data) => {
  return axiosPost(APIS.event, data, {}, true);
};

export const addRSVPResponse = (id, data) => {
  return axiosPost(`${APIS.rsvp}/${id}`, data, {}, true);
};

export const deleteEvent = (id) => {
  return axiosDelete(`${APIS.event}/${id}`);
};

export const deleteRecurringEvents = (id) => {
  return axiosDelete(`${APIS.events}/${id}`);
};

export const updateEvent = (id, data) => {
  return axiosPut(`${APIS.event}/${id}`, data, {}, true);
};

export const getRsvpByEventId = (query) => {
  return axiosGet(`${APIS['event-rsvp']}`, query);
};

export const getEvents = (query) => {
  return axiosGet(`${APIS.events}`, query);
};
