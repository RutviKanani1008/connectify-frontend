import {
  useGetApi,
  usePostApi,
  usePutApi,
  useDeleteApi,
} from '../../../../../hooks/useApi';

const APIS = {
  billingTemplate: '/billing-templates',
  billingTermsTemplate: '/billing-templates/terms',
};

export const useGetTermsTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTermsTemplates = (query = {}) =>
    apiCall(`${APIS.billingTermsTemplate}`, { params: query });

  return { getTermsTemplates, isLoading, isSuccess, isError };
};

export const useGetTermsTemplate = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useGetApi();

  const getTermsTemplate = (id) =>
    apiCall(`${APIS.billingTermsTemplate}/${id}`);

  return { getTermsTemplate, isLoading, isSuccess, isError };
};

export const useAddTermsTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const addTermsTemplate = (data, loadingMsg) =>
    apiCall(`${APIS.billingTermsTemplate}`, data, loadingMsg);

  return { addTermsTemplate, isLoading, isSuccess, isError };
};

export const useUpdateTermsTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePutApi();

  const updateTermsTemplate = (id, data, loadingMsg) =>
    apiCall(`${APIS.billingTermsTemplate}/${id}`, data, loadingMsg);

  return { updateTermsTemplate, isLoading, isSuccess, isError };
};

export const useDeleteTermsTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = useDeleteApi();

  const deleteTermsTemplate = (id, loadingMsg) => {
    return apiCall(`${APIS.billingTermsTemplate}/${id}`, loadingMsg);
  };

  return { deleteTermsTemplate, isLoading, isSuccess, isError };
};

export const useCloneTermsTemplates = () => {
  const [apiCall, { isLoading, isSuccess, isError }] = usePostApi();

  const cloneTermsTemplate = (id, loadingMsg) => {
    return apiCall(`${APIS.billingTermsTemplate}/clone/${id}`, {}, loadingMsg);
  };

  return { cloneTermsTemplate, isLoading, isSuccess, isError };
};
