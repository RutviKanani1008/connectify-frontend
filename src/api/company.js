import { axiosGet, axiosPost, axiosPut, axiosDelete } from './axios-config';

const APIS = {
  company: '/company',
  validateCompany: '/validateCompany',
  updateNotes: '/updateCompanyNote',
  updateNotesById: '/updateCompanyNotes',
  updateStage: '/updateContactStage',
  memberCategories: '/memberCategories',
  tags: '/tags',
  companyUser: '/companyUser',
  getTagsAndCategoryDetails: '/tagsAndCategory',
  companyMember: '/company-member',
  memberShipStatus: '/company-member-status',
  assignPipeline: '/assign-pipeline',
};

export const saveCompany = (data) => {
  return axiosPost(APIS.company, data, {}, true);
};

export const updateCompany = (id, data) => {
  return axiosPut(`${APIS.company}/${id}`, data, {}, true);
};

export const getCompany = (query) => {
  return axiosGet(`${APIS.company}`, query, true);
};

export const getFilteredCompany = (query) => {
  return axiosGet(`${APIS.company}/all`, query, true);
};

export const getCompanyDetail = (id, query) => {
  return axiosGet(`${APIS.company}/${id}`, query);
};

export const validateCompany = (query) => {
  return axiosGet(`${APIS.validateCompany}`, query);
};

export const updateCompanyNote = (id, data) => {
  return axiosPut(`${APIS.updateNotes}/${id}`, data, {}, true);
};

export const updateCompanyNoteById = (id, data) => {
  return axiosPut(`${APIS.updateNotesById}/${id}`, data, {}, true);
};

export const updateCompanyContactStage = (id, data) => {
  return axiosPut(`${APIS.updateStage}/${id}`, data, {}, true);
};

export const getMemberCategories = (id, query) => {
  return axiosGet(`${APIS.memberCategories}/${id}`, query);
};

export const addCategory = (data) => {
  return axiosPost(APIS.memberCategories, data, {}, true);
};

export const deleteCategory = (id) => {
  return axiosDelete(`${APIS.memberCategories}/${id}`);
};

export const updateCategory = (id, data) => {
  return axiosPut(`${APIS.memberCategories}/${id}`, data, {}, true);
};
export const getTags = (query) => {
  return axiosGet(`${APIS.tags}`, query);
};

export const addTag = (data) => {
  return axiosPost(APIS.tags, data, {}, true);
};

export const deleteTag = (id) => {
  return axiosDelete(`${APIS.tags}/${id}`);
};

export const updateTag = (id, data) => {
  return axiosPut(`${APIS.tags}/${id}`, data, {}, true);
};

export const companyUser = (query) => {
  return axiosGet(`${APIS.companyUser}`, query);
};

export const getTagsAndCategoryDetails = (query) => {
  return axiosGet(`${APIS.getTagsAndCategoryDetails}`, query);
};

export const createCompanyMemberDetail = (data) => {
  return axiosPost(APIS.companyMember, data, {}, true);
};

export const updateCompanyMemberDetail = (id, data) => {
  return axiosPut(`${APIS.companyMember}/${id}`, data, {}, true);
};

export const updateMembershipStatus = (id, data) => {
  return axiosPut(`${APIS.memberShipStatus}/${id}`, data, {}, true);
};

export const assignPipeline = (data) => {
  return axiosPost(`${APIS.assignPipeline}`, data, {}, true);
};
