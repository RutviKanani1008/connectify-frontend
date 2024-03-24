import { useGetApi, usePutApi } from '../../../../hooks/useApi';

const APIS = {
  'direct-mail-template': '/direct-mail-template',
};

export const useGetDirectMailTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getDirectMailTemplates = (query = {}) =>
    apiCall(`${APIS['direct-mail-template']}`, {
      params: query,
    });

  return { getDirectMailTemplates, isLoading, isSuccess, isError };
};

export const useUpdateDirectMailTemplateFolderOrder = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateDirectMailTemplateFolderOrder = (data = {}) =>
    apiCall(`${APIS['direct-mail-template']}/update-folder-order`, data);

  return { updateDirectMailTemplateFolderOrder, isLoading, isSuccess, isError };
};
