import { axiosDelete, axiosGet, axiosPost, axiosPut } from './axios-config';

const APIS = {
  pipeline: '/pipeline',
  updateStage: '/update-stage',
};

export const createPipeline = (data) => {
  return axiosPost(APIS.pipeline, data, {}, true);
};

export const getPipeline = (query) => {
  return axiosGet(`${APIS.pipeline}`, query, true);
};

export const getPipelineStages = (query) => {
  return axiosGet(`${APIS.pipeline}/stages`, query, true);
};

export const updateMemberContactStage = (id, data) => {
  return axiosPut(`${APIS.updateStage}/${id}`, data, {}, true);
};

export const updatePipeline = (id, data) => {
  return axiosPut(`${APIS.pipeline}/${id}`, data, {}, true);
};

export const deletePipeline = (id, data) => {
  return axiosDelete(`${APIS.pipeline}/${id}`, data, {}, true);
};
