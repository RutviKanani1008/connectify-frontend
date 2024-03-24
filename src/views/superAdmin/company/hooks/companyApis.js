import { useDeleteApi, useGetApi, usePutApi } from '../../../../hooks/useApi';

const APIS = {
  company: '/company',
};

export const useDeleteCompany = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteCompany = (id, loadingMsg) =>
    apiCall(`${APIS.company}/${id}`, loadingMsg);

  return { deleteCompany, isLoading, isSuccess, isError };
};

export const useUpdateCompanyAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateCompanyAPI = (id, data, loadingMsg) =>
    apiCall(`${APIS.company}/${id}`, data, loadingMsg);

  return { updateCompanyAPI, isLoading, isSuccess, isError };
};

export const useArchiveCompanyAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const archiveCompanyAPI = (id, data, loadingMsg) =>
    apiCall(`${APIS.company}/archive/${id}`, data, loadingMsg);

  return { archiveCompanyAPI, isLoading, isSuccess, isError };
};

export const useGetCompanyByIdAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getCompanyByIdAPI = (id, data, loadingMsg) =>
    apiCall(`${APIS.company}/${id}`, data, loadingMsg);

  return { getCompanyByIdAPI, isLoading, isSuccess, isError };
};

export const useGetAllCompaniesAPI = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getAllCompanies = (data, loadingMsg) =>
    apiCall(`${APIS.company}/all`, data, loadingMsg);

  return { getAllCompanies, isLoading, isSuccess, isError };
};
