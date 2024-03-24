import { useGetApi } from '../../../hooks/useApi';

const APIS = {
  groups: '/group',
  status: '/status',
  category: '/category',
  tags : '/tags',
  customField : '/custom-field',
};

export const useGetGroups = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getGroups = (query = {}) =>
    apiCall(`${APIS.groups}`, {
      params: query,
    });

  return { getGroups, isLoading, isSuccess, isError };
};


export const useGetStatus = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getStatus = (query = {}) =>
    apiCall(`${APIS.status}`, {
      params: query,
    });

  return { getStatus, isLoading, isSuccess, isError };
};

export const useGetCategory = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCategory = (query = {}) =>
    apiCall(`${APIS.category}`, {
      params: query,
    });

  return { getCategory, isLoading, isSuccess, isError };
};

export const useGetTags = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTags = (query = {}) =>
    apiCall(`${APIS.tags}`, {
      params: query,
    });

  return { getTags, isLoading, isSuccess, isError };
};

export const useGetCustomFields = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCustomField = (query = {}) =>
    apiCall(`${APIS.customField}`, {
      params: query,
    });

  return { getCustomField, isLoading, isSuccess, isError };
};